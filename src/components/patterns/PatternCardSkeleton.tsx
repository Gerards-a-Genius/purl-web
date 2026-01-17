'use client';

// src/components/patterns/PatternCardSkeleton.tsx
// Skeleton loading placeholder for pattern cards

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface PatternCardSkeletonProps {
  /** Variant for different display contexts */
  variant?: 'default' | 'compact';
  /** Additional className */
  className?: string;
}

export function PatternCardSkeleton({
  variant = 'default',
  className,
}: PatternCardSkeletonProps) {
  const isCompact = variant === 'compact';

  return (
    <Card
      className={cn(
        'overflow-hidden border-0 bg-card',
        isCompact ? 'rounded-lg' : 'rounded-xl',
        className
      )}
    >
      {/* Image skeleton */}
      <Skeleton
        className={cn(
          'w-full',
          isCompact ? 'aspect-square' : 'aspect-[3/4]'
        )}
      />

      {/* Content skeleton */}
      <div className={cn('p-3 space-y-2', isCompact && 'p-2 space-y-1.5')}>
        {/* Title skeleton */}
        <Skeleton className={cn('h-5 w-4/5', isCompact && 'h-4')} />
        {!isCompact && <Skeleton className="h-4 w-1/2" />}

        {/* Yarn weight skeleton */}
        {!isCompact && <Skeleton className="h-3 w-1/3" />}

        {/* Technique chips skeleton */}
        <div className="flex gap-1.5">
          <Skeleton className={cn('h-5 w-14 rounded-full', isCompact && 'h-4 w-10')} />
          <Skeleton className={cn('h-5 w-16 rounded-full', isCompact && 'h-4 w-12')} />
          {!isCompact && <Skeleton className="h-5 w-12 rounded-full" />}
        </div>
      </div>
    </Card>
  );
}
