-- IceCube Database Schema for AWS RDS PostgreSQL
-- This script initializes all tables needed for the application

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Users table (synced with Cognito)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  cognito_sub VARCHAR(255) UNIQUE NOT NULL,
  icecube_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_users_cognito_sub ON users(cognito_sub);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_icecube_id ON users(icecube_id);

-- =====================================================
-- WORKSPACE MANAGEMENT
-- =====================================================

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);

-- Workspace members (for collaboration)
CREATE TABLE IF NOT EXISTS workspace_members (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);

-- =====================================================
-- CLOUD PROFILES
-- =====================================================

-- Cloud provider profiles
CREATE TABLE IF NOT EXISTS cloud_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  region VARCHAR(100),
  credentials JSONB NOT NULL,
  custom_domain VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_cloud_profiles_user ON cloud_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_profiles_workspace ON cloud_profiles(workspace_id);

-- =====================================================
-- DATA SOURCES
-- =====================================================

-- Data sources table
CREATE TABLE IF NOT EXISTS data_sources (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  connection_config JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  last_connected TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_data_sources_user ON data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_workspace ON data_sources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);

-- Data source files
CREATE TABLE IF NOT EXISTS data_source_files (
  id SERIAL PRIMARY KEY,
  data_source_id INTEGER REFERENCES data_sources(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_data_source_files_source ON data_source_files(data_source_id);

-- =====================================================
-- PIPELINES AND WORKFLOWS
-- =====================================================

-- Pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  workflow_definition JSONB,
  yaml_config TEXT,
  cloud_provider VARCHAR(50),
  git_repository VARCHAR(500),
  git_branch VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_run TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_pipelines_user ON pipelines(user_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_workspace ON pipelines(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_status ON pipelines(status);

-- Pipeline runs
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id SERIAL PRIMARY KEY,
  pipeline_id INTEGER REFERENCES pipelines(id) ON DELETE CASCADE,
  triggered_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  logs TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline ON pipeline_runs(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);

-- =====================================================
-- COMPUTE CLUSTERS
-- =====================================================

-- Compute clusters
CREATE TABLE IF NOT EXISTS compute_clusters (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
  cloud_profile_id INTEGER REFERENCES cloud_profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  cluster_type VARCHAR(100) NOT NULL,
  configuration JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'stopped',
  cloud_provider VARCHAR(50),
  region VARCHAR(100),
  instance_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_compute_clusters_user ON compute_clusters(user_id);
CREATE INDEX IF NOT EXISTS idx_compute_clusters_workspace ON compute_clusters(workspace_id);
CREATE INDEX IF NOT EXISTS idx_compute_clusters_status ON compute_clusters(status);

-- =====================================================
-- NOTEBOOKS
-- =====================================================

-- Notebooks
CREATE TABLE IF NOT EXISTS notebooks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  language VARCHAR(50) DEFAULT 'python',
  content JSONB,
  status VARCHAR(50) DEFAULT 'idle',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_executed TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_notebooks_user ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_workspace ON notebooks(workspace_id);

-- =====================================================
-- DATA CATALOG
-- =====================================================

-- Catalog databases
CREATE TABLE IF NOT EXISTS catalog_databases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_catalog_databases_user ON catalog_databases(user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_databases_workspace ON catalog_databases(workspace_id);

-- Catalog tables
CREATE TABLE IF NOT EXISTS catalog_tables (
  id SERIAL PRIMARY KEY,
  database_id INTEGER REFERENCES catalog_databases(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  schema_name VARCHAR(255),
  description TEXT,
  row_count BIGINT,
  size_bytes BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_catalog_tables_database ON catalog_tables(database_id);

-- Catalog columns
CREATE TABLE IF NOT EXISTS catalog_columns (
  id SERIAL PRIMARY KEY,
  table_id INTEGER REFERENCES catalog_tables(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  data_type VARCHAR(100),
  is_nullable BOOLEAN DEFAULT true,
  is_primary_key BOOLEAN DEFAULT false,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_catalog_columns_table ON catalog_columns(table_id);

-- =====================================================
-- QUERY MANAGEMENT
-- =====================================================

-- Saved queries
CREATE TABLE IF NOT EXISTS saved_queries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  query_text TEXT NOT NULL,
  query_language VARCHAR(50) DEFAULT 'sql',
  database_context VARCHAR(255),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_executed TIMESTAMP,
  execution_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_saved_queries_user ON saved_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_queries_workspace ON saved_queries(workspace_id);

-- Query history
CREATE TABLE IF NOT EXISTS query_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  query_language VARCHAR(50),
  execution_time_ms INTEGER,
  rows_returned INTEGER,
  status VARCHAR(50),
  error_message TEXT,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_query_history_user ON query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_workspace ON query_history(workspace_id);
CREATE INDEX IF NOT EXISTS idx_query_history_executed ON query_history(executed_at);

-- =====================================================
-- JOBS AND MONITORING
-- =====================================================

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  job_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  configuration JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  result TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_jobs_user ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_workspace ON jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cloud_profiles_updated_at BEFORE UPDATE ON cloud_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compute_clusters_updated_at BEFORE UPDATE ON compute_clusters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_catalog_databases_updated_at BEFORE UPDATE ON catalog_databases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_catalog_tables_updated_at BEFORE UPDATE ON catalog_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_queries_updated_at BEFORE UPDATE ON saved_queries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default workspace categories
CREATE TABLE IF NOT EXISTS workspace_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO workspace_categories (name, icon, description, sort_order) VALUES
('Data Engineering', 'database', 'For data pipeline and ETL projects', 1),
('Data Science', 'chart-line', 'For analytics and ML projects', 2),
('Business Intelligence', 'chart-bar', 'For reporting and dashboards', 3),
('Development', 'code', 'For software development projects', 4),
('Operations', 'server', 'For DevOps and infrastructure', 5),
('General', 'folder', 'For general purpose projects', 6)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- GRANTS (if needed for specific user)
-- =====================================================

-- Grant permissions to postgres user (adjust as needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'IceCube database schema initialized successfully!';
END
$$;
