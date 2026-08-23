-- Add wait_time column to post_task_surveys table
ALTER TABLE public.post_task_surveys
ADD COLUMN IF NOT EXISTS wait_time INTEGER;

-- Add post_wait_time column to users table for fallback storage
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS post_wait_time INTEGER;
