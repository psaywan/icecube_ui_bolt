# Login Information

## Demo Credentials

Since the Python backend API is not running, use the built-in demo credentials:

- **Email**: `admin@icecube.com`
- **Password**: `admin123`

These credentials are hardcoded in the frontend for offline/demo mode.

## What Was Fixed

1. **Added 5-second timeout** to API requests - prevents infinite loading when backend is unavailable
2. **Better error messages** - now shows helpful message if backend is down
3. **Demo credentials banner** - visible on login page so users know what to enter

## Backend Setup (Optional)

If you want to use the real backend with database:

1. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Set up environment variables in `.env`:
   - Database connection details
   - JWT secret key

3. Run the backend:
   ```bash
   python main.py
   ```

The app will then work with real authentication and database storage.

## Current Setup

Right now, the app works in **offline/demo mode** which:
- Uses hardcoded demo credentials
- Stores data in browser localStorage (not persistent)
- Perfect for testing UI and features
- No database required
