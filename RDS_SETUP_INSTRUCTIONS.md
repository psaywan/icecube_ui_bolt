# RDS Migration Setup Instructions

This project has been migrated from Supabase to AWS RDS PostgreSQL with FastAPI backend.

## Architecture

- **Database**: AWS RDS PostgreSQL
- **Backend**: FastAPI with JWT authentication
- **Frontend**: React with Vite

## Prerequisites

1. Python 3.8+ installed
2. Node.js 18+ installed
3. Access to AWS RDS instance

## Setup Steps

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The requirements include:
- FastAPI
- SQLAlchemy
- psycopg2-binary (PostgreSQL driver)
- python-jose (JWT)
- passlib (password hashing)

### 2. Initialize the Database

The database configuration is already set in `.env` file:
- Host: `icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com`
- Database: `icecubedb`
- User: `postgres`
- Password: `zandubam2025`

Run the initialization script to create all tables:

```bash
cd backend
python init_database.py
```

This will:
- Drop all existing tables (fresh start)
- Create all necessary tables
- Set up indexes and triggers
- Display the list of created tables

### 3. Start the FastAPI Backend

```bash
cd backend
python rds_auth_api.py
```

The backend will start on `http://localhost:8000`

You can verify it's running by visiting:
- `http://localhost:8000` - API info
- `http://localhost:8000/health` - Health check
- `http://localhost:8000/docs` - Interactive API documentation

### 4. Start the Frontend

In a new terminal:

```bash
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## Database Schema

### Tables Created

1. **users** - User authentication
   - id, email, password_hash, full_name, email_confirmed

2. **accounts** - Account management
   - id, account_id (12-digit), account_name, account_type

3. **profiles** - User profiles
   - id, email, full_name, avatar_url, account_id

4. **account_members** - Account membership
   - id, account_id, user_id, role

5. **workspaces** - Project workspaces
   - id, user_id, name, description, category, tags

6. **cloud_profiles** - Cloud provider configurations
   - id, user_id, name, provider, region, status

7. **compute_clusters** - Compute cluster management
   - id, cloud_profile_id, name, compute_type, node_type

8. **data_sources** - Data source connections
   - id, user_id, name, type, config, status

9. **pipelines** - Data pipeline definitions
   - id, user_id, workspace_id, name, workflow_yaml

10. **notebooks** - Interactive notebooks
    - id, workspace_id, name, language, content

11. **saved_queries** - Saved SQL queries
    - id, user_id, name, query_text, tags

12. **blacklisted_tokens** - JWT token blacklist for logout
    - id, token, expires_at

## Authentication Flow

### Sign Up
```
POST http://localhost:8000/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "full_name": "John Doe"
}
```

### Sign In
```
POST http://localhost:8000/auth/signin
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

Returns:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

### Protected Routes

All protected routes require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/signin` - Login
- `POST /auth/logout` - Logout (blacklist token)
- `GET /auth/me` - Get current user info (protected)
- `POST /auth/refresh` - Refresh access token

### Health & Info
- `GET /` - API information
- `GET /health` - Health check with database status

## Environment Variables

The `.env` file contains:

```env
# Frontend API URL
VITE_AUTH_API_URL=http://localhost:8000

# Database Configuration
DB_HOST=icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=icecubedb
DB_USER=postgres
DB_PASSWORD=zandubam2025

# JWT Secret
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-2024

# AWS Credentials
AWS_ACCESS_KEY_ID=AKIAYYFQQTTIVPMREWAJ
AWS_SECRET_ACCESS_KEY=a/QBVLqDCNJ8nRapyOe5YWd/UCNBnZQxgssv1osW
```

## Security Features

1. **Password Hashing**: Uses bcrypt for secure password storage
2. **JWT Tokens**: Access tokens (24 hours) and refresh tokens (30 days)
3. **Token Blacklisting**: Logout invalidates tokens
4. **CORS**: Configured for frontend access
5. **SQL Injection Protection**: Using SQLAlchemy parameterized queries

## Troubleshooting

### Database Connection Issues

If you see connection errors:
1. Check if RDS security group allows your IP
2. Verify database credentials in `.env`
3. Test connection: `python -c "import psycopg2; print('OK')"`

### Backend Not Starting

1. Check if all dependencies are installed
2. Verify Python version: `python --version` (needs 3.8+)
3. Check if port 8000 is available

### Frontend Issues

1. Clear browser cache and localStorage
2. Check if backend is running on `http://localhost:8000`
3. Verify `.env` has correct `VITE_AUTH_API_URL`

## Migration from Supabase

Key changes:
- ✅ Removed Supabase client library
- ✅ Using PostgreSQL RDS directly
- ✅ Custom JWT authentication (replacing Supabase Auth)
- ✅ Password hashing with bcrypt
- ✅ Token management in localStorage
- ✅ All tables migrated to RDS

## Testing the Setup

1. Visit `http://localhost:5173`
2. Click "Sign Up" and create a new account
3. Login with your credentials
4. You should see the dashboard

## Files Modified

- `src/contexts/useAuth.jsx` - Updated to use RDS backend API
- `backend/rds_auth_api.py` - New FastAPI backend
- `database/drop_and_create_fresh.sql` - Complete schema
- `.env` - Updated with RDS credentials
- `backend/requirements.txt` - Python dependencies

## Next Steps

1. Test authentication flow
2. Add additional API endpoints as needed
3. Implement password reset functionality
4. Add email verification
5. Deploy backend to production server
