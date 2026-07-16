-- Add task_duration column to survey_responses table
ALTER TABLE public.survey_responses
ADD COLUMN task_duration INTEGER NULL;