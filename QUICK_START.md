# Quick Start Guide - IceCube with RDS

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL client (optional, for database setup)

## Setup in 3 Steps

### 1. Setup Database (One-time)

The database schema is ready in `database/complete_rds_schema.sql`

**Option A: Using psql**
```bash
psql -h icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com -U postgres -d icecubedb -f database/complete_rds_schema.sql
```

**Option B: Using any PostgreSQL client**
- Connect to your RDS instance
- Execute the SQL from `database/complete_rds_schema.sql`

### 2. Start Backend API

```bash
cd backend
pip install -r requirements.txt
python complete_rds_api.py
```

Backend will start on **http://localhost:8000**

You should see:
```
🚀 Starting IceCube Complete RDS API...
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 3. Start Frontend

In a new terminal:

```bash
npm install
npm run dev
```

Frontend will start on **http://localhost:5173**

## Test It Out

1. Open **http://localhost:5173**
2. Click **"Get Started"** or **"Sign Up"**
3. Fill in your details:
   - Email: your@email.com
   - Password: YourPassword123
   - Full Name: Your Name
4. Click **Sign Up**
5. You'll be logged in automatically
6. Check the profile dropdown (top right) - you'll see your **Icecube Account ID**!

## Verify Backend is Working

Visit these URLs:

- http://localhost:8000 - API info
- http://localhost:8000/health - Health check
- http://localhost:8000/docs - Interactive API documentation

## Troubleshooting

### Backend won't start

**Error: Database credentials missing**
- Make sure `.env` file has DB credentials
- Check DATABASE_URL is correct

**Error: Connection refused**
- Verify RDS instance is running
- Check security group allows your IP
- Verify credentials are correct

### Frontend can't connect to backend

**Error: Failed to fetch**
- Make sure backend is running on port 8000
- Check `VITE_API_URL` in `.env` is `http://localhost:8000`
- Restart frontend after changing `.env`

### Account ID not showing

- Make sure you signed up (not just signed in with old account)
- Old accounts from Supabase won't have account_id
- Create a new account to test

## What's Different from Supabase

| Feature | Supabase | RDS |
|---------|----------|-----|
| Authentication | Supabase Auth | Custom JWT + bcrypt |
| Database | Supabase Postgres | AWS RDS Postgres |
| API | Supabase SDK | REST API |
| Session | Supabase session | JWT tokens |
| Account ID | Supabase generated | Custom 12-digit ID |

## File Structure

```
project/
├── backend/
│   ├── complete_rds_api.py  ← Main API server
│   ├── requirements.txt      ← Python dependencies
│   └── run.sh               ← Startup script
├── database/
│   └── complete_rds_schema.sql  ← Database schema
├── src/
│   ├── lib/
│   │   └── rdsApi.ts        ← API client
│   └── contexts/
│       └── RDSAuthContext.tsx  ← Auth provider
└── .env  ← Configuration
```

## Configuration

The `.env` file contains:

```env
# Frontend API endpoint
VITE_API_URL=http://localhost:8000

# Backend database connection
DB_HOST=icecubedb.cqxo4kicuog0.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=icecubedb
DB_USER=postgres
DB_PASSWORD=zandubam2025

# JWT secret for token generation
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-2024
```

## Production Deployment

For production:

1. Deploy backend to a server (EC2, DigitalOcean, etc.)
2. Get the server's public URL (e.g., `https://api.icecube.com`)
3. Update `VITE_API_URL` in `.env` to point to your backend
4. Rebuild frontend: `npm run build`
5. Deploy frontend build to hosting (Vercel, Netlify, S3, etc.)
6. Update CORS in backend to allow your frontend domain

## Support

For issues or questions, check:
- `RDS_MIGRATION_COMPLETE.md` - Complete migration documentation
- http://localhost:8000/docs - API documentation
- Backend logs for error details
