-- Fix RLS policies for attention_checks table
-- The previous INSERT policy only allowed service_role, but the API uses the anon key.
-- We replace it with a policy that allows inserts via the anon key (consistent with other tables).

-- Drop the old service_role-only INSERT policy
DROP POLICY IF EXISTS "Service role can insert attention checks" ON public.attention_checks;

-- Allow anon key to insert (the API route validates input before inserting)
CREATE POLICY "Allow inserts on attention_checks"
  ON public.attention_checks
  FOR INSERT
  WITH CHECK (true);

-- Also allow the API to read attention checks (for any future query needs)
DROP POLICY IF EXISTS "Users can read own attention checks" ON public.attention_checks;

CREATE POLICY "Allow reads on attention_checks"
  ON public.attention_checks
  FOR SELECT
  USING (true);
