-- Create user project tables with comprehensive Row Level Security
-- Migration: 20250116000001_create_user_projects.sql

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'finished')),

  -- Materials
  needles TEXT NOT NULL,
  yarn TEXT NOT NULL,
  size TEXT,
  notes TEXT,

  -- Techniques (array of technique IDs)
  techniques TEXT[] NOT NULL DEFAULT '{}',

  -- Progress tracking
  current_step_index INTEGER NOT NULL DEFAULT 0,
  total_rows INTEGER NOT NULL DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- seconds

  -- Source info
  source_type TEXT CHECK (source_type IN ('uploaded', 'wizard', 'manual')),
  pattern_file_url TEXT,
  pattern_file_name TEXT,
  ai_generated BOOLEAN DEFAULT false,

  -- Annotation tracking
  annotation_version INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_worked_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(user_id, status);
CREATE INDEX idx_projects_last_worked ON projects(user_id, last_worked_at DESC NULLS LAST);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_step_id UUID REFERENCES steps(id) ON DELETE CASCADE,

  -- Step info
  type TEXT NOT NULL CHECK (type IN ('single', 'group', 'repeat')),
  label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,

  -- Techniques for this step
  techniques TEXT[] NOT NULL DEFAULT '{}',

  -- Ordering
  order_index INTEGER NOT NULL DEFAULT 0,

  -- Row tracking
  row_count INTEGER,
  start_row INTEGER,
  end_row INTEGER,
  repeat_count INTEGER,
  repeat_pattern TEXT[],
  completed_rows INTEGER[] DEFAULT '{}',

  -- Tracking type
  tracking_type TEXT CHECK (tracking_type IN ('stitch', 'row', 'single')),

  -- Stitch tracking
  stitch_count INTEGER,
  current_stitch INTEGER DEFAULT 0,

  -- Color change
  color_change_from TEXT,
  color_change_to TEXT,
  color_change_name TEXT,

  -- Milestone marker
  milestone BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_steps_project_id ON steps(project_id);
CREATE INDEX idx_steps_parent_id ON steps(parent_step_id);
CREATE INDEX idx_steps_order ON steps(project_id, order_index);

-- Enable RLS
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Access controlled via project ownership
CREATE POLICY "Users can view steps of their projects"
  ON steps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = steps.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create steps for their projects"
  ON steps FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = steps.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update steps of their projects"
  ON steps FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = steps.project_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = steps.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete steps of their projects"
  ON steps FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = steps.project_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PATTERN ANNOTATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS pattern_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Annotation type
  type TEXT NOT NULL CHECK (type IN ('path', 'text', 'rectangle', 'circle', 'arrow')),

  -- Shared fields
  color TEXT NOT NULL,
  stroke_width INTEGER,

  -- Path annotation
  path TEXT,
  is_highlighter BOOLEAN DEFAULT false,

  -- Position (for text, rectangle, circle)
  x REAL,
  y REAL,

  -- Text annotation
  text TEXT,
  font_size INTEGER,

  -- Rectangle annotation
  width REAL,
  height REAL,
  filled BOOLEAN DEFAULT false,

  -- Circle annotation
  cx REAL,
  cy REAL,
  rx REAL,
  ry REAL,

  -- Arrow annotation
  start_x REAL,
  start_y REAL,
  end_x REAL,
  end_y REAL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_annotations_project_id ON pattern_annotations(project_id);

-- Enable RLS
ALTER TABLE pattern_annotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Access controlled via project ownership
CREATE POLICY "Users can view annotations of their projects"
  ON pattern_annotations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = pattern_annotations.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create annotations for their projects"
  ON pattern_annotations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = pattern_annotations.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update annotations of their projects"
  ON pattern_annotations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = pattern_annotations.project_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = pattern_annotations.project_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete annotations of their projects"
  ON pattern_annotations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = pattern_annotations.project_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- USER FAVORITES TABLE (for pattern library)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id TEXT NOT NULL, -- Pattern ID from the pattern repository
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicates
  CONSTRAINT unique_user_pattern UNIQUE (user_id, pattern_id)
);

-- Indexes
CREATE INDEX idx_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_favorites_pattern_id ON user_favorites(pattern_id);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATED_AT TRIGGER (apply to new tables)
-- ============================================================================

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE projects IS 'User knitting projects with progress tracking';
COMMENT ON TABLE steps IS 'Individual steps within a knitting project';
COMMENT ON TABLE pattern_annotations IS 'User annotations on pattern files (drawings, text, shapes)';
COMMENT ON TABLE user_favorites IS 'User favorite patterns from the pattern library';
