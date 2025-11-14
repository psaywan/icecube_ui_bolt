import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { authApi, setAuthToken, getAuthToken, type AuthUser } from '../lib/auth-api';

interface Account {
  id: string;
  account_id: string;
  account_name: string;
  account_type: 'individual' | 'organization';
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  account_id: string | null;
  is_parent_account: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  account: Account | null;
  accountRole: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithSSO: (provider: 'google' | 'github' | 'azure' | 'microsoft') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountRole, setAccountRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        const userData = await authApi.getUser(token);
        setUser(userData);
        await fetchProfile(userData.id);
      } catch (error) {
        console.error('Error restoring session:', error);
        setAuthToken(null);
      }
    }
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData?.account_id) {
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', profileData.account_id)
          .maybeSingle();

        if (accountError) throw accountError;
        setAccount(accountData);

        const { data: memberData, error: memberError } = await supabase
          .from('account_members')
          .select('role')
          .eq('account_id', profileData.account_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (memberError) throw memberError;
        setAccountRole(memberData?.role || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await authApi.signUp(email, password, fullName);
      setAuthToken(response.token);
      setUser(response.user);

      await createProfileAndAccount(response.user);
      await fetchProfile(response.user.id);

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: error.response?.data?.error || error.message || 'Sign up failed' };
    }
  };

  const createProfileAndAccount = async (user: AuthUser) => {
    try {
      const accountId = Math.random().toString().slice(2, 14);

      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert({
          account_id: accountId,
          account_name: user.email,
          account_type: 'individual',
        })
        .select()
        .single();

      if (accountError) throw accountError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          account_id: accountData.id,
          is_parent_account: true,
        });

      if (profileError) throw profileError;

      const { error: memberError } = await supabase
        .from('account_members')
        .insert({
          user_id: user.id,
          account_id: accountData.id,
          role: 'owner',
        });

      if (memberError) throw memberError;
    } catch (error) {
      console.error('Error creating profile and account:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.signIn(email, password);
      setAuthToken(response.token);
      setUser(response.user);
      await fetchProfile(response.user.id);
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: error.response?.data?.error || error.message || 'Sign in failed' };
    }
  };

  const signInWithSSO = async (provider: 'google' | 'github' | 'azure' | 'microsoft') => {
    return { error: 'SSO not implemented with custom backend' };
  };

  const signOut = async () => {
    try {
      const token = getAuthToken();
      if (token) {
        await authApi.signOut(token);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setAuthToken(null);
      setUser(null);
      setProfile(null);
      setAccount(null);
      setAccountRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, account, accountRole, loading, signUp, signIn, signInWithSSO, signOut }}>
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
