// src/lib/ai/parsePattern.test.ts
// Unit tests for the pattern parsing client

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateParsedPattern,
  parsedPatternToProjectData,
  type ParsedPattern,
  type ParsedPatternSection,
  type ParsedPatternStep,
} from './parsePattern';

// Mock the supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
      }),
    },
    functions: {
      invoke: vi.fn(),
    },
  })),
}));

describe('validateParsedPattern', () => {
  const createValidPattern = (): ParsedPattern => ({
    projectName: 'Simple Scarf',
    projectType: 'scarf',
    difficulty: 2,
    yarn: 'DK weight wool',
    needles: '5mm / US 8',
    gauge: '18 sts x 24 rows = 4 inches',
    size: '6 inches x 60 inches',
    sections: [],
    steps: [
      {
        label: 'Row 1',
        title: 'Cast On',
        description: 'Cast on 30 stitches. Step 1: Make a slip knot. Step 2: Cast on using long-tail method.',
        techniques: ['long-tail-cast-on'],
        rowCount: 1,
        startRow: 1,
        endRow: 1,
        stitchCount: 30,
      },
    ],
    techniques: ['long-tail-cast-on', 'knit', 'purl'],
    warnings: [],
    confidence: 0.9,
  });

  it('should return no warnings for a valid pattern', () => {
    const pattern = createValidPattern();
    const warnings = validateParsedPattern(pattern);
    expect(warnings).toHaveLength(0);
  });

  it('should warn when project name is missing', () => {
    const pattern = createValidPattern();
    pattern.projectName = '';
    const warnings = validateParsedPattern(pattern);
    expect(warnings).toContain('Could not detect project name');
  });

  it('should warn when yarn is missing', () => {
    const pattern = createValidPattern();
    pattern.yarn = '';
    const warnings = validateParsedPattern(pattern);
    expect(warnings).toContain('Could not detect yarn requirements');
  });

  it('should warn when needles is missing', () => {
    const pattern = createValidPattern();
    pattern.needles = '';
    const warnings = validateParsedPattern(pattern);
    expect(warnings).toContain('Could not detect needle size');
  });

  it('should warn when steps are empty', () => {
    const pattern = createValidPattern();
    pattern.steps = [];
    const warnings = validateParsedPattern(pattern);
    expect(warnings).toContain('No knitting steps were detected');
  });

  it('should warn when confidence is low', () => {
    const pattern = createValidPattern();
    pattern.confidence = 0.5;
    const warnings = validateParsedPattern(pattern);
    expect(warnings).toContain('Low confidence in pattern parsing - please review carefully');
  });

  it('should warn when no techniques detected', () => {
    const pattern = createValidPattern();
    pattern.techniques = [];
    const warnings = validateParsedPattern(pattern);
    expect(warnings).toContain('No known techniques were detected');
  });

  it('should return multiple warnings when multiple issues exist', () => {
    const pattern = createValidPattern();
    pattern.projectName = '';
    pattern.yarn = '';
    pattern.steps = [];
    const warnings = validateParsedPattern(pattern);
    expect(warnings.length).toBeGreaterThanOrEqual(3);
  });
});

describe('parsedPatternToProjectData', () => {
  const createFullPattern = (): ParsedPattern => ({
    projectName: 'Cozy Hat',
    projectType: 'hat',
    difficulty: 3,
    yarn: 'Bulky wool blend',
    needles: '8mm / US 11 circular',
    gauge: '12 sts x 16 rows = 4 inches',
    size: 'Adult Medium (21-23 inch circumference)',
    sections: [
      {
        title: 'Materials',
        content: '100g bulky yarn, 8mm needles',
        type: 'materials' as const,
      },
      {
        title: 'Notes',
        content: 'Work in the round',
        type: 'notes' as const,
      },
      {
        title: 'Abbreviations',
        content: 'K = knit, P = purl',
        type: 'abbreviations' as const,
      },
    ],
    steps: [
      {
        label: 'Cast On',
        title: 'Setup',
        description: 'Cast on 60 stitches',
        techniques: ['long-tail-cast-on'],
        rowCount: 1,
      },
      {
        label: 'Rows 1-10',
        title: 'Ribbing',
        description: 'Work K2 P2 rib',
        techniques: ['rib-2x2'],
        rowCount: 10,
        startRow: 1,
        endRow: 10,
      },
      {
        label: 'Rows 11-30',
        title: 'Body',
        description: 'Knit all rounds',
        techniques: ['stockinette'],
        rowCount: 20,
        startRow: 11,
        endRow: 30,
      },
    ],
    techniques: ['long-tail-cast-on', 'rib-2x2', 'stockinette', 'k2tog'],
    warnings: [],
    confidence: 0.95,
  });

  it('should convert pattern to project data', () => {
    const pattern = createFullPattern();
    const projectData = parsedPatternToProjectData(pattern);

    expect(projectData.name).toBe('Cozy Hat');
    expect(projectData.yarn).toBe('Bulky wool blend');
    expect(projectData.needles).toBe('8mm / US 11 circular');
    expect(projectData.size).toBe('Adult Medium (21-23 inch circumference)');
    expect(projectData.techniques).toEqual(['long-tail-cast-on', 'rib-2x2', 'stockinette', 'k2tog']);
  });

  it('should calculate total rows from steps with rowCount', () => {
    const pattern = createFullPattern();
    const projectData = parsedPatternToProjectData(pattern);

    // 1 + 10 + 20 = 31
    expect(projectData.totalRows).toBe(31);
  });

  it('should calculate total rows from startRow/endRow', () => {
    const pattern: ParsedPattern = {
      ...createFullPattern(),
      steps: [
        {
          label: 'Rows 1-5',
          title: 'Section 1',
          description: 'Work these rows',
          techniques: [],
          startRow: 1,
          endRow: 5,
        },
        {
          label: 'Rows 6-15',
          title: 'Section 2',
          description: 'Work these rows',
          techniques: [],
          startRow: 6,
          endRow: 15,
        },
      ],
    };

    const projectData = parsedPatternToProjectData(pattern);
    // (5-1+1) + (15-6+1) = 5 + 10 = 15
    expect(projectData.totalRows).toBe(15);
  });

  it('should count single steps as 1 row when no count info', () => {
    const pattern: ParsedPattern = {
      ...createFullPattern(),
      steps: [
        {
          label: 'Step 1',
          title: 'Do something',
          description: 'A single step',
          techniques: [],
        },
        {
          label: 'Step 2',
          title: 'Do another thing',
          description: 'Another single step',
          techniques: [],
        },
      ],
    };

    const projectData = parsedPatternToProjectData(pattern);
    expect(projectData.totalRows).toBe(2);
  });

  it('should preserve steps array', () => {
    const pattern = createFullPattern();
    const projectData = parsedPatternToProjectData(pattern);

    expect(projectData.steps).toHaveLength(3);
    expect(projectData.steps[0].label).toBe('Cast On');
    expect(projectData.steps[1].title).toBe('Ribbing');
    expect(projectData.steps[2].techniques).toContain('stockinette');
  });

  it('should build notes from notes and abbreviations sections', () => {
    const pattern = createFullPattern();
    const projectData = parsedPatternToProjectData(pattern);

    expect(projectData.notes).toBeDefined();
    expect(projectData.notes).toContain('Notes');
    expect(projectData.notes).toContain('Work in the round');
    expect(projectData.notes).toContain('Abbreviations');
  });

  it('should handle pattern with no notes sections', () => {
    const pattern: ParsedPattern = {
      ...createFullPattern(),
      sections: [
        {
          title: 'Materials',
          content: 'Yarn and needles',
          type: 'materials' as const,
        },
      ],
    };

    const projectData = parsedPatternToProjectData(pattern);
    expect(projectData.notes).toBeUndefined();
  });

  it('should handle pattern with undefined size', () => {
    const pattern = createFullPattern();
    pattern.size = undefined;
    const projectData = parsedPatternToProjectData(pattern);
    expect(projectData.size).toBeUndefined();
  });
});

describe('ParsedPatternStep type', () => {
  it('should allow all optional fields to be omitted', () => {
    const minimalStep: ParsedPatternStep = {
      label: 'Row 1',
      title: 'Basic Step',
      description: 'Do something',
      techniques: [],
    };

    expect(minimalStep.rowCount).toBeUndefined();
    expect(minimalStep.startRow).toBeUndefined();
    expect(minimalStep.endRow).toBeUndefined();
    expect(minimalStep.stitchCount).toBeUndefined();
  });

  it('should allow all fields to be specified', () => {
    const fullStep: ParsedPatternStep = {
      label: 'Rows 1-10',
      title: 'Ribbing',
      description: 'K2 P2 across',
      techniques: ['rib-2x2', 'knit', 'purl'],
      rowCount: 10,
      startRow: 1,
      endRow: 10,
      stitchCount: 80,
    };

    expect(fullStep.rowCount).toBe(10);
    expect(fullStep.startRow).toBe(1);
    expect(fullStep.endRow).toBe(10);
    expect(fullStep.stitchCount).toBe(80);
  });
});

describe('ParsedPatternSection type', () => {
  it('should support all section types', () => {
    const types = ['materials', 'gauge', 'abbreviations', 'instructions', 'notes', 'other'] as const;

    for (const type of types) {
      const section: ParsedPatternSection = {
        title: `${type} section`,
        content: 'Content here',
        type,
      };
      expect(section.type).toBe(type);
    }
  });
});

describe('Difficulty levels', () => {
  it('should support difficulty levels 1-5', () => {
    const createPatternWithDifficulty = (difficulty: 1 | 2 | 3 | 4 | 5): ParsedPattern => ({
      projectName: 'Test',
      projectType: 'scarf',
      difficulty,
      yarn: 'Yarn',
      needles: '5mm',
      sections: [],
      steps: [{ label: '1', title: 'T', description: 'D', techniques: [] }],
      techniques: [],
      warnings: [],
      confidence: 1,
    });

    expect(createPatternWithDifficulty(1).difficulty).toBe(1);
    expect(createPatternWithDifficulty(2).difficulty).toBe(2);
    expect(createPatternWithDifficulty(3).difficulty).toBe(3);
    expect(createPatternWithDifficulty(4).difficulty).toBe(4);
    expect(createPatternWithDifficulty(5).difficulty).toBe(5);
  });
});
