// src/stories/dashboard/RecentProjects.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { RecentProjects, RecentProjectsSkeleton } from '@/components/dashboard/RecentProjects';
import type { Project } from '@/types/project';

/**
 * RecentProjects displays a grid of the user's most recently worked-on projects.
 *
 * ## Features
 * - Grid layout (2 columns mobile, 4 columns desktop)
 * - Project thumbnails with progress bars
 * - Hover overlay with quick actions (Continue, View Details, Edit)
 * - "New Project" card when there's room
 * - Loading skeleton state
 * - Sorted by lastWorkedAt date
 *
 * ## Usage
 * Pass an array of projects and the component handles sorting and limiting.
 */
const meta: Meta<typeof RecentProjects> = {
  title: 'Dashboard/RecentProjects',
  component: RecentProjects,
  tags: ['autodocs'],
  argTypes: {
    limit: {
      control: { type: 'number', min: 1, max: 8 },
      description: 'Maximum number of projects to show',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading skeleton state',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Grid of recent projects with quick action overlays.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RecentProjects>;

// Mock project data for stories
const createMockProject = (
  id: string,
  name: string,
  status: 'planned' | 'in_progress' | 'finished',
  completedPercent: number,
  daysAgo: number
): Project => ({
  id,
  userId: 'user-1',
  name,
  status,
  needles: '5mm',
  yarn: 'Wool',
  techniques: [],
  currentStepIndex: Math.floor(completedPercent / 10),
  totalRows: 100,
  steps: Array.from({ length: 10 }, (_, i) => ({
    id: `step-${id}-${i}`,
    projectId: id,
    type: 'single' as const,
    label: `${i + 1}`,
    title: `Step ${i + 1}`,
    description: 'Step description',
    completed: (i + 1) <= (completedPercent / 10),
    techniques: [],
    orderIndex: i,
    createdAt: new Date().toISOString(),
  })),
  createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  lastWorkedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
});

const mockProjects: Project[] = [
  createMockProject('1', 'Cable Knit Sweater', 'in_progress', 45, 0),
  createMockProject('2', 'Colorwork Beanie', 'in_progress', 80, 1),
  createMockProject('3', 'Simple Scarf', 'finished', 100, 3),
  createMockProject('4', 'Mittens', 'in_progress', 60, 5),
  createMockProject('5', 'Fair Isle Vest', 'in_progress', 30, 7),
  createMockProject('6', 'Socks', 'finished', 100, 10),
];

// ============================================================================
// DEFAULT STATE
// ============================================================================

export const Default: Story = {
  args: {
    projects: mockProjects,
    limit: 4,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing 4 recent projects.',
      },
    },
  },
};

// ============================================================================
// LOADING STATE
// ============================================================================

export const Loading: Story = {
  args: {
    projects: undefined,
    limit: 4,
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
// EMPTY STATE
// ============================================================================

export const Empty: Story = {
  args: {
    projects: [],
    limit: 4,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state showing only the "New Project" card.',
      },
    },
  },
};

// ============================================================================
// SINGLE PROJECT
// ============================================================================

export const SingleProject: Story = {
  args: {
    projects: [mockProjects[0]],
    limit: 4,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Single project with the "New Project" card.',
      },
    },
  },
};

// ============================================================================
// TWO PROJECTS
// ============================================================================

export const TwoProjects: Story = {
  args: {
    projects: mockProjects.slice(0, 2),
    limit: 4,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Two projects with the "New Project" card.',
      },
    },
  },
};

// ============================================================================
// FULL (NO NEW CARD)
// ============================================================================

export const Full: Story = {
  args: {
    projects: mockProjects,
    limit: 4,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Full grid with all slots filled (no "New Project" card).',
      },
    },
  },
};

// ============================================================================
// SIX PROJECTS
// ============================================================================

export const SixProjects: Story = {
  args: {
    projects: mockProjects,
    limit: 6,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Grid with 6 project limit.',
      },
    },
  },
};

// ============================================================================
// SKELETON COMPONENT DIRECT
// ============================================================================

export const SkeletonOnly: Story = {
  render: () => <RecentProjectsSkeleton count={4} />,
  parameters: {
    docs: {
      description: {
        story: 'The skeleton component rendered directly.',
      },
    },
  },
};

// ============================================================================
// SKELETON 6 COUNT
// ============================================================================

export const SkeletonSix: Story = {
  render: () => <RecentProjectsSkeleton count={6} />,
  parameters: {
    docs: {
      description: {
        story: 'Skeleton with 6 items.',
      },
    },
  },
};
