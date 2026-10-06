-- 1. Ensure profiles table matches trigger requirements
-- Using explicit columns to avoid issues
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Drop and recreate the trigger function to be absolutely sure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name, email, role)
  VALUES (
    new.id, 
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING; -- Ensure it doesn't fail if trigger fires twice
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
