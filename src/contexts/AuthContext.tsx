import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithSSO: (provider: 'google' | 'github' | 'azure' | 'microsoft') => Promise<{ error: Error | null }>;
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
      const response = await api.auth.signUp(email, password, fullName);
      const { token, user: userData } = response.data;

      localStorage.setItem('auth_token', token);
      setUser(userData);

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.error || error.message || 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.auth.signIn(email, password);
      const { token, user: userData } = response.data;

      localStorage.setItem('auth_token', token);
      setUser(userData);

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.error || error.message || 'Sign in failed' };
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
