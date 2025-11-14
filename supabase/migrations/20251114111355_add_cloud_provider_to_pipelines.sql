/*
  # Add Cloud Provider Field to Pipelines

  1. Changes
    - Add cloud_provider column to pipelines table
    - Valid values: 'aws', 'azure', 'gcp', 'snowflake', 'databricks', 'other'
    - Defaults to 'aws'

  2. Notes
    - Used to display appropriate cloud provider icon for each pipeline
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipelines' AND column_name = 'cloud_provider'
  ) THEN
    ALTER TABLE pipelines 
    ADD COLUMN cloud_provider text DEFAULT 'aws' CHECK (cloud_provider IN ('aws', 'azure', 'gcp', 'snowflake', 'databricks', 'other'));
  END IF;
END $$;
