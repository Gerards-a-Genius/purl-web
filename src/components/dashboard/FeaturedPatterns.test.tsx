// src/components/dashboard/FeaturedPatterns.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturedPatterns } from './FeaturedPatterns';

// Mock ViewTransitionLink since it uses Next.js router
vi.mock('@/components/common/ViewTransitionLink', () => ({
  ViewTransitionLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock the PatternCard component
vi.mock('@/components/patterns/PatternCard', () => ({
  PatternCard: ({ pattern, variant, onClick }: any) => (
    <div data-testid="pattern-card" onClick={() => onClick?.(pattern.id)}>
      <span>{pattern.title}</span>
      <span>{variant}</span>
    </div>
  ),
}));

// Mock the mock patterns data
vi.mock('@/components/patterns/__mocks__/patterns', () => ({
  mockPatternCards: [
    { id: '1', title: 'Pattern 1', description: 'Desc 1', difficulty: 'beginner' },
    { id: '2', title: 'Pattern 2', description: 'Desc 2', difficulty: 'intermediate' },
    { id: '3', title: 'Pattern 3', description: 'Desc 3', difficulty: 'advanced' },
    { id: '4', title: 'Pattern 4', description: 'Desc 4', difficulty: 'beginner' },
    { id: '5', title: 'Pattern 5', description: 'Desc 5', difficulty: 'intermediate' },
  ],
}));

describe('FeaturedPatterns', () => {
  it('renders Discover Patterns heading', () => {
    render(<FeaturedPatterns />);
    expect(screen.getByText('Discover Patterns')).toBeInTheDocument();
  });

  it('renders Browse Library link', () => {
    render(<FeaturedPatterns />);
    const link = screen.getByRole('link', { name: /browse library/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/library');
  });

  it('renders loading skeleton when isLoading is true', () => {
    render(<FeaturedPatterns limit={3} isLoading={true} />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders pattern cards when not loading', () => {
    render(<FeaturedPatterns limit={3} isLoading={false} />);
    const patternCards = screen.getAllByTestId('pattern-card');
    expect(patternCards.length).toBe(3);
  });

  it('limits patterns shown based on limit prop', () => {
    render(<FeaturedPatterns limit={2} isLoading={false} />);
    const patternCards = screen.getAllByTestId('pattern-card');
    expect(patternCards.length).toBe(2);
  });

  it('uses compact variant for PatternCard', () => {
    render(<FeaturedPatterns limit={3} isLoading={false} />);
    const patternCards = screen.getAllByTestId('pattern-card');
    // Check that variant is passed as compact
    expect(patternCards[0]).toHaveTextContent('compact');
  });

  it('renders BookMarked icon', () => {
    const { container } = render(<FeaturedPatterns />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('renders correct number of skeleton items when loading', () => {
    render(<FeaturedPatterns limit={3} isLoading={true} />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    // At least 3 skeleton containers (one per pattern)
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('defaults to 3 patterns', () => {
    render(<FeaturedPatterns isLoading={false} />);
    const patternCards = screen.getAllByTestId('pattern-card');
    expect(patternCards.length).toBe(3);
  });
});
