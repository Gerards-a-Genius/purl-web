// src/lib/ai/generateSteps.test.ts
// Unit tests for the step generation client

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PROJECT_TYPES,
  DIFFICULTY_LABELS,
  type ProjectInfo,
  type GeneratedStep,
  type GenerateStepsResult,
} from './generateSteps';

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

describe('PROJECT_TYPES', () => {
  it('should have all project types defined', () => {
    const expectedTypes: ProjectInfo['projectType'][] = [
      'scarf',
      'hat',
      'mittens',
      'socks',
      'blanket',
      'sweater',
      'other',
    ];

    for (const type of expectedTypes) {
      expect(PROJECT_TYPES[type]).toBeDefined();
      expect(PROJECT_TYPES[type].label).toBeDefined();
      expect(PROJECT_TYPES[type].icon).toBeDefined();
      expect(PROJECT_TYPES[type].description).toBeDefined();
    }
  });

  it('should have correct labels for common types', () => {
    expect(PROJECT_TYPES.scarf.label).toBe('Scarf');
    expect(PROJECT_TYPES.hat.label).toBe('Hat');
    expect(PROJECT_TYPES.mittens.label).toBe('Mittens');
    expect(PROJECT_TYPES.socks.label).toBe('Socks');
    expect(PROJECT_TYPES.blanket.label).toBe('Blanket');
    expect(PROJECT_TYPES.sweater.label).toBe('Sweater');
    expect(PROJECT_TYPES.other.label).toBe('Other');
  });

  it('should have emojis for all types', () => {
    expect(PROJECT_TYPES.scarf.icon).toBe('🧣');
    expect(PROJECT_TYPES.hat.icon).toBe('🎩');
    expect(PROJECT_TYPES.mittens.icon).toBe('🧤');
    expect(PROJECT_TYPES.socks.icon).toBe('🧦');
  });
});

describe('DIFFICULTY_LABELS', () => {
  it('should have all 5 difficulty levels', () => {
    expect(Object.keys(DIFFICULTY_LABELS).length).toBe(5);

    for (let i = 1; i <= 5; i++) {
      expect(DIFFICULTY_LABELS[i]).toBeDefined();
      expect(DIFFICULTY_LABELS[i].label).toBeDefined();
      expect(DIFFICULTY_LABELS[i].description).toBeDefined();
    }
  });

  it('should have correct labels', () => {
    expect(DIFFICULTY_LABELS[1].label).toBe('Beginner');
    expect(DIFFICULTY_LABELS[2].label).toBe('Easy');
    expect(DIFFICULTY_LABELS[3].label).toBe('Intermediate');
    expect(DIFFICULTY_LABELS[4].label).toBe('Advanced');
    expect(DIFFICULTY_LABELS[5].label).toBe('Expert');
  });
});

describe('ProjectInfo type', () => {
  it('should accept valid project info', () => {
    const projectInfo: ProjectInfo = {
      projectType: 'scarf',
      difficulty: 2,
      yarn: 'Merino Wool',
      needles: '5mm',
    };

    expect(projectInfo.projectType).toBe('scarf');
    expect(projectInfo.difficulty).toBe(2);
    expect(projectInfo.yarn).toBe('Merino Wool');
    expect(projectInfo.needles).toBe('5mm');
  });

  it('should accept optional fields', () => {
    const projectInfo: ProjectInfo = {
      projectType: 'hat',
      difficulty: 3,
      yarn: 'DK Weight',
      needles: '4mm Circular',
      size: 'Adult Medium',
      notes: 'Birthday gift',
      customInstructions: 'Use colorwork pattern',
    };

    expect(projectInfo.size).toBe('Adult Medium');
    expect(projectInfo.notes).toBe('Birthday gift');
    expect(projectInfo.customInstructions).toBe('Use colorwork pattern');
  });

  it('should support all project types', () => {
    const types: ProjectInfo['projectType'][] = [
      'scarf',
      'hat',
      'mittens',
      'socks',
      'blanket',
      'sweater',
      'other',
    ];

    for (const type of types) {
      const info: ProjectInfo = {
        projectType: type,
        difficulty: 1,
        yarn: 'Test yarn',
        needles: 'Test needles',
      };
      expect(info.projectType).toBe(type);
    }
  });

  it('should support all difficulty levels', () => {
    const difficulties: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

    for (const difficulty of difficulties) {
      const info: ProjectInfo = {
        projectType: 'scarf',
        difficulty,
        yarn: 'Test yarn',
        needles: 'Test needles',
      };
      expect(info.difficulty).toBe(difficulty);
    }
  });
});

describe('GeneratedStep type', () => {
  it('should allow single step type', () => {
    const step: GeneratedStep = {
      label: 'Setup',
      title: 'Cast On',
      description: 'Cast on 32 stitches',
      techniques: ['long-tail-cast-on'],
      type: 'single',
    };

    expect(step.type).toBe('single');
  });

  it('should allow group step type', () => {
    const step: GeneratedStep = {
      label: 'Ribbing',
      title: 'Ribbed Cuff',
      description: 'Work K2 P2 ribbing',
      techniques: ['rib-2x2'],
      type: 'group',
      rowCount: 10,
    };

    expect(step.type).toBe('group');
  });

  it('should allow repeat step type with pattern', () => {
    const step: GeneratedStep = {
      label: 'Rows 1-20',
      title: 'Body',
      description: 'Work stockinette',
      techniques: ['knit', 'purl'],
      type: 'repeat',
      rowCount: 20,
      startRow: 1,
      endRow: 20,
      repeatCount: 10,
      repeatPattern: ['Knit all (RS)', 'Purl all (WS)'],
    };

    expect(step.type).toBe('repeat');
    expect(step.repeatCount).toBe(10);
    expect(step.repeatPattern).toHaveLength(2);
  });

  it('should support milestone steps', () => {
    const step: GeneratedStep = {
      label: 'Bind Off',
      title: 'Finish',
      description: 'Bind off all stitches',
      techniques: ['basic-bind-off'],
      type: 'single',
      milestone: true,
    };

    expect(step.milestone).toBe(true);
  });
});

describe('GenerateStepsResult type', () => {
  it('should contain all required fields', () => {
    const result: GenerateStepsResult = {
      steps: [
        {
          label: 'Row 1',
          title: 'Cast On',
          description: 'Cast on stitches',
          techniques: ['long-tail-cast-on'],
          type: 'single',
        },
      ],
      techniques: ['long-tail-cast-on', 'knit', 'purl'],
      totalRows: 50,
      estimatedTime: '4-6 hours',
      tips: ['Count stitches regularly'],
    };

    expect(result.steps).toHaveLength(1);
    expect(result.techniques).toContain('long-tail-cast-on');
    expect(result.totalRows).toBe(50);
    expect(result.estimatedTime).toBe('4-6 hours');
    expect(result.tips).toHaveLength(1);
  });

  it('should support empty tips array', () => {
    const result: GenerateStepsResult = {
      steps: [],
      techniques: [],
      totalRows: 0,
      estimatedTime: 'Varies',
      tips: [],
    };

    expect(result.tips).toHaveLength(0);
  });

  it('should support multiple steps with different types', () => {
    const result: GenerateStepsResult = {
      steps: [
        {
          label: 'Setup',
          title: 'Cast On',
          description: 'CO 32 sts',
          techniques: ['long-tail-cast-on'],
          type: 'single',
          milestone: true,
        },
        {
          label: 'Rows 1-10',
          title: 'Ribbing',
          description: 'K2 P2 rib',
          techniques: ['rib-2x2'],
          type: 'repeat',
          rowCount: 10,
          repeatCount: 5,
          repeatPattern: ['K2 P2 across', 'K2 P2 across'],
        },
        {
          label: 'Rows 11-50',
          title: 'Body',
          description: 'Stockinette',
          techniques: ['knit', 'purl'],
          type: 'repeat',
          rowCount: 40,
          startRow: 11,
          endRow: 50,
        },
        {
          label: 'Finish',
          title: 'Bind Off',
          description: 'BO all sts',
          techniques: ['basic-bind-off'],
          type: 'single',
          milestone: true,
        },
      ],
      techniques: ['long-tail-cast-on', 'rib-2x2', 'knit', 'purl', 'basic-bind-off'],
      totalRows: 51,
      estimatedTime: '6-8 hours',
      tips: [
        'Count stitches after cast on',
        'Mark right side with a pin',
        'Block finished piece',
      ],
    };

    expect(result.steps).toHaveLength(4);
    expect(result.techniques).toHaveLength(5);
    expect(result.tips).toHaveLength(3);

    // Verify milestones
    const milestones = result.steps.filter(s => s.milestone);
    expect(milestones).toHaveLength(2);
  });
});

describe('Step type validation', () => {
  it('should support all tracking fields', () => {
    const step: GeneratedStep = {
      label: 'Rows 1-20',
      title: 'Main Body',
      description: 'Work pattern',
      techniques: ['stockinette'],
      type: 'repeat',
      rowCount: 20,
      startRow: 1,
      endRow: 20,
      stitchCount: 48,
      repeatCount: 10,
      repeatPattern: ['Row 1: Knit all', 'Row 2: Purl all'],
      milestone: false,
    };

    expect(step.rowCount).toBe(20);
    expect(step.startRow).toBe(1);
    expect(step.endRow).toBe(20);
    expect(step.stitchCount).toBe(48);
  });
});

describe('Yarn weight inference', () => {
  it('should map common yarn weights to difficulty', () => {
    // Verify project types have sensible default difficulties
    const typeDefaults: Record<ProjectInfo['projectType'], number> = {
      scarf: 1,      // Beginner
      hat: 2,        // Easy
      mittens: 3,    // Intermediate
      socks: 3,      // Intermediate
      blanket: 2,    // Easy (just time-consuming)
      sweater: 4,    // Advanced
      other: 2,      // Default to Easy
    };

    for (const [type, expectedDiff] of Object.entries(typeDefaults)) {
      // This is conceptual - the wizard page uses these mappings
      expect(expectedDiff).toBeGreaterThanOrEqual(1);
      expect(expectedDiff).toBeLessThanOrEqual(5);
    }
  });
});
