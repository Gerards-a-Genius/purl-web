// src/components/dashboard/ContinueProjectHero.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ContinueProjectHero,
  ContinueProjectHeroSkeleton,
  ContinueProjectHeroEmpty,
} from './ContinueProjectHero';
import type { Project, Step } from '@/types/project';

// Mock ViewTransitionLink since it uses Next.js router
vi.mock('@/components/common/ViewTransitionLink', () => ({
  ViewTransitionLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ContinueProjectHero', () => {
  const mockSteps: Step[] = [
    { id: '1', projectId: 'proj-1', type: 'single', label: '1', title: 'Cast On', description: 'Cast on stitches', completed: true, techniques: [], orderIndex: 0, createdAt: new Date().toISOString() },
    { id: '2', projectId: 'proj-1', type: 'single', label: '2', title: 'Ribbing', description: 'Work ribbing', completed: true, techniques: [], orderIndex: 1, createdAt: new Date().toISOString() },
    { id: '3', projectId: 'proj-1', type: 'single', label: '3', title: 'Body', description: 'Knit body', completed: false, techniques: [], orderIndex: 2, createdAt: new Date().toISOString() },
    { id: '4', projectId: 'proj-1', type: 'single', label: '4', title: 'Finishing', description: 'Finish up', completed: false, techniques: [], orderIndex: 3, createdAt: new Date().toISOString() },
  ];

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
    totalTimeSpent: 7200000, // 2 hours
    steps: mockSteps,
    createdAt: new Date().toISOString(),
    lastWorkedAt: new Date().toISOString(),
  };

  it('renders loading skeleton when isLoading is true', () => {
    render(<ContinueProjectHero project={undefined} isLoading={true} />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when project is null', () => {
    render(<ContinueProjectHero project={null} isLoading={false} />);
    expect(screen.getByText('Start Your Journey')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders project name', () => {
    render(<ContinueProjectHero project={mockProject} isLoading={false} />);
    expect(screen.getByText('Cable Knit Sweater')).toBeInTheDocument();
  });

  it('shows In Progress badge', () => {
    render(<ContinueProjectHero project={mockProject} isLoading={false} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('shows current step', () => {
    render(<ContinueProjectHero project={mockProject} isLoading={false} />);
    expect(screen.getByText('Step 3: Body')).toBeInTheDocument();
  });

  it('calculates and displays progress percentage', () => {
    render(<ContinueProjectHero project={mockProject} isLoading={false} />);
    // 2 of 4 steps complete = 50%
    expect(screen.getByText('50% complete')).toBeInTheDocument();
  });

  it('shows Continue button with link to steps', () => {
    render(<ContinueProjectHero project={mockProject} isLoading={false} />);
    const continueLink = screen.getByRole('link', { name: /continue/i });
    expect(continueLink).toHaveAttribute('href', '/projects/proj-1/steps');
  });

  it('displays time spent', () => {
    render(<ContinueProjectHero project={mockProject} isLoading={false} />);
    expect(screen.getByText('2h 0m')).toBeInTheDocument();
  });

  it('does not show time when totalTimeSpent is 0', () => {
    const projectNoTime = { ...mockProject, totalTimeSpent: 0 };
    render(<ContinueProjectHero project={projectNoTime} isLoading={false} />);
    expect(screen.queryByText(/\d+h \d+m/)).not.toBeInTheDocument();
  });

  it('handles project with no steps', () => {
    const projectNoSteps = { ...mockProject, steps: undefined };
    render(<ContinueProjectHero project={projectNoSteps} isLoading={false} />);
    expect(screen.getByText('Ready to continue')).toBeInTheDocument();
  });

  it('shows 0% for project with empty steps', () => {
    const projectEmptySteps = { ...mockProject, steps: [] };
    render(<ContinueProjectHero project={projectEmptySteps} isLoading={false} />);
    expect(screen.getByText('0% complete')).toBeInTheDocument();
  });
});

describe('ContinueProjectHeroSkeleton', () => {
  it('renders skeleton elements', () => {
    render(<ContinueProjectHeroSkeleton />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('ContinueProjectHeroEmpty', () => {
  it('renders empty state content', () => {
    render(<ContinueProjectHeroEmpty />);
    expect(screen.getByText('Start Your Journey')).toBeInTheDocument();
    expect(screen.getByText(/Create your first knitting project/)).toBeInTheDocument();
  });

  it('has Get Started link to wizard', () => {
    render(<ContinueProjectHeroEmpty />);
    const link = screen.getByRole('link', { name: /get started/i });
    expect(link).toHaveAttribute('href', '/projects/new/wizard');
  });

  it('shows yarn emoji', () => {
    render(<ContinueProjectHeroEmpty />);
    expect(screen.getByText('🧶')).toBeInTheDocument();
  });
});
