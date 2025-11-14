/*
  # Create Workspaces with Categories

  ## Overview
  Create workspaces table with built-in category support, similar to Databricks workspace organization.
  Users can categorize workspaces by type (e.g., Development, Production, Data Science, ML/AI).

  ## 1. New Tables

  ### Workspaces Table
  - `workspaces`: User workspaces for organizing projects with categories
    - `id` (uuid, primary key)
    - `user_id` (uuid, references auth.users)
    - `name` (text) - Workspace name
    - `description` (text, nullable) - Workspace description
    - `category` (text) - Primary workspace category (Development, Production, etc.)
    - `tags` (text[]) - Array of additional tags for flexible organization
    - `icon` (text, nullable) - Optional icon/emoji for visual identification
    - `color` (text) - Color code for category visual grouping
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Security
  - RLS enabled on workspaces table
  - Users can only access their own workspaces
  - Policies for SELECT, INSERT, UPDATE, DELETE operations

  ## 3. Default Categories
  Common workspace categories:
  - "Development" - Dev/Test environments
  - "Production" - Production workloads
  - "Data Science" - Analytics and data exploration
  - "Machine Learning" - ML model training and deployment
  - "ETL/ELT" - Data pipeline workspaces
  - "Analytics" - BI and reporting
  - "Research" - Experimental work
  - "Shared" - Team collaboration spaces
  - "General" - Default uncategorized workspaces
*/

-- Create workspaces table with category support
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'General',
  tags text[] DEFAULT ARRAY[]::text[],
  icon text,
  color text DEFAULT '#06b6d4',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_category ON workspaces(category);
CREATE INDEX IF NOT EXISTS idx_workspaces_tags ON workspaces USING GIN(tags);
