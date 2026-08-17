-- ====================================================================
-- Post-Task Survey Table
-- 任务后调查问卷表
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.post_task_surveys (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    task_id VARCHAR(50),

    -- Q1: Task instruction clarity (1-5)
    clarity SMALLINT,

    -- Q2: What was unclear (optional text)
    unclear_description TEXT,

    -- Q3: Task difficulty (1-5)
    difficulty SMALLINT,

    -- Q4: Time sufficiency (1-5)
    time_sufficient SMALLINT,

    -- Q5: Cognitive load / agreement items (1-7 each)
    analyze_info SMALLINT,
    generate_ideas SMALLINT,
    doing_similar_repeatedly SMALLINT,
    consider_feelings SMALLINT,
    logical_reasoning SMALLINT,
    repetitive_steps SMALLINT,
    imagination SMALLINT,
    consider_perspective SMALLINT,
    follow_procedure SMALLINT,
    creative_thinking SMALLINT,
    think_reaction SMALLINT,
    compare_evaluate SMALLINT,

    -- Q6: Task type familiarity (1-7)
    familiarity SMALLINT,

    submitted_at TIMESTAMPTZ DEFAULT NOW()
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_post_task_surveys_user_id
    ON public.post_task_surveys (user_id);

CREATE INDEX IF NOT EXISTS idx_post_task_surveys_task_id
    ON public.post_task_surveys (task_id);

-- Enable RLS
ALTER TABLE public.post_task_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on post_task_surveys" ON public.post_task_surveys;
CREATE POLICY "Allow all operations on post_task_surveys" ON public.post_task_surveys FOR ALL USING (true);

-- ====================================================================
-- Alternative: add columns directly to users table (used as API fallback)
-- ====================================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_task_id VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_clarity SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_unclear_description TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_difficulty SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_time_sufficient SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_familiarity SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_analyze_info SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_generate_ideas SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_doing_similar_repeatedly SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_consider_feelings SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_logical_reasoning SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_repetitive_steps SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_imagination SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_consider_perspective SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_follow_procedure SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_creative_thinking SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_think_reaction SMALLINT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS post_compare_evaluate SMALLINT;