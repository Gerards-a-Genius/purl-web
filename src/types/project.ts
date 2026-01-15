// src/types/project.ts
// Web app types for projects and steps

// ============================================================================
// ANNOTATION TYPES - Discriminated Union for Path and Text Annotations
// ============================================================================

export type TextFontSize = 'small' | 'medium' | 'large';
export const TEXT_FONT_SIZES: Record<TextFontSize, number> = {
  small: 14,
  medium: 20,
  large: 28,
};

// Drawing path annotation (pen, highlighter)
export interface DrawPathAnnotation {
  id: string;
  type: 'path';
  path: string;           // SVG path data (e.g., "M 10 10 L 20 20")
  color: string;          // Hex color code
  strokeWidth: number;    // Line thickness in pixels
  isHighlighter: boolean; // Highlighter mode uses lower opacity
}

// Text annotation
export interface TextAnnotation {
  id: string;
  type: 'text';
  text: string;           // The annotation text content
  x: number;              // SVG x coordinate
  y: number;              // SVG y coordinate
  fontSize: number;       // Font size in pixels
  color: string;          // Hex color code
}

// Union type for all annotation types
export type PatternAnnotation = DrawPathAnnotation | TextAnnotation;

// Type guards for annotation types
export function isPathAnnotation(annotation: PatternAnnotation): annotation is DrawPathAnnotation {
  return annotation.type === 'path' || !('type' in annotation);
}

export function isTextAnnotation(annotation: PatternAnnotation): annotation is TextAnnotation {
  return annotation.type === 'text';
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export type ProjectStatus = 'planned' | 'in_progress' | 'finished';
export type ProjectSourceType = 'uploaded' | 'wizard' | 'manual';

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  status: ProjectStatus;
  needles: string;        // "5mm Circular"
  yarn: string;           // "Merino Wool, Red"
  size?: string;          // "Adult Medium"
  notes?: string;
  techniques: string[];   // technique IDs
  steps: Step[];
  currentStepIndex: number;
  totalRows: number;
  createdAt: string;
  lastWorkedAt?: string;
  sourceType?: ProjectSourceType;
  patternFileUrl?: string;    // Supabase Storage URL for uploaded patterns
  patternFileName?: string;   // Display name for pattern file
  aiGenerated?: boolean;      // Flag indicating if project was AI-generated
  totalTimeSpent?: number;    // Total knitting time in seconds

  // Pattern annotation data - persisted markup on pattern files
  patternAnnotations?: PatternAnnotation[];
  annotationVersion?: number;  // For future data migration support

  // Web-specific: User association
  userId?: string;
}

// ============================================================================
// STEP TYPES
// ============================================================================

export type StepType = 'single' | 'group' | 'repeat';
export type TrackingType = 'stitch' | 'row' | 'single';

export interface Step {
  id: string;
  type: StepType;
  label: string;          // "Row 1", "Setup", "Rows 3-12"
  title: string;
  description: string;
  completed: boolean;
  techniques: string[];   // technique IDs for this step
  children?: Step[];      // For grouped steps or expanded rows

  // Row tracking metadata
  rowCount?: number;            // Total rows this step represents
  startRow?: number;            // Starting row number (e.g., 3 for "Rows 3-12")
  endRow?: number;              // Ending row number (e.g., 12 for "Rows 3-12")
  repeatCount?: number;         // For repeat patterns (e.g., "repeat 10 times")
  repeatPattern?: string[];     // Pattern instructions to repeat ["Knit all", "Purl all"]
  completedRows?: number[];     // Track which specific rows are done (e.g., [3, 4, 5])

  // Tracking type detection
  trackingType?: TrackingType;

  // Stitch-level tracking (for tap counter)
  stitchCount?: number;         // Total stitches (e.g., 16 for "K16")
  currentStitch?: number;       // Current position in stitch counter (0-16)

  // Visual enhancements
  colorChange?: {
    from: string;               // Hex color code
    to: string;                 // Hex color code
    colorName?: string;         // Display name like "Mustard", "Navy"
  };
  milestone?: boolean;          // Mark progress checkpoints
}

// ============================================================================
// DATABASE TYPES (for Supabase)
// ============================================================================

// Flat project row for database (steps stored separately)
export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  thumbnail?: string;
  status: ProjectStatus;
  needles: string;
  yarn: string;
  size?: string;
  notes?: string;
  techniques: string[];
  current_step_index: number;
  total_rows: number;
  created_at: string;
  last_worked_at?: string;
  source_type?: ProjectSourceType;
  pattern_file_url?: string;
  pattern_file_name?: string;
  ai_generated?: boolean;
  total_time_spent?: number;
  annotation_version?: number;
}

// Flat step row for database
export interface StepRow {
  id: string;
  project_id: string;
  type: StepType;
  label: string;
  title: string;
  description: string;
  completed: boolean;
  techniques: string[];
  parent_step_id?: string;  // For nested steps
  order_index: number;      // For ordering
  row_count?: number;
  start_row?: number;
  end_row?: number;
  repeat_count?: number;
  repeat_pattern?: string[];
  completed_rows?: number[];
  tracking_type?: TrackingType;
  stitch_count?: number;
  current_stitch?: number;
  color_change_from?: string;
  color_change_to?: string;
  color_change_name?: string;
  milestone?: boolean;
}

// Annotation row for database
export interface AnnotationRow {
  id: string;
  project_id: string;
  type: 'path' | 'text';
  path?: string;
  color: string;
  stroke_width?: number;
  is_highlighter?: boolean;
  text?: string;
  x?: number;
  y?: number;
  font_size?: number;
  created_at: string;
}
