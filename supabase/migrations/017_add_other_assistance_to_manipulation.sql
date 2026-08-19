-- Add other_assistance columns to manipulation_checks table
-- G1-Human / G2-AI: ai_used + other_assistance (no stage distinction)
-- G3-HumanAndAI: stage1_ai_used + stage1_other_assistance + stage2_ai_used + stage2_other_assistance

ALTER TABLE public.manipulation_checks
  ADD COLUMN IF NOT EXISTS other_assistance TEXT,
  ADD COLUMN IF NOT EXISTS stage1_ai_used TEXT,
  ADD COLUMN IF NOT EXISTS stage1_other_assistance TEXT,
  ADD COLUMN IF NOT EXISTS stage2_ai_used TEXT,
  ADD COLUMN IF NOT EXISTS stage2_other_assistance TEXT;
