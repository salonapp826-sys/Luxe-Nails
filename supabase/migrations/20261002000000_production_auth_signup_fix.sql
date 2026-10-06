-- ==============================================================================
-- PRODUCTION SUPABASE AUTH SIGNUP TRIGGER & PROFILE RESOLUTION FIX
-- ==============================================================================

-- 1. Ensure public.profiles table exists with exact foreign key to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'shop_owner', 'admin')),
    referral_code TEXT,
    referred_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure websites and tenants tables exist
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_name TEXT,
    business_name TEXT,
    slug TEXT UNIQUE,
    subdomain TEXT UNIQUE,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY REFERENCES public.websites(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    tagline TEXT,
    email TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Drop any legacy / conflicting signup triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_sync ON auth.users;
DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 3. Robust, Safe, Atomic Signup Handler Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_website_id UUID;
  v_clean_slug TEXT;
  v_slug TEXT;
BEGIN
  -- Extract role and full_name safely from auth metadata
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');
  v_full_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1),
    'User'
  );

  -- A. Create / Upsert Profile (profiles.id = auth.users.id)
  BEGIN
    INSERT INTO public.profiles (id, user_id, full_name, email, role)
    VALUES (new.id, new.id, v_full_name, new.email, v_role)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        role = COALESCE(public.profiles.role, EXCLUDED.role);
  EXCEPTION WHEN OTHERS THEN
    -- Never let profile insert failure block auth.users creation
    RAISE WARNING 'Profile insertion warning for user %: %', new.id, SQLERRM;
  END;

  -- B. Provision Website & Tenant if role is shop_owner (Wrapped in safe exception block)
  IF v_role = 'shop_owner' THEN
    BEGIN
      -- Check if user already owns a website before creating
      SELECT id INTO v_website_id FROM public.websites WHERE owner_id = new.id LIMIT 1;
      
      IF v_website_id IS NULL THEN
        v_website_id := gen_random_uuid();
        v_clean_slug := LOWER(REGEXP_REPLACE(v_full_name, '[^a-zA-Z0-9]', '', 'g'));
        IF v_clean_slug = '' OR v_clean_slug IS NULL THEN
          v_clean_slug := 'salon-' || SUBSTRING(new.id::text FROM 1 FOR 6);
        ELSE
          v_slug := v_clean_slug || '-' || SUBSTRING(new.id::text FROM 1 FOR 4);
        END IF;

        INSERT INTO public.websites (id, owner_id, site_name, business_name, slug, published)
        VALUES (v_website_id, new.id, v_full_name, v_full_name || ' Salon', v_slug, true)
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO public.tenants (id, business_name, tagline, email, is_published)
        VALUES (v_website_id, v_full_name || ' Salon', 'Luxury Salon & Nail Studio', new.email, true)
        ON CONFLICT (id) DO NOTHING;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Optional onboarding failure must NOT block account signup
      RAISE WARNING 'Shop owner website onboarding notice for user %: %', new.id, SQLERRM;
    END;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Set Single Primary Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant Execute Permissions to required execution roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
