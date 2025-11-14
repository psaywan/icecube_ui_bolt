/*
  # Create Saved Queries Schema

  1. New Tables
    - `saved_queries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, query name)
      - `description` (text, optional description)
      - `query_text` (text, the SQL query)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)
      - `tags` (text array, optional tags for categorization)
      - `is_favorite` (boolean, favorite flag)

  2. Security
    - Enable RLS on `saved_queries` table
    - Add policies for authenticated users to manage their own queries

  3. Indexes
    - Add index on user_id for faster query retrieval
    - Add index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS saved_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  query_text text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  tags text[] DEFAULT '{}',
  is_favorite boolean DEFAULT false
);

ALTER TABLE saved_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved queries"
  ON saved_queries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved queries"
  ON saved_queries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved queries"
  ON saved_queries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved queries"
  ON saved_queries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_queries_user_id ON saved_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_queries_created_at ON saved_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_queries_is_favorite ON saved_queries(user_id, is_favorite) WHERE is_favorite = true;
