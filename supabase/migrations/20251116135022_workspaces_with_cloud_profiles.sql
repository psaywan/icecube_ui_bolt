/*
  # Workspaces with Cloud Profile Integration

  This migration enhances the workspaces table to support cloud-based workspace deployment
  with provider-specific configurations (AWS, Azure, GCP).

  1. New Columns Added to workspaces table:
    - `cloud_profile_id` (uuid, foreign key) - Links workspace to a cloud profile
    - `provider` (text) - Cloud provider: aws, azure, or gcp
    - `config` (jsonb) - Provider-specific configuration settings
    - `deployment_status` (text) - Workspace deployment status
    - `workspace_url` (text) - URL to access the deployed workspace
    - `deployment_error` (text) - Error message if deployment fails

  2. Security:
    - Enable RLS on workspaces table (if not already enabled)
    - Add policies for authenticated users to manage their own workspaces

  3. Provider Configuration Examples:
    AWS: {
      "crossAccountRoleArn": "arn:aws:iam::...",
      "vpcCidr": "10.0.0.0/16",
      "rootS3Bucket": "my-bucket",
      "createVpc": true,
      "createSubnets": true,
      "createSecurityGroups": true,
      "enableEfs": false,
      "enableEbs": true
    }
    
    Azure: {
      "subscriptionId": "xxx",
      "resourceGroup": "my-rg",
      "vnetCidr": "10.0.0.0/16",
      "createVnet": true,
      "storageAccountName": "mystorageacct",
      "enableManagedIdentity": true
    }
    
    GCP: {
      "projectId": "my-project",
      "network": "my-vpc",
      "subnetCidr": "10.0.0.0/16",
      "createNetwork": true,
      "gcsBucket": "my-bucket",
      "serviceAccountEmail": "sa@project.iam.gserviceaccount.com"
    }
*/

-- Add new columns to workspaces table
DO $$
BEGIN
  -- Add cloud_profile_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'cloud_profile_id'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN cloud_profile_id uuid REFERENCES cloud_profiles(id) ON DELETE SET NULL;
  END IF;

  -- Add provider column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'provider'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN provider text CHECK (provider IN ('aws', 'azure', 'gcp'));
  END IF;

  -- Add config column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'config'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN config jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add deployment_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'deployment_status'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN deployment_status text DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deploying', 'active', 'failed', 'terminated'));
  END IF;

  -- Add workspace_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'workspace_url'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN workspace_url text;
  END IF;

  -- Add deployment_error column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'deployment_error'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN deployment_error text;
  END IF;
END $$;

-- Create index on cloud_profile_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_workspaces_cloud_profile ON workspaces(cloud_profile_id);

-- Create index on provider for filtering
CREATE INDEX IF NOT EXISTS idx_workspaces_provider ON workspaces(provider);

-- Create index on deployment_status for monitoring
CREATE INDEX IF NOT EXISTS idx_workspaces_deployment_status ON workspaces(deployment_status);

-- Enable RLS if not already enabled
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can create own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can delete own workspaces" ON workspaces;

-- Create RLS policies for workspaces
CREATE POLICY "Users can view own workspaces"
  ON workspaces FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workspaces"
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
