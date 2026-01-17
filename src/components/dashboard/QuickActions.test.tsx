// src/components/dashboard/QuickActions.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickActions } from './QuickActions';

// Mock ViewTransitionLink since it uses Next.js router
vi.mock('@/components/common/ViewTransitionLink', () => ({
  ViewTransitionLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('QuickActions', () => {
  it('renders Quick Actions heading', () => {
    render(<QuickActions />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders New Project link', () => {
    render(<QuickActions />);
    const link = screen.getByRole('link', { name: /new project/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/projects/new/wizard');
  });

  it('renders SOS Help link', () => {
    render(<QuickActions />);
    const link = screen.getByRole('link', { name: /sos help/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/sos');
  });

  it('renders Learn link', () => {
    render(<QuickActions />);
    const link = screen.getByRole('link', { name: /learn/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/learn');
  });

  it('has all three action buttons', () => {
    render(<QuickActions />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('renders all action links as styled buttons', () => {
    const { container } = render(<QuickActions />);
    // Button asChild renders links styled as buttons
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(3);
    // Verify links have expected hrefs
    const hrefs = Array.from(links).map(l => l.getAttribute('href'));
    expect(hrefs).toContain('/projects/new/wizard');
    expect(hrefs).toContain('/sos');
    expect(hrefs).toContain('/learn');
  });
});
