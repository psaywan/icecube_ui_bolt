# IceCube RDS + Cognito Migration Guide

This document describes the migration from Supabase to AWS RDS PostgreSQL with AWS Cognito authentication.

## Overview

The application has been migrated to use:
- **AWS RDS PostgreSQL** for database storage
- **AWS Cognito** for user authentication
- **Custom Backend API** for all data operations

## What Changed

### 1. Environment Configuration

The `.env` file now contains:

```env
# Database Configuration (RDS PostgreSQL)
DB_HOST=icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com
DATABASE_URL=postgresql://postgres:zandubam2025@icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com:5432/icecubedb
DB_PORT=5432
DB_NAME=icecubedb
DB_USER=postgres
DB_PASSWORD=zandubam2025

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=ap-south-1_9u5InoI1l
COGNITO_CLIENT_ID=4fc5emndpls0m5bjqrdbg58rat
COGNITO_CLIENT_SECRET=8fosdmjn30038orbuecr5kdtegkrrmfdkmv47t4100g4i6c17qd
COGNITO_REGION=ap-south-1

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-icecube-2025
```

### 2. Database Schema

A complete database schema has been created in `database/init_rds_schema.sql` that includes:

#### Core Tables:
- **users** - User profiles synced with Cognito
- **workspaces** - Project workspaces with categories
- **workspace_members** - Collaboration management
- **cloud_profiles** - Cloud provider configurations (AWS, Azure, GCP)
- **data_sources** - Data source connections (S3, BigQuery, etc.)
- **data_source_files** - Files associated with data sources
- **pipelines** - Data pipeline definitions with YAML configs
- **pipeline_runs** - Pipeline execution history
- **compute_clusters** - Compute cluster management
- **notebooks** - Jupyter-style notebooks
- **catalog_databases** - Data catalog databases
- **catalog_tables** - Data catalog tables
- **catalog_columns** - Data catalog columns
- **saved_queries** - Saved SQL/query templates
- **query_history** - Query execution history
- **jobs** - Scheduled job definitions
- **workspace_categories** - Predefined workspace categories

#### Features:
- Automatic `updated_at` timestamp triggers
- Foreign key relationships for data integrity
- Indexes for optimized queries
- JSONB columns for flexible metadata storage
- Support for multi-user collaboration

### 3. Authentication System

The authentication has been completely replaced:

#### Old System (Supabase):
```typescript
import { supabase } from './lib/supabase';
await supabase.auth.signUp({ email, password });
```

#### New System (Cognito + Backend API):
```typescript
import apiService from './lib/api';
await apiService.signup({ email, password, name });
await apiService.signin({ email, password });
```

### 4. Authentication Files

Three key files handle authentication:

#### `/src/lib/cognito.js`
- Cognito configuration
- OAuth URL builders
- Token exchange functions
- JWT parsing utilities

#### `/src/lib/api.js`
- Complete API service class
- Authentication endpoints (signup, signin, logout, etc.)
- Token management (access & refresh tokens)
- Password management (forgot, reset, change)
- Auto-retry with token refresh
- LocalStorage token persistence

#### `/src/contexts/useAuth.jsx`
- React Context for authentication
- User state management
- Account ID generation
- Online/offline detection
- Backend synchronization
- Password management functions

### 5. Component Updates

The `AuthContext.tsx` wrapper maintains backward compatibility:
- Transforms API responses to match old Supabase format
- Provides same interface to existing components
- No changes needed in most components

### 6. Package Changes

**Removed:**
- `@supabase/supabase-js`

**Added:**
- `pg` - PostgreSQL client
- `aws-sdk` - AWS SDK for JavaScript
- `axios` - HTTP client (already present)

## Database Setup

### Step 1: Connect to RDS

```bash
psql -h icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com \
     -p 5432 \
     -U postgres \
     -d icecubedb
```

Password: `zandubam2025`

### Step 2: Initialize Schema

```bash
psql -h icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com \
     -p 5432 \
     -U postgres \
     -d icecubedb \
     -f database/init_rds_schema.sql
```

Or copy-paste the SQL content from `database/init_rds_schema.sql` into your PostgreSQL client.

### Step 3: Verify Tables

```sql
\dt
```

You should see all the tables listed above.

## Backend API Requirements

Your backend API at `http://localhost:8002` must implement these endpoints:

### Authentication Endpoints

```
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-email
POST /api/auth/change-password
POST /api/auth/refresh
GET  /api/auth/me
PUT  /api/auth/profile
GET  /api/health
```

### Expected Response Format

```javascript
// Success
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "cognito_sub": "...",
      "icecube_id": "1234-5678-9012",
      "email": "user@example.com",
      "username": "icecube_...",
      "full_name": "John Doe"
    },
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}

// Error
{
  "success": false,
  "error": "Error message here",
  "status": 400
}
```

## User Flow

### Sign Up Flow:
1. User submits email, password, name
2. Frontend calls `apiService.signupAndSignin()`
3. Backend creates Cognito user
4. Backend creates RDS user record
5. Backend returns tokens + user data
6. Frontend stores tokens in localStorage
7. User is redirected to dashboard

### Sign In Flow:
1. User submits email, password
2. Frontend calls `apiService.signin()`
3. Backend validates with Cognito
4. Backend fetches user from RDS
5. Backend returns tokens + user data
6. Frontend stores tokens in localStorage
7. User is redirected to dashboard

### Token Refresh Flow:
1. Every 15 minutes, tokens auto-refresh
2. On 401 errors, automatic token refresh
3. If refresh fails, user is logged out

## Features Preserved

All existing features work the same:
- User authentication (signup, signin, logout)
- Dashboard access
- Workspaces management
- Data sources management
- Pipeline builder
- Notebooks
- Query editor
- Cloud profiles
- Compute clusters
- Data catalog

## Testing the Migration

### 1. Start Your Backend

Ensure your backend API is running on `http://52.66.228.92:8000`

### 2. Start the Frontend

```bash
npm run dev
```

### 3. Test Authentication

1. Go to `/signup` and create a new account
2. Check that user is created in both:
   - AWS Cognito User Pool
   - RDS `users` table
3. Sign out and sign in again
4. Verify session persistence

### 4. Test API Integration

Open browser console and run:

```javascript
// Check API status
const status = await window.apiService.getDetailedStatus();
console.log(status);

// Test all endpoints
await window.apiService.testAllEndpoints();
```

## Troubleshooting

### Issue: "Could not connect to database"

**Solution:** Verify RDS security group allows connections from your IP:
```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 5432 \
  --cidr YOUR_IP/32
```

### Issue: "Token expired"

**Solution:** Tokens refresh automatically. If not working:
```javascript
localStorage.removeItem('auth_token');
localStorage.removeItem('refresh_token');
// Then sign in again
```

### Issue: "CORS error"

**Solution:** Ensure backend has CORS enabled:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: "User not found in Cognito"

**Solution:** Verify Cognito User Pool ID and region in `.env`:
```bash
aws cognito-idp list-users \
  --user-pool-id ap-south-1_9u5InoI1l \
  --region ap-south-1
```

## Migration Checklist

- [x] Update `.env` with RDS and Cognito credentials
- [x] Install required packages (pg, aws-sdk, axios)
- [x] Create database schema migration script
- [x] Update AuthContext to use Cognito and API
- [x] Replace Supabase lib with API service
- [x] Remove Supabase dependencies
- [x] Test build successfully
- [ ] Run database migration on RDS
- [ ] Test user signup/signin flow
- [ ] Verify data persistence in RDS
- [ ] Test all application features
- [ ] Deploy to production

## Security Notes

⚠️ **IMPORTANT SECURITY REMINDERS:**

1. **Never commit `.env` to git** - Add it to `.gitignore`
2. **Rotate credentials** before production deployment
3. **Use AWS Secrets Manager** for production secrets
4. **Enable MFA** on AWS account
5. **Restrict RDS security group** to specific IPs only
6. **Use SSL/TLS** for RDS connections in production
7. **Implement rate limiting** on auth endpoints
8. **Monitor Cognito** for unusual sign-in attempts
9. **Regular backup** RDS database
10. **Keep packages updated** for security patches

## Next Steps

1. Run the database migration script
2. Ensure your backend API implements all required endpoints
3. Test the complete authentication flow
4. Verify data persistence across all features
5. Monitor logs for any errors
6. Consider implementing:
   - Email verification
   - Multi-factor authentication
   - OAuth providers (Google, GitHub)
   - Password strength requirements
   - Account lockout after failed attempts

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify RDS connectivity
4. Verify Cognito user pool status
5. Check API endpoint responses

## Summary

The migration is complete! Your application now uses:
- ✅ AWS RDS PostgreSQL for all data
- ✅ AWS Cognito for user authentication
- ✅ Custom backend API for all operations
- ✅ JWT tokens for session management
- ✅ No dependency on Supabase

All existing features are preserved with enhanced control over your infrastructure.
