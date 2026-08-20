-- ============================================================
-- Rebuild manipulation_checks with simplified GX-X column structure
-- ============================================================

DROP TABLE IF EXISTS public.manipulation_checks CASCADE;

CREATE TABLE public.manipulation_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,

  -- G1-Human: 2 questions
  g1_human_1 TEXT,   -- AI tool usage (yes/no)
  g1_human_2 TEXT,   -- Other outside assistance (yes/no)

  -- G2-AI: 2 questions
  g2_ai_1 TEXT,      -- AI tool usage (yes/no)
  g2_ai_2 TEXT,      -- Other outside assistance (yes/no)

  -- G3-HumanAndAI: 4 questions (2 per stage)
  g3_humanandai_1 TEXT,  -- Stage1: AI tool usage (yes/no)
  g3_humanandai_2 TEXT,  -- Stage1: Other outside assistance (yes/no)
  g3_humanandai_3 TEXT,  -- Stage2: AI tool usage (yes/no)
  g3_humanandai_4 TEXT,  -- Stage2: Other outside assistance (yes/no)

  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.manipulation_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reads on manipulation_checks"
  ON public.manipulation_checks FOR SELECT USING (true);

CREATE POLICY "Allow inserts on manipulation_checks"
  ON public.manipulation_checks FOR INSERT WITH CHECK (true);

CREATE INDEX manipulation_checks_user_id_idx ON public.manipulation_checks (user_id);
