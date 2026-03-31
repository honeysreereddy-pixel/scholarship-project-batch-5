-- ==================================================
-- ScholarHub: Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ==================================================

-- 1. Scholarships table
CREATE TABLE IF NOT EXISTS public.scholarships (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  provider    TEXT NOT NULL,
  amount      TEXT NOT NULL,
  deadline    TEXT NOT NULL,
  location    TEXT NOT NULL,
  category    TEXT NOT NULL,
  featured    BOOLEAN DEFAULT false,
  description TEXT,
  url         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name       TEXT,
  email           TEXT,
  field_of_study  TEXT,
  graduation_year INTEGER,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Saved scholarships table
CREATE TABLE IF NOT EXISTS public.saved_scholarships (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scholarship_id  UUID REFERENCES public.scholarships(id) ON DELETE CASCADE NOT NULL,
  saved_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);

-- ==================================================
-- Row Level Security
-- ==================================================

ALTER TABLE public.scholarships        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scholarships  ENABLE ROW LEVEL SECURITY;

-- Scholarships: anyone can read
DROP POLICY IF EXISTS "Scholarships are publicly readable" ON public.scholarships;
CREATE POLICY "Scholarships are publicly readable"
  ON public.scholarships FOR SELECT USING (true);

-- Profiles: users can read/write only their own
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Saved scholarships: users can CRUD only their own
DROP POLICY IF EXISTS "Users can view own saved scholarships" ON public.saved_scholarships;
CREATE POLICY "Users can view own saved scholarships"
  ON public.saved_scholarships FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save scholarships" ON public.saved_scholarships;
CREATE POLICY "Users can save scholarships"
  ON public.saved_scholarships FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unsave scholarships" ON public.saved_scholarships;
CREATE POLICY "Users can unsave scholarships"
  ON public.saved_scholarships FOR DELETE USING (auth.uid() = user_id);

-- ==================================================
-- Seed Data: 6 Sample Scholarships
-- ==================================================

INSERT INTO public.scholarships (title, provider, amount, deadline, location, category, featured, description, url)
VALUES
  (
    'Global Excellence Award',
    'International Education Fund',
    '$25,000',
    'Apr 30, 2026',
    'Worldwide',
    'STEM',
    true,
    'Awarded to outstanding STEM students demonstrating academic excellence and leadership potential on a global stage.',
    null
  ),
  (
    'Women in Tech Scholarship',
    'TechForward Foundation',
    '$15,000',
    'May 15, 2026',
    'USA & Canada',
    'Technology',
    false,
    'Supporting women pursuing careers in technology, engineering, and computer science.',
    null
  ),
  (
    'Future Leaders Grant',
    'Leadership Academy',
    '$10,000',
    'Jun 01, 2026',
    'Global',
    'Leadership',
    false,
    'For students with demonstrated leadership in community service and student organizations.',
    null
  ),
  (
    'Arts & Humanities Fellowship',
    'Creative Minds Institute',
    '$20,000',
    'May 20, 2026',
    'Europe',
    'Arts',
    true,
    'Celebrating creativity and critical thinking in literature, visual arts, and cultural studies.',
    null
  ),
  (
    'Community Impact Scholarship',
    'Social Change Network',
    '$8,000',
    'Jul 10, 2026',
    'Africa & Asia',
    'Social Work',
    false,
    'Recognizing students committed to social justice, community development, and public service.',
    null
  ),
  (
    'Medical Research Award',
    'HealthFirst Foundation',
    '$30,000',
    'Apr 15, 2026',
    'USA',
    'Medicine',
    true,
    'Supporting the next generation of medical researchers tackling worldwide health challenges.',
    null
  );
