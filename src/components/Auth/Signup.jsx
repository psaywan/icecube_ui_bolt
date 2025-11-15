// src/pages/Signup.jsx - API Integration (Fixed)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../../lib/api'
import { useAuth } from '../../contexts/useAuth'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [backendStatus, setBackendStatus] = useState('checking')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    country: '',
    role: '',
    purpose: ''
  })

  // Test backend connection on mount
  useEffect(() => {
    const testBackend = async () => {
      console.log('🔍 Testing backend connection...')
      const connected = await apiService.testConnection()
      const status = connected ? 'connected' : 'disconnected'
      setBackendStatus(status)
      console.log('Backend connection:', connected ? '✅ Connected' : '❌ Disconnected')
    }
    testBackend()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Clear errors when user starts typing
    if (error) setError('')
  }

  const validateForm = () => {
    if (!form.email || !form.password || !form.country || !form.role) {
      setError('Please fill in all required fields!')
      return false
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match!')
      return false
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long!')
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

    setIsLoading(true)

    try {
      console.log('📝 Starting signup process with API...')

      if (backendStatus === 'connected') {
        // Use API for signup
        const result = await signup({
          email: form.email,
          password: form.password,
          name: form.name || form.email.split('@')[0],
          country: form.country,
          role: form.role,
          purpose: form.purpose
        })

        if (result.success) {
          console.log('🎉 API Signup successful:', result.user)
          
          setSuccess('🎉 Account created successfully! Redirecting...')
          
          setTimeout(() => {
            navigate('/workspace')
          }, 1500)

        } else {
          // Handle different types of signup errors
          if (result.error && result.error.includes('already exists')) {
            setError('❌ Account with this email already exists! Please try signing in instead.')
          } else if (result.step === 'signin' && result.signupSuccessful) {
            setError('✅ Account created successfully, but auto-signin failed. Please try logging in manually.')
          } else {
            setError(`❌ Signup failed: ${result.error}`)
          }
        }

      } else {
        // Fallback: Local storage (when backend is not connected)
        console.log('⚠️ Backend not connected, using local storage fallback')
        
        // Check if user already exists locally
        const existingUser = localStorage.getItem('manual_user_' + form.email)
        if (existingUser) {
          setError('❌ User with this email already exists locally! Please use a different email.')
          return
        }

        const userData = {
          email: form.email,
          name: form.name || form.email.split('@')[0],
          country: form.country,
          role: form.role,
          purpose: form.purpose,
          authMethod: 'local',
          registrationMethod: 'local',
          registeredAt: new Date().toISOString()
        }

        // Store user locally
        localStorage.setItem('manual_user_' + form.email, JSON.stringify({
          ...userData,
          password: form.password // In production, this should be hashed
        }))

        // Login user using auth context
        const loginResult = await signup(userData)
        
        if (loginResult.success) {
          setSuccess('🎉 Account created successfully (offline mode)! Redirecting...')
          
          setTimeout(() => {
            navigate('/workspace')
          }, 1500)
        }
      }

    } catch (error) {
      console.error('❌ Signup process failed:', error)
      setError(`❌ Unexpected error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Get responsive card styling
  const getResponsiveCardStyle = () => {
    const isMobile = window.innerWidth <= 768
    return {
      ...cardStyle,
      padding: isMobile ? '1.5rem' : '2rem',
      margin: isMobile ? '0.5rem' : '0 auto',
      maxWidth: isMobile ? 'calc(100vw - 1rem)' : '450px',
      width: '100%'
    }
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#e4fbff',
      fontFamily: 'sans-serif',
      position: 'relative',
      overflow: 'auto'
    }}>
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        padding: '1rem',
        paddingTop: '1rem',
        boxSizing: 'border-box'
      }}>
        
        {/* Single Signup Form */}
        <div style={getResponsiveCardStyle()}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#011627' }}>
            Sign Up for iceCube
          </h2>

          {/* Backend Status */}
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            textAlign: 'center',
            backgroundColor: backendStatus === 'connected' ? '#d4edda' : '#fff3cd',
            color: backendStatus === 'connected' ? '#155724' : '#856404',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Backend API: {backendStatus === 'connected' ? '✅ Connected' : '⚠️ Offline Mode'}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              textAlign: 'center',
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              borderRadius: '6px',
              border: '1px solid #bbdefb'
            }}>
              🔄 Creating your account... Please wait.
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              textAlign: 'center',
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '6px',
              border: '1px solid #c3e6cb',
              fontWeight: '500'
            }}>
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              textAlign: 'center',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '6px',
              border: '1px solid #f5c6cb',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field 
              label="Full Name" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="John Doe" 
              type="text" 
              hint="Your full name (optional)" 
              disabled={isLoading}
            />
            <Field 
              label="Email *" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="you@example.com" 
              type="email" 
              hint="Your active email address" 
              disabled={isLoading}
              required
            />
            <Field 
              label="Password *" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              type="password" 
              placeholder="••••••••" 
              hint="Minimum 6 characters" 
              disabled={isLoading}
              required
            />
            <Field 
              label="Confirm Password *" 
              name="confirmPassword" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              type="password" 
              placeholder="••••••••" 
              hint="Repeat your password" 
              disabled={isLoading}
              required
            />
            <SelectField 
              label="Country *" 
              name="country" 
              value={form.country} 
              onChange={handleChange} 
              options={countryList} 
              hint="Your country of residence" 
              disabled={isLoading}
              required
            />
            <SelectField 
              label="Role *" 
              name="role" 
              value={form.role} 
              onChange={handleChange} 
              options={["Student", "Working Professional", "Engineering Lead", "Data Scientist", "Data Engineer", "Software Developer", "CTO", "Other"]} 
              hint="Your professional role" 
              disabled={isLoading}
              required
            />
            <SelectField 
              label="Purpose of Use" 
              name="purpose" 
              value={form.purpose} 
              onChange={handleChange} 
              options={["Exploring", "Learning", "Building Prototype", "Tool Evaluation", "Production Use", "Academic Research"]} 
              hint="What describes your use case?" 
              disabled={isLoading}
            />

            <button 
              type="submit" 
              style={{
                ...buttonStyle,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                backgroundColor: backendStatus === 'connected' ? '#00bfff' : '#ff9900'
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 
               backendStatus === 'connected' ? 'Create Account (API)' : 'Create Account (Offline)'}
            </button>
          </form>

          {/* Login Link */}
          <p style={{ 
            marginTop: '1.5rem', 
            fontSize: '0.9rem', 
            textAlign: 'center', 
            color: '#444' 
          }}>
            Already have an account?{' '}
            <a 
              href="/login" 
              style={{ 
                color: '#00bfff', 
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              Sign in
            </a>
          </p>

          {/* API Info */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: '#666',
            textAlign: 'center'
          }}>
            <strong>🔧 Development Info:</strong>
            <br />
            {backendStatus === 'connected' ? 
              'Using live API for authentication & user management' : 
              'Backend offline - using local storage fallback'
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// Field Components
function Field({ label, name, value, onChange, type = "text", placeholder, hint, disabled = false, required = false }) {
  return (
    <div style={fieldWrapper}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          ...inputStyle,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          borderColor: required && !value ? '#ffc107' : '#ccc'
        }}
        disabled={disabled}
        required={required}
      />
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  )
}

function SelectField({ label, name, value, onChange, options, hint, disabled = false, required = false }) {
  return (
    <div style={fieldWrapper}>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          ...inputStyle,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderColor: required && !value ? '#ffc107' : '#ccc'
        }}
        disabled={disabled}
        required={required}
      >
        <option value="">Select {label.toLowerCase().replace(' *', '')}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  )
}

// Styles
const cardStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  padding: '2rem',
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(10px)',
  width: '100%',
  maxWidth: '450px',
  margin: '0 auto',
  boxSizing: 'border-box'
}

const fieldWrapper = {
  marginBottom: '0.8rem'
}

const labelStyle = {
  fontWeight: 'bold',
  display: 'block',
  marginBottom: '0.25rem',
  fontSize: '0.9rem'
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  backgroundColor: 'white',
  color: '#011627',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease'
}

const hintStyle = {
  marginTop: '0.25rem',
  fontSize: '0.8rem',
  color: '#666'
}

const buttonStyle = {
  marginTop: '1rem',
  width: '100%',
  backgroundColor: '#00bfff',
  color: 'white',
  border: 'none',
  padding: '0.75rem',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
}

const countryList = [
  "India", "United States", "Canada", "Australia", "United Kingdom",
  "Germany", "France", "Brazil", "Japan", "South Korea", "Singapore",
  "Netherlands", "Sweden", "Norway", "Denmark", "Switzerland", "Austria",
  "Belgium", "Spain", "Italy", "Portugal", "Ireland", "New Zealand"
]