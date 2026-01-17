// src/hooks/useViewTransition.ts
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';

/**
 * Check if View Transitions API is supported
 */
function supportsViewTransitions(): boolean {
  return (
    typeof document !== 'undefined' &&
    'startViewTransition' in document
  );
}

/**
 * useViewTransition - Hook for smooth page transitions
 *
 * Uses the native View Transitions API (Chrome 111+, Safari 18+) when available,
 * with graceful fallback to instant navigation for unsupported browsers.
 *
 * @example
 * const { navigateWithTransition, isTransitioning } = useViewTransition();
 * navigateWithTransition('/projects/123');
 */
export function useViewTransition() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /**
   * Navigate to a URL with a view transition animation
   */
  const navigateWithTransition = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      const navigate = () => {
        if (options?.replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
      };

      // Check for View Transitions API support
      if (supportsViewTransitions()) {
        // Use View Transitions API with React transition
        startTransition(() => {
          (document as any).startViewTransition(() => {
            navigate();
          });
        });
      } else {
        // Fallback: navigate without transition
        startTransition(() => {
          navigate();
        });
      }
    },
    [router]
  );

  return {
    navigateWithTransition,
    isTransitioning: isPending,
    supportsViewTransitions: supportsViewTransitions(),
  };
}
