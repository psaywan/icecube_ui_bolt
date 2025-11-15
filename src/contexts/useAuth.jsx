import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      }
      setLoading(false);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setAccount(null);
        setAccountRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        if (profileData.account_id) {
          const { data: accountData } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', profileData.account_id)
            .maybeSingle();

          setAccount(accountData);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Failed to create user account' };
      }

      if (data.user && !data.user.identities?.length) {
        return { error: 'This email is already registered. Please sign in instead.' };
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            email: email,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ], {
          onConflict: 'id'
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error.message || 'Signup failed' };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error.message || 'Login failed' };
    }
  };

  const signInWithSSO = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('SSO error:', error);
      return { error: error.message || 'SSO login failed' };
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

  const updateUser = async (updates) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      await loadUserProfile(user.id);
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
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
