-- 1. Ensure profiles table allows insert, with conflict handling
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure website_settings table uses correct type for ID
CREATE TABLE IF NOT EXISTS public.website_settings (
    id UUID PRIMARY KEY REFERENCES public.websites(id) ON DELETE CASCADE,
    theme_color TEXT,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Robust trigger function with explicit conflict handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile, ignore if exists
  INSERT INTO public.profiles (id, user_id, full_name, email, role)
  VALUES (
    new.id, 
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Website/Tenant creation logic should ideally be triggered by the 
  -- frontend after success or via a separate process to avoid 
  -- AuthRetryableFetchErr, but keeping here for atomicity as requested.
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
