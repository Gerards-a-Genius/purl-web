// src/stories/patterns/organisms/PatternFiltersPanel.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { PatternFiltersPanel } from '@/components/patterns/PatternFiltersPanel';
import type { PatternFilters } from '@/types/pattern';

const techniqueOptions = [
  { id: 'cable', label: 'Cable', count: 45 },
  { id: 'lace', label: 'Lace', count: 32 },
  { id: 'colorwork', label: 'Colorwork', count: 28 },
  { id: 'ribbing', label: 'Ribbing', count: 67 },
  { id: 'bobbles', label: 'Bobbles', count: 15 },
  { id: 'short-rows', label: 'Short Rows', count: 22 },
];

/**
 * The PatternFiltersPanel provides filtering controls for the pattern library.
 *
 * ## Features
 * - Two display modes: sidebar (desktop) and sheet (mobile)
 * - Filter groups for type, difficulty, category, yarn weight, and techniques
 * - Active filter chips with individual removal
 * - Clear all functionality
 *
 * ## Filter Categories
 * - **Pattern Type**: Knitting, Crochet, Machine Knit
 * - **Difficulty**: Beginner through Expert
 * - **Category**: Sweater, Hat, Scarf, etc.
 * - **Yarn Weight**: Lace through Super Bulky
 * - **Techniques**: Cable, Lace, Colorwork, etc.
 */
const meta: Meta<typeof PatternFiltersPanel> = {
  title: 'Patterns/Organisms/PatternFiltersPanel',
  component: PatternFiltersPanel,
  tags: ['autodocs'],
  args: {
    onFiltersChange: fn(),
    onOpenChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Filter panel for the pattern library with sidebar and sheet modes.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PatternFiltersPanel>;

// ============================================================================
// SIDEBAR MODE
// ============================================================================

export const SidebarDefault: Story = {
  args: {
    filters: {},
    mode: 'sidebar',
    techniqueOptions,
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-background min-h-[600px]">
        <Story />
      </div>
    ),
  ],
};

export const SidebarWithFilters: Story = {
  args: {
    filters: {
      type: ['knitting'],
      difficulty: ['intermediate', 'advanced'],
      category: ['sweater'],
    },
    mode: 'sidebar',
    techniqueOptions,
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-background min-h-[600px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with active filters showing filter chips.',
      },
    },
  },
};

// ============================================================================
// SHEET MODE (MOBILE)
// ============================================================================

export const SheetClosed: Story = {
  args: {
    filters: {},
    mode: 'sheet',
    isOpen: false,
    techniqueOptions,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Sheet mode shows a button that opens a slide-out panel. Click the Filters button.',
      },
    },
  },
};

export const SheetOpen: Story = {
  args: {
    filters: {
      type: ['knitting'],
      difficulty: ['beginner', 'easy'],
    },
    mode: 'sheet',
    isOpen: true,
    techniqueOptions,
  },
  parameters: {
    docs: {
      description: {
        story: 'Sheet mode with panel open.',
      },
    },
  },
};

// ============================================================================
// INTERACTIVE
// ============================================================================

export const InteractiveSidebar: Story = {
  render: function InteractiveFiltersSidebar() {
    const [filters, setFilters] = useState<PatternFilters>({
      type: ['knitting'],
      difficulty: ['intermediate'],
    });

    return (
      <div className="flex gap-6 p-6 bg-background min-h-[600px]">
        <PatternFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          mode="sidebar"
          techniqueOptions={techniqueOptions}
        />
        <div className="flex-1 p-4 bg-muted/30 rounded-xl">
          <h3 className="text-sm font-semibold mb-4">Active Filters</h3>
          <pre className="text-xs text-muted-foreground">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sidebar - toggle filters and see the filter state update in real-time.',
      },
    },
  },
};

export const InteractiveSheet: Story = {
  render: function InteractiveFiltersSheet() {
    const [filters, setFilters] = useState<PatternFilters>({});
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="p-6 space-y-4">
        <PatternFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          mode="sheet"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          techniqueOptions={techniqueOptions}
        />
        <div className="p-4 bg-muted/30 rounded-xl">
          <h3 className="text-sm font-semibold mb-2">Active Filters</h3>
          <pre className="text-xs text-muted-foreground">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive sheet mode - click the Filters button to open the panel.',
      },
    },
  },
};

// ============================================================================
// WITH MANY FILTERS ACTIVE
// ============================================================================

export const ManyFiltersActive: Story = {
  args: {
    filters: {
      type: ['knitting', 'crochet'],
      difficulty: ['intermediate', 'advanced'],
      category: ['sweater', 'cardigan', 'hat'],
      yarnWeight: ['worsted', 'dk'],
      techniques: ['cable', 'ribbing'],
    },
    mode: 'sidebar',
    techniqueOptions,
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-background min-h-[600px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Many active filters - chips wrap and Clear all is prominent.',
      },
    },
  },
};

// ============================================================================
// WITHOUT TECHNIQUE OPTIONS
// ============================================================================

export const WithoutTechniques: Story = {
  args: {
    filters: {},
    mode: 'sidebar',
    techniqueOptions: [],
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-background min-h-[600px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'When no technique options are provided, that section is hidden.',
      },
    },
  },
};
