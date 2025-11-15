import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../lib/api.ts';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);
  const [accountRole, setAccountRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          await loadUserProfile();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    setTimeout(() => {
      setLoading(false);
      setIsLoading(false);
    }, 1000);

    initAuth();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await api.auth.getUser();
      const userData = response.data;

      const transformedUser = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || userData.email?.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name || userData.email || 'User')}&background=00bfff&color=fff`,
        username: userData.email?.split('@')[0],
      };

      setUser(transformedUser);
      setProfile(userData);
      setIsOnline(true);
    } catch (error) {
      console.error('Error loading user profile:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setProfile(null);
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const response = await api.auth.signUp(email, email, password, fullName);

      if (response.data) {
        return { error: null };
      }

      return { error: 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error.response?.data?.detail || error.message || 'Signup failed' };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await api.auth.signIn(email, password);

      if (response.data?.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);

        const userData = response.data.user;
        const transformedUser = {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name || userData.email?.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name || userData.email || 'User')}&background=00bfff&color=fff`,
          username: userData.email?.split('@')[0],
        };

        setUser(transformedUser);
        setProfile(userData);
        return { error: null };
      }

      return { error: 'Login failed' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error.response?.data?.detail || error.message || 'Login failed' };
    }
  };

  const signInWithSSO = async (provider) => {
    return { error: 'SSO not implemented with RDS backend' };
  };

  const signOut = async () => {
    try {
      await api.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setProfile(null);
      setAccount(null);
      setAccountRole(null);
    }
  };

  const updateUser = async (updates) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      setUser({ ...user, ...updates });
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await loadUserProfile();
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const forgotPassword = async (email) => {
    return { success: false, error: 'Password reset not implemented with RDS backend yet' };
  };

  const resetPassword = async (email, code, newPassword) => {
    return { success: false, error: 'Password reset not implemented with RDS backend yet' };
  };

  const changePassword = async (currentPassword, newPassword) => {
    return { success: false, error: 'Change password not implemented with RDS backend yet' };
  };

  const syncWithBackend = async () => {
    return { success: true };
  };

  const value = {
    user,
    profile,
    account,
    accountRole,
    loading,
    isLoading,
    isOnline,
    signUp,
    signIn,
    signInWithSSO,
    signOut,
    updateUser,
    syncWithBackend,
    refreshUser,
    forgotPassword,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
