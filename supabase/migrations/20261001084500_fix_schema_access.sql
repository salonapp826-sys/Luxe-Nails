-- 1. Fix Missing Tables and Permissions
-- Ensure tables exist
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY REFERENCES public.websites(id) ON DELETE CASCADE,
    business_name TEXT,
    tagline TEXT,
    email TEXT,
    is_published BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_inr INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

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

-- 2. Grant permissions to API user (Critical for PGRST205)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- 3. Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- 4. Simple RLS Policies (Idempotent)
-- Tenants: Public Read
DROP POLICY IF EXISTS "Public read tenants" ON public.tenants;
CREATE POLICY "Public read tenants" ON public.tenants FOR SELECT TO public USING (is_published = true);

-- Services: Public Read
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT TO public USING (is_active = true);

-- Promotions: Public Read
DROP POLICY IF EXISTS "Public read promotions" ON public.promotions;
CREATE POLICY "Public read promotions" ON public.promotions FOR SELECT TO public USING (is_active = true);
