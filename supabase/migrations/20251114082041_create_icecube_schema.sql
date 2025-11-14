/*
  # Icecube Data Platform Schema

  ## Overview
  Complete database schema for Icecube - a multi-cloud data engineering and orchestration platform.
  Supports AWS, Azure, and GCP with multiple compute frameworks (Spark, Dask, Ray).

  ## 1. New Tables

  ### Core Tables
  - `profiles`: User profiles and settings
    - `id` (uuid, primary key, references auth.users)
    - `email` (text)
    - `full_name` (text)
    - `avatar_url` (text, nullable)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Cloud Infrastructure
  - `cloud_profiles`: Cloud provider credentials and configurations
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `name` (text) - friendly name for the profile
    - `cloud_provider` (text) - 'aws', 'azure', or 'gcp'
    - `region` (text)
    - `credentials_encrypted` (jsonb) - encrypted credentials
    - `stack_id` (text, nullable) - CloudFormation/ARM/Deployment Manager stack ID
    - `status` (text) - 'active', 'inactive', 'error'
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `compute_clusters`: Compute cluster configurations
    - `id` (uuid, primary key)
    - `cloud_profile_id` (uuid, references cloud_profiles)
    - `name` (text)
    - `compute_type` (text) - 'spark', 'dask', or 'ray'
    - `node_type` (text) - instance/VM type
    - `num_workers` (integer)
    - `auto_scaling` (boolean)
    - `min_workers` (integer)
    - `max_workers` (integer)
    - `cluster_config` (jsonb) - additional configuration
    - `status` (text) - 'starting', 'running', 'stopped', 'terminated', 'error'
    - `endpoint_url` (text, nullable)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Workspaces & Development
  - `workspaces`: User workspaces for organizing projects
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `name` (text)
    - `description` (text, nullable)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `notebooks`: Interactive notebooks
    - `id` (uuid, primary key)
    - `workspace_id` (uuid, references workspaces)
    - `name` (text)
    - `language` (text) - 'python', 'sql', 'scala', 'r'
    - `content` (jsonb) - notebook cells and outputs
    - `cluster_id` (uuid, nullable, references compute_clusters)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Data Management
  - `data_catalogs`: Data catalog entries
    - `id` (uuid, primary key)
    - `workspace_id` (uuid, references workspaces)
    - `name` (text)
    - `catalog_type` (text) - 'database', 'table', 'view'
    - `cloud_profile_id` (uuid, references cloud_profiles)
    - `schema_info` (jsonb) - column definitions, metadata
    - `location` (text, nullable) - S3/ADLS/GCS path
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `queries`: Saved SQL queries
    - `id` (uuid, primary key)
    - `workspace_id` (uuid, references workspaces)
    - `name` (text)
    - `query_text` (text)
    - `engine` (text) - 'spark', 'trino', 'snowflake'
    - `cluster_id` (uuid, nullable, references compute_clusters)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Orchestration
  - `jobs`: Job definitions
    - `id` (uuid, primary key)
    - `workspace_id` (uuid, references workspaces)
    - `name` (text)
    - `job_type` (text) - 'notebook', 'sql', 'pipeline'
    - `schedule` (text, nullable) - cron expression
    - `cluster_id` (uuid, references compute_clusters)
    - `config` (jsonb) - job configuration
    - `enabled` (boolean)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `job_runs`: Job execution history
    - `id` (uuid, primary key)
    - `job_id` (uuid, references jobs)
    - `status` (text) - 'pending', 'running', 'success', 'failed'
    - `started_at` (timestamptz, nullable)
    - `completed_at` (timestamptz, nullable)
    - `logs` (text, nullable)
    - `error_message` (text, nullable)
    - `created_at` (timestamptz)

  - `pipelines`: Data pipeline definitions
    - `id` (uuid, primary key)
    - `workspace_id` (uuid, references workspaces)
    - `name` (text)
    - `description` (text, nullable)
    - `pipeline_graph` (jsonb) - visual workflow definition
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Security
  All tables have RLS enabled with policies ensuring users can only access their own data.
  Policies verify authentication and ownership through workspace or user_id relationships.

  ## 3. Important Notes
  - All timestamps use `timestamptz` for timezone awareness
  - JSON columns store complex configurations and metadata
  - Foreign keys maintain referential integrity
  - Status fields use text for flexibility (can add enum types later)
  - Credentials are stored encrypted in jsonb format
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Cloud profiles table
CREATE TABLE IF NOT EXISTS cloud_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  cloud_provider text NOT NULL CHECK (cloud_provider IN ('aws', 'azure', 'gcp')),
  region text NOT NULL,
  credentials_encrypted jsonb NOT NULL DEFAULT '{}',
  stack_id text,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cloud_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cloud profiles"
  ON cloud_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cloud profiles"
  ON cloud_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cloud profiles"
  ON cloud_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cloud profiles"
  ON cloud_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Compute clusters table
CREATE TABLE IF NOT EXISTS compute_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cloud_profile_id uuid NOT NULL REFERENCES cloud_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  compute_type text NOT NULL CHECK (compute_type IN ('spark', 'dask', 'ray')),
  node_type text NOT NULL,
  num_workers integer NOT NULL DEFAULT 2,
  auto_scaling boolean DEFAULT false,
  min_workers integer DEFAULT 1,
  max_workers integer DEFAULT 10,
  cluster_config jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'stopped' CHECK (status IN ('starting', 'running', 'stopped', 'terminated', 'error')),
  endpoint_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE compute_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compute clusters"
  ON compute_clusters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cloud_profiles
      WHERE cloud_profiles.id = compute_clusters.cloud_profile_id
      AND cloud_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own compute clusters"
  ON compute_clusters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cloud_profiles
      WHERE cloud_profiles.id = compute_clusters.cloud_profile_id
      AND cloud_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own compute clusters"
  ON compute_clusters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cloud_profiles
      WHERE cloud_profiles.id = compute_clusters.cloud_profile_id
      AND cloud_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cloud_profiles
      WHERE cloud_profiles.id = compute_clusters.cloud_profile_id
      AND cloud_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own compute clusters"
  ON compute_clusters FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cloud_profiles
      WHERE cloud_profiles.id = compute_clusters.cloud_profile_id
      AND cloud_profiles.user_id = auth.uid()
    )
  );

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  language text NOT NULL DEFAULT 'python' CHECK (language IN ('python', 'sql', 'scala', 'r')),
  content jsonb DEFAULT '{"cells": []}',
  cluster_id uuid REFERENCES compute_clusters(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notebooks"
  ON notebooks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = notebooks.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own notebooks"
  ON notebooks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = notebooks.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notebooks"
  ON notebooks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = notebooks.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = notebooks.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own notebooks"
  ON notebooks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = notebooks.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Data catalogs table
CREATE TABLE IF NOT EXISTS data_catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  catalog_type text NOT NULL CHECK (catalog_type IN ('database', 'table', 'view')),
  cloud_profile_id uuid REFERENCES cloud_profiles(id) ON DELETE SET NULL,
  schema_info jsonb DEFAULT '{}',
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE data_catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data catalogs"
  ON data_catalogs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = data_catalogs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own data catalogs"
  ON data_catalogs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = data_catalogs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own data catalogs"
  ON data_catalogs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = data_catalogs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = data_catalogs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own data catalogs"
  ON data_catalogs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = data_catalogs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  query_text text NOT NULL,
  engine text NOT NULL DEFAULT 'spark' CHECK (engine IN ('spark', 'trino', 'snowflake')),
  cluster_id uuid REFERENCES compute_clusters(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queries"
  ON queries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = queries.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own queries"
  ON queries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = queries.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own queries"
  ON queries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = queries.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = queries.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own queries"
  ON queries FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = queries.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  job_type text NOT NULL CHECK (job_type IN ('notebook', 'sql', 'pipeline')),
  schedule text,
  cluster_id uuid NOT NULL REFERENCES compute_clusters(id) ON DELETE CASCADE,
  config jsonb DEFAULT '{}',
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = jobs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = jobs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = jobs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = jobs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = jobs.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Job runs table
CREATE TABLE IF NOT EXISTS job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed')),
  started_at timestamptz,
  completed_at timestamptz,
  logs text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job runs"
  ON job_runs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN workspaces ON workspaces.id = jobs.workspace_id
      WHERE jobs.id = job_runs.job_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own job runs"
  ON job_runs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN workspaces ON workspaces.id = jobs.workspace_id
      WHERE jobs.id = job_runs.job_id
      AND workspaces.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own job runs"
  ON job_runs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN workspaces ON workspaces.id = jobs.workspace_id
      WHERE jobs.id = job_runs.job_id
      AND workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN workspaces ON workspaces.id = jobs.workspace_id
      WHERE jobs.id = job_runs.job_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  pipeline_graph jsonb DEFAULT '{"nodes": [], "edges": []}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pipelines"
  ON pipelines FOR SELECT
  TO authenticated
  USING (
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
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = pipelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
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
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = pipelines.workspace_id
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cloud_profiles_user_id ON cloud_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_compute_clusters_cloud_profile_id ON compute_clusters(cloud_profile_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_workspace_id ON notebooks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_catalogs_workspace_id ON data_catalogs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_queries_workspace_id ON queries(workspace_id);
CREATE INDEX IF NOT EXISTS idx_jobs_workspace_id ON jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_job_runs_job_id ON job_runs(job_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_workspace_id ON pipelines(workspace_id);