// src/lib/ai/sosAssist.ts
// Client for the sos-assist Edge Function
import { createClient } from '@/lib/supabase/client';

export interface SOSRequest {
  problemDescription: string;
  imageBase64?: string;
  imageMimeType?: string;
  currentStep?: {
    title: string;
    description: string;
    techniques: string[];
  };
  projectContext?: {
    projectName: string;
    yarn: string;
    needles: string;
  };
}

export interface SOSResponse {
  diagnosis: string;
  severity: 'minor' | 'moderate' | 'major';
  fixSteps: string[];
  prevention: string;
  relatedTechniques: string[];
  additionalTips?: string[];
  needsExpertHelp: boolean;
}

export async function getSOSHelp(request: SOSRequest): Promise<SOSResponse> {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to get SOS help');
  }

  const response = await supabase.functions.invoke('sos-assist', {
    body: {
      problemDescription: request.problemDescription,
      imageBase64: request.imageBase64,
      imageMimeType: request.imageMimeType,
      currentStep: request.currentStep,
      projectContext: request.projectContext,
    },
  });

  if (response.error) {
    throw new Error(`SOS assistance failed: ${response.error.message}`);
  }

  return response.data as SOSResponse;
}

// Common problem types for quick selection
export const COMMON_PROBLEMS = [
  {
    id: 'dropped-stitch',
    label: 'Dropped Stitch',
    icon: '🕳️',
    description: 'A stitch has fallen off the needle',
  },
  {
    id: 'wrong-count',
    label: 'Wrong Stitch Count',
    icon: '🔢',
    description: 'I have too many or too few stitches',
  },
  {
    id: 'tension-issue',
    label: 'Tension Problems',
    icon: '↔️',
    description: 'My knitting is too tight or too loose',
  },
  {
    id: 'twisted-stitch',
    label: 'Twisted Stitches',
    icon: '🔄',
    description: 'My stitches look twisted or wrong',
  },
  {
    id: 'lost-place',
    label: 'Lost My Place',
    icon: '❓',
    description: "I don't know where I am in the pattern",
  },
  {
    id: 'yarn-issue',
    label: 'Yarn Problem',
    icon: '🧶',
    description: 'Tangled, split, or knotted yarn',
  },
  {
    id: 'uneven-edges',
    label: 'Uneven Edges',
    icon: '📐',
    description: 'My edges look messy or uneven',
  },
  {
    id: 'other',
    label: 'Something Else',
    icon: '💭',
    description: 'Describe your specific issue',
  },
];

// Severity colors for display
export const SEVERITY_CONFIG = {
  minor: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Easy Fix',
    description: 'Can be fixed quickly',
  },
  moderate: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Moderate',
    description: 'Requires some work to fix',
  },
  major: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Major Issue',
    description: 'May need to undo significant work',
  },
};
