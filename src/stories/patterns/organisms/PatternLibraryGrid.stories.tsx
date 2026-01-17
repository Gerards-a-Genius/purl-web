// src/stories/patterns/organisms/PatternLibraryGrid.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import {
  PatternLibraryGrid,
  PatternGridRegular,
} from '@/components/patterns/PatternLibraryGrid';
import { mockPatternCards } from '@/components/patterns/__mocks__/patterns';

/**
 * The PatternLibraryGrid component displays patterns in a Pinterest-style masonry layout.
 *
 * ## Features
 * - Masonry layout using CSS columns
 * - Responsive breakpoints: 2 cols mobile, 3 cols tablet, 4 cols desktop
 * - Staggered entrance animation with Framer Motion
 * - Loading skeleton state
 * - Empty state with helpful message
 *
 * ## Variants
 * - **PatternLibraryGrid**: Masonry layout (variable height cards)
 * - **PatternGridRegular**: Standard grid layout (equal height cards)
 */
const meta: Meta<typeof PatternLibraryGrid> = {
  title: 'Patterns/Organisms/PatternLibraryGrid',
  component: PatternLibraryGrid,
  tags: ['autodocs'],
  args: {
    onPatternClick: fn(),
    onFavoriteToggle: fn(),
    onShare: fn(),
    onUseTemplate: fn(),
    onTechniqueClick: fn(),
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pinterest-style masonry grid for displaying pattern cards with responsive layout and animations.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-background min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PatternLibraryGrid>;

// ============================================================================
// BASIC STATES
// ============================================================================

export const Default: Story = {
  args: {
    patterns: mockPatternCards,
  },
};

export const Loading: Story = {
  args: {
    patterns: [],
    isLoading: true,
    skeletonCount: 12,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state with skeleton cards.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    patterns: [],
    emptyMessage: 'No patterns found matching your filters',
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no patterns match the current filters.',
      },
    },
  },
};

// ============================================================================
// FILTERED RESULTS
// ============================================================================

export const FewResults: Story = {
  args: {
    patterns: mockPatternCards.slice(0, 3),
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid with only a few results - layout still looks balanced.',
      },
    },
  },
};

export const ManyResults: Story = {
  args: {
    patterns: [...mockPatternCards, ...mockPatternCards],
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid with many patterns - demonstrates scrolling behavior.',
      },
    },
  },
};

// ============================================================================
// RESPONSIVE PREVIEW
// ============================================================================

export const MobileView: Story = {
  args: {
    patterns: mockPatternCards.slice(0, 6),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '2-column layout on mobile devices.',
      },
    },
  },
};

export const TabletView: Story = {
  args: {
    patterns: mockPatternCards.slice(0, 9),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: '3-column layout on tablets.',
      },
    },
  },
};

// ============================================================================
// REGULAR GRID VARIANT
// ============================================================================

export const RegularGrid: Story = {
  render: (args) => <PatternGridRegular {...args} />,
  args: {
    patterns: mockPatternCards.slice(0, 8),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Regular grid variant with equal-height cards. Better for filtered or sorted views.',
      },
    },
  },
};

export const RegularGridLoading: Story = {
  render: (args) => <PatternGridRegular {...args} />,
  args: {
    patterns: [],
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Regular grid loading state.',
      },
    },
  },
};

// ============================================================================
// CUSTOM COLUMNS
// ============================================================================

export const TwoColumns: Story = {
  render: (args) => <PatternGridRegular {...args} columns={2} />,
  args: {
    patterns: mockPatternCards.slice(0, 4),
  },
  parameters: {
    docs: {
      description: {
        story: 'Fixed 2-column layout for compact displays.',
      },
    },
  },
};

export const FiveColumns: Story = {
  render: (args) => <PatternGridRegular {...args} columns={5} />,
  args: {
    patterns: mockPatternCards.slice(0, 10),
  },
  parameters: {
    docs: {
      description: {
        story: 'Fixed 5-column layout for wide displays.',
      },
    },
  },
};

// ============================================================================
// INTERACTIVE DEMO
// ============================================================================

export const Interactive: Story = {
  args: {
    patterns: mockPatternCards,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo - hover cards to see quick actions, click to trigger callbacks. Check the Actions panel.',
      },
    },
  },
};
