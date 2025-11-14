import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      cloud_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cloud_provider: 'aws' | 'azure' | 'gcp';
          region: string;
          credentials_encrypted: Record<string, unknown>;
          stack_id: string | null;
          status: 'active' | 'inactive' | 'error';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          cloud_provider: 'aws' | 'azure' | 'gcp';
          region: string;
          credentials_encrypted?: Record<string, unknown>;
          stack_id?: string | null;
          status?: 'active' | 'inactive' | 'error';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          cloud_provider?: 'aws' | 'azure' | 'gcp';
          region?: string;
          credentials_encrypted?: Record<string, unknown>;
          stack_id?: string | null;
          status?: 'active' | 'inactive' | 'error';
          updated_at?: string;
        };
      };
      compute_clusters: {
        Row: {
          id: string;
          cloud_profile_id: string;
          name: string;
          compute_type: 'spark' | 'dask' | 'ray';
          node_type: string;
          num_workers: number;
          auto_scaling: boolean;
          min_workers: number;
          max_workers: number;
          cluster_config: Record<string, unknown>;
          status: 'starting' | 'running' | 'stopped' | 'terminated' | 'error';
          endpoint_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      notebooks: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          language: 'python' | 'sql' | 'scala' | 'r';
          content: Record<string, unknown>;
          cluster_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      data_catalogs: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          catalog_type: 'database' | 'table' | 'view';
          cloud_profile_id: string | null;
          schema_info: Record<string, unknown>;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      queries: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          query_text: string;
          engine: 'spark' | 'trino' | 'snowflake';
          cluster_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          job_type: 'notebook' | 'sql' | 'pipeline';
          schedule: string | null;
          cluster_id: string;
          config: Record<string, unknown>;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      job_runs: {
        Row: {
          id: string;
          job_id: string;
          status: 'pending' | 'running' | 'success' | 'failed';
          started_at: string | null;
          completed_at: string | null;
          logs: string | null;
          error_message: string | null;
          created_at: string;
        };
      };
      pipelines: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          pipeline_graph: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
