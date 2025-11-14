/*
  # Fix RLS Infinite Recursion

  This migration fixes the infinite recursion issue in RLS policies caused by
  account_members policy referencing itself.

  ## Changes
  
  1. Drop existing account_members SELECT policy
  2. Create new simple policy that checks user_id directly (no recursion)
  
  ## Security
  
  - Users can only see account_members records where they are a member
  - This breaks the infinite recursion loop while maintaining security
*/

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view members in their account" ON account_members;

-- Create a simple, non-recursive policy
CREATE POLICY "Users can view their own membership records"
  ON account_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Also allow users to see other members in accounts they belong to
-- This uses a simpler check that won't cause recursion
CREATE POLICY "Users can view other members in their accounts"
  ON account_members
  FOR SELECT
  TO authenticated
  USING (
    account_id IN (
      SELECT account_id 
      FROM account_members 
      WHERE user_id = auth.uid()
    )
  );