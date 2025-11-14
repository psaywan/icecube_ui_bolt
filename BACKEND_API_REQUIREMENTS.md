# Backend API Requirements for AWS RDS PostgreSQL

This document outlines all the backend API endpoints that need to be implemented to work with the migrated frontend.

## Database Schema

First, run these SQL migrations on your AWS RDS PostgreSQL database:

```sql
-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cloud Profiles
CREATE TABLE IF NOT EXISTS cloud_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cloud_provider VARCHAR(50) NOT NULL CHECK (cloud_provider IN ('aws', 'azure', 'gcp')),
  region VARCHAR(100) NOT NULL,
  credentials_encrypted JSONB,
  custom_domain VARCHAR(255),
  stack_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Compute Clusters
CREATE TABLE IF NOT EXISTS compute_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloud_profile_id UUID REFERENCES cloud_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  compute_type VARCHAR(50) NOT NULL CHECK (compute_type IN ('spark', 'dask', 'ray')),
  node_type VARCHAR(100) NOT NULL,
  num_workers INTEGER DEFAULT 2,
  auto_scaling BOOLEAN DEFAULT FALSE,
  min_workers INTEGER DEFAULT 1,
  max_workers INTEGER DEFAULT 10,
  cluster_config JSONB,
  status VARCHAR(50) DEFAULT 'stopped' CHECK (status IN ('starting', 'running', 'stopped', 'terminated', 'error')),
  endpoint_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notebooks
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  language VARCHAR(50) NOT NULL CHECK (language IN ('python', 'sql', 'scala', 'r')),
  content JSONB DEFAULT '{"cells": []}'::jsonb,
  cluster_id UUID REFERENCES compute_clusters(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Data Sources
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(100) NOT NULL,
  connection_config JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  last_tested_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Data Catalogs
CREATE TABLE IF NOT EXISTS data_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  catalog_type VARCHAR(50) NOT NULL CHECK (catalog_type IN ('database', 'table', 'view')),
  cloud_profile_id UUID REFERENCES cloud_profiles(id) ON DELETE SET NULL,
  schema_info JSONB,
  location VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Queries
CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  query_text TEXT NOT NULL,
  engine VARCHAR(50) NOT NULL CHECK (engine IN ('spark', 'trino', 'snowflake')),
  cluster_id UUID REFERENCES compute_clusters(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('notebook', 'sql', 'pipeline')),
  schedule VARCHAR(100),
  cluster_id UUID REFERENCES compute_clusters(id) ON DELETE CASCADE,
  config JSONB,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Job Runs
CREATE TABLE IF NOT EXISTS job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  logs TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pipelines
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pipeline_graph JSONB,
  cloud_provider VARCHAR(50) CHECK (cloud_provider IN ('aws', 'azure', 'gcp')),
  git_repo_url VARCHAR(500),
  git_branch VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cloud_profiles_user_id ON cloud_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_compute_clusters_cloud_profile_id ON compute_clusters(cloud_profile_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_workspace_id ON notebooks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_user_id ON data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_workspace_id ON queries(workspace_id);
CREATE INDEX IF NOT EXISTS idx_jobs_workspace_id ON jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_workspace_id ON pipelines(workspace_id);
```

## Required API Endpoints

### Authentication Endpoints

#### POST /auth/signup
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### POST /auth/signin
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### POST /auth/signout
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Signed out successfully"
}
```

#### GET /auth/user
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe"
}
```

### Cloud Profiles

#### GET /cloud-profiles
List all cloud profiles for authenticated user

#### GET /cloud-profiles/:id
Get specific cloud profile

#### POST /cloud-profiles
Create new cloud profile

#### PUT /cloud-profiles/:id
Update cloud profile

#### DELETE /cloud-profiles/:id
Delete cloud profile

### Compute Clusters

#### GET /compute-clusters
List all compute clusters

#### GET /compute-clusters/:id
Get specific cluster

#### POST /compute-clusters
Create new cluster

#### PUT /compute-clusters/:id
Update cluster

#### DELETE /compute-clusters/:id
Delete cluster

#### POST /compute-clusters/:id/start
Start a cluster

#### POST /compute-clusters/:id/stop
Stop a cluster

### Workspaces

#### GET /workspaces
List all workspaces for authenticated user

#### GET /workspaces/:id
Get specific workspace

#### POST /workspaces
Create new workspace

#### PUT /workspaces/:id
Update workspace

#### DELETE /workspaces/:id
Delete workspace

### Notebooks

#### GET /notebooks?workspace_id=:workspace_id
List notebooks in workspace

#### GET /notebooks/:id
Get specific notebook

#### POST /notebooks
Create new notebook

#### PUT /notebooks/:id
Update notebook (including content/cells)

#### DELETE /notebooks/:id
Delete notebook

#### POST /notebooks/:id/execute
Execute notebook cell
**Request:**
```json
{
  "cellId": "cell-uuid",
  "code": "print('hello')"
}
```

### Data Sources

#### GET /data-sources
List all data sources

#### GET /data-sources/:id
Get specific data source

#### POST /data-sources
Create new data source

#### PUT /data-sources/:id
Update data source

#### DELETE /data-sources/:id
Delete data source

#### POST /data-sources/test
Test connection to data source

### Data Catalog

#### GET /data-catalog?workspace_id=:workspace_id
List catalog items in workspace

#### GET /data-catalog/databases
List all databases

#### GET /data-catalog/databases/:database/tables
List tables in database

#### GET /data-catalog/databases/:database/tables/:table/schema
Get table schema

### Queries

#### GET /queries?workspace_id=:workspace_id
List queries in workspace

#### GET /queries/:id
Get specific query

#### POST /queries
Create new query

#### PUT /queries/:id
Update query

#### DELETE /queries/:id
Delete query

#### POST /queries/execute
Execute SQL query
**Request:**
```json
{
  "query": "SELECT * FROM table",
  "cluster_id": "uuid-optional"
}
```

### Jobs

#### GET /jobs?workspace_id=:workspace_id
List jobs in workspace

#### GET /jobs/:id
Get specific job

#### POST /jobs
Create new job

#### PUT /jobs/:id
Update job

#### DELETE /jobs/:id
Delete job

#### POST /jobs/:id/run
Trigger job run

#### GET /jobs/:id/runs
Get job run history

### Pipelines

#### GET /pipelines?workspace_id=:workspace_id
List pipelines in workspace

#### GET /pipelines/:id
Get specific pipeline

#### POST /pipelines
Create new pipeline

#### PUT /pipelines/:id
Update pipeline

#### DELETE /pipelines/:id
Delete pipeline

#### POST /pipelines/:id/deploy
Deploy pipeline to cloud

## Authentication

All endpoints (except `/auth/signup` and `/auth/signin`) require JWT authentication:

**Header:** `Authorization: Bearer <jwt-token>`

The JWT should contain:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "exp": 1234567890
}
```

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Environment Variables Required

```
DATABASE_URL=postgresql://postgres:zandubam2025@icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com:5432/icecubedb
JWT_SECRET=your-secret-key-here
PORT=8002
```

## Technology Stack Suggestions

- **Framework:** Express.js (Node.js) or FastAPI (Python)
- **Database:** PostgreSQL (AWS RDS) with `pg` or `psycopg2`
- **Authentication:** JWT with `jsonwebtoken` or `PyJWT`
- **Password Hashing:** `bcrypt`
- **Validation:** `joi` or `pydantic`

## Next Steps

1. Set up the backend server (Node.js/Express or Python/FastAPI)
2. Connect to AWS RDS PostgreSQL database
3. Run the migration SQL to create tables
4. Implement authentication with JWT
5. Implement all CRUD endpoints
6. Add proper error handling and validation
7. Test all endpoints with the frontend
