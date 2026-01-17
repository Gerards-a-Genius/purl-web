// src/stories/dashboard/ContinueProjectHero.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import {
  ContinueProjectHero,
  ContinueProjectHeroSkeleton,
  ContinueProjectHeroEmpty,
} from '@/components/dashboard/ContinueProjectHero';
import type { Project, Step } from '@/types/project';

/**
 * ContinueProjectHero is the main hero card on the dashboard showing
 * the user's most recent in-progress project.
 *
 * ## Features
 * - Displays project name and current step
 * - Shows progress bar and percentage
 * - Shows time spent on project
 * - Prominent "Continue" CTA button
 * - Empty state for new users
 * - Loading skeleton state
 *
 * ## Usage
 * Pass the most recent in-progress project and the component handles the rest.
 */
const meta: Meta<typeof ContinueProjectHero> = {
  title: 'Dashboard/ContinueProjectHero',
  component: ContinueProjectHero,
  tags: ['autodocs'],
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Show loading skeleton state',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Hero card for continuing the most recent project.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[300px] bg-gradient-to-br from-caramel-surface to-background rounded-xl p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContinueProjectHero>;

// Mock steps data
const mockSteps: Step[] = [
  { id: '1', type: 'single', label: '1', title: 'Cast On', description: 'Cast on 120 stitches', completed: true, techniques: ['cast-on'] },
  { id: '2', type: 'single', label: '2', title: 'Ribbing', description: 'Work 2x2 ribbing for 2 inches', completed: true, techniques: ['ribbing'] },
  { id: '3', type: 'single', label: '3', title: 'Body', description: 'Knit stockinette for body', completed: false, techniques: ['stockinette'] },
  { id: '4', type: 'single', label: '4', title: 'Armholes', description: 'Shape armholes', completed: false, techniques: ['decreases'] },
  { id: '5', type: 'single', label: '5', title: 'Shoulders', description: 'Shape shoulders', completed: false, techniques: ['short-rows'] },
  { id: '6', type: 'single', label: '6', title: 'Neckline', description: 'Shape neckline', completed: false, techniques: ['decreases'] },
  { id: '7', type: 'single', label: '7', title: 'Sleeves', description: 'Knit sleeves', completed: false, techniques: ['increases'] },
  { id: '8', type: 'single', label: '8', title: 'Finishing', description: 'Seam and block', completed: false, techniques: ['seaming', 'blocking'] },
];

// Mock project with steps
const mockProject: Project = {
  id: 'proj-1',
  userId: 'user-1',
  name: 'Cable Knit Sweater',
  status: 'in_progress',
  needles: '5mm Circular',
  yarn: 'Merino Wool',
  techniques: ['cable', 'stockinette'],
  currentStepIndex: 2,
  totalRows: 150,
  totalTimeSpent: 45000000, // 12.5 hours in ms
  steps: mockSteps,
  createdAt: new Date().toISOString(),
  lastWorkedAt: new Date().toISOString(),
};

// ============================================================================
// DEFAULT STATE
// ============================================================================

export const Default: Story = {
  args: {
    project: mockProject,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing an in-progress project with steps.',
      },
    },
  },
};

// ============================================================================
// LOADING STATE
// ============================================================================

export const Loading: Story = {
  args: {
    project: undefined,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading skeleton while fetching project data.',
      },
    },
  },
};

// ============================================================================
// EMPTY STATE (NO PROJECTS)
// ============================================================================

export const Empty: Story = {
  args: {
    project: null,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state for new users without projects.',
      },
    },
  },
};

// ============================================================================
// ALMOST COMPLETE
// ============================================================================

export const AlmostComplete: Story = {
  args: {
    project: {
      ...mockProject,
      name: 'Colorwork Beanie',
      totalTimeSpent: 10800000, // 3 hours
      steps: mockSteps.map((s, i) => ({ ...s, completed: i < 7 })), // 7 of 8 complete
    },
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Project that is almost complete (87.5%).',
      },
    },
  },
};

// ============================================================================
// JUST STARTED
// ============================================================================

export const JustStarted: Story = {
  args: {
    project: {
      ...mockProject,
      name: 'Fair Isle Vest',
      totalTimeSpent: 1800000, // 30 minutes
      steps: mockSteps.map((s) => ({ ...s, completed: false })), // All incomplete
    },
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Project that was just started (0% progress).',
      },
    },
  },
};

// ============================================================================
// NO TIME TRACKED
// ============================================================================

export const NoTimeTracked: Story = {
  args: {
    project: {
      ...mockProject,
      totalTimeSpent: 0,
    },
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Project without any time tracked.',
      },
    },
  },
};

// ============================================================================
// LONG PROJECT NAME
// ============================================================================

export const LongProjectName: Story = {
  args: {
    project: {
      ...mockProject,
      name: 'Traditional Irish Aran Fisherman Sweater with Complex Cables',
    },
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Project with a very long name to test text overflow.',
      },
    },
  },
};

// ============================================================================
// SKELETON COMPONENT DIRECT
// ============================================================================

export const SkeletonOnly: Story = {
  args: {
    project: undefined,
    isLoading: true,
  },
  render: () => <ContinueProjectHeroSkeleton />,
  parameters: {
    docs: {
      description: {
        story: 'The skeleton component rendered directly.',
      },
    },
  },
};

// ============================================================================
// EMPTY COMPONENT DIRECT
// ============================================================================

export const EmptyOnly: Story = {
  args: {
    project: null,
    isLoading: false,
  },
  render: () => <ContinueProjectHeroEmpty />,
  parameters: {
    docs: {
      description: {
        story: 'The empty state component rendered directly.',
      },
    },
  },
};
