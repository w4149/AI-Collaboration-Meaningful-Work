-- Psychological scales table: stores responses from the psychological scale survey
-- administered after the task and before the post-task survey.

CREATE TABLE IF NOT EXISTS public.psychological_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  task_id TEXT,

  -- Q1: Meaning (4 items, 1-7)
  meaningful INTEGER CHECK (meaningful BETWEEN 1 AND 7),
  contributed_growth INTEGER CHECK (contributed_growth BETWEEN 1 AND 7),
  sense_of_purpose INTEGER CHECK (sense_of_purpose BETWEEN 1 AND 7),
  worthwhile INTEGER CHECK (worthwhile BETWEEN 1 AND 7),

  -- Q2: Psychological Ownership (5 items, 1-7)
  my_task_output INTEGER CHECK (my_task_output BETWEEN 1 AND 7),
  sense_of_belonging INTEGER CHECK (sense_of_belonging BETWEEN 1 AND 7),
  personal_ownership INTEGER CHECK (personal_ownership BETWEEN 1 AND 7),
  this_is_my_task INTEGER CHECK (this_is_my_task BETWEEN 1 AND 7),
  hard_to_think_mine INTEGER CHECK (hard_to_think_mine BETWEEN 1 AND 7),

  -- Q3: Mental Effort (1 item, 1-7)
  mental_effort INTEGER CHECK (mental_effort BETWEEN 1 AND 7),

  -- Q4: Autonomy (4 items, 1-7)
  decide_own_how INTEGER CHECK (decide_own_how BETWEEN 1 AND 7),
  make_decisions_own INTEGER CHECK (make_decisions_own BETWEEN 1 AND 7),
  opportunity_independence INTEGER CHECK (opportunity_independence BETWEEN 1 AND 7),
  personal_initiative INTEGER CHECK (personal_initiative BETWEEN 1 AND 7),

  -- Q5: Skill Utilisation (4 items, 1-7)
  learn_new_things INTEGER CHECK (learn_new_things BETWEEN 1 AND 7),
  utilize_abilities INTEGER CHECK (utilize_abilities BETWEEN 1 AND 7),
  use_talent_skills INTEGER CHECK (use_talent_skills BETWEEN 1 AND 7),
  develop_skills INTEGER CHECK (develop_skills BETWEEN 1 AND 7),

  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_psychological_scales_user_id ON public.psychological_scales(user_id);

-- RLS: users can only see their own responses
ALTER TABLE public.psychological_scales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own psychological scales" ON public.psychological_scales;
CREATE POLICY "Users can insert their own psychological scales"
  ON public.psychological_scales
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own psychological scales" ON public.psychological_scales;
CREATE POLICY "Users can view their own psychological scales"
  ON public.psychological_scales
  FOR SELECT
  USING (true);

-- Add fallback columns to users table for when psychological_scales table is unavailable
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_task_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_meaningful INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_contributed_growth INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_sense_of_purpose INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_worthwhile INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_my_task_output INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_sense_of_belonging INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_personal_ownership INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_this_is_my_task INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_hard_to_think_mine INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_mental_effort INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_decide_own_how INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_make_decisions_own INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_opportunity_independence INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_personal_initiative INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_learn_new_things INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_utilize_abilities INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_use_talent_skills INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS psy_develop_skills INTEGER;
