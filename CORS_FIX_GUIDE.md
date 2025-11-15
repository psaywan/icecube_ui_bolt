# CORS Fix Guide - Urgent

## Problem

You're getting **"Failed to fetch"** error because your backend at `http://52.66.228.92:8000` is missing CORS headers.

The backend is working (I tested it), but browsers block cross-origin requests for security.

## Solution: Add CORS to Your Backend

### For FastAPI (Python)

Add this to your `main.py` **BEFORE** your routes:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ADD THIS - CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (use specific origins in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Then your routes...
```

### For Express.js (Node.js)

```javascript
const cors = require('cors');

app.use(cors({
  origin: '*',  // Allow all origins
  credentials: true
}));
```

## Quick Test

After adding CORS and restarting your backend, test in browser console:

```javascript
fetch('http://52.66.228.92:8000/health')
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

## Steps

1. Add CORS middleware to backend (code above)
2. Restart backend server
3. Try signing in again from frontend

That's it! The "Failed to fetch" error will be gone.
