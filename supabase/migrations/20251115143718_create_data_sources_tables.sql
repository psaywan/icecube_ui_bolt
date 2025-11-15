/*
  # Data Sources and Files

  1. Tables Created
    - `data_sources` - Data source connections
    - `source_files` - Files within data sources
    
  2. Security
    - Enable RLS
    - Users can only manage their own data sources
*/

CREATE TABLE IF NOT EXISTS data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  connection_config jsonb NOT NULL,
  status text DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data sources"
  ON data_sources FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS source_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id uuid REFERENCES data_sources(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  file_type text,
  schema_info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE source_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files from their data sources"
  ON source_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = source_files.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage files in their data sources"
  ON source_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = source_files.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files in their data sources"
  ON source_files FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = source_files.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = source_files.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files in their data sources"
  ON source_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = source_files.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );
