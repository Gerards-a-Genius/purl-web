'use client';

// src/app/(main)/library/page.tsx
// Pattern Library main page with Pinterest-style grid

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PatternLibraryGrid,
  PatternSearchBar,
  PatternFiltersPanel,
  PatternDetailModal,
  FilterChipList,
  filtersToChips,
  countActiveFilters,
} from '@/components/patterns';
import {
  mockPatternCards,
  mockPatterns,
  mockTechniques,
  searchPatterns,
  getPatternById,
} from '@/components/patterns/__mocks__/patterns';
import { useFavorites, useToggleFavorite } from '@/hooks/usePatternRepository';
import type {
  PatternFilters,
  LibraryPattern,
  PatternTechnique,
  PatternDifficulty,
  PatternType,
  PatternCategory,
  YarnWeight,
} from '@/types/pattern';
import { DIFFICULTY_ORDER } from '@/types/pattern';

/**
 * Pattern Library Page
 *
 * A Pinterest-style pattern browsing experience featuring:
 * - Masonry grid layout for visual discovery
 * - Real-time search with debouncing
 * - Multi-faceted filtering
 * - Quick pattern preview on click
 *
 * This page integrates all pattern library components into a cohesive UX.
 */
export default function LibraryPage() {
  const router = useRouter();

  // Favorites integration
  const { data: favoritesData } = useFavorites();
  const { toggleFavorite, isLoading: isFavoriteLoading } = useToggleFavorite();
  const favoritedIds = useMemo(
    () => new Set(favoritesData?.favorites.map((f) => f.patternId) ?? []),
    [favoritesData]
  );

  // Filter state
  const [filters, setFilters] = useState<PatternFilters>({});
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Selected pattern for modal
  const [selectedPattern, setSelectedPattern] = useState<LibraryPattern | null>(null);

  // Technique options for filter panel
  const techniqueOptions = useMemo(
    () =>
      mockTechniques.map((t) => ({
        id: t.id,
        label: t.name,
      })),
    []
  );

  // Filter and search patterns
  const filteredPatterns = useMemo(() => {
    let result = [...mockPatternCards];

    // Search filter
    if (filters.search) {
      const searchResults = searchPatterns(filters.search);
      const searchIds = new Set(searchResults.map((p) => p.id));
      result = result.filter((p) => searchIds.has(p.id));
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      result = result.filter((p) => filters.type!.includes(p.type));
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      result = result.filter((p) => filters.difficulty!.includes(p.difficulty));
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      result = result.filter((p) => filters.category!.includes(p.category));
    }

    // Yarn weight filter
    if (filters.yarnWeight && filters.yarnWeight.length > 0) {
      result = result.filter((p) =>
        filters.yarnWeight!.includes(p.materials.yarnWeight)
      );
    }

    // Technique filter
    if (filters.techniques && filters.techniques.length > 0) {
      result = result.filter((p) =>
        p.techniques.some((t) => filters.techniques!.includes(t.id))
      );
    }

    // Add favorite status from user's favorites
    return result.map((p) => ({
      ...p,
      isFavorited: favoritedIds.has(p.id),
    }));
  }, [filters, favoritedIds]);

  // Get chips for display
  const activeChips = useMemo(() => filtersToChips(filters), [filters]);
  const activeFilterCount = countActiveFilters(filters);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    setFilters((prev) => ({
      ...prev,
      search: query || undefined,
    }));
  }, []);

  const handlePatternClick = useCallback(
    (patternId: string) => {
      const pattern = getPatternById(patternId);
      if (pattern) {
        setSelectedPattern(pattern);
      }
    },
    []
  );

  const handleFavoriteToggle = useCallback(
    (patternId: string) => {
      const isFavorited = favoritedIds.has(patternId);
      toggleFavorite(patternId, isFavorited);
    },
    [favoritedIds, toggleFavorite]
  );

  const handleShare = useCallback((patternId: string) => {
    // TODO: Implement share functionality
    console.log('Share pattern:', patternId);
  }, []);

  const handleUseTemplate = useCallback(
    (patternId: string) => {
      // Navigate to project wizard with pattern as template
      router.push(`/projects/new/wizard?template=${patternId}`);
    },
    [router]
  );

  const handleTechniqueClick = useCallback((technique: PatternTechnique) => {
    setFilters((prev) => ({
      ...prev,
      techniques: prev.techniques
        ? [...prev.techniques, technique.id]
        : [technique.id],
    }));
  }, []);

  const handleRemoveChip = useCallback(
    (chip: { id: string; category: string; value: string }) => {
      const key = chip.category as keyof PatternFilters;
      const current = filters[key] as string[] | undefined;
      if (current) {
        setFilters({
          ...filters,
          [key]: current.filter((v) => v !== chip.value),
        });
      }
    },
    [filters]
  );

  const handleClearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Similar patterns for modal (with favorite status)
  const similarPatterns = useMemo(() => {
    if (!selectedPattern) return [];
    // Get patterns with similar techniques or category
    return mockPatternCards
      .filter(
        (p) =>
          p.id !== selectedPattern.id &&
          (p.category === selectedPattern.category ||
            p.techniques.some((t) =>
              selectedPattern.techniques.some((st) => st.id === t.id)
            ))
      )
      .slice(0, 4)
      .map((p) => ({
        ...p,
        isFavorited: favoritedIds.has(p.id),
      }));
  }, [selectedPattern, favoritedIds]);

  // Selected pattern with favorite status
  const selectedPatternWithFavorite = useMemo(() => {
    if (!selectedPattern) return null;
    return {
      ...selectedPattern,
      isFavorited: favoritedIds.has(selectedPattern.id),
    };
  }, [selectedPattern, favoritedIds]);

  return (
    <div className="py-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Pattern Library</h1>
        <p className="text-muted-foreground">
          Discover patterns for your next project. Browse by technique, difficulty, or
          use AI to find the perfect match.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <PatternSearchBar
            value={filters.search}
            onSearch={handleSearch}
            onFiltersClick={() => setIsFilterPanelOpen(true)}
            activeFilterCount={activeFilterCount}
            className="flex-1"
          />
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <FilterChipList
            chips={activeChips}
            onRemove={handleRemoveChip}
            onClearAll={handleClearAllFilters}
          />
        )}
      </div>

      {/* Main Content with optional sidebar */}
      <div className="flex gap-6">
        {/* Sidebar filters (desktop) */}
        <div className="hidden lg:block">
          <PatternFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            techniqueOptions={techniqueOptions}
            mode="sidebar"
          />
        </div>

        {/* Pattern Grid */}
        <div className="flex-1">
          {/* Results count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredPatterns.length} pattern
              {filteredPatterns.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <PatternLibraryGrid
            patterns={filteredPatterns}
            onPatternClick={handlePatternClick}
            onFavoriteToggle={handleFavoriteToggle}
            onShare={handleShare}
            onUseTemplate={handleUseTemplate}
            onTechniqueClick={handleTechniqueClick}
            emptyMessage={
              filters.search
                ? `No patterns found for "${filters.search}"`
                : 'No patterns match your filters'
            }
          />
        </div>
      </div>

      {/* Mobile Filter Panel (Sheet) */}
      <div className="lg:hidden">
        <PatternFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          techniqueOptions={techniqueOptions}
          mode="sheet"
          isOpen={isFilterPanelOpen}
          onOpenChange={setIsFilterPanelOpen}
        />
      </div>

      {/* Pattern Detail Modal */}
      <PatternDetailModal
        pattern={selectedPatternWithFavorite}
        isOpen={!!selectedPatternWithFavorite}
        onOpenChange={(open) => !open && setSelectedPattern(null)}
        onFavoriteToggle={handleFavoriteToggle}
        onShare={handleShare}
        onUseTemplate={handleUseTemplate}
        similarPatterns={similarPatterns}
        onSimilarPatternClick={handlePatternClick}
      />
    </div>
  );
}
