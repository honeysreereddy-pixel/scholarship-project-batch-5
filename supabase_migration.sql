-- ==================================================
-- ScholarHub: Migration — Add Eligibility Columns
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ==================================================

ALTER TABLE public.scholarships
  ADD COLUMN IF NOT EXISTS min_gpa             NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS eligible_levels     TEXT[],
  ADD COLUMN IF NOT EXISTS eligible_genders    TEXT DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS income_level        TEXT DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS min_age             INTEGER,
  ADD COLUMN IF NOT EXISTS max_age             INTEGER,
  ADD COLUMN IF NOT EXISTS eligible_nationalities TEXT DEFAULT 'All';

-- Update existing seed rows to have open eligibility
UPDATE public.scholarships
SET
  eligible_genders        = 'Any',
  income_level            = 'Any',
  eligible_nationalities  = 'All'
WHERE eligible_genders IS NULL;
