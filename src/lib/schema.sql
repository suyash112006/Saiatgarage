-- Users Table (Mechanics & Admins)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'mechanic')) NOT NULL DEFAULT 'mechanic',
  is_active INTEGER DEFAULT 1, -- 1 = true, 0 = false
  avatar_url TEXT,
  theme TEXT CHECK(theme IN ('light', 'dark', 'system')) NOT NULL DEFAULT 'light',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table (Strict Phase 1)
-- Rule: Mobile number = identity
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL, -- The Identity
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table (Strict Phase 1)
-- Rule: One vehicle -> one customer, One customer -> many vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_number TEXT UNIQUE NOT NULL, -- Unique Identity
  model TEXT NOT NULL,
  customer_id INTEGER NOT NULL,
  last_km INTEGER DEFAULT 0, -- Auto-updates after service
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Job Cards Table (Heart of System)
-- Replaces yellow paper completely
CREATE TABLE IF NOT EXISTS job_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_no TEXT, -- Readable Job Number (e.g. JB-1001) or just computed
  vehicle_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL, -- Redundant but good for quick lookup? Or enforce via Vehicle? 
  -- User diagram: Vehicle -> JobCard. So strict FK is vehicle_id.
  -- But usually we want to freeze customer at time of job?
  -- User said: "One vehicle -> one customer".
  -- Let's include customer_id for query speed, but strict relation is via vehicle.
  -- Wait, user said "Job Card ... vehicle_id (FK)". Did NOT list customer_id in JobCard table text.
  -- "JobCard ... vehicle_id (FK)".
  -- Okay, I will REMOVE customer_id from JobCard schema if strictness implies following the text exactly.
  -- Text: id, job_no, vehicle_id, service_date, km_reading, complaints, status, created_at.
  -- I will follow text exactly.
  
  service_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  km_reading INTEGER NOT NULL,
  complaints TEXT,
  mechanic_notes TEXT,
  status TEXT CHECK(status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'BILLED')) NOT NULL DEFAULT 'OPEN',
  assigned_mechanic_id INTEGER, -- Lead Mechanic responsible for the job
  
  -- Timing (Phase 2B)
  started_at DATETIME,
  completed_at DATETIME,
  
  -- Price Summary (Phase 2)
  total_services_amount REAL DEFAULT 0,
  total_parts_amount REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  grand_total REAL DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_mechanic_id) REFERENCES users(id)
);

-- Master Services Table
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT, -- e.g. General, Electrical, Body
  base_price REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job Services Junction (Itemized Services for a Job)
CREATE TABLE IF NOT EXISTS job_card_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  service_name TEXT, -- Snapshot for history
  price REAL NOT NULL,
  quantity INTEGER DEFAULT 1,
  mechanic_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES job_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (mechanic_id) REFERENCES users(id)
);

-- Master Parts Table (Inventory)
CREATE TABLE IF NOT EXISTS parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  part_no TEXT UNIQUE,
  name TEXT NOT NULL,
  unit_price REAL DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job Parts Junction (Itemized Parts for a Job)
CREATE TABLE IF NOT EXISTS job_card_parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  part_id INTEGER NOT NULL,
  part_name TEXT, -- Snapshot for history
  part_no TEXT, -- Snapshot for history
  price REAL NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES job_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

-- Note: Parts + Labour are NOW Phase 2.

-- Invoices Table (Phase 5)
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_no TEXT UNIQUE NOT NULL,
  job_id INTEGER UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES job_cards(id) ON DELETE CASCADE
);

-- Global Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert Initial Settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('garage_name', 'GaragePro');
INSERT OR IGNORE INTO settings (key, value) VALUES ('tax_rate', '18');

-- Create initial admin user
INSERT OR IGNORE INTO users (id, name, email, password, role) 
VALUES (1, 'Super Admin', 'admin@garage.com', 'admin123', 'admin');

-- Create initial mechanic
INSERT OR IGNORE INTO users (id, name, email, password, role) 
VALUES (2, 'John Mechanic', 'mechanic@garage.com', 'mech123', 'mechanic');

-- Performance Indexes for Analytics
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_job_cards_status ON job_cards(status);
CREATE INDEX IF NOT EXISTS idx_job_cards_mechanic ON job_cards(assigned_mechanic_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_customer ON job_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_job_card_services_job ON job_card_services(job_id);
CREATE INDEX IF NOT EXISTS idx_job_card_parts_job ON job_card_parts(job_id);
