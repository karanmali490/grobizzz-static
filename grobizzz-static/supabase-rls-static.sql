-- Run in Supabase SQL Editor so the browser (anon key) can create & read profiles
-- Safe for public form + public profiles (published only)

-- Public can read published businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_businesses" ON businesses;
CREATE POLICY "public_read_published_businesses" ON businesses
  FOR SELECT USING (status = 'published');

-- Anyone with anon key can insert a new business (form submit)
DROP POLICY IF EXISTS "anon_insert_businesses" ON businesses;
CREATE POLICY "anon_insert_businesses" ON businesses
  FOR INSERT WITH CHECK (true);

-- Gallery
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_gallery" ON gallery;
CREATE POLICY "public_read_gallery" ON gallery FOR SELECT USING (true);
DROP POLICY IF EXISTS "anon_insert_gallery" ON gallery;
CREATE POLICY "anon_insert_gallery" ON gallery FOR INSERT WITH CHECK (true);

-- Services / products / hours read
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT USING (true);
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "public_read_hours" ON business_hours;
CREATE POLICY "public_read_hours" ON business_hours FOR SELECT USING (true);

-- Templates read
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_templates" ON templates;
CREATE POLICY "public_read_templates" ON templates FOR SELECT USING (true);

-- Storage: allow public read + anon upload on the 3 buckets
-- (In Dashboard → Storage → bucket → Policies you can also set this)

-- Example storage policies (run if not already public):
-- Note: bucket must exist: business-logos, business-covers, business-gallery










-- Optional: owner column for businesses (run in Supabase SQL editor)
alter table public.businesses add column if not exists user_id uuid references auth.users(id);
create index if not exists businesses_user_id_idx on public.businesses(user_id);

-- Allow authenticated users to insert their drafts
-- (Adjust to your existing RLS — example policies)

-- Public can read only published
-- create policy "public read published" on public.businesses for select using (status = 'published');

-- Owners can read their drafts
-- create policy "owner read own" on public.businesses for select to authenticated using (auth.uid() = user_id);

-- Owners can update own (pay & publish)
-- create policy "owner update own" on public.businesses for update to authenticated using (auth.uid() = user_id);




-- Run in Supabase SQL Editor so drafts belong to the logged-in user

alter table public.businesses
  add column if not exists user_id uuid references auth.users(id);

create index if not exists businesses_user_id_idx on public.businesses(user_id);

-- Example RLS (adjust names if you already have policies)

-- Authenticated users insert their own rows
-- drop policy if exists "users insert own businesses" on public.businesses;
-- create policy "users insert own businesses" on public.businesses
--   for insert to authenticated
--   with check (auth.uid() = user_id);

-- Users read their own drafts + published
-- create policy "users read own businesses" on public.businesses
--   for select to authenticated
--   using (auth.uid() = user_id OR status = 'published');

-- Public read published only
-- create policy "public read published businesses" on public.businesses
--   for select to anon
--   using (status = 'published');
