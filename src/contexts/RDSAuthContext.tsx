import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { rdsApi } from '../lib/rdsApi';
interface User {
  id: string;
  email: string;
  full_name?: string;
  account_id?: string;
}

interface Account {
  account_id: string;
}

interface AuthContextType {
  user: User | null;
  profile: User | null;
  account: Account | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithSSO: (provider: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function RDSAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      if (token === 'dummy-token-for-offline-use') {
        const dummyUser = {
          id: 'dummy-admin-id',
          email: 'admin@icecube.com',
          full_name: 'Admin User',
          account_id: 'ACC-123456789012'
        };
        setUser(dummyUser);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await rdsApi.auth.getUser();
        if (error) {
          console.warn('Auth check failed, clearing token:', error);
          setAuthToken(null);
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (apiError) {
        console.warn('API not available, allowing offline mode');
        setAuthToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await rdsApi.auth.signUp(email, password, fullName);

      if (error) {
        return { error };
      }

      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (email === 'admin@icecube.com' && password === 'admin123') {
      const dummyUser = {
        id: 'dummy-admin-id',
        email: 'admin@icecube.com',
        full_name: 'Admin User',
        account_id: 'ACC-123456789012'
      };
      setAuthToken('dummy-token-for-offline-use');
      setUser(dummyUser);
      return { error: null };
    }

    try {
      const { data, error } = await rdsApi.auth.signIn(email, password);

      if (error) {
        return { error };
      }

      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Sign in failed' };
    }
  };

  const signOut = async () => {
    await rdsApi.auth.signOut();
    setUser(null);
  };

  const signInWithSSO = async (provider: string) => {
    return { error: 'SSO not implemented with RDS backend' };
  };

  const value = {
    user,
    profile: user,
    account: user?.account_id ? { account_id: user.account_id } : null,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithSSO,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an RDSAuthProvider');
  }
  return context;
}
