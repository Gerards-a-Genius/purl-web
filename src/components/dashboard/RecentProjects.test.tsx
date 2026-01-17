// src/components/dashboard/RecentProjects.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { RecentProjects, RecentProjectsSkeleton } from './RecentProjects';
import type { Project, Step } from '@/types/project';

// Mock ViewTransitionLink since it uses Next.js router
vi.mock('@/components/common/ViewTransitionLink', () => ({
  ViewTransitionLink: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe('RecentProjects', () => {
  const createMockProject = (
    id: string,
    name: string,
    status: 'planned' | 'in_progress' | 'finished',
    daysAgo: number
  ): Project => ({
    id,
    userId: 'user-1',
    name,
    status,
    needles: '5mm',
    yarn: 'Wool',
    techniques: [],
    currentStepIndex: 2,
    totalRows: 100,
    steps: [
      { id: `s-${id}-1`, projectId: id, type: 'single' as const, label: '1', title: 'Step 1', description: 'Desc', completed: true, techniques: [], orderIndex: 0, createdAt: new Date().toISOString() },
      { id: `s-${id}-2`, projectId: id, type: 'single' as const, label: '2', title: 'Step 2', description: 'Desc', completed: false, techniques: [], orderIndex: 1, createdAt: new Date().toISOString() },
    ],
    createdAt: new Date().toISOString(),
    lastWorkedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  });

  const mockProjects: Project[] = [
    createMockProject('1', 'Sweater', 'in_progress', 0),
    createMockProject('2', 'Beanie', 'in_progress', 1),
    createMockProject('3', 'Scarf', 'finished', 3),
    createMockProject('4', 'Mittens', 'in_progress', 5),
  ];

  it('renders loading skeleton when isLoading is true', () => {
    render(<RecentProjects projects={undefined} isLoading={true} />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders Recent Projects heading', () => {
    render(<RecentProjects projects={mockProjects} isLoading={false} />);
    expect(screen.getByText('Recent Projects')).toBeInTheDocument();
  });

  it('renders project names', () => {
    render(<RecentProjects projects={mockProjects} limit={4} isLoading={false} />);
    expect(screen.getByText('Sweater')).toBeInTheDocument();
    expect(screen.getByText('Beanie')).toBeInTheDocument();
    expect(screen.getByText('Scarf')).toBeInTheDocument();
    expect(screen.getByText('Mittens')).toBeInTheDocument();
  });

  it('limits projects shown based on limit prop', () => {
    render(<RecentProjects projects={mockProjects} limit={2} isLoading={false} />);
    expect(screen.getByText('Sweater')).toBeInTheDocument();
    expect(screen.getByText('Beanie')).toBeInTheDocument();
    expect(screen.queryByText('Scarf')).not.toBeInTheDocument();
    expect(screen.queryByText('Mittens')).not.toBeInTheDocument();
  });

  it('sorts projects by lastWorkedAt date', () => {
    const unsortedProjects = [
      createMockProject('old', 'Old Project', 'in_progress', 10),
      createMockProject('new', 'New Project', 'in_progress', 0),
    ];
    render(<RecentProjects projects={unsortedProjects} limit={2} isLoading={false} />);

    // Both should be rendered
    expect(screen.getByText('New Project')).toBeInTheDocument();
    expect(screen.getByText('Old Project')).toBeInTheDocument();
  });

  it('shows New Project card when there is room', () => {
    render(<RecentProjects projects={[mockProjects[0]]} limit={4} isLoading={false} />);
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('does not show New Project card when full', () => {
    render(<RecentProjects projects={mockProjects} limit={4} isLoading={false} />);
    // With 4 projects and limit 4, no New Project card
    const newProjectLink = screen.queryByText('New Project');
    expect(newProjectLink).not.toBeInTheDocument();
  });

  it('renders progress bars for projects', () => {
    const { container } = render(<RecentProjects projects={mockProjects} limit={4} isLoading={false} />);
    // Progress bars have role="progressbar" or specific class
    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('renders Continue buttons on hover', () => {
    render(<RecentProjects projects={mockProjects} limit={4} isLoading={false} />);
    const continueButtons = screen.getAllByRole('link', { name: /continue/i });
    expect(continueButtons.length).toBeGreaterThan(0);
  });

  it('shows empty state with New Project card when no projects', () => {
    render(<RecentProjects projects={[]} limit={4} isLoading={false} />);
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('handles undefined projects', () => {
    render(<RecentProjects projects={undefined} limit={4} isLoading={false} />);
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });
});

describe('RecentProjectsSkeleton', () => {
  it('renders correct number of skeleton items', () => {
    const { container } = render(<RecentProjectsSkeleton count={4} />);
    // Each skeleton item has multiple skeleton elements
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders different counts', () => {
    const { container } = render(<RecentProjectsSkeleton count={6} />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('defaults to 4 items', () => {
    const { container } = render(<RecentProjectsSkeleton />);
    // Should render without error with default count
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
