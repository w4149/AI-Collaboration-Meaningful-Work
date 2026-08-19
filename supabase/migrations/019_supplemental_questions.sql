-- Supplemental question: AI familiarity prior to study

CREATE TABLE IF NOT EXISTS public.supplemental_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ai_familiarity SMALLINT,        -- 1-7 Likert
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.supplemental_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow reads on supplemental_questions"
  ON public.supplemental_questions FOR SELECT USING (true);

CREATE POLICY "Allow inserts on supplemental_questions"
  ON public.supplemental_questions FOR INSERT WITH CHECK (true);

CREATE INDEX supplemental_questions_user_id_idx ON public.supplemental_questions (user_id);
