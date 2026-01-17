// src/hooks/usePatternRepository.ts
// React Query hooks for pattern repository

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPES
// ============================================================================

export interface PatternSearchResult {
  id: string;
  title: string;
  type: string;
  category: string;
  difficulty?: string;
  techniques?: string[];
  score?: number;
}

export interface PatternSearchResponse {
  count: number;
  query: string;
  filters: Record<string, string>;
  patterns: PatternSearchResult[];
}

export interface PatternMetadata {
  id: string;
  source: string;
  title: string;
  type: 'knitting' | 'crochet' | 'machine_knit';
  category: string;
  difficulty?: {
    level: string;
    score?: number;
  };
  techniques?: Array<{ name: string; complexity?: number }>;
  materials?: {
    yarn_weight?: string;
    fiber_content?: string[];
    yardage?: number;
    needle_size?: string;
    hook_size?: string;
    notions?: string[];
  };
  gauge?: {
    stitches_per_inch?: number;
    rows_per_inch?: number;
    swatch_size?: string;
  };
  instructions_text?: string;
}

export interface SimilarPatternsResponse {
  source_pattern_id: string;
  count: number;
  similar_patterns: Array<PatternSearchResult & { similarity_score: number }>;
}

export interface TechniqueCount {
  name: string;
  count: number;
}

export interface TechniquesResponse {
  count: number;
  techniques: TechniqueCount[];
}

export interface TechniquePatterns {
  technique: string;
  count: number;
  patterns: PatternSearchResult[];
}

export interface RepositoryStats {
  total_patterns: number;
  sources: Record<string, number>;
  types: Record<string, number>;
  difficulties: Record<string, number>;
  categories: Record<string, number>;
}

export interface SearchFilters {
  type?: 'knitting' | 'crochet' | 'machine_knit';
  difficulty?: string;
  category?: string;
  limit?: number;
}

export interface Favorite {
  patternId: string;
  createdAt: string;
}

export interface FavoritesResponse {
  count: number;
  favorites: Favorite[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function searchPatterns(
  query: string,
  filters?: SearchFilters
): Promise<PatternSearchResponse> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.difficulty) params.set('difficulty', filters.difficulty);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.limit) params.set('limit', filters.limit.toString());

  const response = await fetch(`/api/patterns/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to search patterns');
  }
  return response.json();
}

async function getPattern(id: string): Promise<PatternMetadata> {
  const response = await fetch(`/api/patterns/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Pattern not found');
    }
    throw new Error('Failed to fetch pattern');
  }
  return response.json();
}

async function getSimilarPatterns(
  id: string,
  limit: number = 5
): Promise<SimilarPatternsResponse> {
  const response = await fetch(`/api/patterns/${id}/similar?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch similar patterns');
  }
  return response.json();
}

async function getTechniques(): Promise<TechniquesResponse> {
  const response = await fetch('/api/patterns/techniques');
  if (!response.ok) {
    throw new Error('Failed to fetch techniques');
  }
  return response.json();
}

async function getPatternsByTechnique(
  name: string,
  limit: number = 10
): Promise<TechniquePatterns> {
  const response = await fetch(
    `/api/patterns/techniques?name=${encodeURIComponent(name)}&limit=${limit}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch patterns by technique');
  }
  return response.json();
}

async function getStats(): Promise<RepositoryStats> {
  const response = await fetch('/api/patterns/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Search patterns in the repository
 */
export function usePatternSearch(query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: ['patterns', 'search', query, filters],
    queryFn: () => searchPatterns(query, filters),
    enabled: query.length > 0 || Object.keys(filters || {}).length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a specific pattern by ID
 */
export function usePattern(id: string | undefined) {
  return useQuery({
    queryKey: ['patterns', 'detail', id],
    queryFn: () => getPattern(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get patterns similar to a given pattern
 */
export function useSimilarPatterns(id: string | undefined, limit: number = 5) {
  return useQuery({
    queryKey: ['patterns', 'similar', id, limit],
    queryFn: () => getSimilarPatterns(id!, limit),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get all techniques with counts
 */
export function useTechniques() {
  return useQuery({
    queryKey: ['patterns', 'techniques'],
    queryFn: getTechniques,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Get patterns that use a specific technique
 */
export function usePatternsByTechnique(name: string, limit: number = 10) {
  return useQuery({
    queryKey: ['patterns', 'byTechnique', name, limit],
    queryFn: () => getPatternsByTechnique(name, limit),
    enabled: name.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get repository statistics
 */
export function useRepositoryStats() {
  return useQuery({
    queryKey: ['patterns', 'stats'],
    queryFn: getStats,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Browse all patterns (paginated)
 */
export function useBrowsePatterns(filters?: SearchFilters) {
  return useQuery({
    queryKey: ['patterns', 'browse', filters],
    queryFn: () => searchPatterns('', filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// FAVORITES API FUNCTIONS
// ============================================================================

async function getFavorites(): Promise<FavoritesResponse> {
  const response = await fetch('/api/patterns/favorites');
  if (!response.ok) {
    if (response.status === 401) {
      // Not authenticated, return empty favorites
      return { count: 0, favorites: [] };
    }
    throw new Error('Failed to fetch favorites');
  }
  return response.json();
}

async function addFavorite(patternId: string): Promise<Favorite> {
  const response = await fetch('/api/patterns/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patternId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add favorite');
  }
  const data = await response.json();
  return data.favorite;
}

async function removeFavorite(patternId: string): Promise<void> {
  const response = await fetch(`/api/patterns/favorites?patternId=${encodeURIComponent(patternId)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove favorite');
  }
}

// ============================================================================
// FAVORITES HOOKS
// ============================================================================

/**
 * Get user's favorite patterns
 */
export function useFavorites() {
  return useQuery({
    queryKey: ['patterns', 'favorites'],
    queryFn: getFavorites,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Check if a pattern is favorited
 */
export function useIsFavorited(patternId: string | undefined) {
  const { data } = useFavorites();
  if (!patternId || !data) return false;
  return data.favorites.some((f) => f.patternId === patternId);
}

/**
 * Toggle favorite status for a pattern with optimistic updates
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onMutate: async (patternId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['patterns', 'favorites'] });

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData<FavoritesResponse>(['patterns', 'favorites']);

      // Optimistically update
      if (previousFavorites) {
        queryClient.setQueryData<FavoritesResponse>(['patterns', 'favorites'], {
          count: previousFavorites.count + 1,
          favorites: [
            { patternId, createdAt: new Date().toISOString() },
            ...previousFavorites.favorites,
          ],
        });
      }

      return { previousFavorites };
    },
    onError: (err, patternId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['patterns', 'favorites'], context.previousFavorites);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['patterns', 'favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onMutate: async (patternId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['patterns', 'favorites'] });

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData<FavoritesResponse>(['patterns', 'favorites']);

      // Optimistically update
      if (previousFavorites) {
        queryClient.setQueryData<FavoritesResponse>(['patterns', 'favorites'], {
          count: Math.max(0, previousFavorites.count - 1),
          favorites: previousFavorites.favorites.filter((f) => f.patternId !== patternId),
        });
      }

      return { previousFavorites };
    },
    onError: (err, patternId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['patterns', 'favorites'], context.previousFavorites);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['patterns', 'favorites'] });
    },
  });

  return {
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    toggleFavorite: (patternId: string, isFavorited: boolean) => {
      if (isFavorited) {
        removeMutation.mutate(patternId);
      } else {
        addMutation.mutate(patternId);
      }
    },
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
