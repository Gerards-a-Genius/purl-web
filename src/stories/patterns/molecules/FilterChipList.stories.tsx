// src/stories/patterns/molecules/FilterChipList.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { FilterChipList, type FilterChip } from '@/components/patterns/FilterChipList';

const sampleChips: FilterChip[] = [
  { id: 'intermediate', label: 'Intermediate', category: 'difficulty', value: 'intermediate' },
  { id: 'knitting', label: 'Knitting', category: 'type', value: 'knitting' },
  { id: 'sweater', label: 'Sweater', category: 'category', value: 'sweater' },
  { id: 'cable', label: 'Cable', category: 'technique', value: 'cable' },
];

/**
 * The FilterChipList component displays active filter selections as removable chips.
 *
 * ## Features
 * - Shows currently active filters
 * - Individual chips can be removed
 * - "Clear all" button when multiple filters are active
 * - Uses Purl's copper accent color for emphasis
 *
 * ## Usage
 * Typically placed above the pattern grid to show which filters are active
 * and allow quick removal without opening the filter panel.
 */
const meta: Meta<typeof FilterChipList> = {
  title: 'Patterns/Molecules/FilterChipList',
  component: FilterChipList,
  tags: ['autodocs'],
  args: {
    onRemove: fn(),
    onClearAll: fn(),
  },
  argTypes: {
    showClearAll: {
      control: 'boolean',
      description: 'Whether to show the "Clear all" button',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Displays active filters as removable chips. Allows users to quickly see and modify current filters.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[500px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterChipList>;

// ============================================================================
// BASIC VARIANTS
// ============================================================================

export const Default: Story = {
  args: {
    chips: sampleChips,
  },
};

export const SingleChip: Story = {
  args: {
    chips: [sampleChips[0]],
  },
  parameters: {
    docs: {
      description: {
        story: 'Single filter chip - "Clear all" button is hidden when only one chip.',
      },
    },
  },
};

export const TwoChips: Story = {
  args: {
    chips: sampleChips.slice(0, 2),
  },
  parameters: {
    docs: {
      description: {
        story: '"Clear all" button appears when there are multiple chips.',
      },
    },
  },
};

export const ManyChips: Story = {
  args: {
    chips: [
      ...sampleChips,
      { id: 'worsted', label: 'Worsted', category: 'yarnWeight', value: 'worsted' },
      { id: 'ribbing', label: 'Ribbing', category: 'technique', value: 'ribbing' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Many active filters - chips wrap to multiple lines.',
      },
    },
  },
};

// ============================================================================
// CONFIGURATION
// ============================================================================

export const WithoutClearAll: Story = {
  args: {
    chips: sampleChips,
    showClearAll: false,
  },
  parameters: {
    docs: {
      description: {
        story: '"Clear all" button can be hidden if not desired.',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    chips: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty chip list renders nothing.',
      },
    },
  },
};

// ============================================================================
// INTERACTIVE
// ============================================================================

export const Interactive: Story = {
  render: function InteractiveChipList() {
    const [chips, setChips] = useState<FilterChip[]>(sampleChips);

    const handleRemove = (chip: FilterChip) => {
      setChips((prev) => prev.filter((c) => c.id !== chip.id));
    };

    const handleClearAll = () => {
      setChips([]);
    };

    return (
      <div className="space-y-4">
        <FilterChipList
          chips={chips}
          onRemove={handleRemove}
          onClearAll={handleClearAll}
        />
        {chips.length === 0 && (
          <p className="text-sm text-muted-foreground">No filters active</p>
        )}
        {chips.length === 0 && (
          <button
            className="text-sm text-copper underline"
            onClick={() => setChips(sampleChips)}
          >
            Reset filters
          </button>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - click X to remove chips, or "Clear all" to reset.',
      },
    },
  },
};

// ============================================================================
// CONTEXT
// ============================================================================

export const InFilterContext: Story = {
  render: () => (
    <div className="space-y-4 p-4 bg-background border rounded-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">180 patterns</h2>
        <button className="text-sm text-copper">Filters</button>
      </div>
      <FilterChipList chips={sampleChips.slice(0, 3)} />
      <p className="text-sm text-muted-foreground">
        Showing knitting sweater patterns at intermediate level...
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Filter chips shown in context, above pattern results.',
      },
    },
  },
};
