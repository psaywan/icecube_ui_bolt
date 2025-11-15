// src/pages/AuthCallback.jsx - Simple Cognito Callback Handler
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AuthCallback() {
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Processing authentication...')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing Cognito auth callback...')
        console.log('📍 Current URL:', window.location.href)
        
        const urlParams = new URLSearchParams(location.search)
        const authCode = urlParams.get('code')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        console.log('🔑 Auth Code:', authCode ? 'Found' : 'Not found')
        console.log('❌ Error:', error || 'None')
        console.log('📝 Error Description:', errorDescription || 'None')

        if (error) {
          console.error('❌ Cognito auth error:', error, errorDescription)
          setStatus('error')
          setMessage(`Authentication failed: ${errorDescription || error}`)
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        if (!authCode) {
          console.error('❌ No authorization code found')
          setStatus('error')
          setMessage('No authorization code received from Cognito')
          setTimeout(() => navigate('/login'), 3000)
          return
        }

        setMessage('Exchanging authorization code for tokens...')

        // Exchange authorization code for tokens
        const tokenResponse = await exchangeCodeForTokens(authCode)
        
        if (!tokenResponse.id_token) {
          throw new Error('No ID token received from Cognito')
        }

        console.log('✅ Tokens received from Cognito')
        setMessage('Validating user with backend...')

// http://43.204.30.148:8000/api/auth/test-cognito-token
        // Call backend API with JWT token
        const backendResponse = await fetch('http://52.66.228.92:8000/auth/signin', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenResponse.id_token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json().catch(() => ({}))
          console.log('⚠️ Backend validation failed, proceeding with frontend-only auth')
          console.log('Backend error:', errorData)
        }

        const apiResult = await backendResponse.json().catch(() => null)
        console.log('🔍 Backend API response:', apiResult)

        // Decode ID token to get user info (simple version)
        const idTokenPayload = parseJWT(tokenResponse.id_token)
        console.log('👤 User info from token:', idTokenPayload)

        // Create user data for frontend
        const userData = {
          email: idTokenPayload.email || 'unknown@example.com',
          name: idTokenPayload.given_name || idTokenPayload.name || idTokenPayload.email?.split('@')[0] || 'Cognito User',
          authMethod: 'cognito',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(idTokenPayload.given_name || 'User')}&background=ff9900&color=fff`,
          loginTime: new Date().toISOString(),
          cognitoUserId: idTokenPayload.sub,
          sessionToken: tokenResponse.access_token,
          idToken: tokenResponse.id_token,
          refreshToken: tokenResponse.refresh_token,
          // Add backend data if available
          ...(apiResult?.user_info || {})
        }

        // Store in localStorage
        localStorage.setItem('manual_user', JSON.stringify(userData))

        console.log('✅ Cognito authentication successful!')
        console.log(`🎉 Welcome ${userData.name}!`)

        setStatus('success')
        setMessage(`Welcome ${userData.name}! Redirecting to workspace...`)
        
        // Redirect to workspace after a short delay
        setTimeout(() => {
          navigate('/workspace')
        }, 2000)

      } catch (error) {
        console.error('❌ Auth callback error:', error)
        setStatus('error')
        setMessage(`Authentication failed: ${error.message}`)
        
        // Redirect back to login after error
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [navigate, location])

  // Exchange authorization code for tokens
  const exchangeCodeForTokens = async (authCode) => {
    const tokenEndpoint = 'https://ap-south-19u5inoi1l.auth.ap-south-1.amazoncognito.com/oauth2/token'
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: '4fc5emndpls0m5bjqrdbg58rat',
      code: authCode,
      redirect_uri: 'http://localhost:5173/auth/callback'  // Fixed port
    })

    console.log('🔄 Calling Cognito token endpoint...')
    console.log('📤 Request params:', params.toString())
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa('4fc5emndpls0m5bjqrdbg58rat:8fosdmjn30038orbuecr5kdtegkrrmfdkmv47t4100g4i6c17qd')  // Added client secret
      },
      body: params.toString()
    })

    console.log('📥 Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Token exchange failed:', errorText)
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`)
    }

    const tokens = await response.json()
    console.log('✅ Token exchange successful')
    return tokens
  }

  // Simple JWT parser (without verification)
  const parseJWT = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('❌ JWT parsing error:', error)
      return {}
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#eef7fb',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '90%'
      }}>
        {/* Status Icon */}
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '1.5rem',
          animation: status === 'processing' ? 'spin 2s linear infinite' : 'none'
        }}>
          {status === 'processing' && '🔄'}
          {status === 'success' && '🎉'}
          {status === 'error' && '❌'}
        </div>

        {/* Title */}
        <h2 style={{ 
          fontSize: '1.5rem', 
          color: '#011627', 
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          {status === 'processing' && 'Authenticating...'}
          {status === 'success' && 'Authentication Successful!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>

        {/* Message */}
        <p style={{ 
          fontSize: '1rem', 
          color: '#666', 
          marginBottom: '2rem',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        {/* Progress Bar for Processing */}
        {status === 'processing' && (
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e9ecef',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '30%',
              height: '100%',
              backgroundColor: '#ff9900',
              borderRadius: '2px',
              animation: 'progress 2s ease-in-out infinite'
            }}></div>
          </div>
        )}

        {/* Action Buttons */}
        {status === 'error' && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#ff9900',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Debug Info (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#666',
            textAlign: 'left'
          }}>
            <strong>🐛 Debug Info:</strong>
            <br />Status: {status}
            <br />URL: {window.location.href}
            <br />Search: {location.search}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}