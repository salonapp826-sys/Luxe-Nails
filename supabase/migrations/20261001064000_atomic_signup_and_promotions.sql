-- 1. Atomic Signup Handler: Profiles, Websites, and Tenants
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_username TEXT;
  v_website_id UUID := gen_random_uuid();
BEGIN
  -- Extract role and full_name from metadata
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');
  v_username := COALESCE(new.raw_user_meta_data->>'full_name', 'User');

  -- A. Create Profile (Always)
  INSERT INTO public.profiles (id, user_id, full_name, email, role)
  VALUES (new.id, new.id, v_username, new.email, v_role)
  ON CONFLICT (id) DO NOTHING;

  -- B. Create Website & Tenant (ONLY for shop_owner)
  IF v_role = 'shop_owner' THEN
    -- Website (Assume websites.id is UUID based on previous errors)
    INSERT INTO public.websites (id, owner_id, site_name, business_name, slug, published)
    VALUES (v_website_id, new.id, v_username, v_username || ' Salon', LOWER(REGEXP_REPLACE(v_username, '[^a-zA-Z0-9]', '', 'g')), true)
    ON CONFLICT (id) DO NOTHING;

    -- Tenant
    INSERT INTO public.tenants (id, business_name, tagline, email, is_published)
    VALUES (v_website_id, v_username || ' Salon', 'Luxury Salon', new.email, true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop and Re-create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Promotions Table
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Idempotent)
DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
CREATE POLICY "Public can view active promotions" ON public.promotions
    FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Shop owners can manage their promotions" ON public.promotions;
CREATE POLICY "Shop owners can manage their promotions" ON public.promotions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.websites
            WHERE websites.id = promotions.website_id
            AND websites.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.websites
            WHERE websites.id = promotions.website_id
            AND websites.owner_id = auth.uid()
        )
    );
