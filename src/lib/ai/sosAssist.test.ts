// src/lib/ai/sosAssist.test.ts
// Unit tests for the SOS assistant client

import { describe, it, expect, vi } from 'vitest';
import {
  COMMON_PROBLEMS,
  SEVERITY_CONFIG,
  type SOSRequest,
  type SOSResponse,
} from './sosAssist';

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

describe('COMMON_PROBLEMS', () => {
  it('should have all common problems defined', () => {
    expect(COMMON_PROBLEMS.length).toBeGreaterThan(5);
  });

  it('should have required fields for each problem', () => {
    for (const problem of COMMON_PROBLEMS) {
      expect(problem.id).toBeDefined();
      expect(problem.label).toBeDefined();
      expect(problem.icon).toBeDefined();
      expect(problem.description).toBeDefined();
    }
  });

  it('should include dropped stitch', () => {
    const droppedStitch = COMMON_PROBLEMS.find(p => p.id === 'dropped-stitch');
    expect(droppedStitch).toBeDefined();
    expect(droppedStitch?.label).toBe('Dropped Stitch');
  });

  it('should include wrong stitch count', () => {
    const wrongCount = COMMON_PROBLEMS.find(p => p.id === 'wrong-count');
    expect(wrongCount).toBeDefined();
    expect(wrongCount?.label).toBe('Wrong Stitch Count');
  });

  it('should include tension issues', () => {
    const tension = COMMON_PROBLEMS.find(p => p.id === 'tension-issue');
    expect(tension).toBeDefined();
    expect(tension?.label).toBe('Tension Problems');
  });

  it('should include twisted stitches', () => {
    const twisted = COMMON_PROBLEMS.find(p => p.id === 'twisted-stitch');
    expect(twisted).toBeDefined();
    expect(twisted?.label).toBe('Twisted Stitches');
  });

  it('should include lost place', () => {
    const lost = COMMON_PROBLEMS.find(p => p.id === 'lost-place');
    expect(lost).toBeDefined();
    expect(lost?.label).toBe('Lost My Place');
  });

  it('should include yarn issue', () => {
    const yarn = COMMON_PROBLEMS.find(p => p.id === 'yarn-issue');
    expect(yarn).toBeDefined();
    expect(yarn?.label).toBe('Yarn Problem');
  });

  it('should include uneven edges', () => {
    const edges = COMMON_PROBLEMS.find(p => p.id === 'uneven-edges');
    expect(edges).toBeDefined();
    expect(edges?.label).toBe('Uneven Edges');
  });

  it('should include other option', () => {
    const other = COMMON_PROBLEMS.find(p => p.id === 'other');
    expect(other).toBeDefined();
    expect(other?.label).toBe('Something Else');
  });

  it('should have unique IDs', () => {
    const ids = COMMON_PROBLEMS.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('SEVERITY_CONFIG', () => {
  it('should have all severity levels defined', () => {
    expect(SEVERITY_CONFIG.minor).toBeDefined();
    expect(SEVERITY_CONFIG.moderate).toBeDefined();
    expect(SEVERITY_CONFIG.major).toBeDefined();
  });

  it('should have correct labels', () => {
    expect(SEVERITY_CONFIG.minor.label).toBe('Easy Fix');
    expect(SEVERITY_CONFIG.moderate.label).toBe('Moderate');
    expect(SEVERITY_CONFIG.major.label).toBe('Major Issue');
  });

  it('should have colors and descriptions', () => {
    for (const severity of ['minor', 'moderate', 'major'] as const) {
      expect(SEVERITY_CONFIG[severity].color).toBeDefined();
      expect(SEVERITY_CONFIG[severity].bgColor).toBeDefined();
      expect(SEVERITY_CONFIG[severity].description).toBeDefined();
    }
  });

  it('should have appropriate colors', () => {
    expect(SEVERITY_CONFIG.minor.color).toContain('green');
    expect(SEVERITY_CONFIG.moderate.color).toContain('yellow');
    expect(SEVERITY_CONFIG.major.color).toContain('red');
  });
});

describe('SOSRequest type', () => {
  it('should accept minimal request', () => {
    const request: SOSRequest = {
      problemDescription: 'I dropped a stitch',
    };

    expect(request.problemDescription).toBe('I dropped a stitch');
    expect(request.imageBase64).toBeUndefined();
  });

  it('should accept request with image', () => {
    const request: SOSRequest = {
      problemDescription: 'Help me identify this problem',
      imageBase64: 'base64-encoded-image',
      imageMimeType: 'image/jpeg',
    };

    expect(request.imageBase64).toBe('base64-encoded-image');
    expect(request.imageMimeType).toBe('image/jpeg');
  });

  it('should accept request with current step', () => {
    const request: SOSRequest = {
      problemDescription: 'I messed up on this step',
      currentStep: {
        title: 'Decrease Row',
        description: 'K2tog, K to end',
        techniques: ['k2tog', 'knit'],
      },
    };

    expect(request.currentStep?.title).toBe('Decrease Row');
    expect(request.currentStep?.techniques).toContain('k2tog');
  });

  it('should accept request with project context', () => {
    const request: SOSRequest = {
      problemDescription: 'My stitches look weird',
      projectContext: {
        projectName: 'Cozy Hat',
        yarn: 'Merino Wool',
        needles: '5mm Circular',
      },
    };

    expect(request.projectContext?.projectName).toBe('Cozy Hat');
    expect(request.projectContext?.yarn).toBe('Merino Wool');
  });

  it('should accept full request with all fields', () => {
    const request: SOSRequest = {
      problemDescription: 'Full problem description',
      imageBase64: 'image-data',
      imageMimeType: 'image/png',
      currentStep: {
        title: 'Step Title',
        description: 'Step description',
        techniques: ['knit', 'purl'],
      },
      projectContext: {
        projectName: 'My Project',
        yarn: 'Cotton Blend',
        needles: '4mm',
      },
    };

    expect(request.problemDescription).toBeDefined();
    expect(request.imageBase64).toBeDefined();
    expect(request.currentStep).toBeDefined();
    expect(request.projectContext).toBeDefined();
  });
});

describe('SOSResponse type', () => {
  it('should contain all required fields', () => {
    const response: SOSResponse = {
      diagnosis: 'You dropped a stitch 3 rows back',
      severity: 'moderate',
      fixSteps: [
        'Insert crochet hook through dropped stitch',
        'Pull the ladder bar through',
        'Continue until caught up',
        'Place stitch back on needle',
      ],
      prevention: 'Count stitches regularly',
      relatedTechniques: ['picking-up-stitches'],
      needsExpertHelp: false,
    };

    expect(response.diagnosis).toBeDefined();
    expect(response.severity).toBeDefined();
    expect(response.fixSteps).toHaveLength(4);
    expect(response.prevention).toBeDefined();
    expect(response.relatedTechniques).toContain('picking-up-stitches');
    expect(response.needsExpertHelp).toBe(false);
  });

  it('should support minor severity', () => {
    const response: SOSResponse = {
      diagnosis: 'Quick fix needed',
      severity: 'minor',
      fixSteps: ['Simple step'],
      prevention: 'Prevention tip',
      relatedTechniques: [],
      needsExpertHelp: false,
    };

    expect(response.severity).toBe('minor');
  });

  it('should support moderate severity', () => {
    const response: SOSResponse = {
      diagnosis: 'Moderate issue',
      severity: 'moderate',
      fixSteps: ['Step 1', 'Step 2'],
      prevention: 'Prevention tip',
      relatedTechniques: [],
      needsExpertHelp: false,
    };

    expect(response.severity).toBe('moderate');
  });

  it('should support major severity', () => {
    const response: SOSResponse = {
      diagnosis: 'Major issue requiring rework',
      severity: 'major',
      fixSteps: ['Step 1', 'Step 2', 'Step 3'],
      prevention: 'Prevention tip',
      relatedTechniques: [],
      needsExpertHelp: true,
    };

    expect(response.severity).toBe('major');
    expect(response.needsExpertHelp).toBe(true);
  });

  it('should support optional additional tips', () => {
    const response: SOSResponse = {
      diagnosis: 'Problem diagnosed',
      severity: 'minor',
      fixSteps: ['Fix it'],
      prevention: 'Prevention',
      relatedTechniques: [],
      additionalTips: ['Tip 1', 'Tip 2'],
      needsExpertHelp: false,
    };

    expect(response.additionalTips).toHaveLength(2);
    expect(response.additionalTips).toContain('Tip 1');
  });

  it('should support multiple related techniques', () => {
    const response: SOSResponse = {
      diagnosis: 'Complex issue',
      severity: 'moderate',
      fixSteps: ['Step 1'],
      prevention: 'Prevention',
      relatedTechniques: ['k2tog', 'ssk', 'picking-up-stitches'],
      needsExpertHelp: false,
    };

    expect(response.relatedTechniques).toHaveLength(3);
  });
});

describe('Edge cases', () => {
  it('should handle empty fix steps array', () => {
    const response: SOSResponse = {
      diagnosis: 'No fix needed',
      severity: 'minor',
      fixSteps: [],
      prevention: 'Keep knitting',
      relatedTechniques: [],
      needsExpertHelp: false,
    };

    expect(response.fixSteps).toHaveLength(0);
  });

  it('should handle empty related techniques', () => {
    const response: SOSResponse = {
      diagnosis: 'Simple issue',
      severity: 'minor',
      fixSteps: ['Just fix it'],
      prevention: 'Be careful',
      relatedTechniques: [],
      needsExpertHelp: false,
    };

    expect(response.relatedTechniques).toHaveLength(0);
  });
});
