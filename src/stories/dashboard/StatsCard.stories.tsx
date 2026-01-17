// src/stories/dashboard/StatsCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/StatsCard';
import type { Project } from '@/types/project';

/**
 * StatsCard displays crafting activity statistics on the dashboard.
 *
 * ## Features
 * - Total time spent this week
 * - Number of active (in-progress) projects
 * - Number of completed projects
 * - Loading skeleton state
 *
 * ## Usage
 * Pass an array of user projects and the component calculates stats automatically.
 */
const meta: Meta<typeof StatsCard> = {
  title: 'Dashboard/StatsCard',
  component: StatsCard,
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
        component: 'Dashboard statistics card showing crafting activity summary.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatsCard>;

// Mock project data for stories
const mockProjects: Project[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Cable Knit Sweater',
    status: 'in_progress',
    needles: '5mm Circular',
    yarn: 'Merino Wool',
    techniques: ['cable', 'stockinette'],
    currentStepIndex: 3,
    totalRows: 150,
    totalTimeSpent: 45000000, // 12.5 hours in ms
    steps: [],
    createdAt: new Date().toISOString(),
    lastWorkedAt: new Date().toISOString(), // Today
  },
  {
    id: '2',
    userId: 'user-1',
    name: 'Colorwork Beanie',
    status: 'in_progress',
    needles: '4mm DPNs',
    yarn: 'Superwash Wool',
    techniques: ['colorwork', 'ribbing'],
    currentStepIndex: 5,
    totalRows: 80,
    totalTimeSpent: 10800000, // 3 hours in ms
    steps: [],
    createdAt: new Date().toISOString(),
    lastWorkedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: '3',
    userId: 'user-1',
    name: 'Simple Scarf',
    status: 'finished',
    needles: '6mm Straight',
    yarn: 'Acrylic Blend',
    techniques: ['garter'],
    currentStepIndex: 4,
    totalRows: 200,
    totalTimeSpent: 7200000, // 2 hours in ms
    steps: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastWorkedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
  },
  {
    id: '4',
    userId: 'user-1',
    name: 'Mittens',
    status: 'finished',
    needles: '3.5mm DPNs',
    yarn: 'Worsted Weight',
    techniques: ['ribbing', 'decreases'],
    currentStepIndex: 6,
    totalRows: 60,
    totalTimeSpent: 5400000, // 1.5 hours in ms
    steps: [],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastWorkedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
  },
];

// ============================================================================
// DEFAULT STATE
// ============================================================================

export const Default: Story = {
  args: {
    projects: mockProjects,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing calculated stats from project data.',
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
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when user has no projects yet.',
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
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stats with only one active project.',
      },
    },
  },
};

// ============================================================================
// MANY COMPLETED
// ============================================================================

export const ManyCompleted: Story = {
  args: {
    projects: [
      ...mockProjects,
      {
        id: '5',
        userId: 'user-1',
        name: 'Hat',
        status: 'finished' as const,
        needles: '4mm',
        yarn: 'Cotton',
        techniques: [],
        currentStepIndex: 5,
        totalRows: 40,
        steps: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: '6',
        userId: 'user-1',
        name: 'Socks',
        status: 'finished' as const,
        needles: '2.5mm',
        yarn: 'Sock Yarn',
        techniques: [],
        currentStepIndex: 10,
        totalRows: 100,
        steps: [],
        createdAt: new Date().toISOString(),
      },
    ],
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stats showing many completed projects.',
      },
    },
  },
};

// ============================================================================
// SKELETON COMPONENT DIRECT
// ============================================================================

export const SkeletonOnly: Story = {
  args: {
    projects: undefined,
    isLoading: true,
  },
  render: () => <StatsCardSkeleton />,
  parameters: {
    docs: {
      description: {
        story: 'The skeleton component directly rendered for testing.',
      },
    },
  },
};
