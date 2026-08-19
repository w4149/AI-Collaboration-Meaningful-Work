-- Add Other text fields for demographics survey

ALTER TABLE public.demographics_survey_responses
  ADD COLUMN IF NOT EXISTS other_gender VARCHAR(200),
  ADD COLUMN IF NOT EXISTS other_race VARCHAR(200),
  ADD COLUMN IF NOT EXISTS other_political VARCHAR(200);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS demo_other_gender VARCHAR(200),
  ADD COLUMN IF NOT EXISTS demo_other_race VARCHAR(200),
  ADD COLUMN IF NOT EXISTS demo_other_political VARCHAR(200);
