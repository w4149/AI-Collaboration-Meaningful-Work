-- Add task_type_id (uuid) and group_mode (varchar) columns to survey_responses table
ALTER TABLE public.survey_responses
ADD COLUMN task_type_id UUID NULL REFERENCES task_types(id);

ALTER TABLE public.survey_responses
ADD COLUMN group_mode VARCHAR(50) NULL;
-- Add task_type and group_type columns to survey_responses table
ALTER TABLE public.survey_responses
ADD COLUMN task_type VARCHAR(50) NULL;

ALTER TABLE public.survey_responses
ADD COLUMN group_type VARCHAR(50) NULL;