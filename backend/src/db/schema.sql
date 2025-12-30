-- Tenants (Empresas/Clientes)
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rnc VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  type VARCHAR(20) CHECK (type IN ('juridico', 'fisico')),
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, username)
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  rnc_ci VARCHAR(20) NOT NULL,
  address TEXT,
  email VARCHAR(255),
  phone VARCHAR(20),
  type VARCHAR(20) CHECK (type IN ('juridico', 'fisico')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  sku VARCHAR(50),
  description TEXT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 18.00,
  unit VARCHAR(20),
  type VARCHAR(20) CHECK (type IN ('product', 'service')) DEFAULT 'product',
  cost DECIMAL(12, 2) DEFAULT 0.00,
  stock_quantity INTEGER DEFAULT 0,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, sku)
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  net_total DECIMAL(12, 2) NOT NULL,
  tax_total DECIMAL(12, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, signed, sent, accepted, rejected
  e_ncf VARCHAR(20),
  xml_path TEXT,
  pdf_path TEXT,
  track_id_dgii VARCHAR(50),
  type_code VARCHAR(2) DEFAULT '31', -- 31=Invoice, 33=Credit Note, 34=Debit Note
  reference_ncf VARCHAR(19), -- For notes, referencing the original e-NCF
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  line_amount DECIMAL(12, 2) NOT NULL,
  line_tax DECIMAL(12, 2) NOT NULL
);

-- Sequences (Consecutivos)
CREATE TABLE IF NOT EXISTS sequences (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  type_code VARCHAR(10) NOT NULL, -- e.g., 31, 32
  start_date DATE,
  end_date DATE,
  next_number INTEGER NOT NULL,
  current_end_number INTEGER
);

-- Invoice Logs
CREATE TABLE IF NOT EXISTS invoice_logs (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  type VARCHAR(10), -- .p12, .pfx
  expiration_date TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Settings (Tenants configs)
CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
  key VARCHAR(50) NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, key)
);

-- Enable Row Level Security (RLS) basics
-- Note: In a real Supabase env, you would create policies here.
-- For local Node.js development, RLS is often bypassed if connecting as postgres superuser.
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

