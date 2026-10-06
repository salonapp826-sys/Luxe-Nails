-- 1. Create the promotions table if it doesn't exist
-- We explicitly set website_id to UUID to match a potential UUID websites.id
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public can view active promotions
-- We use DROP/CREATE to ensure policies are updated cleanly (idempotent)
DROP POLICY IF EXISTS "Public can view active promotions" ON public.promotions;
CREATE POLICY "Public can view active promotions" ON public.promotions
    FOR SELECT USING (is_active = true);

-- 4. Policy: Shop owners can manage their own promotions
-- Uses EXISTS to check if the authenticated user is the owner of the associated website
DROP POLICY IF EXISTS "Shop owners can manage their promotions" ON public.promotions;
CREATE POLICY "Shop owners can manage their promotions" ON public.promotions
    FOR ALL USING (
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
