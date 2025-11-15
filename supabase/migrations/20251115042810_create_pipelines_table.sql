/*
  # Create Pipelines Table

  1. New Tables
    - `pipelines`: Data pipeline definitions and workflows
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text, nullable)
      - `cloud_provider` (text) - 'aws', 'azure', or 'gcp'
      - `git_repo_url` (text, nullable)
      - `git_branch` (text, nullable)
      - `workflow_yaml` (text, nullable)
      - `pipeline_graph` (jsonb) - visual workflow definition
      - `status` (text) - 'draft', 'active', 'inactive'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `pipelines` table
    - Add policies for authenticated users to manage their own pipelines
*/

-- Create pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  cloud_provider text NOT NULL DEFAULT 'aws' CHECK (cloud_provider IN ('aws', 'azure', 'gcp')),
  git_repo_url text,
  git_branch text DEFAULT 'main',
  workflow_yaml text,
  pipeline_graph jsonb DEFAULT '{"nodes": [], "edges": []}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pipelines"
  ON pipelines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pipelines"
  ON pipelines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pipelines"
  ON pipelines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pipelines"
  ON pipelines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_pipelines_user_id ON pipelines(user_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_status ON pipelines(status);