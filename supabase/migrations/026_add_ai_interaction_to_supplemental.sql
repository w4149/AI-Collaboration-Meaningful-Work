-- Add new columns to supplemental_questions table for AI interaction feedback
ALTER TABLE public.supplemental_questions
ADD COLUMN IF NOT EXISTS ai_interaction_freq SMALLINT,
ADD COLUMN IF NOT EXISTS ai_helpful SMALLINT,
ADD COLUMN IF NOT EXISTS ai_easy SMALLINT,
ADD COLUMN IF NOT EXISTS ai_speed SMALLINT,
ADD COLUMN IF NOT EXISTS ai_no_use_reasons TEXT,
ADD COLUMN IF NOT EXISTS ai_no_use_tech_issue TEXT,
ADD COLUMN IF NOT EXISTS ai_no_use_other TEXT,
ADD COLUMN IF NOT EXISTS ai_suggestions TEXT;