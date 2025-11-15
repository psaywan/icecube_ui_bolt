# API Configuration Update

## Backend API URL

The application now uses the following backend API URL:

```
http://52.66.228.92:8000
```

## Configuration Files Updated

### 1. Environment Variables (`.env`)
```env
REACT_APP_API_URL=http://52.66.228.92:8000
VITE_API_URL=http://52.66.228.92:8000
```

### 2. API Service (`src/lib/api.js`)
```javascript
const API_BASE_URL = 'http://52.66.228.92:8000'
```

## API Endpoints

The backend should implement these authentication endpoints:

### Authentication Endpoints
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Sign in existing user
- `POST /auth/logout` - Sign out user
- `GET /auth/me` - Get current user info
- `PUT /auth/profile` - Update user profile
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with code
- `POST /auth/verify-email` - Verify email address
- `POST /auth/change-password` - Change user password
- `POST /auth/refresh` - Refresh access token

### Health Check
- `GET /health` - Backend health status

## Expected Request/Response Format

### Sign Up Request
```json
POST /auth/signup
{
  "username": "icecube_1234567890_abc",
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

### Sign Up Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "cognito_sub": "...",
      "icecube_id": "1234-5678-9012",
      "email": "user@example.com",
      "username": "icecube_1234567890_abc",
      "full_name": "John Doe",
      "created_at": "2025-11-15T..."
    },
    "message": "User created successfully"
  }
}
```

### Sign In Request
```json
POST /auth/signin
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Sign In Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "cognito_sub": "...",
      "icecube_id": "1234-5678-9012",
      "email": "user@example.com",
      "username": "icecube_1234567890_abc",
      "full_name": "John Doe"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid credentials",
  "status": 401
}
```

## CORS Configuration

The backend must have CORS enabled for the frontend origin:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing API Connection

### From Browser Console
```javascript
// Test API connection
fetch('http://52.66.228.92:8000/health')
  .then(res => res.json())
  .then(data => console.log('API Status:', data))
  .catch(err => console.error('API Error:', err));
```

### From Application
The application automatically tests the connection on:
- Login page load
- Signup page load
- Auth context initialization

Status indicators show:
- ✅ Connected - Backend API is reachable
- ⚠️ Offline Mode - Backend not available (falls back to localStorage)

## Auth Flow Components

### Login Component (`src/components/Auth/Login.jsx`)
- Tests API connection on mount
- Shows connection status
- Falls back to local storage if offline
- Path: `/login`

### Signup Component (`src/components/Auth/Signup.jsx`)
- Tests API connection on mount
- Shows connection status
- Validates form inputs
- Creates account via API
- Auto-signs in after successful signup
- Path: `/signup`

### Auth Callback (`src/components/Auth/AuthCallback.jsx`)
- Handles Cognito OAuth callback
- Exchanges authorization code for tokens
- Validates user with backend
- Redirects to workspace after success
- Path: `/auth/callback`

## Token Management

### Storage
Tokens are stored in localStorage:
- `auth_token` - Access token (JWT)
- `refresh_token` - Refresh token
- `manual_user` - User profile data

### Auto-Refresh
- Tokens refresh every 15 minutes automatically
- On 401 errors, automatic token refresh attempt
- If refresh fails, user is logged out

### Security Headers
All authenticated requests include:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Database Integration

The backend should:
1. Authenticate with AWS Cognito
2. Store user data in RDS PostgreSQL
3. Generate iceCube ID for each user
4. Return user data + tokens to frontend

### User Data Flow
```
Frontend → Backend → Cognito (Auth) → Backend → RDS (Store) → Frontend
```

## Environment Setup

1. Ensure backend is running on port 8000
2. RDS database is accessible
3. Cognito User Pool is configured
4. Environment variables are set

## Troubleshooting

### API Not Reachable
```bash
# Test backend connectivity
curl http://52.66.228.92:8000/health

# Check if port is open
telnet 52.66.228.92 8000
```

### CORS Errors
- Verify backend CORS configuration
- Check browser console for specific error
- Ensure frontend origin is allowed

### Token Issues
```javascript
// Clear tokens and retry
localStorage.removeItem('auth_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('manual_user');
```

## Migration Checklist

- [x] Updated `.env` with new API URL
- [x] Updated `src/lib/api.js` with new base URL
- [x] Fixed import paths in Auth components
- [x] Removed Canvas/SnowParticles dependencies
- [x] Build successful
- [ ] Test backend API connectivity
- [ ] Test signup flow
- [ ] Test signin flow
- [ ] Test token refresh
- [ ] Verify RDS data persistence

## Next Steps

1. Start your backend server on `http://52.66.228.92:8000`
2. Ensure all auth endpoints are implemented
3. Test the complete authentication flow
4. Monitor backend logs for any issues
5. Verify data is being saved to RDS
