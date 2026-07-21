-- Add scale_results column to survey_responses table
ALTER TABLE public.survey_responses
ADD COLUMN scale_results TEXT NULL;
