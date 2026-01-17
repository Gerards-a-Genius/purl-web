'use client';

// src/components/patterns/FilterChipList.tsx
// List of active filter chips that can be removed

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface FilterChip {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Filter category (e.g., 'difficulty', 'type', 'technique') */
  category: string;
  /** The actual filter value */
  value: string;
}

export interface FilterChipListProps {
  /** List of active filter chips */
  chips: FilterChip[];
  /** Callback when a chip is removed */
  onRemove?: (chip: FilterChip) => void;
  /** Callback to clear all filters */
  onClearAll?: () => void;
  /** Whether to show the "Clear all" button */
  showClearAll?: boolean;
  /** Additional className */
  className?: string;
}

export function FilterChipList({
  chips,
  onRemove,
  onClearAll,
  showClearAll = true,
  className,
}: FilterChipListProps) {
  if (!chips || chips.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <Badge
          key={`${chip.category}-${chip.id}`}
          variant="secondary"
          className={cn(
            'pl-2.5 pr-1 py-1 gap-1 bg-copper-light/20 text-copper-dark',
            'hover:bg-copper-light/30 transition-colors'
          )}
        >
          <span className="text-xs">{chip.label}</span>
          {onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(chip);
              }}
              className={cn(
                'rounded-full p-0.5 hover:bg-copper/20 transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              )}
              aria-label={`Remove ${chip.label} filter`}
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}

      {showClearAll && chips.length > 1 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
