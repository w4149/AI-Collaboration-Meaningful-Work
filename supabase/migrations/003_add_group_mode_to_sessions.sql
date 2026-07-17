ALTER TABLE sessions
ADD COLUMN group_mode VARCHAR(50);

ALTER TABLE sessions
ADD CONSTRAINT chk_session_group_mode CHECK (group_mode IN ('Human', 'Human-AI', 'AI'));
