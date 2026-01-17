'use client';

// src/components/patterns/PatternLibraryGrid.tsx
// Pinterest-style masonry grid for displaying pattern cards

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { PatternCard } from './PatternCard';
import { PatternCardSkeleton } from './PatternCardSkeleton';
import type { PatternCardData, PatternTechnique } from '@/types/pattern';
import { BookOpen } from 'lucide-react';

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface PatternLibraryGridProps {
  /** Patterns to display */
  patterns: PatternCardData[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Number of skeleton cards to show when loading */
  skeletonCount?: number;
  /** Callback when a pattern card is clicked */
  onPatternClick?: (patternId: string) => void;
  /** Callback when favorite is toggled */
  onFavoriteToggle?: (patternId: string) => void;
  /** Callback when share is clicked */
  onShare?: (patternId: string) => void;
  /** Callback when "use template" is clicked */
  onUseTemplate?: (patternId: string) => void;
  /** Callback when a technique tag is clicked */
  onTechniqueClick?: (technique: PatternTechnique) => void;
  /** Enable View Transitions API for smooth navigation animations */
  enableViewTransition?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional className */
  className?: string;
}

export function PatternLibraryGrid({
  patterns,
  isLoading = false,
  skeletonCount = 12,
  onPatternClick,
  onFavoriteToggle,
  onShare,
  onUseTemplate,
  onTechniqueClick,
  enableViewTransition = false,
  emptyMessage = 'No patterns found',
  className,
}: PatternLibraryGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'columns-2 gap-4 space-y-4',
          'sm:columns-2 sm:gap-4',
          'md:columns-3 md:gap-5',
          'lg:columns-4 lg:gap-6',
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <div key={idx} className="break-inside-avoid mb-4 sm:mb-4 md:mb-5 lg:mb-6">
            <PatternCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!patterns || patterns.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-16 px-4',
          'text-center',
          className
        )}
      >
        <div className="rounded-full bg-muted p-4 mb-4">
          <BookOpen className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Try adjusting your search or filters to find more patterns.
        </p>
      </div>
    );
  }

  // Main grid
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'columns-2 gap-4 space-y-4',
        'sm:columns-2 sm:gap-4',
        'md:columns-3 md:gap-5',
        'lg:columns-4 lg:gap-6',
        className
      )}
    >
      {patterns.map((pattern) => (
        <motion.div
          key={pattern.id}
          variants={itemVariants}
          className="break-inside-avoid mb-4 sm:mb-4 md:mb-5 lg:mb-6"
        >
          <PatternCard
            pattern={pattern}
            onClick={onPatternClick}
            onFavoriteToggle={onFavoriteToggle}
            onShare={onShare}
            onUseTemplate={onUseTemplate}
            onTechniqueClick={onTechniqueClick}
            enableViewTransition={enableViewTransition}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// RESPONSIVE GRID VARIANT (CSS Grid instead of columns)
// For use cases where equal-height cards are preferred
// ============================================================================

export interface PatternGridRegularProps extends PatternLibraryGridProps {
  /** Number of columns (overrides responsive defaults) */
  columns?: 2 | 3 | 4 | 5 | 6;
}

export function PatternGridRegular({
  patterns,
  isLoading = false,
  skeletonCount = 8,
  columns,
  onPatternClick,
  onFavoriteToggle,
  onShare,
  onUseTemplate,
  onTechniqueClick,
  enableViewTransition = false,
  emptyMessage = 'No patterns found',
  className,
}: PatternGridRegularProps) {
  const gridCols = columns
    ? `grid-cols-${columns}`
    : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:gap-5 lg:gap-6', gridCols, className)}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <PatternCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!patterns || patterns.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-16 px-4',
          'text-center',
          className
        )}
      >
        <div className="rounded-full bg-muted p-4 mb-4">
          <BookOpen className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Try adjusting your search or filters to find more patterns.
        </p>
      </div>
    );
  }

  // Main grid
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('grid gap-4 md:gap-5 lg:gap-6', gridCols, className)}
    >
      {patterns.map((pattern) => (
        <motion.div key={pattern.id} variants={itemVariants}>
          <PatternCard
            pattern={pattern}
            onClick={onPatternClick}
            onFavoriteToggle={onFavoriteToggle}
            onShare={onShare}
            onUseTemplate={onUseTemplate}
            onTechniqueClick={onTechniqueClick}
            enableViewTransition={enableViewTransition}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
