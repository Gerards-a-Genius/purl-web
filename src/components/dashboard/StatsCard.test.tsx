// src/components/dashboard/StatsCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard, StatsCardSkeleton } from './StatsCard';
import type { Project } from '@/types/project';

// Mock ViewTransitionLink since it uses Next.js router
vi.mock('@/components/common/ViewTransitionLink', () => ({
  ViewTransitionLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('StatsCard', () => {
  const mockProjects: Project[] = [
    {
      id: '1',
      userId: 'user-1',
      name: 'Sweater',
      status: 'in_progress',
      needles: '5mm',
      yarn: 'Wool',
      techniques: [],
      currentStepIndex: 2,
      totalRows: 100,
      totalTimeSpent: 3600000, // 1 hour
      createdAt: new Date().toISOString(),
      lastWorkedAt: new Date().toISOString(), // Today
    },
    {
      id: '2',
      userId: 'user-1',
      name: 'Beanie',
      status: 'in_progress',
      needles: '4mm',
      yarn: 'Wool',
      techniques: [],
      currentStepIndex: 5,
      totalRows: 50,
      totalTimeSpent: 1800000, // 30 min
      createdAt: new Date().toISOString(),
      lastWorkedAt: new Date().toISOString(), // Today
    },
    {
      id: '3',
      userId: 'user-1',
      name: 'Scarf',
      status: 'finished',
      needles: '6mm',
      yarn: 'Acrylic',
      techniques: [],
      currentStepIndex: 4,
      totalRows: 200,
      createdAt: new Date().toISOString(),
    },
  ];

  it('renders loading skeleton when isLoading is true', () => {
    render(<StatsCard projects={undefined} isLoading={true} />);
    // Skeleton renders divs with data-slot="skeleton" attribute
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders stats when projects are provided', () => {
    render(<StatsCard projects={mockProjects} isLoading={false} />);
    // Should show "This Week" label
    expect(screen.getByText('This Week')).toBeInTheDocument();
    // Should show "Active" label
    expect(screen.getByText('Active')).toBeInTheDocument();
    // Should show "Done" label
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('displays correct active project count', () => {
    render(<StatsCard projects={mockProjects} isLoading={false} />);
    // 2 in_progress projects
    const activeCount = screen.getAllByText('2');
    expect(activeCount.length).toBeGreaterThan(0);
  });

  it('displays correct finished project count', () => {
    render(<StatsCard projects={mockProjects} isLoading={false} />);
    // 1 finished project
    const finishedCount = screen.getAllByText('1');
    expect(finishedCount.length).toBeGreaterThan(0);
  });

  it('handles empty projects array', () => {
    render(<StatsCard projects={[]} isLoading={false} />);
    // Should show 0 for active and done
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  it('handles undefined projects', () => {
    render(<StatsCard projects={undefined} isLoading={false} />);
    // Should show 0 for stats
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  it('calculates time from recent projects only', () => {
    // Create projects with old lastWorkedAt
    const oldProjects: Project[] = [
      {
        id: '1',
        userId: 'user-1',
        name: 'Old Project',
        status: 'in_progress',
        needles: '5mm',
        yarn: 'Wool',
        techniques: [],
        currentStepIndex: 2,
        totalRows: 100,
        totalTimeSpent: 36000000, // 10 hours - should NOT count
        createdAt: new Date().toISOString(),
        lastWorkedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      },
    ];

    render(<StatsCard projects={oldProjects} isLoading={false} />);
    // Time should be 0 since no projects worked on this week
    expect(screen.getByText('0m')).toBeInTheDocument();
  });
});

describe('StatsCardSkeleton', () => {
  it('renders skeleton elements', () => {
    render(<StatsCardSkeleton />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has proper structure for skeleton', () => {
    const { container } = render(<StatsCardSkeleton />);
    // Should have container with flex layout
    const flexContainer = container.querySelector('.flex');
    expect(flexContainer).toBeInTheDocument();
  });
});
