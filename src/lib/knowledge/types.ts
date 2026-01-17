// src/lib/knowledge/types.ts
// Knowledge system type definitions (ported from purl-app)

// ============================================================================
// DIFFICULTY & YARN WEIGHTS
// ============================================================================

export enum DifficultyLevel {
  BEGINNER = 1,
  EASY = 2,
  INTERMEDIATE = 3,
  ADVANCED = 4,
  EXPERT = 5,
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.BEGINNER]: 'Beginner',
  [DifficultyLevel.EASY]: 'Easy',
  [DifficultyLevel.INTERMEDIATE]: 'Intermediate',
  [DifficultyLevel.ADVANCED]: 'Advanced',
  [DifficultyLevel.EXPERT]: 'Expert',
};

export enum YarnWeight {
  LACE = 0,
  SUPER_FINE = 1, // Fingering, sock
  FINE = 2, // Sport
  LIGHT = 3, // DK, light worsted
  MEDIUM = 4, // Worsted, aran
  BULKY = 5, // Chunky
  SUPER_BULKY = 6, // Roving
  JUMBO = 7,
}

export const YARN_WEIGHT_LABELS: Record<YarnWeight, string[]> = {
  [YarnWeight.LACE]: ['lace', 'cobweb', 'thread'],
  [YarnWeight.SUPER_FINE]: ['fingering', 'sock', 'baby', 'super fine'],
  [YarnWeight.FINE]: ['sport', 'baby', 'fine'],
  [YarnWeight.LIGHT]: ['dk', 'light worsted', 'light'],
  [YarnWeight.MEDIUM]: ['worsted', 'aran', 'medium', 'afghan'],
  [YarnWeight.BULKY]: ['bulky', 'chunky', 'craft', 'rug'],
  [YarnWeight.SUPER_BULKY]: ['super bulky', 'roving', 'super chunky'],
  [YarnWeight.JUMBO]: ['jumbo', 'roving'],
};

export type GarmentCategory =
  | 'sweater'
  | 'cardigan'
  | 'vest'
  | 'top'
  | 'dress'
  | 'socks'
  | 'hat'
  | 'cowl'
  | 'scarf'
  | 'shawl'
  | 'mittens'
  | 'gloves'
  | 'blanket'
  | 'bag'
  | 'toy'
  | 'pet'
  | 'home'
  | 'other';

// ============================================================================
// TECHNIQUE CATEGORIES
// ============================================================================

export type TechniqueCategory =
  | 'cast-on'
  | 'bind-off'
  | 'basic-stitches'
  | 'increases'
  | 'decreases'
  | 'short-rows'
  | 'cables'
  | 'colorwork'
  | 'lace'
  | 'texture'
  | 'construction'
  | 'finishing'
  | 'fixing-mistakes'
  | 'edges'
  | 'shaping';

export const TECHNIQUE_CATEGORY_LABELS: Record<TechniqueCategory, string> = {
  'cast-on': 'Cast On Methods',
  'bind-off': 'Bind Off Methods',
  'basic-stitches': 'Basic Stitches',
  increases: 'Increases',
  decreases: 'Decreases',
  'short-rows': 'Short Rows',
  cables: 'Cables',
  colorwork: 'Colorwork',
  lace: 'Lace',
  texture: 'Texture Patterns',
  construction: 'Construction',
  finishing: 'Finishing',
  'fixing-mistakes': 'Fixing Mistakes',
  edges: 'Edges & Borders',
  shaping: 'Shaping',
};

// ============================================================================
// TECHNIQUE INTERFACES
// ============================================================================

export interface Technique {
  id: string;
  name: string;
  slug: string;

  // Classification
  category: TechniqueCategory;
  subcategory?: string;
  difficulty: DifficultyLevel;

  // Content
  description: string;
  purpose: string; // Why/when to use this technique
  instructions: TechniqueStep[];
  tips: string[];
  commonMistakes: TechniqueMistake[];

  // Variations
  variations?: TechniqueVariation[];

  // Learning resources
  videoUrl?: string;
  images?: TechniqueImage[];

  // Relationships
  prerequisites: string[]; // Technique IDs you should know first
  relatedTechniques: string[]; // Similar or complementary techniques
  alternativeTo?: string[]; // Techniques this can replace

  // For AI parsing recognition
  aliases: string[]; // Different names: ["SSK", "slip slip knit"]
  abbreviations: string[]; // Pattern abbreviations: ["ssk", "Ssk"]
  patternPhrases: string[]; // How it appears: ["slip 2 sts knitwise, knit together"]

  // Usage data
  usedInPatternTypes?: string[]; // ["socks", "sweaters"]
  frequency: 'very-common' | 'common' | 'occasional' | 'rare';

  // App metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface TechniqueStep {
  order: number;
  instruction: string;
  imageUrl?: string;
  tip?: string;
}

export interface TechniqueMistake {
  description: string;
  howToAvoid: string;
  howToFix?: string;
}

export interface TechniqueVariation {
  id: string;
  name: string;
  description: string;
  whenToUse: string;
  instructions?: TechniqueStep[];
}

export interface TechniqueImage {
  url: string;
  alt: string;
  caption?: string;
  step?: number; // Which step this illustrates
}

// ============================================================================
// ABBREVIATION INTERFACES
// ============================================================================

export interface KnittingAbbreviation {
  abbreviation: string;
  expansion: string;
  techniqueId?: string;
  category?: string;
}

export interface AbbreviationEntry {
  abbreviation: string;
  variations: string[]; // Case variations, alternate spellings
  fullName: string;
  definition: string;
  techniqueId?: string; // Link to technique if applicable
  category?: TechniqueCategory;
  isStandard: boolean; // Part of standard abbreviation set
}

// ============================================================================
// KNOWLEDGE GRAPH TYPES
// ============================================================================

export type NodeType =
  | 'pattern'
  | 'technique'
  | 'skill'
  | 'garment_type'
  | 'yarn_weight'
  | 'construction_method'
  | 'designer';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, unknown>;
}

export type EdgeType =
  // Pattern relationships
  | 'uses_technique'
  | 'requires_skill'
  | 'is_garment_type'
  | 'uses_yarn_weight'
  | 'uses_construction'
  | 'designed_by'
  | 'similar_to'
  // Technique relationships
  | 'prerequisite_for'
  | 'variation_of'
  | 'alternative_to'
  | 'in_category'
  // Skill relationships
  | 'teaches_technique'
  | 'builds_on'
  // User relationships
  | 'user_knows'
  | 'user_completed'
  | 'user_wants_to_learn';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight?: number;
  properties?: Record<string, unknown>;
}

export interface KnowledgeGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  edgesBySource: Map<string, GraphEdge[]>;
  edgesByTarget: Map<string, GraphEdge[]>;
  edgesByType: Map<EdgeType, GraphEdge[]>;
}

export interface SerializedKnowledgeGraph {
  nodes: Array<{ id: string; node: GraphNode }>;
  edges: GraphEdge[];
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface TechniqueProficiency {
  techniqueId: string;
  level: 'learning' | 'practiced' | 'comfortable' | 'mastered';
  timesUsed: number;
  lastUsed?: string;
  notes?: string;
}

export interface UserSkillProfile {
  userId: string;
  knownTechniques: Map<string, TechniqueProficiency>;
  completedPatterns: string[];
  inProgressPatterns: string[];
  learningGoals: string[];
  overallLevel: DifficultyLevel;
  categoryProficiency: Map<TechniqueCategory, number>;
}

export interface PatternRecommendation {
  patternId: string;
  score: number;
  reasons: string[];
  newTechniques: string[];
  missingPrerequisites: string[];
  difficulty: DifficultyLevel;
}

export interface TechniqueRecommendation {
  techniqueId: string;
  score: number;
  reasons: string[];
  prerequisitesMet: boolean;
  relatedPatterns: string[];
  unlocks?: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDifficultyLabel(level: DifficultyLevel): string {
  return DIFFICULTY_LABELS[level];
}

export function getYarnWeightLabel(weight: YarnWeight): string {
  return YARN_WEIGHT_LABELS[weight][0];
}

export function getCategoryLabel(category: TechniqueCategory): string {
  return TECHNIQUE_CATEGORY_LABELS[category];
}
