// src/services/api.js - Enhanced with Backend Integration
const API_BASE_URL = 'http://52.66.228.92:8000'

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('auth_token')
  }

  // Helper method for making API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    // Add auth token if available
    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`
    }

    const config = {
      headers: defaultHeaders,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      console.log(`API Call: ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, config)
      
      // Handle non-JSON responses
      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      console.log(`API Response (${response.status}):`, data)

      if (!response.ok) {
        const errorMessage = data.detail || data.message || data || `HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      return {
        success: true,
        data: data,
        status: response.status
      }

    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error)
      return {
        success: false,
        error: error.message,
        status: error.status || 500
      }
    }
  }

  // Enhanced test connection with health check
  async testConnection() {
    try {
      const result = await this.makeRequest('/health')
      if (result.success) {
        console.log('Backend connection successful:', result.data)
        return true
      }
      return false
    } catch (error) {
      console.log('Backend connection failed:', error)
      return false
    }
  }

  // AUTHENTICATION ENDPOINTS

  // 1. Signup User (with unique username generation)
  async signup(userData) {
    // Generate unique username (not email format)
    const uniqueUsername = 'icecube_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
    
    return await this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: uniqueUsername,
        email: userData.email,
        password: userData.password,
        full_name: userData.name || userData.email.split('@')[0]
      })
    })
  }

  // 2. Signin User
  async signin(credentials) {
    const result = await this.makeRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    })

    // Store tokens if successful
    if (result.success && result.data) {
      this.setTokens(result.data.access_token, result.data.refresh_token)
    }

    return result
  }

  // 3. Logout User
  async logout() {
    const result = await this.makeRequest('/auth/logout', {
      method: 'POST'
    })
    
    // Clear local tokens regardless of API response
    this.clearTokens()
    
    return result
  }

  // 4. Forgot Password
  async forgotPassword(email) {
    return await this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  // 5. Reset Password
  async resetPassword(email, confirmationCode, newPassword) {
    return await this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        confirmation_code: confirmationCode,
        new_password: newPassword
      })
    })
  }

  // 6. Verify Email
  async verifyEmail(email, confirmationCode) {
    return await this.makeRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        confirmation_code: confirmationCode
      })
    })
  }

  // 7. Change Password
  async changePassword(currentPassword, newPassword) {
    return await this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    })
  }

  // 8. Refresh Access Token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const result = await this.makeRequest('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    })

    // Update tokens if successful
    if (result.success && result.data) {
      this.setTokens(result.data.access_token, result.data.refresh_token)
    }

    return result
  }

  // 9. Get Current User Info
  async getCurrentUser() {
    return await this.makeRequest('/auth/me')
  }

  // 10. Update User Profile
  async updateProfile(profileData) {
    return await this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  // HELPER METHODS

  // Set authentication tokens
  setTokens(accessToken, refreshToken = null) {
    this.token = accessToken
    localStorage.setItem('auth_token', accessToken)
    
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
    
    console.log('Tokens stored successfully')
  }

  // Get current token
  getToken() {
    return this.token || localStorage.getItem('auth_token')
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken()
  }

  // Clear all tokens
  clearTokens() {
    this.token = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    console.log('All tokens cleared')
  }

  // Enhanced auto-retry with token refresh
  async makeAuthenticatedRequest(endpoint, options = {}) {
    let result = await this.makeRequest(endpoint, options)
    
    // If unauthorized, try to refresh token and retry
    if (!result.success && result.status === 401) {
      console.log('Token expired, attempting refresh...')
      
      try {
        const refreshResult = await this.refreshToken()
        
        if (refreshResult.success) {
          console.log('Token refreshed, retrying request...')
          result = await this.makeRequest(endpoint, options)
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError)
        this.clearTokens()
      }
    }
    
    return result
  }

  // CONVENIENCE METHODS

  // Complete signup with automatic signin
  async signupAndSignin(userData) {
    try {
      console.log('Starting signup process for:', userData.email)
      
      // Step 1: Signup
      const signupResult = await this.signup(userData)
      
      if (!signupResult.success) {
        return {
          success: false,
          error: `Signup failed: ${signupResult.error}`,
          step: 'signup'
        }
      }

      console.log('Signup successful, attempting auto signin...')

      // Step 2: Auto signin
      const signinResult = await this.signin({
        email: userData.email,
        password: userData.password
      })

      if (!signinResult.success) {
        return {
          success: false,
          error: `Auto signin failed: ${signinResult.error}`,
          step: 'signin',
          signupSuccessful: true
        }
      }

      console.log('Signup and signin both successful!')

      return {
        success: true,
        data: {
          user: signinResult.data.user,
          access_token: signinResult.data.access_token,
          refresh_token: signinResult.data.refresh_token,
          signup_info: signupResult.data
        }
      }

    } catch (error) {
      console.error('Signup and signin process failed:', error)
      return {
        success: false,
        error: error.message,
        step: 'process'
      }
    }
  }

  // Get user profile with auto-refresh
  async getUserProfile() {
    return await this.makeAuthenticatedRequest('/auth/me')
  }

  // BACKEND SPECIFIC METHODS

  // Get all users (requires auth)
  async getAllUsers() {
    return await this.makeAuthenticatedRequest('/users')
  }

  // Get user by iceCube ID
  async getUserById(icecubeId) {
    return await this.makeRequest(`/users/${icecubeId}`)
  }

  // Debug Cognito user (admin)
  async debugCognitoUser(email) {
    return await this.makeRequest(`/debug/cognito-user/${email}`)
  }

  // Admin verify user email
  async adminVerifyUserEmail(email) {
    return await this.makeRequest(`/admin/verify-user-email/${email}`, {
      method: 'POST'
    })
  }

  // DEBUG METHODS

  // Get backend info
  async getBackendInfo() {
    try {
      const healthResult = await this.makeRequest('/health')
      const rootResult = await this.makeRequest('/')
      
      return {
        success: true,
        health: healthResult.data,
        info: rootResult.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Test all endpoints
  async testAllEndpoints() {
    console.log('Testing all API endpoints...')
    
    const tests = [
      { name: 'Root Endpoint', fn: () => this.makeRequest('/') },
      { name: 'Health Check', fn: () => this.testConnection() },
      { name: 'Backend Info', fn: () => this.getBackendInfo() }
    ]

    const results = []
    
    for (const test of tests) {
      try {
        const result = await test.fn()
        results.push({
          name: test.name,
          success: result.success || result === true,
          result: result
        })
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error.message
        })
      }
    }

    console.table(results)
    return results
  }

  // Enhanced status with backend info
  async getDetailedStatus() {
    const backendInfo = await this.getBackendInfo()
    
    return {
      frontend: {
        baseURL: this.baseURL,
        hasToken: !!this.token,
        isAuthenticated: this.isAuthenticated(),
        tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : null
      },
      backend: backendInfo.success ? backendInfo : { error: 'Backend not reachable' }
    }
  }

  // Simple status
  getStatus() {
    return {
      baseURL: this.baseURL,
      hasToken: !!this.token,
      isAuthenticated: this.isAuthenticated(),
      tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : null
    }
  }
}

// Create and export singleton instance
const apiService = new APIService()

export default apiService
export { APIService }