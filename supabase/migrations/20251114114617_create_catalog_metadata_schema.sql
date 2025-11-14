/*
  # Create Catalog Metadata Schema

  1. New Tables
    - `catalog_metadata`
      - `id` (uuid, primary key)
      - `data_source_id` (uuid, references data_sources)
      - `database_name` (text) - Database/schema name
      - `table_name` (text) - Table name
      - `column_name` (text) - Column name
      - `data_type` (text) - Column data type
      - `is_nullable` (boolean) - Whether column allows NULL
      - `column_order` (integer) - Order of column in table
      - `metadata` (jsonb) - Additional metadata (partitions, size, etc.)
      - `last_synced` (timestamptz) - Last time metadata was synced
      - `created_at` (timestamptz)

  2. Indexes
    - Index on data_source_id for fast lookups
    - Composite index on database, table, column for queries

  3. Security
    - Enable RLS
    - Users can only view catalog for their own data sources
*/

CREATE TABLE IF NOT EXISTS catalog_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id uuid REFERENCES data_sources(id) ON DELETE CASCADE NOT NULL,
  database_name text NOT NULL DEFAULT 'default',
  table_name text NOT NULL,
  column_name text,
  data_type text,
  is_nullable boolean DEFAULT true,
  column_order integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  last_synced timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE catalog_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view catalog for own data sources"
  ON catalog_metadata FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = catalog_metadata.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert catalog for own data sources"
  ON catalog_metadata FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = catalog_metadata.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update catalog for own data sources"
  ON catalog_metadata FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = catalog_metadata.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = catalog_metadata.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete catalog for own data sources"
  ON catalog_metadata FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM data_sources
      WHERE data_sources.id = catalog_metadata.data_source_id
      AND data_sources.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_catalog_data_source_id ON catalog_metadata(data_source_id);
CREATE INDEX IF NOT EXISTS idx_catalog_table ON catalog_metadata(database_name, table_name);
CREATE INDEX IF NOT EXISTS idx_catalog_full ON catalog_metadata(data_source_id, database_name, table_name, column_name);
