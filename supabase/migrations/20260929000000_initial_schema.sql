-- ==============================================================================
-- NAILS BY UMA - SUPABASE POSTGRESQL INITIAL DATABASE SCHEMA
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 3. USERS TABLE (Roles: customer / admin / staff / technician)
-- ==============================================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('customer', 'admin', 'staff', 'technician')) default 'customer',
  full_name text not null,
  phone text unique,
  email text unique,
  avatar_url text,
  loyalty_points integer not null default 0 check (loyalty_points >= 0),
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_users_auth_id on public.users(auth_user_id);
create index if not exists idx_users_phone on public.users(phone);
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);

create or replace trigger set_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- Auto sync new Supabase Auth sign-ups to public.users
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (auth_user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (auth_user_id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ==============================================================================
-- 4. TECHNICIANS / ARTISTS TABLE
-- ==============================================================================
create table if not exists public.technicians (
  id text primary key,
  name text not null,
  specialty text,
  rating numeric(3,2) not null default 5.0 check (rating >= 0 and rating <= 5.0),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace trigger set_technicians_updated_at
  before update on public.technicians
  for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 5. SERVICES TABLE
-- ==============================================================================
create table if not exists public.services (
  id text primary key,
  name text not null,
  category text not null check (category in ('basic', 'premium', 'art', 'bridal', 'mehndi', 'beauty')),
  description text,
  price_inr numeric(10,2) not null check (price_inr >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  image_url text,
  is_active boolean not null default true,
  is_premium boolean default false,
  home_service_allowed boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_services_category on public.services(category);
create index if not exists idx_services_active on public.services(is_active);

create or replace trigger set_services_updated_at
  before update on public.services
  for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 6. BOOKINGS TABLE
-- ==============================================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null unique,
  user_id uuid references public.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  service_id text references public.services(id) on delete restrict,
  service_name text not null,
  category text not null,
  visit_type text not null check (visit_type in ('salon', 'home')) default 'salon',
  address text,
  distance_km numeric(6,2),
  home_service_charge numeric(10,2) not null default 0 check (home_service_charge >= 0),
  appointment_date date not null,
  appointment_time text not null,
  estimated_duration_minutes integer default 60,
  total_price numeric(10,2) not null check (total_price >= 0),
  advance_amount numeric(10,2) not null check (advance_amount >= 0),
  remaining_amount numeric(10,2) not null check (remaining_amount >= 0),
  booking_status text not null check (
    booking_status in ('pending_verification', 'confirmed', 'cancelled', 'completed')
  ) default 'pending_verification',
  technician_id text references public.technicians(id) on delete set null,
  technician_name text,
  coupon_code text,
  coupon_discount numeric(10,2) default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_bookings_customer_phone on public.bookings(customer_phone);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_date on public.bookings(appointment_date);
create index if not exists idx_bookings_status on public.bookings(booking_status);
create index if not exists idx_bookings_booking_id on public.bookings(booking_id);

create or replace trigger set_bookings_updated_at
  before update on public.bookings
  for each row execute function public.handle_updated_at();

-- ==============================================================================
-- 7. PAYMENTS TABLE
-- ==============================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  upi_transaction_id text,
  payment_screenshot_url text,
  amount numeric(10,2) not null check (amount >= 0),
  payment_status text not null check (
    payment_status in ('pending', 'verified', 'rejected')
  ) default 'pending',
  verified_by text,
  verified_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_status on public.payments(payment_status);

-- ==============================================================================
-- 8. REVIEWS TABLE
-- ==============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  service_name text,
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  photo_url text,
  is_approved boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_reviews_rating on public.reviews(rating);
create index if not exists idx_reviews_approved on public.reviews(is_approved);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.technicians enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;

-- Services RLS
create policy "Public can view active services"
  on public.services for select
  using (is_active = true or auth.uid() is not null);

create policy "Admins can manage services"
  on public.services for all
  using (auth.uid() is not null);

-- Technicians RLS
create policy "Public can view active technicians"
  on public.technicians for select
  using (is_active = true or auth.uid() is not null);

create policy "Admins can manage technicians"
  on public.technicians for all
  using (auth.uid() is not null);

-- Bookings RLS
create policy "Public can create bookings"
  on public.bookings for insert
  with check (true);

create policy "Public can view their own bookings"
  on public.bookings for select
  using (true);

create policy "Admins can update bookings"
  on public.bookings for update
  using (true);

-- Payments RLS
create policy "Public can create payments"
  on public.payments for insert
  with check (true);

create policy "Users and admins can view payments"
  on public.payments for select
  using (true);

create policy "Admins can update payment status"
  on public.payments for update
  using (true);

-- Reviews RLS
create policy "Public can view approved reviews"
  on public.reviews for select
  using (is_approved = true);

create policy "Public can submit reviews"
  on public.reviews for insert
  with check (true);

-- Users RLS
create policy "Users can view and update their profile"
  on public.users for select
  using (true);

create policy "Users can insert profiles"
  on public.users for insert
  with check (true);

create policy "Users can update their profile"
  on public.users for update
  using (true);

-- ==============================================================================
-- 10. INITIAL SEED DATA
-- ==============================================================================
insert into public.services (id, name, category, description, price_inr, duration_minutes, image_url, is_active, is_premium, home_service_allowed)
values
  ('classic-mani', 'Classic Manicure', 'basic', 'Essential nail care with shaping, cuticle treatment, and premium polish.', 499.00, 45, 'https://images.unsplash.com/photo-1610992015762-45dca7464f11?w=800&h=600&fit=crop&q=80', true, false, true),
  ('classic-pedi', 'Classic Pedicure', 'basic', 'Relaxing foot soak, gentle exfoliation, massage, and nail shaping.', 699.00, 60, 'https://images.unsplash.com/photo-1629198735700-610c0e49aab2?w=800&h=600&fit=crop&q=80', true, false, true),
  ('gel-mani', 'Gel Manicure', 'premium', 'Long-lasting high-gloss gel polish cured with UV lamp, lasts up to 3 weeks.', 899.00, 60, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=600&fit=crop&q=80', true, true, true),
  ('gel-pedi', 'Gel Pedicure Deluxe', 'premium', 'Luxury foot spa treatment with chip-free gel polish for long-lasting glamour.', 1099.00, 75, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80', true, true, true),
  ('french-mani', 'French Manicure & Tips', 'premium', 'Timeless French manicure with clean natural pink base and crisp white smile lines.', 799.00, 50, 'https://images.unsplash.com/photo-1606789674925-58a94bf6d1e8?w=800&h=600&fit=crop&q=80', true, true, true),
  ('nail-art-simple', 'Accent Nail Art (2-4 Nails)', 'art', 'Hand-painted designs, chrome powder, foil, or crystals on accent nails.', 649.00, 60, 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&h=600&fit=crop&q=80', true, false, true),
  ('nail-art-complex', 'Full Set 3D Nail Art & Extensions', 'art', 'Full acrylic/gel extensions with intricate 3D hand art, pearls, and rhinestones.', 1599.00, 120, 'https://images.unsplash.com/photo-1604654894623-b5e7c0a5a6d1?w=800&h=600&fit=crop&q=80', true, true, false),
  ('mehndi-bridal', 'Bridal Henna & Mehndi Design', 'mehndi', 'Full bridal arms and feet ornate mehndi using 100% organic dark-stain henna cone.', 3499.00, 180, 'https://images.unsplash.com/photo-1583001809873-a128495da465?w=800&h=600&fit=crop&q=80', true, true, true),
  ('bridal-package', 'Complete Bridal Glow Package', 'bridal', 'Gel nail extensions, custom bridal nail art, luxury pedicure, and relaxing hand spa.', 4999.00, 240, 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop&q=80', true, true, true),
  ('facial-glow', 'Gold Glow Facial & Clean-up', 'beauty', 'Deep pore cleansing, skin rejuvenating fruit peel, gold mask, and face massage.', 1299.00, 60, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop&q=80', true, false, true)
on conflict (id) do nothing;

insert into public.technicians (id, name, specialty, rating, avatar_url, is_active)
values
  ('tech-1', 'Uma Sharma', 'Master Nail Artist & Mehndi Specialist', 4.9, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80', true),
  ('tech-2', 'Pooja Verma', 'Gel Extensions & Nail Art', 4.8, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&q=80', true),
  ('tech-3', 'Ananya Roy', 'Spa & Bridal Nail Expert', 4.9, 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&q=80', true)
on conflict (id) do nothing;
