/*
  # Make user_id nullable in pipelines table

  1. Changes
    - Make `user_id` column nullable since pipelines can be associated via workspace_id
    - User can be derived from workspace relationship

  2. Security
    - RLS policies already handle both user_id and workspace_id access patterns
*/

-- Make user_id nullable
ALTER TABLE pipelines ALTER COLUMN user_id DROP NOT NULL;