/*
  # Create ETL Pipelines Table

  1. New Tables
    - `etl_pipelines`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `workspace_id` (uuid, references workspaces)
      - `name` (text)
      - `description` (text)
      - `mode` (text) - 'visual' or 'form'
      - `workflow_data` (jsonb) - stores nodes, edges, positions for visual mode
      - `sources` (jsonb) - array of source configurations
      - `targets` (jsonb) - array of target configurations
      - `transformations` (jsonb) - transformation logic
      - `cloud_services` (jsonb) - selected cloud services (Glue, Data Factory, etc)
      - `deployment_config` (jsonb) - deployment settings
      - `status` (text) - 'draft', 'active', 'paused', 'failed'
      - `last_run` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `etl_pipelines` table
    - Add policies for authenticated users to manage their own pipelines
*/

CREATE TABLE IF NOT EXISTS etl_pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  mode text DEFAULT 'visual' CHECK (mode IN ('visual', 'form')),
  workflow_data jsonb DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  sources jsonb DEFAULT '[]'::jsonb,
  targets jsonb DEFAULT '[]'::jsonb,
  transformations jsonb DEFAULT '[]'::jsonb,
  cloud_services jsonb DEFAULT '[]'::jsonb,
  deployment_config jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'failed', 'completed')),
  last_run timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_etl_pipelines_user_id ON etl_pipelines(user_id);
CREATE INDEX IF NOT EXISTS idx_etl_pipelines_workspace_id ON etl_pipelines(workspace_id);
CREATE INDEX IF NOT EXISTS idx_etl_pipelines_status ON etl_pipelines(status);

ALTER TABLE etl_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ETL pipelines"
  ON etl_pipelines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ETL pipelines"
  ON etl_pipelines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ETL pipelines"
  ON etl_pipelines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ETL pipelines"
  ON etl_pipelines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_etl_pipeline_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER etl_pipeline_updated_at
  BEFORE UPDATE ON etl_pipelines
  FOR EACH ROW
  EXECUTE FUNCTION update_etl_pipeline_updated_at();
