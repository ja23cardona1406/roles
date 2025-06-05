/*
  # Initial schema setup

  1. New Tables
    - `users`: Store user information with role permissions
    - `officials`: Store public officials information
    - `systems`: Store available systems (MUISCA, SIAT, etc.)
    - `official_roles`: Many-to-many relationship between officials and systems
    - `inventory`: Store inventory items assigned to officials
    - `official_events`: Store scheduled events for officials

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on their roles
*/

-- Create extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT role_check CHECK (role IN ('USER', 'ADMIN', 'SUPERUSER'))
);

-- Create officials table
CREATE TABLE IF NOT EXISTS officials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  age INTEGER,
  document_id TEXT UNIQUE NOT NULL,
  position TEXT NOT NULL,
  profession TEXT,
  procedure TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROVISIONAL',
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT status_check CHECK (status IN ('PROVISIONAL', 'POSITIONED', 'INACTIVE', 'FOLLOW_UP'))
);

-- Create systems table
CREATE TABLE IF NOT EXISTS systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create official_roles table (many-to-many)
CREATE TABLE IF NOT EXISTS official_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  official_id UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(official_id, system_id)
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  official_id UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  value INTEGER NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create official_events table
CREATE TABLE IF NOT EXISTS official_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  official_id UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT event_type_check CHECK (event_type IN ('FOLLOW_UP', 'TRIAL_PERIOD_EVALUATION', 'ANNUAL_EVALUATION'))
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_events ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admin users can view all users" 
  ON users FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can insert users" 
  ON users FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can update users" 
  ON users FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

-- Create policies for officials table
CREATE POLICY "All authenticated users can view officials" 
  ON officials FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert officials" 
  ON officials FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can update officials" 
  ON officials FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can delete officials" 
  ON officials FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

-- Create policies for systems table
CREATE POLICY "All authenticated users can view systems" 
  ON systems FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert systems" 
  ON systems FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can update systems" 
  ON systems FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

-- Create policies for official_roles table
CREATE POLICY "All authenticated users can view official roles" 
  ON official_roles FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert official roles" 
  ON official_roles FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can delete official roles" 
  ON official_roles FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

-- Create policies for inventory table
CREATE POLICY "All authenticated users can view inventory" 
  ON inventory FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert inventory" 
  ON inventory FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can update inventory" 
  ON inventory FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can delete inventory" 
  ON inventory FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

-- Create policies for official_events table
CREATE POLICY "All authenticated users can view official events" 
  ON official_events FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can insert official events" 
  ON official_events FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can update official events" 
  ON official_events FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

CREATE POLICY "Admin users can delete official events" 
  ON official_events FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPERUSER')
  ));

-- Insert default systems
INSERT INTO systems (name, description) VALUES
  ('MUISCA', 'Modelo Único de Ingresos, Servicios y Control Automatizado'),
  ('SIAT', 'Sistema Integrado de Administración Tributaria'),
  ('Dynamics', 'Microsoft Dynamics ERP'),
  ('SAP', 'Sistemas, Aplicaciones y Productos'),
  ('SIIF', 'Sistema Integrado de Información Financiera')
ON CONFLICT (name) DO NOTHING;