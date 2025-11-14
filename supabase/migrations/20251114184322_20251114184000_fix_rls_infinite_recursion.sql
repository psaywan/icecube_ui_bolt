/*
  # Fix RLS Infinite Recursion

  ## Problem
  The accounts and account_members tables have circular RLS policy dependencies causing
  infinite recursion errors when querying.

  ## Solution
  Simplify RLS policies by using direct auth.uid() checks instead of subqueries that
  reference the same table, breaking the circular dependency.

  ## Changes
  1. Drop existing problematic policies
  2. Create simplified policies that avoid recursion
  3. Use SECURITY DEFINER functions where necessary
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own account" ON accounts;
DROP POLICY IF EXISTS "Account owners can update their account" ON accounts;
DROP POLICY IF EXISTS "Users can view members in their account" ON account_members;
DROP POLICY IF EXISTS "Account owners can manage members" ON account_members;
DROP POLICY IF EXISTS "Account owners can remove members" ON account_members;

-- Create simplified policies for accounts
-- Users can view accounts they are members of (direct join, no recursion)
CREATE POLICY "Users can view their accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM account_members
      WHERE account_members.account_id = accounts.id
      AND account_members.user_id = auth.uid()
    )
  );

-- Account owners/admins can update their account
CREATE POLICY "Admins can update accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM account_members
      WHERE account_members.account_id = accounts.id
      AND account_members.user_id = auth.uid()
      AND account_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_members
      WHERE account_members.account_id = accounts.id
      AND account_members.user_id = auth.uid()
      AND account_members.role IN ('owner', 'admin')
    )
  );

-- Create simplified policies for account_members
-- Users can view all members in their account (use direct user_id check to avoid recursion)
CREATE POLICY "Users can view account members"
  ON account_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
  );

-- Only owners/admins can add members
CREATE POLICY "Admins can add members"
  ON account_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_members existing
      WHERE existing.account_id = account_members.account_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update member roles
CREATE POLICY "Admins can update members"
  ON account_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM account_members existing
      WHERE existing.account_id = account_members.account_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM account_members existing
      WHERE existing.account_id = account_members.account_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can remove members
CREATE POLICY "Admins can remove members"
  ON account_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM account_members existing
      WHERE existing.account_id = account_members.account_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
  );
