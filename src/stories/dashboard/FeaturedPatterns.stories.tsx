// src/stories/dashboard/FeaturedPatterns.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { FeaturedPatterns } from '@/components/dashboard/FeaturedPatterns';

/**
 * FeaturedPatterns displays a curated selection of patterns from the library
 * to inspire users on the dashboard.
 *
 * ## Features
 * - Daily rotating featured patterns (based on day of week)
 * - Compact PatternCard display
 * - Link to browse full library
 * - Loading skeleton state
 * - Empty state handling
 *
 * ## Design Notes
 * - Uses BookMarked icon for library branding
 * - Copper accent color for the header
 * - Grid layout (1 column mobile, 3 columns desktop)
 */
const meta: Meta<typeof FeaturedPatterns> = {
  title: 'Dashboard/FeaturedPatterns',
  component: FeaturedPatterns,
  tags: ['autodocs'],
  argTypes: {
    limit: {
      control: { type: 'number', min: 1, max: 6 },
      description: 'Maximum number of patterns to show',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading skeleton state',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Featured patterns widget for the dashboard.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FeaturedPatterns>;

// ============================================================================
// DEFAULT STATE
// ============================================================================

export const Default: Story = {
  args: {
    limit: 3,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing 3 featured patterns from the library.',
      },
    },
  },
};

// ============================================================================
// LOADING STATE
// ============================================================================

export const Loading: Story = {
  args: {
    limit: 3,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading skeleton while fetching pattern data.',
      },
    },
  },
};

// ============================================================================
// TWO PATTERNS
// ============================================================================

export const TwoPatterns: Story = {
  args: {
    limit: 2,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Showing only 2 featured patterns.',
      },
    },
  },
};

// ============================================================================
// FOUR PATTERNS
// ============================================================================

export const FourPatterns: Story = {
  args: {
    limit: 4,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Showing 4 featured patterns.',
      },
    },
  },
};

// ============================================================================
// SIX PATTERNS
// ============================================================================

export const SixPatterns: Story = {
  args: {
    limit: 6,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Showing 6 featured patterns in a wider grid.',
      },
    },
  },
};

// ============================================================================
// COMPACT CONTAINER
// ============================================================================

export const InCompactContainer: Story = {
  args: {
    limit: 3,
    isLoading: false,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Featured patterns in a narrower container.',
      },
    },
  },
};

// ============================================================================
// FULL WIDTH
// ============================================================================

export const FullWidth: Story = {
  args: {
    limit: 3,
    isLoading: false,
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Featured patterns in a wider container.',
      },
    },
  },
};
