// src/types/technique.ts
// Web app types for techniques and learning features

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export type TechniqueCategory =
  | 'foundations'      // Pre-knitting basics: yarn, needles, holding, tension
  | 'cast-on'          // Starting techniques: slip knot, long-tail, etc.
  | 'basic'            // Core stitches: knit, purl
  | 'bind-off'         // Finishing the work
  | 'patterns'         // Stitch patterns: garter, stockinette, ribbing
  | 'increase'         // Adding stitches: KFB, M1L, M1R, YO
  | 'decrease'         // Removing stitches: K2tog, SSK, P2tog
  | 'sos'              // Problem solving: dropped stitch, twisted, frogging
  | 'finishing'        // Completing projects: weaving ends, blocking, seaming
  | 'reading-patterns' // Understanding pattern instructions and terminology
  | 'texture'          // Legacy category
  | 'special';         // Legacy category

// Category metadata for display
export interface CategoryInfo {
  id: TechniqueCategory;
  name: string;
  description: string;
  icon: string;         // Lucide icon name
  color: string;
}

// ============================================================================
// LEARNING CONTENT TYPES
// ============================================================================

// Enhanced step with individual illustration for step-through tutorials
export interface TechniqueStep {
  stepNumber: number;
  title: string;
  instruction: string;
  imageUrl?: string;
  animationUrl?: string;
  detailedTip?: string;
}

// Quiz question for technique comprehension checks
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  imageUrl?: string;
}

// Curated video from YouTube
export interface CuratedVideo {
  platform: 'youtube';
  videoId: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  creatorName: string;
  duration: number;       // seconds
  recommendedStart: number;
  recommendedEnd?: number;
  aiScore: number;        // 1-10
  evaluatedAt: string;
}

// Fallback content when video is unavailable
export interface TechniqueFallback {
  staticImageUrl: string;
  stepByStepText: string[];
}

// Supplementary learning resource
export interface ResourceLink {
  title: string;
  url: string;
  source: string;         // e.g., "Sheep & Stitch", "Nimble Needles"
  type: 'guide' | 'pattern' | 'video' | 'tool';
}

// Collection of supplementary resources for a technique
export interface TechniqueResources {
  guides: ResourceLink[];
  patterns?: ResourceLink[];
  videos?: ResourceLink[];
}

// ============================================================================
// MAIN TECHNIQUE TYPE
// ============================================================================

export interface Technique {
  id: string;
  name: string;                    // "Knit Stitch"
  abbreviation: string | null;     // "K"
  category: TechniqueCategory;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;

  // Legacy steps (simple text array)
  steps: string[];

  // Enhanced tutorial steps with individual illustrations
  tutorialSteps?: TechniqueStep[];

  // Quiz questions for this technique
  quiz?: QuizQuestion[];

  // Tips and common mistakes
  tips: string[];
  commonMistakes: string[];

  // Video content
  video: CuratedVideo;

  // Related techniques for discovery
  relatedTechniques: string[];

  // Fallback content
  fallback: TechniqueFallback;

  // Prerequisites (technique IDs that should be learned first)
  prerequisites?: string[];

  // Tags for filtering and organization
  tags?: string[];

  // Supplementary learning resources
  resources?: TechniqueResources;

  // Alternative names and abbreviations for pattern matching
  aliases?: string[];
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export type ProgressStatus = 'not_started' | 'practicing' | 'confident';

export interface TechniqueProgress {
  status: ProgressStatus;
  completedSteps: number[];
  quizScore?: number;
  quizAttempts: number;
  lastPracticed?: string;  // ISO date
  practiceCount: number;
}

// Default progress for new techniques
export const defaultTechniqueProgress: TechniqueProgress = {
  status: 'not_started',
  completedSteps: [],
  quizAttempts: 0,
  practiceCount: 0,
};

// ============================================================================
// DATABASE TYPES (for Supabase)
// ============================================================================

export interface TechniqueRow {
  id: string;
  name: string;
  abbreviation?: string;
  category: TechniqueCategory;
  description: string;
  difficulty: number;
  steps: string[];
  tips: string[];
  common_mistakes: string[];
  related_techniques: string[];
  prerequisites?: string[];
  tags?: string[];
  aliases?: string[];
}

export interface TechniqueProgressRow {
  id: string;
  user_id: string;
  technique_id: string;
  status: ProgressStatus;
  completed_steps: number[];
  quiz_score?: number;
  quiz_attempts: number;
  last_practiced?: string;
  practice_count: number;
}

export interface TechniqueStepRow {
  id: string;
  technique_id: string;
  step_number: number;
  title: string;
  instruction: string;
  image_url?: string;
  animation_url?: string;
  detailed_tip?: string;
}

export interface QuizQuestionRow {
  id: string;
  technique_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  image_url?: string;
}

export interface CuratedVideoRow {
  id: string;
  technique_id: string;
  platform: string;
  video_id: string;
  url: string;
  thumbnail_url: string;
  title: string;
  creator_name: string;
  duration: number;
  recommended_start: number;
  recommended_end?: number;
  ai_score: number;
  evaluated_at: string;
}
