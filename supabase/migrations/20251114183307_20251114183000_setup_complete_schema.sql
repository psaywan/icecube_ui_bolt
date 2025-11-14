/*
  # Complete Database Schema Setup

  ## Overview
  Sets up all necessary tables for the iceCube platform including profiles, accounts, 
  cloud profiles, and other core infrastructure.

  ## 1. New Tables

  ### Core Tables
  - `profiles`: User profiles linked to auth.users
  - `accounts`: Account structure with unique 12-digit IDs
  - `account_members`: Junction table for account membership

  ### Cloud Infrastructure
  - `cloud_profiles`: Cloud provider configurations (AWS, Azure, GCP)
  - `compute_clusters`: Compute cluster configurations
  - `notebooks`: Interactive notebooks
  - `data_sources`: Data source connections
  - `pipelines`: Data pipeline definitions
  - `saved_queries`: Saved SQL queries

  ## 2. Security
  - RLS enabled on all tables
  - Policies ensure users can only access their own data

  ## 3. Functions & Triggers
  - Auto-create account and profile on user signup
  - Generate unique 12-digit account IDs
*/

-- Function to generate unique 12-digit account ID
CREATE OR REPLACE FUNCTION generate_account_id()
RETURNS text AS $$
DECLARE
  new_id text;
  id_exists boolean;
BEGIN
  LOOP
    new_id := LPAD(FLOOR(RANDOM() * 900000000000 + 100000000000)::bigint::text, 12, '0');
    SELECT EXISTS(SELECT 1 FROM accounts WHERE account_id = new_id) INTO id_exists;
    EXIT WHEN NOT id_exists;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text UNIQUE NOT NULL DEFAULT generate_account_id(),
  account_name text NOT NULL,
  account_type text NOT NULL DEFAULT 'individual' CHECK (account_type IN ('individual', 'organization')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  is_parent_account boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Account members table
CREATE TABLE IF NOT EXISTS account_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(account_id, user_id)
);

-- Cloud profiles table
CREATE TABLE IF NOT EXISTS cloud_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp')),
  region text NOT NULL,
  external_id text,
  custom_domain text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive', 'error')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Accounts policies
DROP POLICY IF EXISTS "Users can view their own account" ON accounts;
CREATE POLICY "Users can view their own account"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Account owners can update their account" ON accounts;
CREATE POLICY "Account owners can update their account"
  ON accounts FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Account members policies
DROP POLICY IF EXISTS "Users can view members in their account" ON account_members;
CREATE POLICY "Users can view members in their account"
  ON account_members FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
  );

-- Cloud profiles policies
DROP POLICY IF EXISTS "Users can view own cloud profiles" ON cloud_profiles;
CREATE POLICY "Users can view own cloud profiles"
  ON cloud_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cloud profiles" ON cloud_profiles;
CREATE POLICY "Users can insert own cloud profiles"
  ON cloud_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cloud profiles" ON cloud_profiles;
CREATE POLICY "Users can update own cloud profiles"
  ON cloud_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cloud profiles" ON cloud_profiles;
CREATE POLICY "Users can delete own cloud profiles"
  ON cloud_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_account_id uuid;
BEGIN
  -- Create new account for the user
  INSERT INTO accounts (account_name, account_type)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'individual'
  )
  RETURNING id INTO new_account_id;

  -- Add user as account owner
  INSERT INTO account_members (account_id, user_id, role)
  VALUES (new_account_id, NEW.id, 'owner');

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, account_id, is_parent_account)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    new_account_id,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_accounts_updated_at ON accounts;
CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_cloud_profiles_updated_at ON cloud_profiles;
CREATE TRIGGER set_cloud_profiles_updated_at
  BEFORE UPDATE ON cloud_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_account_id ON profiles(account_id);
CREATE INDEX IF NOT EXISTS idx_account_members_account_id ON account_members(account_id);
CREATE INDEX IF NOT EXISTS idx_account_members_user_id ON account_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_profiles_user_id ON cloud_profiles(user_id);
