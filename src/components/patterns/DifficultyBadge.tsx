'use client';

// src/components/patterns/DifficultyBadge.tsx
// Color-coded badge showing pattern difficulty level

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { PatternDifficulty } from '@/types/pattern';
import { DIFFICULTY_LABELS } from '@/types/pattern';

/**
 * Difficulty color progression (warm color palette):
 * - Beginner: Olive green (encouraging, approachable)
 * - Easy: Light olive (still welcoming)
 * - Intermediate: Caramel (warm neutral)
 * - Advanced: Copper (brand accent, attention-grabbing)
 * - Expert: Chestnut (deep, impressive)
 */
const difficultyBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      difficulty: {
        beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        easy: 'bg-olive-light/20 text-olive dark:bg-olive/20 dark:text-olive-light',
        intermediate:
          'bg-caramel-light/30 text-caramel-dark dark:bg-caramel/20 dark:text-caramel-light',
        advanced:
          'bg-copper-light/30 text-copper-dark dark:bg-copper/20 dark:text-copper-light',
        expert:
          'bg-chestnut-light/20 text-chestnut dark:bg-chestnut/20 dark:text-chestnut-light',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      difficulty: 'beginner',
      size: 'default',
    },
  }
);

export interface DifficultyBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof difficultyBadgeVariants> {
  /** The difficulty level to display */
  difficulty: PatternDifficulty;
  /** Whether to show the label text (default: true) */
  showLabel?: boolean;
  /** Custom label override */
  label?: string;
}

export function DifficultyBadge({
  difficulty,
  size,
  showLabel = true,
  label,
  className,
  ...props
}: DifficultyBadgeProps) {
  const displayLabel = label ?? DIFFICULTY_LABELS[difficulty];

  return (
    <span
      className={cn(difficultyBadgeVariants({ difficulty, size, className }))}
      data-difficulty={difficulty}
      {...props}
    >
      {showLabel && displayLabel}
    </span>
  );
}

// Export variants for external use/testing
export { difficultyBadgeVariants };
