/*
  # Data Catalog Tables

  1. Tables Created
    - `catalog_databases` - Data catalog databases
    - `catalog_tables` - Data catalog tables
    - `catalog_columns` - Data catalog columns
    
  2. Security
    - Enable RLS
    - Users can only manage their own catalog data
*/

CREATE TABLE IF NOT EXISTS catalog_databases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  source_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE catalog_databases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own catalog databases"
  ON catalog_databases FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS catalog_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id uuid REFERENCES catalog_databases(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  table_type text,
  row_count bigint,
  size_bytes bigint,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(database_id, name)
);

ALTER TABLE catalog_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tables from their databases"
  ON catalog_tables FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM catalog_databases
      WHERE catalog_databases.id = catalog_tables.database_id
      AND catalog_databases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tables in their databases"
  ON catalog_tables FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM catalog_databases
      WHERE catalog_databases.id = catalog_tables.database_id
      AND catalog_databases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tables in their databases"
  ON catalog_tables FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM catalog_databases
      WHERE catalog_databases.id = catalog_tables.database_id
      AND catalog_databases.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM catalog_databases
      WHERE catalog_databases.id = catalog_tables.database_id
      AND catalog_databases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tables in their databases"
  ON catalog_tables FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM catalog_databases
      WHERE catalog_databases.id = catalog_tables.database_id
      AND catalog_databases.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS catalog_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES catalog_tables(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  data_type text NOT NULL,
  is_nullable boolean DEFAULT true,
  is_primary_key boolean DEFAULT false,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(table_id, name)
);

ALTER TABLE catalog_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view columns from their tables"
  ON catalog_columns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM catalog_tables
      JOIN catalog_databases ON catalog_databases.id = catalog_tables.database_id
      WHERE catalog_tables.id = catalog_columns.table_id
      AND catalog_databases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert columns in their tables"
  ON catalog_columns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM catalog_tables
      JOIN catalog_databases ON catalog_databases.id = catalog_tables.database_id
      WHERE catalog_tables.id = catalog_columns.table_id
      AND catalog_databases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update columns in their tables"
  ON catalog_columns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM catalog_tables
      JOIN catalog_databases ON catalog_databases.id = catalog_tables.database_id
      WHERE catalog_tables.id = catalog_columns.table_id
      AND catalog_databases.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM catalog_tables
      JOIN catalog_databases ON catalog_databases.id = catalog_tables.database_id
      WHERE catalog_tables.id = catalog_columns.table_id
      AND catalog_databases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete columns in their tables"
  ON catalog_columns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM catalog_tables
      JOIN catalog_databases ON catalog_databases.id = catalog_tables.database_id
      WHERE catalog_tables.id = catalog_columns.table_id
      AND catalog_databases.user_id = auth.uid()
    )
  );
