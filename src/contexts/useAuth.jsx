
// src/hooks/useAuth.jsx - Updated for Backend Integration
import { useState, useEffect, createContext, useContext } from 'react'
import apiService from '../services/api'

// Create Auth Context
const AuthContext = createContext()

// Custom hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Generate Account ID (keeping your existing logic)
  const generateAccountId = (email) => {
    if (!email) return null
    
    const emailLower = email.toLowerCase().trim()
    let hash = 0
    for (let i = 0; i < emailLower.length; i++) {
      const char = emailLower.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    const positiveHash = Math.abs(hash)
    const twelveDigitNumber = positiveHash % 1000000000000
    const twelveDigitStr = twelveDigitNumber.toString().padStart(12, '0')
    const formattedId = `${twelveDigitStr.slice(0, 4)}-${twelveDigitStr.slice(4, 8)}-${twelveDigitStr.slice(8, 12)}`
    
    console.log(`🆔 Generated Account ID for ${email}: ${formattedId}`)
    return formattedId
  }

  // Generate avatar URL
  const generateAvatar = (name) => {
    if (!name) return `https://ui-avatars.com/api/?name=User&background=00bfff&color=fff`
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00bfff&color=fff&bold=true`
  }

  // Check API status
  const checkAPIStatus = async () => {
    try {
      const connected = await apiService.testConnection()
      setIsOnline(connected)
      return connected
    } catch (error) {
      setIsOnline(false)
      return false
    }
  }

  // Load user from API or localStorage
  const loadUser = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      console.log('👤 Loading user authentication... (attempt:', retryCount + 1, ')')

      // Check if we have a token first
      const token = apiService.getToken()
      
      if (token) {
        console.log('🔗 Token found, fetching user from API...')
        
        try {
          const result = await apiService.getCurrentUser()
          
          if (result.success && result.data) {
            const apiUser = result.data
            
            const enrichedUser = {
              ...apiUser,
              // Use backend icecube_id or generate if missing
              iceCubeAccountId: apiUser.icecube_id || generateAccountId(apiUser.email),
              // Use backend full_name or email-based name
              name: apiUser.full_name || apiUser.username || apiUser.email?.split('@')[0],
              avatar: generateAvatar(apiUser.full_name || apiUser.username),
              authMethod: 'api',
              lastSync: new Date().toISOString()
            }

            setUser(enrichedUser)
            
            // Store in localStorage as backup
            localStorage.setItem('manual_user', JSON.stringify(enrichedUser))
            
            console.log(`✅ User loaded from API: ${enrichedUser.email}`)
            setIsLoading(false)
            return enrichedUser
          } else {
            console.log('❌ API user fetch failed:', result.error)
            apiService.clearTokens()
            // Fall through to localStorage check
          }
        } catch (apiError) {
          console.log('❌ API error, checking localStorage:', apiError)
          // Fall through to localStorage check
        }
      }

      // Fallback to localStorage
      const storedUser = localStorage.getItem('manual_user')
      
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        console.log('📱 Found stored user:', userData.email)

        // Generate consistent account ID if missing
        let accountId = userData.iceCubeAccountId
        if (!accountId) {
          accountId = generateAccountId(userData.email)
          console.log('🆔 Generated missing Account ID:', accountId)
        }

        const enrichedUser = {
          ...userData,
          iceCubeAccountId: accountId,
          name: userData.name || userData.full_name || userData.username || userData.email?.split('@')[0],
          avatar: userData.avatar || generateAvatar(userData.name || userData.username),
          authMethod: userData.authMethod || 'local',
          lastSync: new Date().toISOString()
        }

        setUser(enrichedUser)
        
        // Update stored user with any missing data
        localStorage.setItem('manual_user', JSON.stringify(enrichedUser))
        console.log(`✅ User loaded from localStorage: ${enrichedUser.email}`)
        
        setIsLoading(false)
        return enrichedUser

      } else {
        // No user found
        if (retryCount === 0) {
          console.log('⚠️ No user found, retrying in 100ms...')
          setTimeout(() => loadUser(1), 100)
          return
        }
        
        console.log('❌ No user found after retry')
        setUser(null)
        setIsLoading(false)
        return null
      }

    } catch (error) {
      console.error('❌ Error loading user:', error)
      setUser(null)
      setIsLoading(false)
      return null
    }
  }

  // Login function with enhanced backend integration
  const login = async (email, password) => {
    try {
      console.log('🔑 Processing login for:', email)
      
      // Call backend signin API
      const result = await apiService.signin({ email, password })
      
      if (result.success && result.data) {
        console.log('✅ API Login successful:', result.data)
        
        // Extract user data from backend response
        const apiUser = result.data.user
        
        const enrichedUser = {
          ...apiUser,
          // Use backend icecube_id or generate if missing
          iceCubeAccountId: apiUser.icecube_id || generateAccountId(apiUser.email),
          // Use backend full_name or email-based name
          name: apiUser.full_name || apiUser.username || apiUser.email?.split('@')[0],
          avatar: generateAvatar(apiUser.full_name || apiUser.username),
          authMethod: 'api',
          lastLogin: new Date().toISOString(),
          lastSync: new Date().toISOString()
        }

        // Update state
        setUser(enrichedUser)
        setIsLoading(false)
        
        // Store in localStorage
        localStorage.setItem('manual_user', JSON.stringify(enrichedUser))
        
        console.log(`✅ User logged in with Account ID: ${enrichedUser.iceCubeAccountId}`)
        return { success: true, user: enrichedUser }
        
      } else {
        console.log('❌ API Login failed:', result.error)
        return { success: false, error: result.error }
      }
      
    } catch (error) {
      console.error('❌ Login error:', error)
      return { success: false, error: error.message }
    }
  }

  // Signup function with enhanced backend integration
  const signup = async (userData) => {
    try {
      console.log('📝 Processing signup for:', userData.email)
      
      // Call backend signupAndSignin API (does both signup + signin)
      const result = await apiService.signupAndSignin(userData)
      
      if (result.success && result.data) {
        console.log('✅ Signup + Signin successful:', result.data)
        
        // Extract user data from backend response
        const apiUser = result.data.user
        
        const enrichedUser = {
          ...apiUser,
          // Use backend icecube_id or generate if missing
          iceCubeAccountId: apiUser.icecube_id || generateAccountId(apiUser.email),
          // Use backend full_name or email-based name
          name: apiUser.full_name || apiUser.username || userData.name || apiUser.email?.split('@')[0],
          avatar: generateAvatar(apiUser.full_name || userData.name),
          authMethod: 'api',
          registrationMethod: 'api',
          lastLogin: new Date().toISOString(),
          lastSync: new Date().toISOString()
        }

        // Update state
        setUser(enrichedUser)
        setIsLoading(false)
        
        // Store in localStorage
        localStorage.setItem('manual_user', JSON.stringify(enrichedUser))
        
        console.log(`✅ User signed up with Account ID: ${enrichedUser.iceCubeAccountId}`)
        return { success: true, user: enrichedUser }
        
      } else {
        console.log('❌ Signup failed:', result.error)
        return { success: false, error: result.error, step: result.step }
      }
      
    } catch (error) {
      console.error('❌ Signup error:', error)
      return { success: false, error: error.message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Logging out...')
      
      // Call backend logout API
      await apiService.logout()
      
      // Clear state
      setUser(null)
      setIsLoading(false)
      
      // Clear localStorage
      localStorage.removeItem('manual_user')
      
      // Clear all user-specific storage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('manual_user_')) {
          localStorage.removeItem(key)
        }
      })

      console.log('✅ Logout successful')
      
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }

  // Update user
  const updateUser = async (updates) => {
    if (!user) return null

    try {
      const updatedUser = {
        ...user,
        ...updates,
        iceCubeAccountId: user.iceCubeAccountId, // Keep same Account ID
        lastSync: new Date().toISOString()
      }

      // Try to update via API if authenticated
      if (apiService.isAuthenticated() && isOnline) {
        try {
          const result = await apiService.updateProfile(updates)
          if (result.success) {
            console.log('✅ Profile updated via API')
            // Use API response data if available
            if (result.data) {
              Object.assign(updatedUser, result.data)
            }
          }
        } catch (apiError) {
          console.log('⚠️ API update failed, updating locally:', apiError)
        }
      }

      // Update state and localStorage
      setUser(updatedUser)
      localStorage.setItem('manual_user', JSON.stringify(updatedUser))
      
      console.log(`✅ User updated, Account ID preserved: ${user.iceCubeAccountId}`)
      return updatedUser
      
    } catch (error) {
      console.error('❌ Update user error:', error)
      return null
    }
  }

  // Sync with backend
  const syncWithBackend = async () => {
    if (!user || !isOnline) return

    try {
      console.log('🔄 Syncing with backend...', user.email)
      
      // Try to get fresh user data from API
      if (apiService.isAuthenticated()) {
        const result = await apiService.getCurrentUser()
        
        if (result.success && result.data) {
          const apiUser = result.data
          
          const syncedUser = {
            ...user,
            ...apiUser,
            // Preserve frontend-generated data if backend doesn't have it
            iceCubeAccountId: apiUser.icecube_id || user.iceCubeAccountId,
            name: apiUser.full_name || apiUser.username || user.name,
            avatar: user.avatar || generateAvatar(apiUser.full_name),
            lastSync: new Date().toISOString()
          }
          
          setUser(syncedUser)
          localStorage.setItem('manual_user', JSON.stringify(syncedUser))
          
          console.log('✅ Backend sync successful')
          return syncedUser
        }
      }
      
    } catch (error) {
      console.log('⚠️ Backend sync failed (offline mode):', error)
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    console.log('🔄 Force refreshing user data...')
    await loadUser()
  }

  // Password management
  const forgotPassword = async (email) => {
    try {
      console.log('📧 Sending forgot password email to:', email)
      const result = await apiService.forgotPassword(email)
      return result
    } catch (error) {
      console.error('❌ Forgot password error:', error)
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (email, confirmationCode, newPassword) => {
    try {
      console.log('🔐 Resetting password for:', email)
      const result = await apiService.resetPassword(email, confirmationCode, newPassword)
      return result
    } catch (error) {
      console.error('❌ Reset password error:', error)
      return { success: false, error: error.message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('🔐 Changing password...')
      const result = await apiService.changePassword(currentPassword, newPassword)
      return result
    } catch (error) {
      console.error('❌ Change password error:', error)
      return { success: false, error: error.message }
    }
  }

  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network online')
      setIsOnline(true)
      // Try to sync when coming back online
      if (user) {
        syncWithBackend()
      }
    }

    const handleOffline = () => {
      console.log('📴 Network offline')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user])

  // Initialize auth on mount
  useEffect(() => {
    console.log('🚀 AuthProvider initializing...')
    loadUser()
  }, [])

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'manual_user') {
        console.log('📱 Storage change detected, refreshing user...')
        loadUser()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Auto token refresh (every 15 minutes)
  useEffect(() => {
    if (!apiService.isAuthenticated() || !isOnline) return

    const refreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Auto-refreshing token...')
        await apiService.refreshToken()
      } catch (error) {
        console.log('❌ Token refresh failed:', error)
        // If refresh fails, clear tokens and reload user
        apiService.clearTokens()
        loadUser()
      }
    }, 15 * 60 * 1000) // Refresh every 15 minutes

    return () => clearInterval(refreshInterval)
  }, [isOnline])

  const value = {
    user,
    isLoading,
    isOnline,
    login,
    signup,
    logout,
    loadUser,
    updateUser,
    syncWithBackend,
    generateAccountId,
    refreshUser,
    checkAPIStatus,
    forgotPassword,
    resetPassword,
    changePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Exports
export { useAuth }
export default AuthProvider