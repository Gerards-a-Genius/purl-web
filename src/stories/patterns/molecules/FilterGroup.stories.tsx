// src/stories/patterns/molecules/FilterGroup.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { FilterGroup, type FilterOption } from '@/components/patterns/FilterGroup';

const difficultyOptions: FilterOption[] = [
  { id: 'beginner', label: 'Beginner', count: 24 },
  { id: 'easy', label: 'Easy', count: 45 },
  { id: 'intermediate', label: 'Intermediate', count: 67 },
  { id: 'advanced', label: 'Advanced', count: 32 },
  { id: 'expert', label: 'Expert', count: 12 },
];

const typeOptions: FilterOption[] = [
  { id: 'knitting', label: 'Knitting', count: 156 },
  { id: 'crochet', label: 'Crochet', count: 89 },
  { id: 'machine_knit', label: 'Machine Knit', count: 23 },
];

const categoryOptions: FilterOption[] = [
  { id: 'sweater', label: 'Sweater', count: 45 },
  { id: 'hat', label: 'Hat', count: 38 },
  { id: 'scarf', label: 'Scarf', count: 29 },
  { id: 'shawl', label: 'Shawl', count: 22 },
  { id: 'socks', label: 'Socks', count: 41 },
  { id: 'blanket', label: 'Blanket', count: 18 },
];

/**
 * The FilterGroup component displays a collapsible group of filter options.
 *
 * ## Features
 * - Two display variants: checkbox (for multi-select) and button (for visual selection)
 * - Optional item counts
 * - Collapsible with smooth animation
 * - Full keyboard accessibility
 *
 * ## Usage
 * Used in the PatternFiltersPanel for filtering pattern library results
 * by difficulty, type, category, yarn weight, and techniques.
 */
const meta: Meta<typeof FilterGroup> = {
  title: 'Patterns/Molecules/FilterGroup',
  component: FilterGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['checkbox', 'button'],
      description: 'Display variant',
      table: {
        defaultValue: { summary: 'checkbox' },
      },
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether the group can be collapsed',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Whether the group starts expanded',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Collapsible filter group with checkbox or button variants for filter panels.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[280px] p-4 bg-card rounded-xl border">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterGroup>;

// ============================================================================
// CHECKBOX VARIANT
// ============================================================================

export const CheckboxDefault: Story = {
  args: {
    title: 'Difficulty',
    options: difficultyOptions,
    selected: [],
    variant: 'checkbox',
    onChange: fn(),
  },
};

export const CheckboxWithSelection: Story = {
  args: {
    title: 'Difficulty',
    options: difficultyOptions,
    selected: ['beginner', 'easy'],
    variant: 'checkbox',
    onChange: fn(),
  },
};

// ============================================================================
// BUTTON VARIANT
// ============================================================================

export const ButtonDefault: Story = {
  args: {
    title: 'Pattern Type',
    options: typeOptions,
    selected: [],
    variant: 'button',
    onChange: fn(),
  },
};

export const ButtonWithSelection: Story = {
  args: {
    title: 'Pattern Type',
    options: typeOptions,
    selected: ['knitting'],
    variant: 'button',
    onChange: fn(),
  },
};

// ============================================================================
// COLLAPSIBLE STATES
// ============================================================================

export const Collapsed: Story = {
  args: {
    title: 'Category',
    options: categoryOptions,
    selected: [],
    defaultOpen: false,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter group starting in collapsed state.',
      },
    },
  },
};

export const NonCollapsible: Story = {
  args: {
    title: 'Difficulty',
    options: difficultyOptions,
    selected: ['intermediate'],
    collapsible: false,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter group without collapse functionality.',
      },
    },
  },
};

// ============================================================================
// WITHOUT COUNTS
// ============================================================================

export const WithoutCounts: Story = {
  args: {
    title: 'Difficulty',
    options: difficultyOptions.map(({ count, ...opt }) => opt),
    selected: [],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Filter options without item counts.',
      },
    },
  },
};

// ============================================================================
// DISABLED OPTIONS
// ============================================================================

export const WithDisabledOptions: Story = {
  args: {
    title: 'Pattern Type',
    options: [
      { id: 'knitting', label: 'Knitting', count: 156 },
      { id: 'crochet', label: 'Crochet', count: 89 },
      { id: 'machine_knit', label: 'Machine Knit', count: 0, disabled: true },
    ],
    selected: ['knitting'],
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Options with count of 0 can be disabled.',
      },
    },
  },
};

// ============================================================================
// INTERACTIVE
// ============================================================================

export const Interactive: Story = {
  render: function InteractiveFilterGroup() {
    const [selected, setSelected] = useState<string[]>(['beginner']);

    return (
      <FilterGroup
        title="Difficulty"
        options={difficultyOptions}
        selected={selected}
        onChange={setSelected}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example - click to toggle filter options.',
      },
    },
  },
};

export const InteractiveButtons: Story = {
  render: function InteractiveButtonFilterGroup() {
    const [selected, setSelected] = useState<string[]>(['knitting']);

    return (
      <FilterGroup
        title="Pattern Type"
        options={typeOptions}
        selected={selected}
        onChange={setSelected}
        variant="button"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive button variant - click to toggle selection.',
      },
    },
  },
};

// ============================================================================
// MULTIPLE GROUPS
// ============================================================================

export const MultipleGroups: Story = {
  render: function MultipleFilterGroups() {
    const [difficulty, setDifficulty] = useState<string[]>(['intermediate']);
    const [type, setType] = useState<string[]>(['knitting']);
    const [category, setCategory] = useState<string[]>([]);

    return (
      <div className="space-y-4">
        <FilterGroup
          title="Pattern Type"
          options={typeOptions}
          selected={type}
          onChange={setType}
          variant="button"
        />
        <FilterGroup
          title="Difficulty"
          options={difficultyOptions}
          selected={difficulty}
          onChange={setDifficulty}
        />
        <FilterGroup
          title="Category"
          options={categoryOptions}
          selected={category}
          onChange={setCategory}
          defaultOpen={false}
        />
      </div>
    );
  },
  decorators: [
    (Story) => (
      <div className="max-w-[280px] p-4 bg-card rounded-xl border space-y-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Multiple filter groups combined, as they would appear in a filter panel.',
      },
    },
  },
};
