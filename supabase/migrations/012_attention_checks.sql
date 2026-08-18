-- Create attention_checks table to store attention check responses

CREATE TABLE IF NOT EXISTS public.attention_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  check_type INTEGER NOT NULL, -- 1 = entry attention check, 2 = psychological-scale attention check
  group_type TEXT,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attention_checks ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own attention checks
CREATE POLICY "Users can read own attention checks"
  ON public.attention_checks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow service role to insert
CREATE POLICY "Service role can insert attention checks"
  ON public.attention_checks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS attention_checks_user_id_idx ON public.attention_checks (user_id);
CREATE INDEX IF NOT EXISTS attention_checks_check_type_idx ON public.attention_checks (check_type);
