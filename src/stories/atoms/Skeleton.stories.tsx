// src/stories/atoms/Skeleton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton components provide loading placeholders that match the shape of content.
 * They give users visual feedback that content is loading without jarring layout shifts.
 *
 * ## Use Cases
 * - Project card loading states
 * - Pattern image loading
 * - Technique list loading
 * - User profile loading
 *
 * ## Design Notes
 * - Uses Purl's caramel accent color with pulse animation
 * - Rounded corners match the design system
 * - Compose multiple skeletons to match actual content layout
 */
const meta: Meta<typeof Skeleton> = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for sizing',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Animated placeholder for loading content.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

// ============================================================================
// BASIC SHAPES
// ============================================================================

export const Default: Story = {
  args: {
    className: 'h-4 w-[200px]',
  },
};

export const Text: Story = {
  args: {
    className: 'h-4 w-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'Single line text placeholder.',
      },
    },
  },
};

export const Circle: Story = {
  args: {
    className: 'h-12 w-12 rounded-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'Circular placeholder for avatars.',
      },
    },
  },
};

export const Square: Story = {
  args: {
    className: 'h-24 w-24',
  },
};

export const Rectangle: Story = {
  args: {
    className: 'h-32 w-full',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large rectangular placeholder for images or cards.',
      },
    },
  },
};

// ============================================================================
// COMPOSITION EXAMPLES
// ============================================================================

export const ProjectCardSkeleton: Story = {
  render: () => (
    <div className="w-full max-w-sm rounded-lg border border-border bg-card p-4 space-y-3">
      {/* Image placeholder */}
      <Skeleton className="h-40 w-full rounded-md" />
      {/* Title */}
      <Skeleton className="h-5 w-3/4" />
      {/* Subtitle */}
      <Skeleton className="h-4 w-1/2" />
      {/* Progress */}
      <Skeleton className="h-2 w-full" />
      {/* Meta info */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading skeleton matching the ProjectCard component.',
      },
    },
  },
};

export const TechniqueCardSkeleton: Story = {
  render: () => (
    <div className="w-full max-w-xs rounded-lg border border-border bg-card p-4 space-y-3">
      {/* Icon placeholder */}
      <Skeleton className="h-10 w-10 rounded-md" />
      {/* Title */}
      <Skeleton className="h-5 w-2/3" />
      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      {/* Badge */}
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading skeleton for technique cards.',
      },
    },
  },
};

export const UserProfileSkeleton: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <Skeleton className="h-12 w-12 rounded-full" />
      {/* Info */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ),
};

export const StepListSkeleton: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
          {/* Checkbox */}
          <Skeleton className="h-5 w-5 rounded" />
          {/* Content */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading skeleton for project step list.',
      },
    },
  },
};

export const PatternViewerSkeleton: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
      {/* Pattern image */}
      <Skeleton className="h-96 w-full rounded-lg" />
      {/* Toolbar */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading skeleton for the pattern viewer component.',
      },
    },
  },
};

// ============================================================================
// MULTIPLE LINE TEXT
// ============================================================================

export const MultiLineText: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple lines of text placeholder.',
      },
    },
  },
};

export const HeadingWithText: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-3">
      <Skeleton className="h-6 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ),
};
