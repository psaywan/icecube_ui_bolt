// src/pages/Login.jsx - Simplified Backend Integration
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import apiService from '../../lib/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [apiStatus, setApiStatus] = useState('checking')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  
  const navigate = useNavigate()
  const { login } = useAuth()

  // Check API connection on load
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await apiService.testConnection()
        setApiStatus(response ? 'connected' : 'disconnected')
        console.log('API Status:', response ? '✅ Connected' : '❌ Disconnected')
      } catch (error) {
        setApiStatus('disconnected')
        console.log('❌ API connection failed:', error)
      }
    }
    checkAPI()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Clear errors when user starts typing
    if (error) setError('')
  }

  const validateForm = () => {
    if (!form.email || !form.password) {
      setError('Please enter both email and password!')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address!')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!validateForm()) {
      return
    }

    // Check if API is available
    if (apiStatus !== 'connected') {
      setError('❌ Backend API is not available. Please try again later.')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔑 Attempting login for:', form.email)
      
      const result = await login(form.email, form.password)

      if (result.success) {
        console.log('✅ Login successful:', result.user)
        
        setSuccess(`🎉 Login successful! Welcome ${result.user.name}!`)
        
        setTimeout(() => {
          navigate('/workspace')
        }, 1500)

      } else {
        // Handle specific API errors
        if (result.error.includes('Invalid email or password') || result.error.includes('NotAuthorizedException')) {
          setError('❌ Invalid email or password. Please check your credentials.')
        } else if (result.error.includes('not found') || result.error.includes('User not found')) {
          setError('❌ Account not found. Please sign up first or check your email.')
        } else if (result.error.includes('not verified') || result.error.includes('UserNotConfirmedException')) {
          setError('❌ Email not verified. Please check your email and verify your account.')
        } else {
          setError(`❌ Login failed: ${result.error}`)
        }
      }

    } catch (error) {
      console.error('❌ Login error:', error)
      setError(`❌ Connection error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setError('Please enter your email address!')
      return
    }

    if (apiStatus !== 'connected') {
      setError('❌ Forgot password requires API connection. Please try again when online.')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      console.log('📧 Sending forgot password request for:', forgotEmail)
      
      const result = await apiService.forgotPassword(forgotEmail)
      
      if (result.success) {
        setSuccess('📧 Password reset email sent! Please check your inbox.')
        setShowForgotPassword(false)
        setForgotEmail('')
      } else {
        setError(`❌ Failed to send reset email: ${result.error}`)
      }
      
    } catch (error) {
      console.error('❌ Forgot password error:', error)
      setError(`❌ Failed to send reset email: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#e4fbff',
        fontFamily: 'sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>

        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '2rem'
        }}>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '3rem',
            borderRadius: '20px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(15px)',
            width: '450px',
            textAlign: 'center'
          }}>
            
            <h2 style={{
              fontSize: '2rem',
              color: '#011627',
              marginBottom: '1rem'
            }}>
              Forgot Password
            </h2>
            
            <p style={{
              color: '#666',
              marginBottom: '2rem',
              lineHeight: '1.5'
            }}>
              Enter your email address and we'll send you a password reset link.
            </p>

            {error && (
              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                borderRadius: '8px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                borderRadius: '8px',
                fontWeight: '500'
              }}>
                {success}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#011627'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #ccc',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowForgotPassword(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#00bfff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? '📧 Sending...' : '📧 Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#e4fbff',
      fontFamily: 'sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Canvas
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        camera={{ position: [0, 0, 10], fov: 75 }}
      >
        <SnowParticles count={400} />
      </Canvas>

      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem'
      }}>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(15px)',
          width: '450px',
          textAlign: 'center'
        }}>
          
          {/* Logo/Title */}
          <div style={{
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              color: '#011627',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              iceCube
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              margin: '0'
            }}>
              Unified Data Platform
            </p>
          </div>

          {/* API Status */}
          <div style={{
            marginBottom: '2rem',
            padding: '0.75rem',
            textAlign: 'center',
            backgroundColor: apiStatus === 'connected' ? '#d4edda' : '#f8d7da',
            color: apiStatus === 'connected' ? '#155724' : '#721c24',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Backend API: {apiStatus === 'connected' ? '✅ Connected & Ready' : '❌ Connection Failed'}
          </div>

          {/* API Unavailable Warning */}
          {apiStatus !== 'connected' && (
            <div style={{
              marginBottom: '2rem',
              padding: '1rem',
              backgroundColor: '#fff3cd',
              color: '#856404',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              ⚠️ Login requires backend connection. Please check your internet connection and try again.
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div style={{
              marginBottom: '2rem',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              🔄 Authenticating with backend...
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              marginBottom: '2rem',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: '2rem',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#011627'
              }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={isLoading || apiStatus !== 'connected'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #ccc',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  opacity: (isLoading || apiStatus !== 'connected') ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = '#00bfff'}
                onBlur={(e) => e.target.style.borderColor = '#ccc'}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#011627'
              }}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading || apiStatus !== 'connected'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid #ccc',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                  opacity: (isLoading || apiStatus !== 'connected') ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = '#00bfff'}
                onBlur={(e) => e.target.style.borderColor = '#ccc'}
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || apiStatus !== 'connected'}
              style={{
                width: '100%',
                backgroundColor: '#00bfff',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: (isLoading || apiStatus !== 'connected') ? 'not-allowed' : 'pointer',
                opacity: (isLoading || apiStatus !== 'connected') ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,191,255,0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && apiStatus === 'connected') {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(0,191,255,0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && apiStatus === 'connected') {
                  e.target.style.transform = 'translateY(0px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0,191,255,0.3)'
                }
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ fontSize: '1.2rem' }}>🔄</span>
                  Signing in...
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.3rem' }}>🔗</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          {apiStatus === 'connected' && (
            <button
              onClick={() => setShowForgotPassword(true)}
              disabled={isLoading}
              style={{
                marginTop: '1rem',
                background: 'none',
                border: 'none',
                color: '#00bfff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Forgot your password?
            </button>
          )}

          {/* Signup Link */}
          <p style={{ 
            marginTop: '2rem', 
            fontSize: '0.9rem', 
            color: '#444' 
          }}>
            Don't have an account?{' '}
            <a 
              href="/signup" 
              style={{ 
                color: '#00bfff', 
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              Sign up here
            </a>
          </p>

          {/* API Info */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'rgba(0,191,255,0.1)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#666'
          }}>
            <p style={{ margin: '0', lineHeight: '1.4' }}>
              🔗 <strong>Backend Authentication:</strong> Secure login with AWS Cognito integration, 
              JWT tokens, and RDS database sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}