-- Add ai_work_extent column to supplemental_questions table
ALTER TABLE public.supplemental_questions
ADD COLUMN IF NOT EXISTS ai_work_extent SMALLINT;