import { createContext, useContext, ReactNode } from 'react';
import AuthProviderBase, { useAuth as useAuthHook } from './useAuth';

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

interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar?: string;
  iceCubeAccountId?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  account: Account | null;
  accountRole: string | null;
  loading: boolean;
  isLoading: boolean;
  isOnline: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithSSO: (provider: 'google' | 'github' | 'azure' | 'microsoft') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateUser: (updates: any) => Promise<any>;
  syncWithBackend: () => Promise<any>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProviderBase>
      <AuthContextWrapper>{children}</AuthContextWrapper>
    </AuthProviderBase>
  );
}

function AuthContextWrapper({ children }: { children: ReactNode }) {
  const auth = useAuthHook();

  const transformedUser = auth.user ? {
    id: auth.user.id?.toString() || auth.user.cognito_sub || '',
    email: auth.user.email || '',
    username: auth.user.username,
    full_name: auth.user.full_name || auth.user.name,
    avatar: auth.user.avatar,
    iceCubeAccountId: auth.user.iceCubeAccountId || auth.user.icecube_id,
  } : null;

  const profile: Profile | null = auth.user ? {
    id: auth.user.id?.toString() || auth.user.cognito_sub || '',
    email: auth.user.email || '',
    full_name: auth.user.full_name || auth.user.name || null,
    avatar_url: auth.user.avatar || null,
    account_id: auth.user.iceCubeAccountId || auth.user.icecube_id || null,
    is_parent_account: true,
  } : null;

  const account: Account | null = auth.user ? {
    id: auth.user.iceCubeAccountId || auth.user.icecube_id || '',
    account_id: auth.user.iceCubeAccountId || auth.user.icecube_id || '',
    account_name: auth.user.full_name || auth.user.name || auth.user.email || 'My Account',
    account_type: 'individual',
  } : null;

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await auth.signUp(email, password, fullName);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await auth.signIn(email, password);
    return result;
  };

  const signInWithSSO = async (provider: 'google' | 'github' | 'azure' | 'microsoft') => {
    const result = await auth.signInWithSSO(provider);
    return result;
  };

  const signOut = async () => {
    await auth.signOut();
  };

  const contextValue: AuthContextType = {
    user: transformedUser,
    profile,
    account,
    accountRole: 'owner',
    loading: auth.isLoading,
    isLoading: auth.isLoading,
    isOnline: auth.isOnline,
    signUp,
    signIn,
    signInWithSSO,
    signOut,
    updateUser: auth.updateUser,
    syncWithBackend: auth.syncWithBackend,
    refreshUser: auth.refreshUser,
    forgotPassword: auth.forgotPassword,
    resetPassword: auth.resetPassword,
    changePassword: auth.changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
