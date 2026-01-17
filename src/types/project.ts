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

// Rectangle annotation
export interface RectangleAnnotation {
  id: string;
  type: 'rectangle';
  x: number;              // Top-left x coordinate
  y: number;              // Top-left y coordinate
  width: number;          // Rectangle width
  height: number;         // Rectangle height
  color: string;          // Stroke color (hex)
  strokeWidth: number;    // Border thickness
  filled: boolean;        // Whether to fill with semi-transparent color
}

// Circle/Ellipse annotation
export interface CircleAnnotation {
  id: string;
  type: 'circle';
  cx: number;             // Center x coordinate
  cy: number;             // Center y coordinate
  rx: number;             // Horizontal radius (ellipse support)
  ry: number;             // Vertical radius (ellipse support)
  color: string;          // Stroke color (hex)
  strokeWidth: number;    // Border thickness
  filled: boolean;        // Whether to fill with semi-transparent color
}

// Arrow annotation
export interface ArrowAnnotation {
  id: string;
  type: 'arrow';
  startX: number;         // Arrow tail x coordinate
  startY: number;         // Arrow tail y coordinate
  endX: number;           // Arrow tip x coordinate
  endY: number;           // Arrow tip y coordinate
  color: string;          // Arrow color (hex)
  strokeWidth: number;    // Line thickness
}

// Union type for all annotation types
export type PatternAnnotation =
  | DrawPathAnnotation
  | TextAnnotation
  | RectangleAnnotation
  | CircleAnnotation
  | ArrowAnnotation;

// Type guards for annotation types
export function isPathAnnotation(annotation: PatternAnnotation): annotation is DrawPathAnnotation {
  return annotation.type === 'path' || !('type' in annotation);
}

export function isTextAnnotation(annotation: PatternAnnotation): annotation is TextAnnotation {
  return annotation.type === 'text';
}

export function isRectangleAnnotation(annotation: PatternAnnotation): annotation is RectangleAnnotation {
  return annotation.type === 'rectangle';
}

export function isCircleAnnotation(annotation: PatternAnnotation): annotation is CircleAnnotation {
  return annotation.type === 'circle';
}

export function isArrowAnnotation(annotation: PatternAnnotation): annotation is ArrowAnnotation {
  return annotation.type === 'arrow';
}

// Helper type for shape annotations
export type ShapeAnnotation = RectangleAnnotation | CircleAnnotation | ArrowAnnotation;

export function isShapeAnnotation(annotation: PatternAnnotation): annotation is ShapeAnnotation {
  return ['rectangle', 'circle', 'arrow'].includes(annotation.type);
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
  type: 'path' | 'text' | 'rectangle' | 'circle' | 'arrow';
  // Path annotation fields
  path?: string;
  is_highlighter?: boolean;
  // Shared fields
  color: string;
  stroke_width?: number;
  x?: number;
  y?: number;
  // Text annotation fields
  text?: string;
  font_size?: number;
  // Rectangle annotation fields
  width?: number;
  height?: number;
  filled?: boolean;
  // Circle annotation fields
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  // Arrow annotation fields
  start_x?: number;
  start_y?: number;
  end_x?: number;
  end_y?: number;
  // Metadata
  created_at: string;
}
