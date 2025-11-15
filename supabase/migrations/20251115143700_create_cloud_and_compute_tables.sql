/*
  # Cloud Profiles and Compute Clusters

  1. Tables Created
    - `cloud_profiles` - Cloud provider configurations
    - `compute_clusters` - Compute cluster configurations
    
  2. Security
    - Enable RLS
    - Users can only manage their own resources
*/

CREATE TABLE IF NOT EXISTS cloud_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp')),
  region text NOT NULL,
  external_id text,
  custom_domain text,
  role_arn text,
  credentials jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cloud_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cloud profiles"
  ON cloud_profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS compute_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  cloud_profile_id uuid REFERENCES cloud_profiles(id) ON DELETE SET NULL,
  instance_type text NOT NULL,
  node_count integer DEFAULT 1,
  status text DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'starting', 'stopping')),
  auto_terminate boolean DEFAULT false,
  auto_terminate_minutes integer,
  spark_version text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE compute_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own compute clusters"
  ON compute_clusters FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
