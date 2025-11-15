import apiService from './api';

export const supabase = {
  auth: {
    signUp: async ({ email, password, options }: any) => {
      const result = await apiService.signup({
        email,
        password,
        name: options?.data?.full_name || email.split('@')[0]
      });

      if (result.success) {
        return { data: { user: result.data?.user, session: result.data }, error: null };
      }
      return { data: { user: null, session: null }, error: new Error(result.error) };
    },

    signInWithPassword: async ({ email, password }: any) => {
      const result = await apiService.signin({ email, password });

      if (result.success) {
        return { data: { user: result.data?.user, session: result.data }, error: null };
      }
      return { data: { user: null, session: null }, error: new Error(result.error) };
    },

    signInWithOAuth: async ({ provider, options }: any) => {
      return { data: null, error: new Error('OAuth not implemented with backend API') };
    },

    signOut: async () => {
      await apiService.logout();
      return { error: null };
    },

    getSession: async () => {
      if (apiService.isAuthenticated()) {
        const result = await apiService.getCurrentUser();
        if (result.success) {
          return { data: { session: { user: result.data } }, error: null };
        }
      }
      return { data: { session: null }, error: null };
    },

    onAuthStateChange: (callback: Function) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    },
  },

  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: null })
      }),
      single: async () => ({ data: null, error: null })
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      })
    }),
    delete: () => ({
      eq: () => ({})
    })
  })
};

export default supabase;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
