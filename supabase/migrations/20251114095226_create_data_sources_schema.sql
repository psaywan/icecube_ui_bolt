/*
  # Create Data Sources Schema

  1. New Tables
    - `data_sources`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - User-friendly name for the connection
      - `type` (text) - Type: s3, azure_blob, gcs, athena, hdfs, sap_hana, mysql, postgresql, mongodb, snowflake, redshift, bigquery
      - `config` (jsonb) - Connection configuration (credentials, endpoints, etc.)
      - `status` (text) - Connection status: active, inactive, error
      - `last_tested` (timestamptz) - Last time connection was tested
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `description` (text) - Optional description

  2. Security
    - Enable RLS on `data_sources` table
    - Add policies for authenticated users to manage their own data sources
*/

CREATE TABLE IF NOT EXISTS data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_tested timestamptz,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data sources"
  ON data_sources FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data sources"
  ON data_sources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data sources"
  ON data_sources FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data sources"
  ON data_sources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(status);