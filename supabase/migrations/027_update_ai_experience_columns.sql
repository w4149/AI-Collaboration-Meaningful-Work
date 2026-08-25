-- Rename old AI experience columns and add new ones
ALTER TABLE public.supplemental_questions
  ADD COLUMN IF NOT EXISTS ai_perceived_usefulness SMALLINT,
  ADD COLUMN IF NOT EXISTS ai_perceived_ease_of_use SMALLINT,
  ADD COLUMN IF NOT EXISTS ai_perceived_trustworthiness SMALLINT,
  ADD COLUMN IF NOT EXISTS ai_interaction_fluency SMALLINT,
  ADD COLUMN IF NOT EXISTS ai_satisfaction SMALLINT;