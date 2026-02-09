-- Users Table (Mechanics & Admins)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'mechanic')) NOT NULL DEFAULT 'mechanic',
  is_active INTEGER DEFAULT 1, -- 1 = true, 0 = false
  avatar_url TEXT,
  theme TEXT CHECK(theme IN ('light', 'dark', 'system')) NOT NULL DEFAULT 'light',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table (Strict Phase 1)
-- Rule: Mobile number = identity
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL, -- The Identity
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table (Strict Phase 1)
-- Rule: One vehicle -> one customer, One customer -> many vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_number TEXT UNIQUE NOT NULL, -- Unique Identity
  model TEXT NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  last_km INTEGER DEFAULT 0, -- Auto-updates after service
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Cards Table (Heart of System)
CREATE TABLE IF NOT EXISTS job_cards (
  id SERIAL PRIMARY KEY,
  job_no TEXT, -- Readable Job Number (e.g. JB-1001)
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_id INTEGER, 
  service_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  km_reading INTEGER NOT NULL,
  complaints TEXT,
  mechanic_notes TEXT,
  status TEXT CHECK(status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'BILLED')) NOT NULL DEFAULT 'OPEN',
  assigned_mechanic_id INTEGER REFERENCES users(id),
  
  -- Timing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Price Summary
  total_services_amount NUMERIC DEFAULT 0,
  total_parts_amount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Services Table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  base_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Services Junction
CREATE TABLE IF NOT EXISTS job_card_services (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES job_cards(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id),
  service_name TEXT,
  price NUMERIC NOT NULL,
  quantity INTEGER DEFAULT 1,
  mechanic_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Parts Table
CREATE TABLE IF NOT EXISTS parts (
  id SERIAL PRIMARY KEY,
  part_no TEXT UNIQUE,
  name TEXT NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Parts Junction
CREATE TABLE IF NOT EXISTS job_card_parts (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES job_cards(id) ON DELETE CASCADE,
  part_id INTEGER NOT NULL REFERENCES parts(id),
  part_name TEXT,
  part_no TEXT,
  price NUMERIC NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_no TEXT UNIQUE NOT NULL,
  job_id INTEGER UNIQUE NOT NULL REFERENCES job_cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Global Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert Initial Settings
INSERT INTO settings (key, value) VALUES ('garage_name', 'GaragePro') ON CONFLICT (key) DO NOTHING;
INSERT INTO settings (key, value) VALUES ('tax_rate', '18') ON CONFLICT (key) DO NOTHING;

-- Create initial users
INSERT INTO users (name, email, username, password, role) 
VALUES ('Super Admin', 'admin@garage.com', 'admin', 'admin123', 'admin') ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, username, password, role) 
VALUES ('John Mechanic', 'mechanic@garage.com', 'mechanic', 'mech123', 'mechanic') ON CONFLICT (email) DO NOTHING;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_job_cards_status ON job_cards(status);
CREATE INDEX IF NOT EXISTS idx_job_cards_mechanic ON job_cards(assigned_mechanic_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_customer ON job_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_job_card_services_job ON job_card_services(job_id);
CREATE INDEX IF NOT EXISTS idx_job_card_parts_job ON job_card_parts(job_id);
