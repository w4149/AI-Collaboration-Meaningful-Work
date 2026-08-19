-- Create manipulation_checks table to store manipulation check responses

CREATE TABLE IF NOT EXISTS public.manipulation_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  group_type TEXT NOT NULL,
  -- G1-Human: ai_used (no / yes_own_ai)
  -- G2-AI: ai_used (no / copy_paste_no_changes / copy_paste_edited)
  -- G3-HumanAndAI: stage1_ai_used + stage2_ai_used
  ai_used_stage1 TEXT,
  ai_used_stage2 TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manipulation_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reads on manipulation_checks"
  ON public.manipulation_checks
  FOR SELECT
  USING (true);

CREATE POLICY "Allow inserts on manipulation_checks"
  ON public.manipulation_checks
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS manipulation_checks_user_id_idx ON public.manipulation_checks (user_id);
CREATE INDEX IF NOT EXISTS manipulation_checks_group_type_idx ON public.manipulation_checks (group_type);
