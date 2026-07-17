ALTER TABLE survey_responses
ADD COLUMN task_type_id UUID REFERENCES task_types(id) ON DELETE SET NULL,
ADD COLUMN group_mode VARCHAR(50);

-- Optional: Add a check constraint for group_mode if it's strictly these three values
ALTER TABLE survey_responses
ADD CONSTRAINT chk_group_mode CHECK (group_mode IN ('Human', 'Human-AI', 'AI'));
