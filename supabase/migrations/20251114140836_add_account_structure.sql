/*
  # Add Account Structure with Unique Account IDs

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `account_id` (text, unique 12-digit number like AWS)
      - `account_name` (text)
      - `account_type` (enum: 'individual', 'organization')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `account_members`
      - `id` (uuid, primary key)
      - `account_id` (uuid, references accounts)
      - `user_id` (uuid, references auth.users)
      - `role` (enum: 'owner', 'admin', 'member')
      - `created_at` (timestamp)

  2. Changes
    - Add `account_id` reference to profiles table
    - Add `is_parent_account` to profiles (true for account creator)

  3. Security
    - Enable RLS on all tables
    - Add policies for account-based access control
    - Ensure users can only see data from their account

  4. Functions
    - `generate_account_id()` - Generate unique 12-digit account ID
    - `create_account_for_new_user()` - Auto-create account on signup
*/

-- Function to generate unique 12-digit account ID
CREATE OR REPLACE FUNCTION generate_account_id()
RETURNS text AS $$
DECLARE
  new_id text;
  id_exists boolean;
BEGIN
  LOOP
    -- Generate 12-digit number (between 100000000000 and 999999999999)
    new_id := LPAD(FLOOR(RANDOM() * 900000000000 + 100000000000)::bigint::text, 12, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM accounts WHERE account_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text UNIQUE NOT NULL DEFAULT generate_account_id(),
  account_name text NOT NULL,
  account_type text NOT NULL DEFAULT 'individual' CHECK (account_type IN ('individual', 'organization')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create account_members junction table
CREATE TABLE IF NOT EXISTS account_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(account_id, user_id)
);

-- Add account_id to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add is_parent_account to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_parent_account'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_parent_account boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
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

-- RLS Policies for account_members
DROP POLICY IF EXISTS "Users can view members in their account" ON account_members;
CREATE POLICY "Users can view members in their account"
  ON account_members FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Account owners can manage members" ON account_members;
CREATE POLICY "Account owners can manage members"
  ON account_members FOR INSERT
  TO authenticated
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Account owners can remove members" ON account_members;
CREATE POLICY "Account owners can remove members"
  ON account_members FOR DELETE
  TO authenticated
  USING (
    account_id IN (
      SELECT account_id FROM account_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Update the handle_new_user function to create account
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

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for accounts
DROP TRIGGER IF EXISTS set_accounts_updated_at ON accounts;
CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
