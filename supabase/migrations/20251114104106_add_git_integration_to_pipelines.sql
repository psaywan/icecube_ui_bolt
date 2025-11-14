/*
  # Add Git Integration to Pipelines

  1. Changes to `pipelines` table
    - Add `git_repo_url` for repository URL
    - Add `git_branch` for branch name
    - Add `git_file_path` for workflow file path in repo
    - Add `git_sync_enabled` for auto-sync toggle
    - Add `last_git_sync` for last sync timestamp

  2. Purpose
    - Allow pipelines to be synced from Git repositories
    - Enable version control integration
    - Support importing workflows from external repos
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'git_repo_url'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN git_repo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'git_branch'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN git_branch text DEFAULT 'main';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'git_file_path'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN git_file_path text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'git_sync_enabled'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN git_sync_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'last_git_sync'
  ) THEN
    ALTER TABLE pipelines ADD COLUMN last_git_sync timestamptz;
  END IF;
END $$;