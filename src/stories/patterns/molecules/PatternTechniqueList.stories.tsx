// src/stories/patterns/molecules/PatternTechniqueList.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';
import { PatternTechniqueList } from '@/components/patterns/PatternTechniqueList';
import type { PatternTechnique } from '@/types/pattern';

const sampleTechniques: PatternTechnique[] = [
  { id: 'cable', name: 'Cable', complexity: 0.7 },
  { id: 'ribbing', name: 'Ribbing', complexity: 0.3 },
  { id: 'seaming', name: 'Seaming', complexity: 0.4 },
  { id: 'blocking', name: 'Blocking', complexity: 0.2 },
  { id: 'picking-up', name: 'Picking Up Stitches', complexity: 0.5 },
  { id: 'short-rows', name: 'Short Rows', complexity: 0.6 },
];

/**
 * The PatternTechniqueList component displays technique chips for a pattern.
 *
 * ## Features
 * - Configurable maximum visible techniques
 * - Overflow indicator showing remaining count
 * - Optional click handler for filtering by technique
 * - Two size variants for different contexts
 *
 * ## Usage
 * Used primarily in PatternCard components, but can also be used in
 * pattern detail views or filter panels.
 */
const meta: Meta<typeof PatternTechniqueList> = {
  title: 'Patterns/Molecules/PatternTechniqueList',
  component: PatternTechniqueList,
  tags: ['autodocs'],
  args: {
    onTechniqueClick: fn(),
  },
  argTypes: {
    techniques: {
      control: 'object',
      description: 'Array of techniques to display',
    },
    maxVisible: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum techniques to show before collapsing',
      table: {
        defaultValue: { summary: '3' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'default'],
      description: 'Size variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Displays technique chips with overflow handling. Commonly used in pattern cards.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PatternTechniqueList>;

// ============================================================================
// BASIC VARIANTS
// ============================================================================

export const Default: Story = {
  args: {
    techniques: sampleTechniques.slice(0, 3),
  },
};

export const FewTechniques: Story = {
  args: {
    techniques: sampleTechniques.slice(0, 2),
  },
  parameters: {
    docs: {
      description: {
        story: 'When fewer techniques than maxVisible, all are shown without overflow.',
      },
    },
  },
};

export const ManyTechniques: Story = {
  args: {
    techniques: sampleTechniques,
    maxVisible: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'When more techniques than maxVisible, shows "+N more" indicator.',
      },
    },
  },
};

export const SingleTechnique: Story = {
  args: {
    techniques: [sampleTechniques[0]],
  },
};

// ============================================================================
// SIZE VARIANTS
// ============================================================================

export const SizeSmall: Story = {
  args: {
    techniques: sampleTechniques.slice(0, 3),
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact size for tight spaces like compact cards or dense layouts.',
      },
    },
  },
};

export const SizeDefault: Story = {
  args: {
    techniques: sampleTechniques.slice(0, 3),
    size: 'default',
  },
};

// ============================================================================
// CONFIGURATION VARIANTS
// ============================================================================

export const MaxVisible5: Story = {
  args: {
    techniques: sampleTechniques,
    maxVisible: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Showing up to 5 techniques before collapsing.',
      },
    },
  },
};

export const MaxVisible1: Story = {
  args: {
    techniques: sampleTechniques,
    maxVisible: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal view showing only 1 technique with overflow count.',
      },
    },
  },
};

// ============================================================================
// INTERACTIVE
// ============================================================================

export const Clickable: Story = {
  args: {
    techniques: sampleTechniques.slice(0, 3),
    onTechniqueClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'When onTechniqueClick is provided, chips become clickable. Check the Actions panel.',
      },
    },
  },
};

// ============================================================================
// EDGE CASES
// ============================================================================

export const Empty: Story = {
  args: {
    techniques: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty techniques array renders nothing.',
      },
    },
  },
};

export const LongTechniqueNames: Story = {
  args: {
    techniques: [
      { id: 'long1', name: 'German Short Rows', complexity: 0.6 },
      { id: 'long2', name: 'Stranded Colorwork', complexity: 0.7 },
      { id: 'long3', name: 'Provisional Cast On', complexity: 0.5 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Handles longer technique names gracefully.',
      },
    },
  },
};

// ============================================================================
// CONTEXT SHOWCASE
// ============================================================================

export const InCardContext: Story = {
  render: () => (
    <div className="p-4 bg-card rounded-xl border space-y-3">
      <h3 className="font-semibold">Classic Cable Sweater</h3>
      <PatternTechniqueList techniques={sampleTechniques} maxVisible={3} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Technique list shown in the context of a pattern card.',
      },
    },
  },
};

export const CompactComparison: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Default size</p>
        <PatternTechniqueList techniques={sampleTechniques.slice(0, 3)} size="default" />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Small size</p>
        <PatternTechniqueList techniques={sampleTechniques.slice(0, 3)} size="sm" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of size variants side by side.',
      },
    },
  },
};
