'use client';

// src/components/patterns/PatternTechniqueList.tsx
// Displays a list of technique chips for a pattern, with overflow handling

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { PatternTechnique } from '@/types/pattern';

export interface PatternTechniqueListProps {
  /** List of techniques to display */
  techniques: PatternTechnique[];
  /** Maximum number of techniques to show before collapsing */
  maxVisible?: number;
  /** Size variant */
  size?: 'sm' | 'default';
  /** Additional className */
  className?: string;
  /** Callback when a technique is clicked */
  onTechniqueClick?: (technique: PatternTechnique) => void;
}

export function PatternTechniqueList({
  techniques,
  maxVisible = 3,
  size = 'default',
  className,
  onTechniqueClick,
}: PatternTechniqueListProps) {
  if (!techniques || techniques.length === 0) {
    return null;
  }

  const visibleTechniques = techniques.slice(0, maxVisible);
  const remainingCount = techniques.length - maxVisible;
  const hasMore = remainingCount > 0;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0',
    default: 'text-xs px-2 py-0.5',
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {visibleTechniques.map((technique) => (
        <Badge
          key={technique.id}
          variant="secondary"
          className={cn(
            'bg-muted/60 text-muted-foreground hover:bg-muted transition-colors cursor-default',
            sizeClasses[size],
            onTechniqueClick && 'cursor-pointer hover:bg-muted/80'
          )}
          onClick={
            onTechniqueClick
              ? (e) => {
                  e.stopPropagation();
                  onTechniqueClick(technique);
                }
              : undefined
          }
        >
          {technique.name}
        </Badge>
      ))}
      {hasMore && (
        <Badge
          variant="secondary"
          className={cn(
            'bg-transparent text-muted-foreground/70 hover:bg-muted/40 transition-colors',
            sizeClasses[size]
          )}
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
