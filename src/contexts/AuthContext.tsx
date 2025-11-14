import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Account {
  id: string;
  account_id: string;
  account_name: string;
  account_type: 'individual' | 'organization';
}

interface AccountMember {
  role: 'owner' | 'admin' | 'member';
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
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountRole, setAccountRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setAccount(null);
        setAccountRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      console.log('Profile data:', profileData);

      if (profileData?.account_id) {
        console.log('Fetching account for ID:', profileData.account_id);
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', profileData.account_id)
          .maybeSingle();

        if (accountError) {
          console.error('Account fetch error:', accountError);
          throw accountError;
        }
        console.log('Account data fetched:', accountData);
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
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        return { error: null };
      }

      return { error: 'Sign up failed' };
    } catch (error: any) {
      return { error: error.message || 'Sign up failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        return { error: null };
      }

      return { error: 'Sign in failed' };
    } catch (error: any) {
      return { error: error.message || 'Sign in failed' };
    }
  };

  const signInWithSSO = async (provider: 'google' | 'github' | 'azure' | 'microsoft') => {
    try {
      const mappedProvider = provider === 'microsoft' ? 'azure' : provider;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: mappedProvider as 'google' | 'github' | 'azure',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'SSO sign in failed' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
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
