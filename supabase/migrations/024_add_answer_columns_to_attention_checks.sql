-- Add check1_answer and check2_answer columns to attention_checks table
-- These store the actual selected answer values (integer from Likert scale)
-- Replaces the old pass/fail tracking fields for the simplified attention check design

ALTER TABLE public.attention_checks
ADD COLUMN IF NOT EXISTS check1_answer INTEGER,
ADD COLUMN IF NOT EXISTS check2_answer INTEGER;