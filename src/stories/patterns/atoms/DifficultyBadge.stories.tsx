// src/stories/patterns/atoms/DifficultyBadge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DifficultyBadge } from '@/components/patterns/DifficultyBadge';

/**
 * The DifficultyBadge component displays a color-coded badge indicating pattern difficulty.
 *
 * ## Color Progression
 * Colors progress from welcoming greens for beginners to deeper, more impressive
 * tones for expert patterns, following Purl's warm color palette:
 *
 * - **Beginner**: Green (encouraging, "you can do this!")
 * - **Easy**: Olive (still welcoming, slightly elevated)
 * - **Intermediate**: Caramel (warm neutral, balanced challenge)
 * - **Advanced**: Copper (brand accent, attention-grabbing)
 * - **Expert**: Chestnut (deep, impressive achievement)
 *
 * ## Usage
 * Use this badge on pattern cards, library grids, and detail views to help users
 * quickly identify patterns matching their skill level.
 */
const meta: Meta<typeof DifficultyBadge> = {
  title: 'Patterns/Atoms/DifficultyBadge',
  component: DifficultyBadge,
  tags: ['autodocs'],
  argTypes: {
    difficulty: {
      control: 'select',
      options: ['beginner', 'easy', 'intermediate', 'advanced', 'expert'],
      description: 'The difficulty level to display',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Badge size variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    showLabel: {
      control: 'boolean',
      description: 'Whether to show the label text',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    label: {
      control: 'text',
      description: 'Custom label override',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Color-coded badge showing pattern difficulty level. Uses a warm color progression to indicate skill requirements.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DifficultyBadge>;

// ============================================================================
// INDIVIDUAL DIFFICULTY LEVELS
// ============================================================================

export const Beginner: Story = {
  args: {
    difficulty: 'beginner',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Green badge for beginner-friendly patterns. Encourages new knitters to get started.',
      },
    },
  },
};

export const Easy: Story = {
  args: {
    difficulty: 'easy',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Olive badge for easy patterns. Slightly elevated from beginner but still very approachable.',
      },
    },
  },
};

export const Intermediate: Story = {
  args: {
    difficulty: 'intermediate',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Caramel badge for intermediate patterns. Balanced challenge requiring some experience.',
      },
    },
  },
};

export const Advanced: Story = {
  args: {
    difficulty: 'advanced',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Copper badge for advanced patterns. Uses our brand accent color to draw attention.',
      },
    },
  },
};

export const Expert: Story = {
  args: {
    difficulty: 'expert',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Chestnut badge for expert patterns. Deep, impressive color for the most challenging projects.',
      },
    },
  },
};

// ============================================================================
// SIZE VARIANTS
// ============================================================================

export const SizeSmall: Story = {
  args: {
    difficulty: 'intermediate',
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact size for tight spaces like table rows or dense card layouts.',
      },
    },
  },
};

export const SizeDefault: Story = {
  args: {
    difficulty: 'intermediate',
    size: 'default',
  },
};

export const SizeLarge: Story = {
  args: {
    difficulty: 'intermediate',
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Larger size for featured displays or detail views.',
      },
    },
  },
};

// ============================================================================
// SHOWCASE
// ============================================================================

export const AllDifficulties: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <DifficultyBadge difficulty="beginner" />
      <DifficultyBadge difficulty="easy" />
      <DifficultyBadge difficulty="intermediate" />
      <DifficultyBadge difficulty="advanced" />
      <DifficultyBadge difficulty="expert" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'All difficulty levels side by side, showing the color progression from green to chestnut.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <DifficultyBadge difficulty="intermediate" size="sm" />
      <DifficultyBadge difficulty="intermediate" size="default" />
      <DifficultyBadge difficulty="intermediate" size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All size variants side by side for comparison.',
      },
    },
  },
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="p-4 bg-card rounded-xl border space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Classic Cable Sweater</h3>
          <DifficultyBadge difficulty="intermediate" />
        </div>
        <p className="text-sm text-muted-foreground">
          A timeless Aran-style sweater featuring traditional cable patterns.
        </p>
      </div>
      <div className="p-4 bg-card rounded-xl border space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Cozy Beginner Hat</h3>
          <DifficultyBadge difficulty="beginner" />
        </div>
        <p className="text-sm text-muted-foreground">
          A simple stockinette hat perfect for beginners.
        </p>
      </div>
      <div className="p-4 bg-card rounded-xl border space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Intricate Lace Shawl</h3>
          <DifficultyBadge difficulty="expert" />
        </div>
        <p className="text-sm text-muted-foreground">
          A challenging lace shawl for experienced knitters.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Badges shown in context on pattern cards, demonstrating real-world usage.',
      },
    },
  },
};

export const CustomLabel: Story = {
  args: {
    difficulty: 'intermediate',
    label: 'Medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom label override for localization or alternative terminology.',
      },
    },
  },
};
