-- =====================================================
-- Attention Checks v2: One row per user, tracks both checks
-- =====================================================

-- Drop old table
DROP TABLE IF EXISTS public.attention_checks;

CREATE TABLE IF NOT EXISTS public.attention_checks (
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

-- Enable RLS
ALTER TABLE public.attention_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow reads on attention_checks" ON public.attention_checks;
CREATE POLICY "Allow reads on attention_checks"
  ON public.attention_checks
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow inserts on attention_checks" ON public.attention_checks;
CREATE POLICY "Allow inserts on attention_checks"
  ON public.attention_checks
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updates on attention_checks" ON public.attention_checks;
CREATE POLICY "Allow updates on attention_checks"
  ON public.attention_checks
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS attention_checks_user_id_idx ON public.attention_checks (user_id);
CREATE INDEX IF NOT EXISTS attention_checks_group_type_idx ON public.attention_checks (group_type);
