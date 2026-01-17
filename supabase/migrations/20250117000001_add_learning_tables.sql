-- Migration: Add Learning System Tables
-- Date: 2025-01-17
-- Purpose: Create missing tables for Learn page functionality + fix category enum mismatch

-- ============================================================================
-- STEP 1: Add missing enum values for technique_category
-- ============================================================================
-- These values are expected by TypeScript types but missing from the original enum

DO $$
BEGIN
  -- Add 'basic' (TypeScript uses 'basic', DB has 'basic-stitches')
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'basic' AND enumtypid = 'technique_category'::regtype) THEN
    ALTER TYPE technique_category ADD VALUE 'basic';
  END IF;

  -- Add 'increase' (TypeScript uses 'increase', DB has 'increases')
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'increase' AND enumtypid = 'technique_category'::regtype) THEN
    ALTER TYPE technique_category ADD VALUE 'increase';
  END IF;

  -- Add 'decrease' (TypeScript uses 'decrease', DB has 'decreases')
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'decrease' AND enumtypid = 'technique_category'::regtype) THEN
    ALTER TYPE technique_category ADD VALUE 'decrease';
  END IF;

  -- Add 'sos' (TypeScript uses 'sos', DB has 'fixing-mistakes')
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'sos' AND enumtypid = 'technique_category'::regtype) THEN
    ALTER TYPE technique_category ADD VALUE 'sos';
  END IF;

  -- Add 'foundations' (new category for pre-knitting basics)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'foundations' AND enumtypid = 'technique_category'::regtype) THEN
    ALTER TYPE technique_category ADD VALUE 'foundations';
  END IF;

  -- Add 'patterns' (for stitch patterns like ribbing, seed stitch)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'patterns' AND enumtypid = 'technique_category'::regtype) THEN
    ALTER TYPE technique_category ADD VALUE 'patterns';
  END IF;

  -- Add 'reading-patterns' (for pattern reading skills)
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'reading-patterns' AND enumtypid = 'technique_category'::regtype) THEN
    ALTER TYPE technique_category ADD VALUE 'reading-patterns';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Create technique_steps table
-- ============================================================================
-- Stores interactive tutorial steps for each technique

CREATE TABLE IF NOT EXISTS technique_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  instruction TEXT NOT NULL,
  image_url TEXT,
  animation_url TEXT,
  detailed_tip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique step numbers per technique
  UNIQUE(technique_id, step_number)
);

-- Create index for efficient technique lookup
CREATE INDEX IF NOT EXISTS idx_technique_steps_technique_id ON technique_steps(technique_id);

-- Enable RLS
ALTER TABLE technique_steps ENABLE ROW LEVEL SECURITY;

-- Allow public read access (technique steps are educational content)
CREATE POLICY "Technique steps are viewable by everyone"
  ON technique_steps FOR SELECT
  USING (true);

-- Allow authenticated users to insert (for admin)
CREATE POLICY "Authenticated users can insert technique steps"
  ON technique_steps FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE technique_steps IS 'Interactive tutorial steps for each knitting technique';

-- ============================================================================
-- STEP 3: Create quiz_questions table
-- ============================================================================
-- Stores quiz questions for technique comprehension checks

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0 AND correct_index < 4),
  explanation TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient technique lookup
CREATE INDEX IF NOT EXISTS idx_quiz_questions_technique_id ON quiz_questions(technique_id);

-- Enable RLS
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Quiz questions are viewable by everyone"
  ON quiz_questions FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert quiz questions"
  ON quiz_questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE quiz_questions IS 'Multiple choice quiz questions for technique comprehension';

-- ============================================================================
-- STEP 4: Create curated_videos table
-- ============================================================================
-- Stores curated YouTube video links for techniques

CREATE TABLE IF NOT EXISTS curated_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'youtube',
  video_id TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  title TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  recommended_start INTEGER NOT NULL DEFAULT 0,
  recommended_end INTEGER,
  ai_score INTEGER NOT NULL DEFAULT 8 CHECK (ai_score >= 1 AND ai_score <= 10),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One video per technique for now
  UNIQUE(technique_id)
);

-- Create index for efficient technique lookup
CREATE INDEX IF NOT EXISTS idx_curated_videos_technique_id ON curated_videos(technique_id);

-- Enable RLS
ALTER TABLE curated_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Curated videos are viewable by everyone"
  ON curated_videos FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert curated videos"
  ON curated_videos FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE curated_videos IS 'Curated YouTube tutorial videos for each technique';

-- ============================================================================
-- STEP 5: Create technique_progress table
-- ============================================================================
-- Tracks user progress on each technique

CREATE TABLE IF NOT EXISTS technique_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'practicing', 'confident')),
  completed_steps INTEGER[] NOT NULL DEFAULT '{}',
  quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
  quiz_attempts INTEGER NOT NULL DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  practice_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One progress record per user per technique
  UNIQUE(user_id, technique_id)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_technique_progress_user_id ON technique_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_technique_progress_technique_id ON technique_progress(technique_id);
CREATE INDEX IF NOT EXISTS idx_technique_progress_status ON technique_progress(status);

-- Enable RLS
ALTER TABLE technique_progress ENABLE ROW LEVEL SECURITY;

-- Users can only view their own progress
CREATE POLICY "Users can view own technique progress"
  ON technique_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own technique progress"
  ON technique_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own technique progress"
  ON technique_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own technique progress"
  ON technique_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_technique_progress_updated_at
  BEFORE UPDATE ON technique_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE technique_progress IS 'User progress tracking for knitting techniques';

-- ============================================================================
-- STEP 6: Add missing columns to techniques table if needed
-- ============================================================================

-- Add abbreviation column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'techniques' AND column_name = 'abbreviation'
  ) THEN
    ALTER TABLE techniques ADD COLUMN abbreviation TEXT;
  END IF;
END $$;

-- Add steps column (TEXT array for simple instruction list) if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'techniques' AND column_name = 'steps'
  ) THEN
    ALTER TABLE techniques ADD COLUMN steps TEXT[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- Add common_mistakes as TEXT array if the column type is JSONB
-- (API expects TEXT[] but original schema may have JSONB)
-- Note: This is handled gracefully by the API layer

-- Add tags column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'techniques' AND column_name = 'tags'
  ) THEN
    ALTER TABLE techniques ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- ============================================================================
-- Migration Complete
-- ============================================================================
