-- Add ai_used column for G1/G2 groups (non-stage AI usage question)

ALTER TABLE public.manipulation_checks
  ADD COLUMN IF NOT EXISTS ai_used TEXT;
