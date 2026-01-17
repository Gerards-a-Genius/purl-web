'use client';

// src/components/dashboard/FeaturedPatterns.tsx
// Featured patterns widget for the dashboard

import { useMemo } from 'react';
import { ViewTransitionLink } from '@/components/common/ViewTransitionLink';
import { PatternCard } from '@/components/patterns/PatternCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { mockPatternCards } from '@/components/patterns/__mocks__/patterns';
import { BookMarked, ArrowRight } from 'lucide-react';

export interface FeaturedPatternsProps {
  /** Maximum number of patterns to show */
  limit?: number;
  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * FeaturedPatterns - Dashboard widget showing featured pattern previews
 *
 * Displays a curated selection of patterns to inspire users.
 * Links to the full Pattern Library for more exploration.
 */
export function FeaturedPatterns({
  limit = 3,
  isLoading = false,
}: FeaturedPatternsProps) {
  // Select featured patterns (in production, this would come from an API)
  const featuredPatterns = useMemo(() => {
    // For demo, rotate based on day of week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startIndex = dayOfWeek % Math.max(1, mockPatternCards.length - limit);
    return mockPatternCards.slice(startIndex, startIndex + limit);
  }, [limit]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="size-5 text-copper" />
          <h2 className="text-lg font-semibold">Discover Patterns</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-copper gap-1" asChild>
          <ViewTransitionLink href="/library">
            Browse Library
            <ArrowRight className="size-3" />
          </ViewTransitionLink>
        </Button>
      </div>

      {/* Pattern Cards */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton className="aspect-[3/4] rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featuredPatterns.map((pattern) => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              variant="compact"
              onClick={(id) => {
                // Navigate to library with pattern selected
                window.location.href = `/library?pattern=${id}`;
              }}
            />
          ))}
        </div>
      )}

      {/* CTA for empty state */}
      {!isLoading && featuredPatterns.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-2">No featured patterns available.</p>
          <Button variant="outline" asChild>
            <ViewTransitionLink href="/library">
              Explore the Library
            </ViewTransitionLink>
          </Button>
        </div>
      )}
    </div>
  );
}
