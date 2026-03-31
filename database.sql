-- Create contacts table for storing form submissions
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) - optional
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates on re-run)
DROP POLICY IF EXISTS "Allow public inserts" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated select" ON contacts;

-- Create a policy to allow anyone to insert (for the public form)
CREATE POLICY "Allow public inserts" ON contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy to allow authenticated users to select
CREATE POLICY "Allow authenticated select" ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Create payments table for storing PayHero payment callbacks
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reference VARCHAR(255),
  package_name VARCHAR(100),
  limit_amount VARCHAR(50),
  checkout_request_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates on re-run)
DROP POLICY IF EXISTS "Allow service role inserts" ON payments;
DROP POLICY IF EXISTS "Allow authenticated select payments" ON payments;

-- Create a policy to allow service role to insert (for webhook)
CREATE POLICY "Allow service role inserts" ON payments
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create a policy to allow authenticated users to select
CREATE POLICY "Allow authenticated select payments" ON payments
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Create index for faster payment queries
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
