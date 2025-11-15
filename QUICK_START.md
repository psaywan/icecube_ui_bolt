# 🚀 Quick Start - Local Development

## ⚠️ Important: Environment Variables

When you download this code to your local machine, you **MUST** create a `.env` file in the project root.

### Step 1: Create .env File

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Or manually create a `.env` file with this content:

```env
# Backend API
VITE_API_URL=http://localhost:8000

# Supabase (REQUIRED for data persistence)
VITE_SUPABASE_URL=https://uzhzwrszdpkxqosjjypm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aHp3cnN6ZHBreHFvc2pqeXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjc0NjYsImV4cCI6MjA3ODcwMzQ2Nn0.PFUjZ7whzXBxfeT8RBGmkQS1RrlJWvpQY8RlBndA9X4
```

**⚠️ Without these variables, you'll see the Supabase error!**

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

**Important:** If the dev server was already running when you created `.env`, **restart it**:
- Press `Ctrl+C` to stop
- Run `npm run dev` again

### Step 4: Login

Open `http://localhost:5173` and login with:
- **Email:** admin@icecube.com
- **Password:** admin123

## Why Do We Use Supabase?

The app uses **Supabase** for data persistence:
- ✅ ETL pipelines storage
- ✅ Data source configurations
- ✅ Saved queries
- ✅ Workspace management
- ✅ Notebook storage

**Authentication** uses the RDS backend (dummy admin account for offline mode), but **data storage** uses Supabase.

## Common Issues

### Issue: "Missing Supabase environment variables"

**Cause:** The `.env` file doesn't exist or is missing variables.

**Solution:**
1. Create `.env` file in project root
2. Copy content from `.env.example`
3. Restart dev server (`Ctrl+C` then `npm run dev`)

### Issue: White screen after creating .env

**Cause:** Dev server needs restart to load new environment variables.

**Solution:**
```bash
# Stop the server
Ctrl+C

# Clear cache (optional but recommended)
rm -rf node_modules/.vite

# Restart
npm run dev
```

### Issue: "Failed to fetch" or network errors

**Cause:** Backend is not running (this is OK for most features).

**Solution:** The app works in offline mode! Just login with dummy admin account.

## Verification Checklist

- [ ] `.env` file exists in project root
- [ ] `.env` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Dev server restarted after creating `.env`
- [ ] Browser shows login page (not white screen)
- [ ] No "Missing Supabase environment variables" error in console
- [ ] Can login with admin@icecube.com / admin123

## Quick Commands

```bash
# Install and run
npm install
npm run dev

# If you see Supabase error:
# 1. Create .env file (copy from .env.example)
# 2. Restart dev server
```

## Success!

If you see the login page and can login, you're all set! 🎉
