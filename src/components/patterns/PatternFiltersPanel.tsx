'use client';

// src/components/patterns/PatternFiltersPanel.tsx
// Filter panel for the pattern library (sidebar or sheet)

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterGroup, type FilterOption } from './FilterGroup';
import { FilterChipList, type FilterChip } from './FilterChipList';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  DIFFICULTY_LABELS,
  TYPE_LABELS,
  CATEGORY_LABELS,
  YARN_WEIGHT_LABELS,
  type PatternFilters,
  type PatternDifficulty,
  type PatternType,
  type PatternCategory,
  type YarnWeight,
} from '@/types/pattern';

// ============================================================================
// FILTER OPTIONS
// ============================================================================

const difficultyOptions: FilterOption[] = (
  Object.entries(DIFFICULTY_LABELS) as [PatternDifficulty, string][]
).map(([id, label]) => ({ id, label }));

const typeOptions: FilterOption[] = (
  Object.entries(TYPE_LABELS) as [PatternType, string][]
).map(([id, label]) => ({ id, label }));

const categoryOptions: FilterOption[] = (
  Object.entries(CATEGORY_LABELS) as [PatternCategory, string][]
).map(([id, label]) => ({ id, label }));

const yarnWeightOptions: FilterOption[] = (
  Object.entries(YARN_WEIGHT_LABELS) as [YarnWeight, string][]
).map(([id, label]) => ({ id, label }));

// ============================================================================
// TYPES
// ============================================================================

export interface PatternFiltersPanelProps {
  /** Current filter values */
  filters: PatternFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: PatternFilters) => void;
  /** Available technique options */
  techniqueOptions?: FilterOption[];
  /** Whether the panel is open (for sheet mode) */
  isOpen?: boolean;
  /** Callback when open state changes (for sheet mode) */
  onOpenChange?: (open: boolean) => void;
  /** Display mode */
  mode?: 'sidebar' | 'sheet';
  /** Additional className */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function filtersToChips(filters: PatternFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  filters.difficulty?.forEach((d) => {
    chips.push({
      id: d,
      label: DIFFICULTY_LABELS[d],
      category: 'difficulty',
      value: d,
    });
  });

  filters.type?.forEach((t) => {
    chips.push({
      id: t,
      label: TYPE_LABELS[t],
      category: 'type',
      value: t,
    });
  });

  filters.category?.forEach((c) => {
    chips.push({
      id: c,
      label: CATEGORY_LABELS[c],
      category: 'category',
      value: c,
    });
  });

  filters.yarnWeight?.forEach((y) => {
    chips.push({
      id: y,
      label: YARN_WEIGHT_LABELS[y],
      category: 'yarnWeight',
      value: y,
    });
  });

  filters.techniques?.forEach((t) => {
    chips.push({
      id: t,
      label: t, // Will be replaced with actual name if techniqueOptions provided
      category: 'technique',
      value: t,
    });
  });

  return chips;
}

function countActiveFilters(filters: PatternFilters): number {
  return (
    (filters.difficulty?.length || 0) +
    (filters.type?.length || 0) +
    (filters.category?.length || 0) +
    (filters.yarnWeight?.length || 0) +
    (filters.techniques?.length || 0)
  );
}

// ============================================================================
// FILTER CONTENT (shared between sidebar and sheet)
// ============================================================================

interface FilterContentProps {
  filters: PatternFilters;
  onFiltersChange: (filters: PatternFilters) => void;
  techniqueOptions?: FilterOption[];
}

function FilterContent({
  filters,
  onFiltersChange,
  techniqueOptions = [],
}: FilterContentProps) {
  const updateFilter = <K extends keyof PatternFilters>(
    key: K,
    value: PatternFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Pattern Type */}
      <FilterGroup
        title="Pattern Type"
        options={typeOptions}
        selected={filters.type || []}
        onChange={(selected) => updateFilter('type', selected as PatternType[])}
        variant="button"
      />

      <Separator />

      {/* Difficulty */}
      <FilterGroup
        title="Difficulty"
        options={difficultyOptions}
        selected={filters.difficulty || []}
        onChange={(selected) =>
          updateFilter('difficulty', selected as PatternDifficulty[])
        }
      />

      <Separator />

      {/* Category */}
      <FilterGroup
        title="Category"
        options={categoryOptions}
        selected={filters.category || []}
        onChange={(selected) => updateFilter('category', selected as PatternCategory[])}
        defaultOpen={false}
      />

      <Separator />

      {/* Yarn Weight */}
      <FilterGroup
        title="Yarn Weight"
        options={yarnWeightOptions}
        selected={filters.yarnWeight || []}
        onChange={(selected) => updateFilter('yarnWeight', selected as YarnWeight[])}
        defaultOpen={false}
      />

      {/* Techniques (if options provided) */}
      {techniqueOptions.length > 0 && (
        <>
          <Separator />
          <FilterGroup
            title="Techniques"
            options={techniqueOptions}
            selected={filters.techniques || []}
            onChange={(selected) => updateFilter('techniques', selected)}
            defaultOpen={false}
          />
        </>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PatternFiltersPanel({
  filters,
  onFiltersChange,
  techniqueOptions = [],
  isOpen = false,
  onOpenChange,
  mode = 'sheet',
  className,
}: PatternFiltersPanelProps) {
  const activeCount = countActiveFilters(filters);
  const chips = filtersToChips(filters);

  const handleClearAll = () => {
    onFiltersChange({});
  };

  const handleRemoveChip = (chip: FilterChip) => {
    const key = chip.category as keyof PatternFilters;
    const current = filters[key] as string[] | undefined;
    if (current) {
      onFiltersChange({
        ...filters,
        [key]: current.filter((v) => v !== chip.value),
      });
    }
  };

  // Sidebar mode
  if (mode === 'sidebar') {
    return (
      <aside
        className={cn(
          'w-[280px] flex-shrink-0 bg-card rounded-xl border p-4',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 text-xs text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="mb-4">
            <FilterChipList
              chips={chips}
              onRemove={handleRemoveChip}
              showClearAll={false}
            />
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-250px)]">
          <FilterContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            techniqueOptions={techniqueOptions}
          />
        </ScrollArea>
      </aside>
    );
  }

  // Sheet mode (mobile-friendly)
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'relative gap-2',
            activeCount > 0 && 'border-copper text-copper'
          )}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-copper text-white text-xs font-medium">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="py-4 border-b">
            <FilterChipList
              chips={chips}
              onRemove={handleRemoveChip}
              onClearAll={handleClearAll}
            />
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-200px)] py-4">
          <FilterContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            techniqueOptions={techniqueOptions}
          />
        </ScrollArea>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button variant="outline" onClick={handleClearAll} className="flex-1">
            Clear all
          </Button>
          <Button
            onClick={() => onOpenChange?.(false)}
            className="flex-1 bg-copper hover:bg-copper-dark"
          >
            Show results
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Export helper for external use
export { countActiveFilters, filtersToChips };
