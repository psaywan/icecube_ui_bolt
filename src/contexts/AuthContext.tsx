import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  icecube_id: string;
  username: string;
  email: string;
  full_name?: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithSSO: (provider: 'google' | 'github' | 'azure' | 'microsoft') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.auth.getUser()
        .then((response) => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await api.auth.signUp(email, email, password, fullName);
      const responseData = response.data;

      if (responseData.message && responseData.user) {
        const tempToken = 'temp_signup_token';
        localStorage.setItem('auth_token', tempToken);
        setUser({
          icecube_id: responseData.user.icecube_id,
          username: responseData.user.username,
          email: responseData.user.email,
          full_name: responseData.user.full_name,
          is_verified: responseData.user.is_verified
        });
        return { error: null };
      }

      return { error: 'Unexpected response format' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Sign up failed';
      return { error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.auth.signIn(email, password);
      const { access_token, user: userData } = response.data;

      localStorage.setItem('auth_token', access_token);
      setUser({
        icecube_id: userData.icecube_id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        is_verified: userData.is_verified
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Sign in failed';
      return { error: errorMessage };
    }
  };

  const signInWithSSO = async (provider: 'google' | 'github' | 'azure' | 'microsoft') => {
    try {
      return { error: 'SSO is not available with the current backend configuration. Please use email/password authentication.' };
    } catch (error: any) {
      console.error('SSO Error:', error);
      return { error: error.message || 'SSO sign in failed' };
    }
  };

  const signOut = async () => {
    try {
      await api.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithSSO, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
