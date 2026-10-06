-- 1. ट्रिगर और फंक्शन को फिर से बनाएँ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name, email, role)
  VALUES (
    new.id, 
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. profiles के लिए RLS को सुरक्षित करना
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert" ON public.profiles;
CREATE POLICY "Allow public insert" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
CREATE POLICY "Allow users to view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- 3. websites के लिए RLS
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert for new owners" ON public.websites;
CREATE POLICY "Allow insert for new owners" ON public.websites FOR INSERT WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Allow read for everyone" ON public.websites;
CREATE POLICY "Allow read for everyone" ON public.websites FOR SELECT TO public USING (true);

-- 4. promotions के लिए RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
CREATE POLICY "Public can view active promotions" ON public.promotions FOR SELECT TO public USING (is_active = true);
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
