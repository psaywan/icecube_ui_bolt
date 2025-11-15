// src/contexts/useAuth.jsx - Supabase Authentication
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
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setAccount(null);
        setAccountRole(null);
      }

      setLoading(false);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      }

      const userData = {
        id: authUser.id,
        email: authUser.email,
        full_name: profileData?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        avatar: profileData?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.email || 'User')}&background=00bfff&color=fff`,
        username: authUser.email?.split('@')[0],
      };

      setUser(userData);
      setProfile(profileData);
      setIsOnline(true);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.email?.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=User&background=00bfff&color=fff`,
      });
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
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
            },
          ])
          .select()
          .maybeSingle();
      }

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error.message };
    }
  };

  const signInWithSSO = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'azure' || provider === 'microsoft' ? 'azure' : provider,
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('SSO sign in error:', error);
      return { error: error.message };
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

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      setUser({ ...user, ...updates });
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
        await loadUserProfile(session.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    return { success: false, error: 'Not implemented' };
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
      console.error('Change password error:', error);
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
