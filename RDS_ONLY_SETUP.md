# 🎉 Supabase Completely Removed - RDS Only Setup

## Overview

The application has been completely migrated from Supabase to use **only your RDS backend** for all operations including:

✅ Authentication (login/signup)
✅ Data persistence (ETL pipelines, data sources, notebooks, etc.)
✅ All database operations

**No Supabase dependency whatsoever!**

## Quick Start

### 1. Environment Setup

Create a `.env` file in the project root:

```env
# Backend API (REQUIRED)
VITE_API_URL=http://localhost:8000

# AWS Configuration (Optional)
VITE_ICECUBE_AWS_ACCOUNT=your-account-id
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

**That's it! No Supabase variables needed.**

### 2. Start Backend

```bash
cd backend
python main.py
```

Backend runs at `http://localhost:8000`

### 3. Start Frontend

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Login

**Offline Mode (dummy account):**
- Email: `admin@icecube.com`
- Password: `admin123`

**Or create a real account** if your backend is running.

## What Changed?

### Removed
- ❌ `@supabase/supabase-js` package
- ❌ `src/lib/supabase.ts` file
- ❌ `supabase/` folder with all migrations
- ❌ Supabase environment variables
- ❌ All Supabase API calls

### Added/Updated
- ✅ `rdsApi.etlPipelines` - ETL pipeline endpoints
- ✅ All data operations now use RDS API
- ✅ Unified authentication through RDS
- ✅ Simplified environment variables

## Architecture

```
┌─────────────┐
│   Browser   │
│  (React App)│
└──────┬──────┘
       │
       │ HTTP Requests
       ▼
┌─────────────┐
│ RDS Backend │
│ (Python API)│
└──────┬──────┘
       │
       │ SQL
       ▼
┌─────────────┐
│  PostgreSQL │
│  (RDS)      │
└─────────────┘
```

**Everything goes through your RDS backend!**

## Backend Requirements

Your RDS backend MUST have these endpoints:

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/signin` - Login user
- `GET /auth/me` - Get current user

### ETL Pipelines
- `GET /etl-pipelines` - List all pipelines
- `GET /etl-pipelines/{id}` - Get specific pipeline
- `POST /etl-pipelines` - Create pipeline
- `PUT /etl-pipelines/{id}` - Update pipeline
- `DELETE /etl-pipelines/{id}` - Delete pipeline

### Data Sources
- `GET /data-sources` - List all data sources
- `POST /data-sources` - Create data source
- `PUT /data-sources/{id}` - Update data source
- `DELETE /data-sources/{id}` - Delete data source

### Notebooks
- `GET /notebooks` - List notebooks
- `POST /notebooks` - Create notebook
- `PUT /notebooks/{id}` - Update notebook
- `DELETE /notebooks/{id}` - Delete notebook

### Saved Queries
- `GET /saved-queries` - List saved queries
- `POST /saved-queries` - Create query
- `PUT /saved-queries/{id}` - Update query
- `DELETE /saved-queries/{id}` - Delete query

### Workspaces
- `GET /workspaces` - List workspaces
- `POST /workspaces` - Create workspace
- `PUT /workspaces/{id}` - Update workspace
- `DELETE /workspaces/{id}` - Delete workspace

### Cloud Profiles & Compute Clusters
- `GET /cloud-profiles` - List cloud profiles
- `POST /cloud-profiles` - Create cloud profile
- `PUT /cloud-profiles/{id}` - Update cloud profile
- `DELETE /cloud-profiles/{id}` - Delete cloud profile
- `GET /compute-clusters` - List clusters
- `POST /compute-clusters` - Create cluster
- `PUT /compute-clusters/{id}` - Update cluster
- `DELETE /compute-clusters/{id}` - Delete cluster

### Pipelines (GitLab-style)
- `GET /pipelines` - List pipelines
- `POST /pipelines` - Create pipeline
- `PUT /pipelines/{id}` - Update pipeline
- `DELETE /pipelines/{id}` - Delete pipeline

## Database Schema

Your PostgreSQL database should have tables for:

- `users` - User accounts
- `etl_pipelines` - ETL pipeline configurations
- `data_sources` - Data source connections
- `notebooks` - Interactive notebooks
- `saved_queries` - Saved SQL queries
- `workspaces` - User workspaces
- `cloud_profiles` - Cloud provider configurations
- `compute_clusters` - Compute cluster definitions
- `pipelines` - CI/CD style pipelines

Refer to `database/complete_rds_schema.sql` for the full schema.

## Benefits of RDS-Only

### Advantages
1. **Single Source of Truth** - All data in your RDS database
2. **Full Control** - You own and manage everything
3. **No External Dependencies** - No Supabase subscription needed
4. **Simpler Architecture** - One backend, one database
5. **Easier Debugging** - All logic in your codebase
6. **Cost Effective** - Only pay for RDS instance

### Considerations
1. **Backend Must Be Running** - Frontend requires backend
2. **You Handle Scaling** - Need to manage database performance
3. **Backup & Recovery** - You're responsible for backups
4. **Security** - Must implement proper authentication and authorization

## Offline Mode

The app includes a **dummy admin account** for offline development:

- Email: `admin@icecube.com`
- Password: `admin123`

This works without the backend running, but data won't persist.

## Troubleshooting

### Backend Connection Failed

**Symptoms:** "Failed to fetch" or network errors

**Solutions:**
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify `VITE_API_URL` in `.env`
3. Use offline mode with dummy admin account

### Authentication Errors

**Symptoms:** "Not authenticated" or 401 errors

**Solutions:**
1. Clear localStorage: Open DevTools → Application → Local Storage → Clear
2. Try dummy admin login
3. Check JWT secret matches between frontend and backend

### Data Not Persisting

**Symptoms:** Data disappears after refresh

**Solutions:**
1. Ensure backend is running and reachable
2. Check database connection in backend
3. Verify user is authenticated (not using offline mode)

## Development Workflow

### 1. Database First
- Design your schema
- Create migrations
- Run migrations on RDS

### 2. Backend Development
- Implement API endpoints
- Test with Postman/curl
- Ensure proper authentication

### 3. Frontend Integration
- Update `rdsApi.ts` if needed
- Use endpoints in components
- Test full flow

### 4. Testing
```bash
# Run backend
cd backend && python main.py

# Run frontend
npm run dev

# Test in browser
open http://localhost:5173
```

## Deployment

### Backend Deployment
- Deploy Python app to EC2, ECS, or Lambda
- Ensure it can connect to RDS
- Set environment variables
- Enable CORS for frontend domain

### Frontend Deployment
- Build: `npm run build`
- Deploy `dist/` folder to S3, Netlify, or Vercel
- Update `VITE_API_URL` to production backend URL
- Rebuild with production config

## Migration Complete!

You now have a fully RDS-based application with:
- ✅ No Supabase dependencies
- ✅ All data in your RDS PostgreSQL database
- ✅ Complete control over your stack
- ✅ Simpler architecture and deployment

**Your app runs entirely on your own infrastructure!**

## Need Help?

1. Check backend logs for errors
2. Verify RDS connection string
3. Test API endpoints with curl
4. Check browser console for frontend errors
5. Review backend API implementation

---

**Successfully migrated from Supabase to RDS-only architecture! 🎉**
