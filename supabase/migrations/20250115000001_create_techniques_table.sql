-- Create techniques table for knitting knowledge base
-- Migration: 20250115000001_create_techniques_table.sql

-- Create enum for technique categories
CREATE TYPE technique_category AS ENUM (
  'cast-on',
  'bind-off',
  'basic-stitches',
  'increases',
  'decreases',
  'short-rows',
  'cables',
  'colorwork',
  'lace',
  'texture',
  'construction',
  'finishing',
  'fixing-mistakes',
  'edges',
  'shaping'
);

-- Create enum for technique frequency
CREATE TYPE technique_frequency AS ENUM (
  'very-common',
  'common',
  'occasional',
  'rare'
);

-- Create techniques table
CREATE TABLE IF NOT EXISTS techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,

  -- Classification
  category technique_category NOT NULL,
  subcategory TEXT,
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),

  -- Content
  description TEXT NOT NULL,
  purpose TEXT NOT NULL,
  instructions JSONB NOT NULL DEFAULT '[]', -- Array of TechniqueStep
  tips TEXT[] NOT NULL DEFAULT '{}',
  common_mistakes JSONB NOT NULL DEFAULT '[]', -- Array of TechniqueMistake

  -- Variations
  variations JSONB, -- Array of TechniqueVariation

  -- Learning resources
  video_url TEXT,
  images JSONB, -- Array of TechniqueImage

  -- Relationships (stored as arrays of technique IDs)
  prerequisites TEXT[] NOT NULL DEFAULT '{}',
  related_techniques TEXT[] NOT NULL DEFAULT '{}',
  alternative_to TEXT[],

  -- For AI parsing recognition
  aliases TEXT[] NOT NULL DEFAULT '{}',
  abbreviations TEXT[] NOT NULL DEFAULT '{}',
  pattern_phrases TEXT[] NOT NULL DEFAULT '{}',

  -- Usage data
  used_in_pattern_types TEXT[],
  frequency technique_frequency NOT NULL DEFAULT 'common',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_techniques_category ON techniques(category);
CREATE INDEX idx_techniques_difficulty ON techniques(difficulty);
CREATE INDEX idx_techniques_slug ON techniques(slug);
CREATE INDEX idx_techniques_frequency ON techniques(frequency);

-- Create GIN index for full-text search on name, description, aliases
CREATE INDEX idx_techniques_search ON techniques USING GIN (
  to_tsvector('english', name || ' ' || description || ' ' || array_to_string(aliases, ' '))
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to techniques table
CREATE TRIGGER update_techniques_updated_at
  BEFORE UPDATE ON techniques
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users (techniques are public knowledge)
CREATE POLICY "Techniques are viewable by everyone"
  ON techniques FOR SELECT
  USING (true);

-- Allow insert/update only for authenticated users (for admin purposes)
CREATE POLICY "Authenticated users can insert techniques"
  ON techniques FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update techniques"
  ON techniques FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE techniques IS 'Knitting techniques knowledge base with instructions, tips, and relationships';
COMMENT ON COLUMN techniques.instructions IS 'Array of TechniqueStep objects: {order, instruction, imageUrl?, tip?}';
COMMENT ON COLUMN techniques.common_mistakes IS 'Array of TechniqueMistake objects: {description, howToAvoid, howToFix?}';
COMMENT ON COLUMN techniques.variations IS 'Array of TechniqueVariation objects: {id, name, description, whenToUse, instructions?}';
COMMENT ON COLUMN techniques.images IS 'Array of TechniqueImage objects: {url, alt, caption?, step?}';
COMMENT ON COLUMN techniques.prerequisites IS 'Array of technique IDs that should be learned first';
COMMENT ON COLUMN techniques.related_techniques IS 'Array of technique IDs for similar/complementary techniques';
