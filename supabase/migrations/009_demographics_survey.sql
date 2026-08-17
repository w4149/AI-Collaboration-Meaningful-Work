-- ====================================================================
-- Demographics Survey Table
-- 人口统计调查问卷表
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.demographics_survey_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,

    -- Q1: Gender
    gender VARCHAR(50),

    -- Q2: Race and/or ethnicity (comma-separated for multi-select)
    race_ethnicity VARCHAR(500),

    -- Q3: Education
    education VARCHAR(100),

    -- Q4: Employment
    employment VARCHAR(100),

    -- Q5: Income (1-10 scale)
    income SMALLINT,

    -- Q6: US born
    us_born VARCHAR(50),

    -- Q7: Political affiliation
    political VARCHAR(50),

    submitted_at TIMESTAMPTZ DEFAULT NOW()
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_demographics_survey_user_id
    ON public.demographics_survey_responses (user_id);

-- Enable RLS
ALTER TABLE public.demographics_survey_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on demographics_survey_responses" ON public.demographics_survey_responses;
CREATE POLICY "Allow all operations on demographics_survey_responses" ON public.demographics_survey_responses FOR ALL USING (true);

-- ====================================================================
-- Alternative: add columns directly to users table (used as API fallback)
-- ====================================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_gender VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_race_ethnicity VARCHAR(500);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_education VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_employment VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_income SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_us_born VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_political VARCHAR(50);