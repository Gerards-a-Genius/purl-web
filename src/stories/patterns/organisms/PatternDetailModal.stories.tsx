// src/stories/patterns/organisms/PatternDetailModal.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { PatternDetailModal } from '@/components/patterns/PatternDetailModal';
import { Button } from '@/components/ui/button';
import {
  mockPatterns,
  mockPatternCards,
} from '@/components/patterns/__mocks__/patterns';

/**
 * The PatternDetailModal displays full pattern information in a dialog.
 *
 * ## Features
 * - Split layout with image on left, content on right (desktop)
 * - Stacked layout for mobile
 * - Tabs for Details, Materials, and Similar Patterns
 * - Quick actions: Favorite, Share, Use as Template
 * - Responsive design
 *
 * ## Tabs
 * - **Details**: Description, techniques, tags, and source info
 * - **Materials**: Yarn, needles/hook, notions, gauge, and sizing
 * - **Similar**: Related patterns (when provided)
 */
const meta: Meta<typeof PatternDetailModal> = {
  title: 'Patterns/Organisms/PatternDetailModal',
  component: PatternDetailModal,
  tags: ['autodocs'],
  args: {
    onFavoriteToggle: fn(),
    onShare: fn(),
    onUseTemplate: fn(),
    onSimilarPatternClick: fn(),
    onOpenChange: fn(),
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Full-screen pattern detail modal with tabs, images, and action buttons.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PatternDetailModal>;

// Get sample patterns
const cableSweater = mockPatterns[0];
const laceShawl = mockPatterns[1];
const beginnerHat = mockPatterns[2];
const grannyCrochet = mockPatterns[4];

// ============================================================================
// BASIC STATES
// ============================================================================

export const Default: Story = {
  args: {
    pattern: cableSweater,
    isOpen: true,
  },
};

export const CrochetPattern: Story = {
  args: {
    pattern: grannyCrochet,
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Crochet pattern showing hook size instead of needle size.',
      },
    },
  },
};

export const AdvancedPattern: Story = {
  args: {
    pattern: laceShawl,
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Advanced lace pattern with many techniques.',
      },
    },
  },
};

export const SimplePattern: Story = {
  args: {
    pattern: beginnerHat,
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple beginner pattern with fewer details.',
      },
    },
  },
};

// ============================================================================
// WITH SIMILAR PATTERNS
// ============================================================================

export const WithSimilarPatterns: Story = {
  args: {
    pattern: cableSweater,
    isOpen: true,
    similarPatterns: mockPatternCards.slice(3, 7),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with Similar Patterns tab showing related patterns.',
      },
    },
  },
};

// ============================================================================
// FAVORITED STATE
// ============================================================================

export const Favorited: Story = {
  args: {
    pattern: {
      ...cableSweater,
      isFavorited: true,
    },
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pattern that has been favorited - heart icon is filled.',
      },
    },
  },
};

// ============================================================================
// MOBILE VIEW
// ============================================================================

export const MobileView: Story = {
  args: {
    pattern: cableSweater,
    isOpen: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Stacked layout on mobile with image at top.',
      },
    },
  },
};

// ============================================================================
// INTERACTIVE
// ============================================================================

export const Interactive: Story = {
  render: function InteractiveModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPattern, setCurrentPattern] = useState(cableSweater);

    const patterns = [cableSweater, laceShawl, beginnerHat, grannyCrochet];

    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click a button to open the modal with different patterns:
        </p>
        <div className="flex flex-wrap gap-2">
          {patterns.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              onClick={() => {
                setCurrentPattern(p);
                setIsOpen(true);
              }}
            >
              {p.title}
            </Button>
          ))}
        </div>

        <PatternDetailModal
          pattern={currentPattern}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          similarPatterns={mockPatternCards.slice(0, 4)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - click buttons to open modal with different patterns.',
      },
    },
  },
};

// ============================================================================
// MINIMAL DATA
// ============================================================================

export const MinimalData: Story = {
  args: {
    pattern: {
      id: 'minimal-1',
      title: 'Simple Pattern',
      type: 'knitting',
      category: 'scarf',
      difficulty: 'beginner',
      techniques: [],
      materials: {
        yarnWeight: 'worsted',
      },
      createdAt: new Date().toISOString(),
    },
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pattern with minimal data - gracefully handles missing fields.',
      },
    },
  },
};

// ============================================================================
// FULL DATA
// ============================================================================

export const FullData: Story = {
  args: {
    pattern: {
      ...cableSweater,
      designer: 'Traditional Aran',
      estimatedTime: '40-60 hours',
      instructionFormat: 'both',
      tags: ['classic', 'aran', 'warm', 'winter', 'traditional', 'heirloom'],
    },
    isOpen: true,
    similarPatterns: mockPatternCards.slice(1, 5),
  },
  parameters: {
    docs: {
      description: {
        story: 'Pattern with all data fields populated.',
      },
    },
  },
};
