// src/lib/ai/parsePattern.ts
// Client for the parse-pattern Edge Function
import { createClient } from '@/lib/supabase/client';

export interface ParsedPatternSection {
  title: string;
  content: string;
  type: 'materials' | 'gauge' | 'abbreviations' | 'instructions' | 'notes' | 'other';
}

export interface ParsedPatternStep {
  label: string;
  title: string;
  description: string;
  techniques: string[];
  rowCount?: number;
  startRow?: number;
  endRow?: number;
  stitchCount?: number;
}

export interface ParsedPattern {
  projectName: string;
  projectType: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  yarn: string;
  needles: string;
  gauge?: string;
  size?: string;
  sections: ParsedPatternSection[];
  steps: ParsedPatternStep[];
  techniques: string[];
  warnings: string[];
  confidence: number;
}

export interface ParsePatternRequest {
  fileUrl?: string;
  base64Data?: string;
  mimeType: string;
  fileName: string;
}

export async function parsePattern(request: ParsePatternRequest): Promise<ParsedPattern> {
  const supabase = createClient();

  // Get the current session for the auth token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to parse patterns');
  }

  const response = await supabase.functions.invoke('parse-pattern', {
    body: {
      fileUrl: request.fileUrl,
      base64Data: request.base64Data,
      mimeType: request.mimeType,
      fileName: request.fileName,
    },
  });

  if (response.error) {
    throw new Error(`Pattern parsing failed: ${response.error.message}`);
  }

  return response.data as ParsedPattern;
}

// Validate parsed pattern
export function validateParsedPattern(pattern: ParsedPattern): string[] {
  const warnings: string[] = [];

  if (!pattern.projectName) {
    warnings.push('Could not detect project name');
  }

  if (!pattern.yarn) {
    warnings.push('Could not detect yarn requirements');
  }

  if (!pattern.needles) {
    warnings.push('Could not detect needle size');
  }

  if (pattern.steps.length === 0) {
    warnings.push('No knitting steps were detected');
  }

  if (pattern.confidence < 0.7) {
    warnings.push('Low confidence in pattern parsing - please review carefully');
  }

  if (pattern.techniques.length === 0) {
    warnings.push('No known techniques were detected');
  }

  return warnings;
}

// Convert parsed pattern to project creation format
export function parsedPatternToProjectData(
  pattern: ParsedPattern
): {
  name: string;
  yarn: string;
  needles: string;
  size?: string;
  notes?: string;
  techniques: string[];
  steps: Array<{
    label: string;
    title: string;
    description: string;
    techniques: string[];
    rowCount?: number;
    startRow?: number;
    endRow?: number;
    stitchCount?: number;
  }>;
  totalRows: number;
} {
  // Calculate total rows from steps
  let totalRows = 0;
  pattern.steps.forEach(step => {
    if (step.rowCount) {
      totalRows += step.rowCount;
    } else if (step.startRow && step.endRow) {
      totalRows += step.endRow - step.startRow + 1;
    } else {
      totalRows += 1;
    }
  });

  // Build notes from sections
  const notesSections = pattern.sections
    .filter(s => s.type === 'notes' || s.type === 'abbreviations')
    .map(s => `${s.title}:\n${s.content}`)
    .join('\n\n');

  return {
    name: pattern.projectName,
    yarn: pattern.yarn,
    needles: pattern.needles,
    size: pattern.size,
    notes: notesSections || undefined,
    techniques: pattern.techniques,
    steps: pattern.steps,
    totalRows,
  };
}
