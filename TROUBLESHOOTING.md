# Troubleshooting Guide

## ⚠️ "Missing Supabase environment variables" Error

**This is the most common error when downloading and running locally!**

### Quick Fix

1. **Create `.env` file** in the project root (same folder as `package.json`)
2. **Copy from `.env.example`** or add these lines:

```env
VITE_SUPABASE_URL=https://uzhzwrszdpkxqosjjypm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aHp3cnN6ZHBreHFvc2pqeXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjc0NjYsImV4cCI6MjA3ODcwMzQ2Nn0.PFUjZ7whzXBxfeT8RBGmkQS1RrlJWvpQY8RlBndA9X4
VITE_API_URL=http://localhost:8000
```

3. **Restart dev server**:
   - Press `Ctrl+C` to stop
   - Run `npm run dev` again

### Why This Happens

When you download the code, the `.env` file is **not included** in the download (it's in `.gitignore` for security). You must create it manually on your local machine.

### Verification

Check that your `.env` file exists:
```bash
ls -la .env
```

You should see the file listed. If not, create it!

---

## White Screen / App Not Loading

If you're seeing a white screen when running the application locally, follow these steps:

### 1. Check Browser Console

Open your browser's developer tools (F12) and check the Console tab for any errors.

### 2. Verify Environment Variables

Make sure your `.env` file is properly configured:

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://uzhzwrszdpkxqosjjypm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**Important:** Copy the full key from `.env.example`!

### 3. Start the Backend (If Using RDS Backend)

If you're using the RDS backend authentication, make sure it's running:

```bash
cd backend
python main.py
```

The backend should be accessible at `http://localhost:8000`

### 4. Clear Browser Cache & Local Storage

1. Open Developer Tools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Click "Clear storage" or manually delete localStorage items
4. Refresh the page

### 5. Use Dummy Admin Account (Offline Mode)

The app has a built-in offline mode with a dummy admin account:

- **Email:** `admin@icecube.com`
- **Password:** `admin123`

This works without the backend running.

### 6. Check Network Tab

1. Open Developer Tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for any failed requests (red status codes)

### 7. Common Issues

#### Issue: "localStorage is not defined"
**Solution:** This is now fixed. The app properly checks for browser environment before accessing localStorage.

#### Issue: "Not authenticated" errors
**Solution:** Use the dummy admin account or ensure your backend is running at `http://localhost:8000`

#### Issue: Supabase connection errors
**Solution:** The app will work in offline mode. ETL pipelines are saved to browser's IndexedDB when Supabase is unavailable.

### 8. Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app should be accessible at `http://localhost:5173` (or the port shown in terminal)

### 9. Still Not Working?

If you're still seeing a white screen:

1. Check if `dist/index.html` exists after building
2. Try running `npm run preview` instead of `npm run dev`
3. Check if port 5173 is already in use
4. Try a different browser
5. Check the browser console for the specific error message

### 10. Authentication Flow

The app supports two authentication methods:

1. **RDS Backend** (requires backend at port 8000)
   - Sign up and login through backend API
   - Tokens stored in localStorage

2. **Dummy Offline Mode** (no backend needed)
   - Use credentials: admin@icecube.com / admin123
   - Works completely offline
   - Perfect for testing and development

### 11. Database

The app uses Supabase for data persistence:
- Data sources
- ETL pipelines
- Workspaces
- Notebooks
- Saved queries

If Supabase is unavailable, the app will still load but data won't persist across sessions.

## Need More Help?

Check the error message in:
1. Browser console (F12 → Console)
2. Network tab (F12 → Network)
3. Terminal where you ran `npm run dev`

The error message will help identify the specific issue.
