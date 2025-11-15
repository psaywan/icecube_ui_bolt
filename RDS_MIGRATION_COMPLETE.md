# IceCube RDS Migration Complete

The platform has been successfully migrated from Supabase to AWS RDS PostgreSQL!

## Architecture

- **Backend**: FastAPI running on port 8000
- **Database**: AWS RDS PostgreSQL
- **Frontend**: React with Vite (connects to backend API)
- **Authentication**: JWT-based with bcrypt password hashing

## Database Schema

The complete RDS schema is in `database/complete_rds_schema.sql` and includes:

- Users & Authentication
- Accounts & Profiles
- Workspaces
- Cloud Profiles & Compute Clusters
- Data Sources
- Pipelines
- Notebooks
- Saved Queries

## Backend API

**Location**: `backend/complete_rds_api.py`

### Endpoints

#### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Login user
- `GET /auth/me` - Get current user info

#### Workspaces
- `GET /workspaces` - List all workspaces
- `POST /workspaces` - Create workspace

#### Data Sources
- `GET /data-sources` - List all data sources
- `POST /data-sources` - Create data source

#### Pipelines
- `GET /pipelines` - List all pipelines
- `POST /pipelines` - Create pipeline
- `PUT /pipelines/{id}` - Update pipeline

#### Cloud Profiles
- `GET /cloud-profiles` - List cloud profiles
- `POST /cloud-profiles` - Create cloud profile

#### Compute Clusters
- `GET /compute-clusters` - List compute clusters
- `POST /compute-clusters` - Create cluster

#### Notebooks
- `GET /notebooks` - List notebooks
- `POST /notebooks` - Create notebook

#### Saved Queries
- `GET /saved-queries` - List saved queries
- `POST /saved-queries` - Create query

## How to Run

### Step 1: Apply Database Schema

Connect to your RDS instance and run:

```bash
psql -h icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com -U postgres -d icecubedb -f database/complete_rds_schema.sql
```

Or use any PostgreSQL client to execute the schema.

### Step 2: Start Backend API

```bash
cd backend
chmod +x run.sh
./run.sh
```

Or manually:

```bash
cd backend
pip install -r requirements.txt
python complete_rds_api.py
```

The API will start on `http://localhost:8000`

### Step 3: Start Frontend

In a separate terminal:

```bash
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## Environment Variables

The `.env` file is already configured with:

```
VITE_API_URL=http://localhost:8000
DB_HOST=icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=icecubedb
DB_USER=postgres
DB_PASSWORD=zandubam2025
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-2024
```

## Key Changes

### Frontend

1. **New RDS API Client**: `src/lib/rdsApi.ts`
   - REST API calls instead of Supabase SDK
   - JWT token management
   - All CRUD operations

2. **New Auth Context**: `src/contexts/RDSAuthContext.tsx`
   - Uses RDS API for authentication
   - JWT-based session management
   - Compatible with existing components

3. **App Updated**: `src/App.tsx`
   - Now uses `RDSAuthProvider` instead of Supabase `AuthProvider`

### Backend

1. **Complete API**: `backend/complete_rds_api.py`
   - All authentication endpoints
   - Full CRUD for all entities
   - JWT token generation and validation
   - Password hashing with bcrypt

2. **Database**: PostgreSQL RDS
   - Complete schema with all tables
   - Proper foreign key relationships
   - Auto-generated account IDs
   - Triggers for updated_at timestamps

## Testing

1. **Sign Up**: Create a new account
   - Backend creates user, account, profile, and account_member records
   - Returns JWT token
   - Account ID is auto-generated (12-digit number)

2. **Sign In**: Login with email/password
   - Validates credentials
   - Returns JWT token
   - Token includes user info

3. **Access Dashboard**: All features work
   - Workspaces
   - Data Sources
   - Pipelines
   - Cloud Profiles
   - Compute Clusters
   - Notebooks
   - Saved Queries

## Account ID Display

The Icecube Account ID is now properly displayed in the user profile dropdown because:

1. During signup, an account is created with a unique 12-digit ID
2. The account_id is returned in the signin/signup response
3. The frontend stores and displays it in the profile

## API Documentation

Once the backend is running, visit:
- http://localhost:8000 - API info
- http://localhost:8000/docs - Interactive API documentation (Swagger)
- http://localhost:8000/health - Health check

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Token expiration (24 hours)
- Protected routes require authentication
- Environment-based configuration

## Next Steps

1. Deploy backend to a cloud server (AWS EC2, Azure, etc.)
2. Update VITE_API_URL to point to production backend
3. Set up HTTPS for production
4. Configure CORS properly for production domain
5. Implement refresh token rotation
6. Add rate limiting
7. Set up logging and monitoring
