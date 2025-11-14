/*
  # Fix RLS Infinite Recursion with Helper Function

  ## Problem
  Policies on account_members that query account_members create infinite recursion.

  ## Solution
  Create a SECURITY DEFINER function to check account membership without triggering RLS,
  then use that function in the policies to break the circular dependency.

  ## Changes
  1. Create helper function that bypasses RLS
  2. Replace all policies with simplified versions using the helper function
*/

-- Create helper function to check if user is member of an account (bypasses RLS)
CREATE OR REPLACE FUNCTION is_account_member(account_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM account_members
    WHERE account_id = account_uuid
    AND user_id = user_uuid
  );
END;
$$;

-- Create helper function to check if user has admin role (bypasses RLS)
CREATE OR REPLACE FUNCTION is_account_admin(account_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM account_members
    WHERE account_id = account_uuid
    AND user_id = user_uuid
    AND role IN ('owner', 'admin')
  );
END;
$$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view account members" ON account_members;
DROP POLICY IF EXISTS "Admins can add members" ON account_members;
DROP POLICY IF EXISTS "Admins can update members" ON account_members;
DROP POLICY IF EXISTS "Admins can remove members" ON account_members;

-- Create new policies for accounts using helper function
CREATE POLICY "Users can view their accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (is_account_member(id, auth.uid()));

CREATE POLICY "Admins can update accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (is_account_admin(id, auth.uid()))
  WITH CHECK (is_account_admin(id, auth.uid()));

-- Create new policies for account_members using helper function
CREATE POLICY "Users can view account members"
  ON account_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR is_account_member(account_id, auth.uid())
  );

CREATE POLICY "Admins can add members"
  ON account_members FOR INSERT
  TO authenticated
  WITH CHECK (is_account_admin(account_id, auth.uid()));

CREATE POLICY "Admins can update members"
  ON account_members FOR UPDATE
  TO authenticated
  USING (is_account_admin(account_id, auth.uid()))
  WITH CHECK (is_account_admin(account_id, auth.uid()));

CREATE POLICY "Admins can remove members"
  ON account_members FOR DELETE
  TO authenticated
  USING (is_account_admin(account_id, auth.uid()));
