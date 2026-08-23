-- Add ai_total_tokens column to task_submissions table
-- Tracks total AI tokens consumed across all chat interactions (0 for Human group)

ALTER TABLE public.task_submissions
ADD COLUMN IF NOT EXISTS ai_total_tokens INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.task_submissions.ai_total_tokens IS 'Total AI tokens consumed across all chat interactions. 0 for G1-Human group.';
