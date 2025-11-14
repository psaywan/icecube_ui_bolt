/*
  # Update Pipelines Schema for Workflow Builder

  1. Changes to `pipelines` table
    - Rename `pipeline_graph` to `workflow_json` (if needed, otherwise use existing)
    - Add `airflow_yaml` column for generated YAML
    - Add `status` column for pipeline state tracking
    - Add `schedule` column for cron expressions
    - Add `last_run` and `next_run` columns
    
  2. New Table: `pipeline_runs`
    - Track individual pipeline executions
    - Store logs and status for each run

  3. Security
    - Maintain existing RLS policies
    - Add policies for pipeline_runs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'airflow_yaml'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN airflow_yaml text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'status'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'error'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'schedule'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN schedule text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'last_run'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN last_run timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'next_run'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN next_run timestamptz;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES pipelines(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  duration_seconds integer,
  logs text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pipeline_runs' AND policyname = 'Users can view pipeline runs for own pipelines'
  ) THEN
    CREATE POLICY "Users can view pipeline runs for own pipelines"
      ON pipeline_runs FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM pipelines p
          JOIN workspaces w ON p.workspace_id = w.id
          WHERE p.id = pipeline_runs.pipeline_id
          AND w.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pipeline_runs' AND policyname = 'Users can insert pipeline runs for own pipelines'
  ) THEN
    CREATE POLICY "Users can insert pipeline runs for own pipelines"
      ON pipeline_runs FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM pipelines p
          JOIN workspaces w ON p.workspace_id = w.id
          WHERE p.id = pipeline_runs.pipeline_id
          AND w.user_id = auth.uid()
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline_id ON pipeline_runs(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);