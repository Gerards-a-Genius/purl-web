// src/stories/atoms/Progress.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

/**
 * Progress bars visualize completion status in Purl.
 * They're essential for tracking project progress, step completion, and row counts.
 *
 * ## Use Cases
 * - Project overall progress (e.g., 45% complete)
 * - Step completion within a section
 * - Row progress (e.g., 12 of 24 rows)
 * - Learning module progress
 *
 * ## Design Notes
 * - Uses Purl's copper color for the progress indicator
 * - Background uses copper with 20% opacity for visual harmony
 * - Height is 8px by default (2 Tailwind units)
 *
 * ## Accessibility
 * - Progress bars should include aria-label or aria-labelledby
 * - Consider adding text representation for screen readers
 */
const meta: Meta<typeof Progress> = {
  title: 'Atoms/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
      table: {
        defaultValue: { summary: '0' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Visual progress indicator for tracking completion status.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

// ============================================================================
// BASIC PROGRESS VALUES
// ============================================================================

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const QuarterComplete: Story = {
  args: {
    value: 25,
  },
};

export const HalfComplete: Story = {
  args: {
    value: 50,
  },
};

export const ThreeQuartersComplete: Story = {
  args: {
    value: 75,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

// ============================================================================
// ANIMATED PROGRESS
// ============================================================================

export const Animated: Story = {
  render: function AnimatedProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 5;
        });
      }, 200);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="w-full max-w-sm space-y-2">
        <Progress value={progress} />
        <p className="text-caption text-muted-foreground text-center">
          {progress}% complete
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with animated value change.',
      },
    },
  },
};

// ============================================================================
// SIZES (CUSTOM)
// ============================================================================

export const Thin: Story = {
  args: {
    value: 60,
    className: 'h-1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Thin progress bar (4px height) for subtle indicators.',
      },
    },
  },
};

export const Default: Story = {
  args: {
    value: 60,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default height (8px) for standard use.',
      },
    },
  },
};

export const Thick: Story = {
  args: {
    value: 60,
    className: 'h-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'Thick progress bar (16px height) for prominent display.',
      },
    },
  },
};

// ============================================================================
// WITH LABELS
// ============================================================================

export const WithPercentage: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex justify-between text-body-small">
        <span>Project Progress</span>
        <span className="text-muted-foreground">67%</span>
      </div>
      <Progress value={67} />
    </div>
  ),
};

export const WithRowCount: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex justify-between text-body-small">
        <span>Rows Completed</span>
        <span className="text-muted-foreground">18 of 24</span>
      </div>
      <Progress value={(18 / 24) * 100} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'How progress is displayed for row tracking in Purl.',
      },
    },
  },
};

export const WithStepCount: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-2">
      <div className="flex justify-between text-body-small">
        <span>Steps Completed</span>
        <span className="text-muted-foreground">5 of 12</span>
      </div>
      <Progress value={(5 / 12) * 100} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'How progress is displayed for step tracking in projects.',
      },
    },
  },
};

// ============================================================================
// PROJECT PROGRESS EXAMPLES
// ============================================================================

export const ProjectNotStarted: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-1">
      <p className="text-body-small font-medium">Winter Scarf</p>
      <Progress value={0} className="h-1.5" />
      <p className="text-caption text-muted-foreground">Not started</p>
    </div>
  ),
};

export const ProjectInProgress: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-1">
      <p className="text-body-small font-medium">Cable Knit Sweater</p>
      <Progress value={35} className="h-1.5" />
      <p className="text-caption text-muted-foreground">35% complete - Row 42 of 120</p>
    </div>
  ),
};

export const ProjectAlmostDone: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-1">
      <p className="text-body-small font-medium">Baby Blanket</p>
      <Progress value={92} className="h-1.5" />
      <p className="text-caption text-muted-foreground">92% complete - Finishing touches!</p>
    </div>
  ),
};

export const ProjectComplete: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-1">
      <p className="text-body-small font-medium">Summer Tank Top</p>
      <Progress value={100} className="h-1.5" />
      <p className="text-caption text-muted-foreground">Completed!</p>
    </div>
  ),
};

// ============================================================================
// MULTIPLE PROGRESS BARS
// ============================================================================

export const MultipleProjects: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-body-small">
          <span>Cable Knit Sweater</span>
          <span className="text-muted-foreground">35%</span>
        </div>
        <Progress value={35} className="h-1.5" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-body-small">
          <span>Baby Blanket</span>
          <span className="text-muted-foreground">92%</span>
        </div>
        <Progress value={92} className="h-1.5" />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-body-small">
          <span>Winter Scarf</span>
          <span className="text-muted-foreground">0%</span>
        </div>
        <Progress value={0} className="h-1.5" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple progress bars for project list overview.',
      },
    },
  },
};

// ============================================================================
// LEARNING PROGRESS
// ============================================================================

export const TechniqueModuleProgress: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-3">
      <p className="text-body font-medium">Cable Knitting Basics</p>
      <div className="space-y-2">
        <div className="flex justify-between text-caption">
          <span>Module Progress</span>
          <span className="text-muted-foreground">3 of 5 lessons</span>
        </div>
        <Progress value={60} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress indicator for learning modules.',
      },
    },
  },
};
