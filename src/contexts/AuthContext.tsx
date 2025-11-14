import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

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
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setAccount(null);
        setAccountRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      setLoading(false);
    }
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data.user) {
        if (data.session) {
          await createProfileAndAccount(data.user, fullName);
        } else {
          return { error: 'Please check your email to confirm your account before signing in.' };
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: error.message || 'Sign up failed' };
    }
  };

  const createProfileAndAccount = async (user: User, fullName: string) => {
    try {
      const accountId = Math.random().toString().slice(2, 14);

      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .insert({
          account_id: accountId,
          account_name: user.email || 'My Account',
          account_type: 'individual',
        })
        .select()
        .single();

      if (accountError) throw accountError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: fullName,
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: error.message || 'Sign in failed' };
    }
  };

  const signInWithSSO = async (provider: 'google' | 'github' | 'azure' | 'microsoft') => {
    try {
      const providerMap = {
        google: 'google',
        github: 'github',
        azure: 'azure',
        microsoft: 'azure',
      } as const;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerMap[provider] as any,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('SSO error:', error);
      return { error: error.message || 'SSO sign in failed' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setAccount(null);
      setAccountRole(null);
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
