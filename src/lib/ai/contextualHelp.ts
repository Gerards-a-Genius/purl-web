// src/lib/ai/contextualHelp.ts
// Client for the contextual-help Edge Function
import { createClient } from '@/lib/supabase/client';

export interface ContextualHelpRequest {
  techniqueId: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  context?: {
    projectType?: string;
    currentStep?: string;
    specificQuestion?: string;
  };
}

export interface ContextualHelpResponse {
  techniqueName: string;
  explanation: string;
  whyItMatters: string;
  stepByStep: string[];
  tips: string[];
  commonMistakes: string[];
  videoTimestamp?: {
    start: number;
    end: number;
    description: string;
  };
  relatedTechniques: string[];
}

export async function getContextualHelp(
  request: ContextualHelpRequest
): Promise<ContextualHelpResponse> {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to get help');
  }

  const response = await supabase.functions.invoke('contextual-help', {
    body: {
      techniqueId: request.techniqueId,
      skillLevel: request.skillLevel,
      context: request.context,
    },
  });

  if (response.error) {
    throw new Error(`Contextual help failed: ${response.error.message}`);
  }

  return response.data as ContextualHelpResponse;
}

// Skill level descriptions
export const SKILL_LEVELS = {
  beginner: {
    label: 'Beginner',
    description: 'New to knitting, learning basics',
    icon: '🌱',
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Comfortable with basic techniques',
    icon: '🌿',
  },
  advanced: {
    label: 'Advanced',
    description: 'Experienced with complex patterns',
    icon: '🌳',
  },
};
