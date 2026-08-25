-- Add ai_issues column to supplemental_questions
ALTER TABLE public.supplemental_questions
  ADD COLUMN IF NOT EXISTS ai_issues TEXT;