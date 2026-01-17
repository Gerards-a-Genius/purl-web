// src/components/dashboard/AiTipCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AiTipCard } from './AiTipCard';

// Mock ViewTransitionLink since it uses Next.js router
vi.mock('@/components/common/ViewTransitionLink', () => ({
  ViewTransitionLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AiTipCard', () => {
  it('renders AI Tip label', () => {
    render(<AiTipCard />);
    expect(screen.getByText('AI Tip')).toBeInTheDocument();
  });

  it('renders a tip message', () => {
    const { container } = render(<AiTipCard />);
    // Should contain paragraph with tip content
    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent?.length).toBeGreaterThan(10);
  });

  it('renders a link to learn more', () => {
    render(<AiTipCard />);
    // There should be a link in the component
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('link points to learn section', () => {
    render(<AiTipCard />);
    const links = screen.getAllByRole('link');
    const learnLink = links.find(link =>
      link.getAttribute('href')?.includes('/learn')
    );
    expect(learnLink).toBeDefined();
  });

  it('renders Sparkles icon', () => {
    const { container } = render(<AiTipCard />);
    // Lucide icons render as SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('renders arrow icon for link', () => {
    const { container } = render(<AiTipCard />);
    // Should have at least 2 SVGs (Sparkles + ArrowRight)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('has consistent tip selection for same day', () => {
    // Render twice - should show same tip
    const { rerender } = render(<AiTipCard />);
    const tipText1 = screen.getByRole('link').textContent;

    rerender(<AiTipCard />);
    const tipText2 = screen.getByRole('link').textContent;

    expect(tipText1).toBe(tipText2);
  });
});
