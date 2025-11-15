import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { rdsApi, setAuthToken, getAuthToken } from '../lib/rdsApi';

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
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const { data, error } = await rdsApi.auth.getUser();
      if (error) {
        setAuthToken(null);
        setUser(null);
      } else {
        setUser(data.user);
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
