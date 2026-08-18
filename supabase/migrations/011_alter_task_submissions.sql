-- Alter task_submissions: rename content → submission, add submission_2 and timing columns

ALTER TABLE public.task_submissions RENAME COLUMN content TO submission;

ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS submission_2 TEXT;

-- submission_time: seconds from entering task page to Phase 1 submit (or final submit for G1/G2)
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS submission_time INTEGER;

-- submission_time_2: seconds from entering Phase 2 to final Phase 2 submit (G3 only)
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS submission_time_2 INTEGER;
