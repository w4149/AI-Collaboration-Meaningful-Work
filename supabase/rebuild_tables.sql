-- ============================================================
-- COMPLETE REBUILD: attention_checks + demographics_survey_responses + manipulation_checks
-- ============================================================

-- ============================================================
-- 1. ATTENTION CHECKS
-- ============================================================
DROP TABLE IF EXISTS public.attention_checks CASCADE;

CREATE TABLE public.attention_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  group_type TEXT,

  -- Check 1 (entry page)
  check1_ever_failed BOOLEAN NOT NULL DEFAULT false,
  check1_fail_count INTEGER NOT NULL DEFAULT 0,
  check1_correct_answer TEXT,
  check1_final_answer TEXT,
  check1_completed_at TIMESTAMPTZ,

  -- Check 2 (psychological-scale page)
  check2_ever_failed BOOLEAN NOT NULL DEFAULT false,
  check2_fail_count INTEGER NOT NULL DEFAULT 0,
  check2_correct_answer TEXT,
  check2_final_answer TEXT,
  check2_completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id)
);

ALTER TABLE public.attention_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reads on attention_checks"
  ON public.attention_checks FOR SELECT USING (true);

CREATE POLICY "Allow inserts on attention_checks"
  ON public.attention_checks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updates on attention_checks"
  ON public.attention_checks FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX attention_checks_user_id_idx ON public.attention_checks (user_id);
CREATE INDEX attention_checks_group_type_idx ON public.attention_checks (group_type);


-- ============================================================
-- 2. DEMOGRAPHICS SURVEY RESPONSES
-- ============================================================
DROP TABLE IF EXISTS public.demographics_survey_responses CASCADE;

CREATE TABLE public.demographics_survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,

  -- Q1: Gender
  gender VARCHAR(50),
  other_gender VARCHAR(200),

  -- Q2: Race and/or ethnicity (comma-separated for multi-select)
  race_ethnicity VARCHAR(500),
  other_race VARCHAR(200),

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
  other_political VARCHAR(200),

  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_demographics_survey_user_id
  ON public.demographics_survey_responses (user_id);

ALTER TABLE public.demographics_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on demographics_survey_responses"
  ON public.demographics_survey_responses FOR ALL USING (true);

-- Ensure users table has demo_ columns (fallback storage)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_gender VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_other_gender VARCHAR(200);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_race_ethnicity VARCHAR(500);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_other_race VARCHAR(200);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_education VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_employment VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_income SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_us_born VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_political VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS demo_other_political VARCHAR(200);


-- ============================================================
-- 3. MANIPULATION CHECKS
-- ============================================================
DROP TABLE IF EXISTS public.manipulation_checks CASCADE;

CREATE TABLE public.manipulation_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  group_type TEXT NOT NULL,

  -- Legacy columns (always populated)
  ai_used_stage1 TEXT,
  ai_used_stage2 TEXT,

  -- New columns for G1/G2 groups (single-stage questions)
  ai_used TEXT,
  other_assistance TEXT,

  -- New columns for G3 group (separate stage1/stage2 questions)
  stage1_ai_used TEXT,
  stage1_other_assistance TEXT,
  stage2_ai_used TEXT,
  stage2_other_assistance TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.manipulation_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reads on manipulation_checks"
  ON public.manipulation_checks FOR SELECT USING (true);

CREATE POLICY "Allow inserts on manipulation_checks"
  ON public.manipulation_checks FOR INSERT WITH CHECK (true);

CREATE INDEX manipulation_checks_user_id_idx ON public.manipulation_checks (user_id);
CREATE INDEX manipulation_checks_group_type_idx ON public.manipulation_checks (group_type);
