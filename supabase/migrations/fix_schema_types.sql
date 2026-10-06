-- 1. Profiles Table (Keep as is)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Websites Table (Keep as is - id is TEXT)
CREATE TABLE IF NOT EXISTS public.websites (
    id TEXT PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_name TEXT,
    business_name TEXT,
    slug TEXT UNIQUE,
    subdomain TEXT UNIQUE,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Website Settings
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY REFERENCES public.websites(id) ON DELETE CASCADE,
    theme_color TEXT,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Services (website_id must be TEXT to match websites.id)
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    website_id TEXT REFERENCES public.websites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_inr INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Gallery (website_id must be TEXT to match websites.id)
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id TEXT PRIMARY KEY,
    website_id TEXT REFERENCES public.websites(id) ON DELETE CASCADE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Customer Reviews (website_id must be TEXT to match websites.id)
CREATE TABLE IF NOT EXISTS public.customer_reviews (
    id TEXT PRIMARY KEY,
    website_id TEXT REFERENCES public.websites(id) ON DELETE CASCADE,
    customer_name TEXT,
    rating INTEGER,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Favorites (website_id must be TEXT to match websites.id)
CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    website_id TEXT REFERENCES public.websites(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, website_id)
);

-- 8. Bookings (website_id must be TEXT to match websites.id)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    website_id TEXT REFERENCES public.websites(id) ON DELETE CASCADE,
    customer_name TEXT,
    appointment_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending'
);

-- 9. Promotions (website_id must be TEXT to match websites.id)
CREATE TABLE IF NOT EXISTS public.promotions (
    id TEXT PRIMARY KEY,
    website_id TEXT REFERENCES public.websites(id) ON DELETE CASCADE,
    title TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
