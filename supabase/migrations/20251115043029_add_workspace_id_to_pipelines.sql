/*
  # Add workspace_id to pipelines table

  1. Changes
    - Add `workspace_id` column to `pipelines` table (nullable, references workspaces)
    - Keep `user_id` column for direct user access
    - Add missing columns that frontend expects: `airflow_yaml`, `schedule`, `last_run`
    - Update RLS policies to work with workspace_id

  2. Security
    - Update RLS policies to check workspace ownership
*/

-- Add workspace_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add airflow_yaml column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'airflow_yaml'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN airflow_yaml text;
  END IF;
END $$;

-- Add schedule column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'schedule'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN schedule text;
  END IF;
END $$;

-- Add last_run column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'last_run'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN last_run timestamptz;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own pipelines" ON pipelines;
DROP POLICY IF EXISTS "Users can insert own pipelines" ON pipelines;
DROP POLICY IF EXISTS "Users can update own pipelines" ON pipelines;
DROP POLICY IF EXISTS "Users can delete own pipelines" ON pipelines;

-- Create new policies that support both user_id and workspace_id
CREATE POLICY "Users can view own pipelines"
  ON pipelines FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = pipelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own pipelines"
  ON pipelines FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = pipelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own pipelines"
  ON pipelines FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = pipelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = pipelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own pipelines"
  ON pipelines FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = pipelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create index for workspace_id
CREATE INDEX IF NOT EXISTS idx_pipelines_workspace_id ON pipelines(workspace_id);