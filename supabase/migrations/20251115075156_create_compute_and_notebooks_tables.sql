/*
  # Create Compute Clusters and Notebooks Tables

  1. New Tables
    - `compute_clusters`: Spark/Dask/Ray cluster configurations
    - `notebooks`: Interactive notebook workspaces

  2. Security
    - Enable RLS on both tables
    - Users access through cloud_profiles and workspaces ownership
*/

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_compute_clusters_cloud_profile_id ON compute_clusters(cloud_profile_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_workspace_id ON notebooks(workspace_id);