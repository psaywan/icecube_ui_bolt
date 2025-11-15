/*
  # Accounts and Account Members

  1. Tables Created
    - `accounts` - Organization and individual accounts
    - `account_members` - User membership in accounts
    
  2. Updates
    - Add account_id and is_parent_account to profiles table
    
  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text UNIQUE NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL DEFAULT 'individual' CHECK (account_type IN ('individual', 'organization')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create account_members table
CREATE TABLE IF NOT EXISTS account_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(account_id, user_id)
);

ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;

-- Add columns to profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_parent_account'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_parent_account boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Policies for accounts
CREATE POLICY "Users can view accounts they are members of"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM account_members
      WHERE account_members.account_id = accounts.id
      AND account_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for account_members
CREATE POLICY "Users can view their own memberships"
  ON account_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Account owners can manage members"
  ON account_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM account_members am
      WHERE am.account_id = account_members.account_id
      AND am.user_id = auth.uid()
      AND am.role = 'owner'
    )
  );
