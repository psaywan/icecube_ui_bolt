/*
  # Add Custom Domain Field to Cloud Profiles

  1. Changes
    - Add custom_domain column to cloud_profiles table
    - Optional field for AWS CloudFormation stack naming
    - Max 10 characters, alphanumeric only

  2. Notes
    - Used for custom naming of AWS resources (IAM roles, stacks, lambdas)
    - Makes resources easily identifiable in AWS Console
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cloud_profiles' AND column_name = 'custom_domain'
  ) THEN
    ALTER TABLE cloud_profiles 
    ADD COLUMN custom_domain text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cloud_profiles' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE cloud_profiles 
    ADD COLUMN external_id text;
  END IF;
END $$;
