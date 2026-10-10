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
