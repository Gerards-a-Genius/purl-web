// src/components/common/ViewTransitionLink.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useViewTransition } from '@/hooks/useViewTransition';
import { cn } from '@/lib/utils';

interface ViewTransitionLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'onClick'> {
  /**
   * Optional view-transition-name for shared element transitions.
   * Apply the same name to the target element on the destination page.
   */
  transitionName?: string;
  /**
   * Whether to use View Transitions API. Defaults to true.
   * Set to false to disable transitions for specific links.
   */
  enableTransition?: boolean;
  /**
   * Custom onClick handler. Called before navigation.
   */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * ViewTransitionLink - Link component with View Transitions API support
 *
 * Wraps Next.js Link with smooth page transitions using the native
 * View Transitions API when available.
 *
 * @example
 * // Basic usage
 * <ViewTransitionLink href="/projects/123">
 *   View Project
 * </ViewTransitionLink>
 *
 * @example
 * // With shared element transition
 * <ViewTransitionLink
 *   href="/projects/123"
 *   transitionName="project-card-123"
 * >
 *   <ProjectCard />
 * </ViewTransitionLink>
 */
export function ViewTransitionLink({
  href,
  transitionName,
  enableTransition = true,
  onClick,
  children,
  className,
  style,
  ...props
}: ViewTransitionLinkProps) {
  const { navigateWithTransition, supportsViewTransitions } = useViewTransition();

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Call custom onClick if provided
      onClick?.(e);

      // If default prevented, don't navigate
      if (e.defaultPrevented) return;

      // If modifier keys are pressed, let the browser handle it
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Only handle left clicks
      if (e.button !== 0) return;

      // If transitions are disabled or not supported, use default Link behavior
      if (!enableTransition || !supportsViewTransitions) return;

      // Prevent default Link behavior and use view transition
      e.preventDefault();
      navigateWithTransition(href.toString());
    },
    [href, onClick, enableTransition, supportsViewTransitions, navigateWithTransition]
  );

  // Combine styles with optional view-transition-name
  const combinedStyle = React.useMemo(
    () => ({
      ...style,
      ...(transitionName && {
        viewTransitionName: transitionName,
      }),
    }),
    [style, transitionName]
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      style={combinedStyle}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * CSS utility for applying view-transition-name inline
 */
export function viewTransitionStyle(name: string): React.CSSProperties {
  return {
    viewTransitionName: name,
  } as React.CSSProperties;
}
