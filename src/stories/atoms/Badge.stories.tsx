// src/stories/atoms/Badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Star } from 'lucide-react';

/**
 * Badges are used to highlight status, categories, or counts.
 * In Purl, they commonly indicate project status, technique difficulty, or labels.
 *
 * ## Use Cases
 * - Project status (Planned, In Progress, Finished)
 * - Technique difficulty (Beginner, Intermediate, Advanced)
 * - Category labels (Knit, Purl, Cable)
 * - Count indicators (3 steps, 12 rows)
 *
 * ## Accessibility
 * - Badges can be links when using `asChild` prop
 * - Color is not the only indicator - text provides meaning
 */
const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (for composition with links)',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Small status indicators for categorization and labeling.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// ============================================================================
// BASIC VARIANTS
// ============================================================================

export const Default: Story = {
  args: {
    children: 'In Progress',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Beginner',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Optional',
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Overdue',
    variant: 'destructive',
  },
};

// ============================================================================
// WITH ICONS
// ============================================================================

export const WithIconLeft: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <CheckCircle className="h-3 w-3" />
        Completed
      </>
    ),
  },
};

export const InProgressWithIcon: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <Clock className="h-3 w-3" />
        In Progress
      </>
    ),
  },
};

export const WarningWithIcon: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <AlertTriangle className="h-3 w-3" />
        Needs Attention
      </>
    ),
  },
};

// ============================================================================
// PROJECT STATUS BADGES
// ============================================================================

export const StatusPlanned: Story = {
  args: {
    variant: 'outline',
    children: 'Planned',
  },
  parameters: {
    docs: {
      description: {
        story: 'Used for projects that haven\'t been started yet.',
      },
    },
  },
};

export const StatusInProgress: Story = {
  args: {
    variant: 'default',
    children: 'In Progress',
  },
  parameters: {
    docs: {
      description: {
        story: 'Used for active projects currently being worked on.',
      },
    },
  },
};

export const StatusFinished: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <CheckCircle className="h-3 w-3" />
        Finished
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Used for completed projects.',
      },
    },
  },
};

// ============================================================================
// DIFFICULTY BADGES
// ============================================================================

export const DifficultyBeginner: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <Star className="h-3 w-3" />
        Beginner
      </>
    ),
  },
};

export const DifficultyIntermediate: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        <Star className="h-3 w-3" />
        <Star className="h-3 w-3" />
        Intermediate
      </>
    ),
  },
};

export const DifficultyAdvanced: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <Star className="h-3 w-3" />
        <Star className="h-3 w-3" />
        <Star className="h-3 w-3" />
        Advanced
      </>
    ),
  },
};

// ============================================================================
// TECHNIQUE CATEGORY BADGES
// ============================================================================

export const CategoryKnit: Story = {
  args: {
    variant: 'secondary',
    children: 'Knit',
  },
};

export const CategoryPurl: Story = {
  args: {
    variant: 'secondary',
    children: 'Purl',
  },
};

export const CategoryCable: Story = {
  args: {
    variant: 'secondary',
    children: 'Cable',
  },
};

// ============================================================================
// ALL VARIANTS SHOWCASE
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All badge variants side by side for comparison.',
      },
    },
  },
};

export const ProjectStatusExamples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">Planned</Badge>
      <Badge variant="default">
        <Clock className="h-3 w-3" />
        In Progress
      </Badge>
      <Badge variant="secondary">
        <CheckCircle className="h-3 w-3" />
        Finished
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'How badges are used to show project status in Purl.',
      },
    },
  },
};

export const TechniqueCategoryExamples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">Knit</Badge>
      <Badge variant="secondary">Purl</Badge>
      <Badge variant="secondary">Cast On</Badge>
      <Badge variant="secondary">Bind Off</Badge>
      <Badge variant="secondary">Cable</Badge>
      <Badge variant="secondary">Colorwork</Badge>
      <Badge variant="secondary">Lace</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'How badges are used to categorize techniques.',
      },
    },
  },
};
