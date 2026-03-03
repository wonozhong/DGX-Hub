-- Create table for singleton settings (hero, about, contact)
CREATE TABLE IF NOT EXISTS sindo_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for settings
ALTER TABLE sindo_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON sindo_settings
  FOR SELECT USING (true);

-- Allow update access to authenticated users only (admin)
CREATE POLICY "Allow authenticated update access" ON sindo_settings
  FOR UPDATE USING (auth.role() = 'authenticated');
  
-- Allow insert access to authenticated users only (admin)
CREATE POLICY "Allow authenticated insert access" ON sindo_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- Create table for products
CREATE TABLE IF NOT EXISTS sindo_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for products
ALTER TABLE sindo_products ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON sindo_products
  FOR SELECT USING (true);

-- Allow all access to authenticated users only (admin)
CREATE POLICY "Allow authenticated all access" ON sindo_products
  FOR ALL USING (auth.role() = 'authenticated');


-- Insert default data for settings
INSERT INTO sindo_settings (key, value) VALUES
  ('hero', '{"title": "Excellence in <br /> <span class=''text-secondary''>Marine Solutions</span>", "subtitle": "Founded in 2006, Sindo Marine is a leading ship building and marine specialist offering comprehensive construction services, vessel repairing, and marine accommodation across Asia."}'::jsonb),
  ('about', '{"description": "Located in Batam-Indonesia, Sindo Marine is a leading ship building and marine specialist offering a wide range of construction services and vessel repairing, enhanced with marine accommodation supply and works capabilities across Asia.", "vision": "Sindo Marine - A customer-focused, responsive provider of innovative solutions and to excel in providing diverse marine accommodation services.", "mission": "To exceed the expectations of every client by offering outstanding customer service, increased flexibility, and greater value, thus optimizing functionality and improving operation efficiency."}'::jsonb),
  ('contact', '{"phone1": "+62 (778) 396228", "phone2": "+62 (778) 7058408", "fax": "+62 (778) 3581228", "emailGeneral": "sm@ptsindomarine.co.id", "emailPerson": "sam@ptsindomarine.co.id", "address": "Jl. Brigjend Katamso RT 02 RW 01, Kel. Tanjung Uncang Kec. Batu Aji, Batam - Indonesia"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert default data for products
INSERT INTO sindo_products (id, title, description, images) VALUES
  ('wall-paneling', 'Wall Paneling', 'High-quality marine grade wall paneling systems designed for durability and aesthetic appeal in marine environments.', ARRAY['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80']),
  ('ceiling-panel', 'Ceiling Panel', 'Acoustic and fire-rated ceiling panel solutions suitable for all types of vessels and offshore accommodations.', ARRAY['https://images.unsplash.com/photo-1594444663683-162e8477a321?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80']),
  ('marine-fire-door', 'Marine Fire Door', 'Certified marine fire doors ensuring safety and compliance with international maritime regulations.', ARRAY['https://images.unsplash.com/photo-1517646331032-9e8563c523a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80']),
  ('deck-covering', 'Deck Covering', 'Durable and slip-resistant deck covering solutions for various marine applications.', ARRAY['https://images.unsplash.com/photo-1517581177697-a06a189117d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80']),
  ('marine-furniture', 'Marine Furniture', 'Custom-designed marine furniture that combines comfort, functionality, and space optimization.', ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80']),
  ('wooden-deck-sheating', 'Wooden Deck Sheating', 'Premium wooden deck sheating providing a classic look with superior resistance to marine elements.', ARRAY['https://images.unsplash.com/photo-1583847661884-393f63116346?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80']),
  ('toilet-module', 'Toilet Module', 'Prefabricated wet units and toilet modules designed for quick installation and easy maintenance.', ARRAY['https://images.unsplash.com/photo-1584622050111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80']);
