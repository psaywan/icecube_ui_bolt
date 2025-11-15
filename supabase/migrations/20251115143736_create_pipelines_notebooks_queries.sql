/*
  # Pipelines, Notebooks, and Saved Queries

  1. Tables Created
    - `pipelines` - Data pipeline definitions
    - `notebooks` - Jupyter notebook instances
    - `saved_queries` - Saved SQL queries
    
  2. Security
    - Enable RLS
    - Users can only manage their own resources
*/

CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  workflow_json jsonb,
  yaml_config text,
  cloud_provider text CHECK (cloud_provider IN ('aws', 'azure', 'gcp')),
  git_repo_url text,
  git_branch text,
  git_token text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  schedule text,
  last_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pipelines"
  ON pipelines FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE TABLE IF NOT EXISTS notebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  language text NOT NULL DEFAULT 'python' CHECK (language IN ('python', 'r', 'scala', 'sql')),
  content jsonb DEFAULT '{"cells": []}'::jsonb,
  cluster_id uuid REFERENCES compute_clusters(id) ON DELETE SET NULL,
  status text DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notebooks"
  ON notebooks FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS saved_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  query_text text NOT NULL,
  data_source_id uuid REFERENCES data_sources(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own queries"
  ON saved_queries FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
