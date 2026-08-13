-- ====================================================================
-- Pre-Survey Demographics Table
-- 人口学前置调查问卷表
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.pre_survey_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    birth_year SMALLINT,
    gender VARCHAR(50),
    ethnic_background VARCHAR(500),
    ethnic_other_text VARCHAR(500),
    education VARCHAR(100),
    employment VARCHAR(100),
    employment_other_text VARCHAR(500),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_pre_survey_responses_user_id
    ON public.pre_survey_responses (user_id);

-- Enable RLS so server-side (service_role) can write freely
ALTER TABLE public.pre_survey_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on pre_survey_responses" ON pre_survey_responses;
CREATE POLICY "Allow all operations on pre_survey_responses" ON pre_survey_responses FOR ALL USING (true);

-- ====================================================================
-- Alternative: add columns directly to users table (used as API fallback)
-- ====================================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pre_birth_year SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pre_gender VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pre_ethnic_background VARCHAR(500);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pre_ethnic_other_text VARCHAR(500);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pre_education VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pre_employment VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pre_employment_other_text VARCHAR(500);
