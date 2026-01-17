// src/lib/ai/generateSteps.ts
// Client for the generate-steps Edge Function
import { createClient } from '@/lib/supabase/client';

export interface ProjectInfo {
  projectType: 'scarf' | 'hat' | 'mittens' | 'socks' | 'blanket' | 'sweater' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  yarn: string;
  needles: string;
  size?: string;
  notes?: string;
  customInstructions?: string;
}

export interface GeneratedStep {
  label: string;
  title: string;
  description: string;
  techniques: string[];
  type: 'single' | 'group' | 'repeat';
  rowCount?: number;
  startRow?: number;
  endRow?: number;
  stitchCount?: number;
  repeatCount?: number;
  repeatPattern?: string[];
  milestone?: boolean;
}

export interface GenerateStepsResult {
  steps: GeneratedStep[];
  techniques: string[];
  totalRows: number;
  estimatedTime: string;
  tips: string[];
}

export async function generateSteps(projectInfo: ProjectInfo): Promise<GenerateStepsResult> {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to generate steps');
  }

  const response = await supabase.functions.invoke('generate-steps', {
    body: {
      projectType: projectInfo.projectType,
      difficulty: projectInfo.difficulty,
      yarn: projectInfo.yarn,
      needles: projectInfo.needles,
      size: projectInfo.size,
      notes: projectInfo.notes,
      customInstructions: projectInfo.customInstructions,
    },
  });

  if (response.error) {
    throw new Error(`Step generation failed: ${response.error.message}`);
  }

  return response.data as GenerateStepsResult;
}

// Project type labels for display
export const PROJECT_TYPES: Record<ProjectInfo['projectType'], {
  label: string;
  icon: string;
  description: string;
}> = {
  scarf: {
    label: 'Scarf',
    icon: '🧣',
    description: 'A cozy scarf for any skill level',
  },
  hat: {
    label: 'Hat',
    icon: '🎩',
    description: 'Warm beanie or cap',
  },
  mittens: {
    label: 'Mittens',
    icon: '🧤',
    description: 'Cozy hand warmers',
  },
  socks: {
    label: 'Socks',
    icon: '🧦',
    description: 'Comfortable knitted socks',
  },
  blanket: {
    label: 'Blanket',
    icon: '🛋️',
    description: 'Throw or baby blanket',
  },
  sweater: {
    label: 'Sweater',
    icon: '🧥',
    description: 'Pullover or cardigan',
  },
  other: {
    label: 'Other',
    icon: '✨',
    description: 'Custom project type',
  },
};

// Difficulty labels
export const DIFFICULTY_LABELS: Record<number, {
  label: string;
  description: string;
}> = {
  1: { label: 'Beginner', description: 'Basic stitches only' },
  2: { label: 'Easy', description: 'Simple shaping' },
  3: { label: 'Intermediate', description: 'Multiple techniques' },
  4: { label: 'Advanced', description: 'Complex patterns' },
  5: { label: 'Expert', description: 'Professional level' },
};
