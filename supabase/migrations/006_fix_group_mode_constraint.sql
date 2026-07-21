-- Fix group_mode check constraint to allow new group naming
ALTER TABLE public.survey_responses DROP CONSTRAINT IF EXISTS chk_group_mode;
ALTER TABLE public.survey_responses ADD CONSTRAINT chk_group_mode 
  CHECK (group_mode IN ('Human', 'HumanAndAI', 'AI', 'G1-Human', 'G2-HumanAndAI', 'G3-AI'));
