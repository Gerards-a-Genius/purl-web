// src/types/pattern.ts
// Types for the Pattern Library feature

// ============================================================================
// DIFFICULTY TYPES
// ============================================================================

export type PatternDifficulty = 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert';

// Numeric difficulty for sorting and comparison (1-5 scale)
export const DIFFICULTY_ORDER: Record<PatternDifficulty, number> = {
  beginner: 1,
  easy: 2,
  intermediate: 3,
  advanced: 4,
  expert: 5,
};

// ============================================================================
// PATTERN TYPES
// ============================================================================

export type PatternType = 'knitting' | 'crochet' | 'machine_knit';

export type PatternCategory =
  | 'sweater'
  | 'cardigan'
  | 'hat'
  | 'scarf'
  | 'shawl'
  | 'socks'
  | 'mittens'
  | 'gloves'
  | 'blanket'
  | 'bag'
  | 'toy'
  | 'home'
  | 'accessory'
  | 'other';

// ============================================================================
// TECHNIQUE TYPES (for pattern library context)
// ============================================================================

export interface PatternTechnique {
  id: string;
  name: string;
  complexity: number; // 0.0 - 1.0
}

// ============================================================================
// MATERIAL TYPES
// ============================================================================

export type YarnWeight =
  | 'lace'
  | 'fingering'
  | 'sport'
  | 'dk'
  | 'worsted'
  | 'aran'
  | 'bulky'
  | 'super_bulky';

export interface PatternMaterials {
  yarnWeight: YarnWeight;
  fiberContent?: string[]; // e.g., ["wool", "acrylic"]
  yardage?: number;
  needleSize?: string; // e.g., "US 7 / 4.5mm"
  hookSize?: string; // For crochet
  notions?: string[]; // e.g., ["cable needle", "stitch markers"]
}

// ============================================================================
// GAUGE TYPES
// ============================================================================

export interface PatternGauge {
  stitchesPerInch: number;
  rowsPerInch: number;
  swatchSize?: string; // e.g., "4x4 inches"
}

// ============================================================================
// SIZING TYPES
// ============================================================================

export interface PatternSizing {
  availableSizes: string[]; // e.g., ["XS", "S", "M", "L", "XL"]
  measurements?: Record<string, string>; // e.g., { "bust": "32-34 inches" }
}

// ============================================================================
// MAIN PATTERN TYPE
// ============================================================================

export interface LibraryPattern {
  id: string;
  title: string;
  description?: string;
  type: PatternType;
  category: PatternCategory;
  difficulty: PatternDifficulty;

  // Visual assets
  imageUrl?: string;
  thumbnailUrl?: string;
  chartImageUrl?: string;
  swatchImages?: string[];

  // Technical details
  techniques: PatternTechnique[];
  materials: PatternMaterials;
  gauge?: PatternGauge;
  sizing?: PatternSizing;

  // Instructions metadata
  instructionFormat?: 'written' | 'charted' | 'both';
  estimatedTime?: string; // e.g., "10-15 hours"

  // Metadata
  source?: string; // Origin (e.g., "MIT CSAIL KnitDB", "Public Domain")
  designer?: string;
  license?: 'public_domain' | 'mit' | 'cc0' | 'cc-by' | 'cc-by-nc';
  tags?: string[];

  // User interaction (for future features)
  isFavorited?: boolean;
  savedAt?: string;

  // Timestamps
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface PatternFilters {
  search?: string;
  type?: PatternType[];
  category?: PatternCategory[];
  difficulty?: PatternDifficulty[];
  yarnWeight?: YarnWeight[];
  techniques?: string[]; // technique IDs
}

// ============================================================================
// SORT TYPES
// ============================================================================

export type PatternSortField = 'title' | 'difficulty' | 'createdAt' | 'category';
export type PatternSortDirection = 'asc' | 'desc';

export interface PatternSort {
  field: PatternSortField;
  direction: PatternSortDirection;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

// For card display - subset of LibraryPattern
export type PatternCardData = Pick<
  LibraryPattern,
  | 'id'
  | 'title'
  | 'type'
  | 'category'
  | 'difficulty'
  | 'thumbnailUrl'
  | 'techniques'
  | 'materials'
  | 'isFavorited'
>;

// Display labels for enum values
export const DIFFICULTY_LABELS: Record<PatternDifficulty, string> = {
  beginner: 'Beginner',
  easy: 'Easy',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export const TYPE_LABELS: Record<PatternType, string> = {
  knitting: 'Knitting',
  crochet: 'Crochet',
  machine_knit: 'Machine Knit',
};

export const CATEGORY_LABELS: Record<PatternCategory, string> = {
  sweater: 'Sweater',
  cardigan: 'Cardigan',
  hat: 'Hat',
  scarf: 'Scarf',
  shawl: 'Shawl',
  socks: 'Socks',
  mittens: 'Mittens',
  gloves: 'Gloves',
  blanket: 'Blanket',
  bag: 'Bag',
  toy: 'Toy',
  home: 'Home Decor',
  accessory: 'Accessory',
  other: 'Other',
};

export const YARN_WEIGHT_LABELS: Record<YarnWeight, string> = {
  lace: 'Lace',
  fingering: 'Fingering',
  sport: 'Sport',
  dk: 'DK',
  worsted: 'Worsted',
  aran: 'Aran',
  bulky: 'Bulky',
  super_bulky: 'Super Bulky',
};
