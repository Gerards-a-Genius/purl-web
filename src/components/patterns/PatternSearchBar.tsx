'use client';

// src/components/patterns/PatternSearchBar.tsx
// Search bar for the pattern library with debounced input

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export interface PatternSearchBarProps {
  /** Current search query */
  value?: string;
  /** Callback when search query changes (debounced) */
  onSearch?: (query: string) => void;
  /** Callback when filters button is clicked */
  onFiltersClick?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show the filters button */
  showFiltersButton?: boolean;
  /** Number of active filters (shown as badge) */
  activeFilterCount?: number;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Additional className */
  className?: string;
}

export function PatternSearchBar({
  value = '',
  onSearch,
  onFiltersClick,
  placeholder = 'Search patterns...',
  showFiltersButton = true,
  activeFilterCount = 0,
  debounceMs = 300,
  className,
}: PatternSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch && localValue !== value) {
        onSearch(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onSearch, value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onSearch?.('');
  }, [onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [handleClear]
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'pl-10 pr-10 h-10',
            'bg-background border-muted-foreground/20',
            'focus-visible:ring-copper/50'
          )}
          aria-label="Search patterns"
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'p-0.5 rounded-full hover:bg-muted transition-colors',
              'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filters button */}
      {showFiltersButton && (
        <Button
          variant="outline"
          size="default"
          onClick={onFiltersClick}
          className={cn(
            'relative gap-2',
            activeFilterCount > 0 && 'border-copper text-copper'
          )}
        >
          <SlidersHorizontal className="size-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span
              className={cn(
                'flex items-center justify-center min-w-[18px] h-[18px] px-1',
                'rounded-full bg-copper text-white text-xs font-medium'
              )}
            >
              {activeFilterCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
