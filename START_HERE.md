# 🚀 Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- (Optional) Python 3.9+ for backend

## Installation & Running

### Option 1: Frontend Only (Offline Mode)

This is the **easiest** way to get started. No backend needed!

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The app will open at `http://localhost:5173`

**Login with dummy account:**
- Email: `admin@icecube.com`
- Password: `admin123`

### Option 2: Full Stack (Frontend + Backend)

If you want to use the RDS backend:

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## First Time Setup

### 1. Environment Variables

Your `.env` file is already configured. If you need to change anything:

```env
# Backend API
VITE_API_URL=http://localhost:8000

# Supabase (for data persistence)
VITE_SUPABASE_URL=https://uzhzwrszdpkxqosjjypm.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

### 2. Login

Use the **dummy admin account** (works offline):
- Email: `admin@icecube.com`
- Password: `admin123`

Or create a new account if backend is running.

## Features

Once logged in, you can:

### 📊 Data Sources
- Connect to S3, PostgreSQL, MySQL, MongoDB, etc.
- Configure with access keys or IAM roles
- Save and reuse configurations

### 🔧 ETL Pipelines (IGO ETL)
- **Visual Workflow Builder** - Drag-and-drop ETL creation
- **Form Builder** - Guided form-based ETL setup
- Configure data sources by:
  - Creating new configurations
  - Selecting from saved data sources
  - Multiple authentication methods (Access Keys, IAM Roles)
- **Dynamic canvas** - Resize and fullscreen modes
- Double-click nodes to configure
- Generate and export code

### 💻 Interactive Notebooks
- SQL, Python, R, Scala support
- Execute queries in real-time
- Save and share notebooks

### 🔍 Query Editor
- Write and execute SQL queries
- Save frequently used queries
- Browse data catalog

### ☁️ Cloud Profiles
- Manage AWS, Azure, GCP credentials
- Configure compute clusters
- Monitor resources

## Troubleshooting

### White Screen?

1. **Clear browser cache** - Press Ctrl+Shift+Delete
2. **Check console** - Press F12, look for errors
3. **Use dummy login** - admin@icecube.com / admin123

### Port Already in Use?

```bash
# Kill the process on port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

### Backend Connection Failed?

The app works **offline** with the dummy admin account. Backend is optional!

### Database Connection Issues?

Supabase is used for persistence. If unavailable, the app still runs but data won't persist.

## Project Structure

```
project/
├── src/
│   ├── components/        # React components
│   │   ├── Jobs/         # ETL pipeline components
│   │   ├── DataSources/  # Data source management
│   │   ├── Notebooks/    # Interactive notebooks
│   │   └── Query/        # Query editor
│   ├── contexts/         # React contexts (Auth, Theme)
│   ├── lib/              # API clients and utilities
│   └── App.tsx           # Main app component
├── backend/              # Python backend (optional)
├── supabase/            # Database migrations
└── .env                 # Environment configuration
```

## Key Features Implemented

### 🎯 Node Configuration Modal
- Configure S3 with Access Keys or IAM Roles
- Select from saved data sources
- Database connection configurations
- Real-time validation

### 📝 Enhanced UX
- Expandable description fields
- Dynamic canvas height controls
- Fullscreen mode
- Character counter
- Height adjustment buttons

### 🔐 Dual Authentication
- RDS backend authentication
- Dummy offline mode
- Automatic fallback
- Secure token management

### 💾 Data Persistence
- Supabase integration
- ETL pipeline storage
- Data source configurations
- Workspace management

## Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

Built files will be in `dist/` directory.

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```

## Support

For issues or questions:
1. Check TROUBLESHOOTING.md
2. Check browser console (F12)
3. Verify .env configuration
4. Try dummy admin login

## Next Steps

1. ✅ Login with dummy account
2. ✅ Explore the dashboard
3. ✅ Create a data source
4. ✅ Build an ETL pipeline
5. ✅ Save and test your workflow

Enjoy building with Icecube! 🎉
