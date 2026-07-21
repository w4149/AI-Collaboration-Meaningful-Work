-- Create survey_likert_responses table
CREATE TABLE IF NOT EXISTS survey_likert_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    part INTEGER NOT NULL CHECK (part BETWEEN 1 AND 4),
    responses JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE survey_likert_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on survey_likert_responses" ON survey_likert_responses FOR ALL USING (true);
