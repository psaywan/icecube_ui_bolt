
// src/config/cognito.js - Enhanced Configuration with AWS SDK
export const cognitoConfig = {
    userPoolId: 'ap-south-1_9u5InoI1l',
    userPoolWebClientId: '4fc5emndpls0m5bjqrdbg58rat',
    region: 'ap-south-1',
    domain: 'https://ap-south-19u5inoi1l.auth.ap-south-1.amazoncognito.com',
    redirectSignIn: window.location.origin + '/auth/callback',
    redirectSignOut: window.location.origin + '/login',
    scope: 'openid email profile'
  };
  
  // Helper function to build Cognito login URL
  export const buildCognitoLoginUrl = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: cognitoConfig.userPoolWebClientId,
      redirect_uri: cognitoConfig.redirectSignIn,
      scope: cognitoConfig.scope,
      state: Math.random().toString(36).substring(2, 15) // CSRF protection
    });
    
    const loginUrl = `${cognitoConfig.domain}/oauth2/authorize?${params.toString()}`;
    console.log('🔗 Generated Cognito Login URL:', loginUrl);
    return loginUrl;
  };
  
  // Helper function for signup
  export const buildCognitoSignupUrl = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: cognitoConfig.userPoolWebClientId,
      redirect_uri: cognitoConfig.redirectSignIn,
      scope: cognitoConfig.scope,
      state: Math.random().toString(36).substring(2, 15)
    });
    
    const signupUrl = `${cognitoConfig.domain}/signup?${params.toString()}`;
    console.log('🔗 Generated Cognito Signup URL:', signupUrl);
    return signupUrl;
  };
  
  // Exchange authorization code for tokens
  export const exchangeCodeForTokens = async (authCode) => {
    const tokenEndpoint = `${cognitoConfig.domain}/oauth2/token`;
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: cognitoConfig.userPoolWebClientId,
      code: authCode,
      redirect_uri: cognitoConfig.redirectSignIn
    });
  
    console.log('🔄 Calling Cognito token endpoint...');
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
  
    console.log('📥 Token exchange response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }
  
    const tokens = await response.json();
    console.log('✅ Token exchange successful');
    return tokens;
  };
  
  // Simple JWT parser (without verification)
  export const parseJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ JWT parsing error:', error);
      return {};
    }
  };
  
  console.log('🔧 Enhanced Cognito config loaded:', cognitoConfig);