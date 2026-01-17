// src/stories/patterns/molecules/PatternCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { PatternCard } from '@/components/patterns/PatternCard';
import { PatternCardSkeleton } from '@/components/patterns/PatternCardSkeleton';
import { mockPatternCards } from '@/components/patterns/__mocks__/patterns';

/**
 * The PatternCard component is a Pinterest-style card for displaying patterns
 * in the library grid. Features include:
 *
 * ## Design Features
 * - **3:4 aspect ratio** image (portrait-oriented like Pinterest)
 * - **Hover animations**: Scale, translate, and shadow elevation
 * - **Quick actions**: Favorite, share, use as template on hover
 * - **Type icon**: Knitting needles vs crochet hook for quick identification
 * - **Technique chips**: Shows relevant techniques with overflow handling
 *
 * ## Variants
 * - **default**: Full-size card for main library grid
 * - **compact**: Smaller card for sidebars, carousels, and related patterns
 *
 * ## Interaction
 * Cards are clickable and support keyboard navigation. Quick actions
 * appear on hover and can be triggered independently.
 */
const meta: Meta<typeof PatternCard> = {
  title: 'Patterns/Molecules/PatternCard',
  component: PatternCard,
  tags: ['autodocs'],
  args: {
    onClick: fn(),
    onFavoriteToggle: fn(),
    onShare: fn(),
    onUseTemplate: fn(),
    onTechniqueClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact'],
      description: 'Card size variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    pattern: {
      control: 'object',
      description: 'Pattern data to display',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Pinterest-style pattern card with hover effects, quick actions, and technique display.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[280px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PatternCard>;

// Get sample patterns for stories
const knittingPattern = mockPatternCards[0]; // Cable Sweater
const crochetPattern = mockPatternCards[4]; // Granny Blanket
const beginnerPattern = mockPatternCards[2]; // Beginner Hat
const expertPattern = mockPatternCards[7]; // Lace Socks

// ============================================================================
// BASIC VARIANTS
// ============================================================================

export const Default: Story = {
  args: {
    pattern: knittingPattern,
  },
};

export const Compact: Story = {
  args: {
    pattern: knittingPattern,
    variant: 'compact',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact variant for sidebars, carousels, and related patterns sections.',
      },
    },
  },
};

export const CrochetPattern: Story = {
  args: {
    pattern: crochetPattern,
  },
  parameters: {
    docs: {
      description: {
        story: 'Crochet patterns show a hook icon instead of knitting needles.',
      },
    },
  },
};

// ============================================================================
// HOVER & INTERACTION STATES
// ============================================================================

export const WithQuickActions: Story = {
  args: {
    pattern: knittingPattern,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hover over the card to see quick action buttons: Favorite, Share, and Use as Template.',
      },
    },
  },
};

export const Favorited: Story = {
  args: {
    pattern: {
      ...knittingPattern,
      isFavorited: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Favorited patterns show a filled heart icon in the quick actions.',
      },
    },
  },
};

// ============================================================================
// DIFFICULTY VARIANTS
// ============================================================================

export const BeginnerDifficulty: Story = {
  args: {
    pattern: beginnerPattern,
  },
  parameters: {
    docs: {
      description: {
        story: 'Beginner patterns show a green difficulty badge.',
      },
    },
  },
};

export const ExpertDifficulty: Story = {
  args: {
    pattern: expertPattern,
  },
  parameters: {
    docs: {
      description: {
        story: 'Expert patterns show a chestnut/dark brown difficulty badge.',
      },
    },
  },
};

// ============================================================================
// ALL DIFFICULTIES SHOWCASE
// ============================================================================

export const AllDifficulties: Story = {
  render: () => (
    <div className="grid grid-cols-5 gap-4 max-w-none">
      {['beginner', 'easy', 'intermediate', 'advanced', 'expert'].map((difficulty, idx) => (
        <PatternCard
          key={difficulty}
          pattern={{
            ...mockPatternCards[idx < mockPatternCards.length ? idx : 0],
            difficulty: difficulty as any,
          }}
          variant="compact"
        />
      ))}
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="max-w-[1200px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'All difficulty levels side by side showing the color progression.',
      },
    },
  },
};

// ============================================================================
// EDGE CASES
// ============================================================================

export const NoImage: Story = {
  args: {
    pattern: {
      ...knittingPattern,
      thumbnailUrl: undefined,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'When no image is available, a placeholder is shown.',
      },
    },
  },
};

export const NoTechniques: Story = {
  args: {
    pattern: {
      ...knittingPattern,
      techniques: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Patterns without techniques gracefully omit the technique list.',
      },
    },
  },
};

export const ManyTechniques: Story = {
  args: {
    pattern: {
      ...knittingPattern,
      techniques: [
        { id: 'cable', name: 'Cable', complexity: 0.7 },
        { id: 'ribbing', name: 'Ribbing', complexity: 0.3 },
        { id: 'seaming', name: 'Seaming', complexity: 0.4 },
        { id: 'blocking', name: 'Blocking', complexity: 0.2 },
        { id: 'picking-up', name: 'Picking Up', complexity: 0.5 },
        { id: 'short-rows', name: 'Short Rows', complexity: 0.6 },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Many techniques are truncated with "+N more" indicator.',
      },
    },
  },
};

export const LongTitle: Story = {
  args: {
    pattern: {
      ...knittingPattern,
      title:
        'Traditional Aran-Style Cable Knit Sweater with Honeycomb Pattern and Saddle Shoulder Construction',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Long titles are truncated to 2 lines with ellipsis.',
      },
    },
  },
};

// ============================================================================
// LOADING STATE
// ============================================================================

export const Loading: Story = {
  render: () => <PatternCardSkeleton />,
  parameters: {
    docs: {
      description: {
        story: 'Skeleton loading state while pattern data is being fetched.',
      },
    },
  },
};

export const LoadingCompact: Story = {
  render: () => <PatternCardSkeleton variant="compact" />,
  parameters: {
    docs: {
      description: {
        story: 'Compact skeleton for smaller layouts.',
      },
    },
  },
};

// ============================================================================
// INTERACTIVE DEMO
// ============================================================================

export const InteractiveDemo: Story = {
  args: {
    pattern: knittingPattern,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo: Hover to see quick actions, click to trigger onClick callback. Check the Actions panel to see events.',
      },
    },
  },
};

// ============================================================================
// KNITTING VS CROCHET COMPARISON
// ============================================================================

export const KnittingVsCrochet: Story = {
  render: () => (
    <div className="flex gap-4 max-w-none">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Knitting</p>
        <PatternCard pattern={knittingPattern} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Crochet</p>
        <PatternCard pattern={crochetPattern} />
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="max-w-[600px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison showing the different type icons for knitting vs crochet patterns.',
      },
    },
  },
};
