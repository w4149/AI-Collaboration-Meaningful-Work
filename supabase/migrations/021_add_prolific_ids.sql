-- Add Prolific STUDY_ID and SESSION_ID to users table

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS study_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS prolific_session_id VARCHAR(100);
