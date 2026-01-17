// src/components/patterns/index.ts
// Pattern Library components barrel export

// Atoms
export { DifficultyBadge, difficultyBadgeVariants } from './DifficultyBadge';
export type { DifficultyBadgeProps } from './DifficultyBadge';

// Molecules
export { PatternCard, KnittingNeedlesIcon, CrochetHookIcon } from './PatternCard';
export type { PatternCardProps } from './PatternCard';

export { PatternCardSkeleton } from './PatternCardSkeleton';
export type { PatternCardSkeletonProps } from './PatternCardSkeleton';

export { PatternQuickActions } from './PatternQuickActions';
export type { PatternQuickActionsProps } from './PatternQuickActions';

export { PatternTechniqueList } from './PatternTechniqueList';
export type { PatternTechniqueListProps } from './PatternTechniqueList';

export { FilterGroup } from './FilterGroup';
export type { FilterGroupProps, FilterOption } from './FilterGroup';

export { FilterChipList } from './FilterChipList';
export type { FilterChipListProps, FilterChip } from './FilterChipList';

// Organisms
export { PatternSearchBar } from './PatternSearchBar';
export type { PatternSearchBarProps } from './PatternSearchBar';

export {
  PatternLibraryGrid,
  PatternGridRegular,
} from './PatternLibraryGrid';
export type {
  PatternLibraryGridProps,
  PatternGridRegularProps,
} from './PatternLibraryGrid';

export {
  PatternFiltersPanel,
  countActiveFilters,
  filtersToChips,
} from './PatternFiltersPanel';
export type { PatternFiltersPanelProps } from './PatternFiltersPanel';

export { PatternDetailModal } from './PatternDetailModal';
export type { PatternDetailModalProps } from './PatternDetailModal';
