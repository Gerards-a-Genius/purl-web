// src/stores/knowledgeStore.ts
// Zustand store for knowledge base state management

import { create } from 'zustand';
import type {
  Technique,
  TechniqueCategory,
  KnowledgeGraph,
  DifficultyLevel,
} from '@/lib/knowledge/types';
import * as KnowledgeService from '@/lib/knowledge/service';

// ============================================================================
// STORE STATE TYPE
// ============================================================================

interface KnowledgeFilters {
  category: TechniqueCategory | null;
  difficulty: DifficultyLevel | null;
  searchQuery: string;
}

interface KnowledgeState {
  // Data
  techniques: Technique[];
  graph: KnowledgeGraph | null;

  // Loading states
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: KnowledgeFilters;

  // Selected items
  selectedTechniqueId: string | null;

  // Actions
  initialize: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Technique actions
  addTechnique: (technique: Technique) => Promise<void>;
  updateTechnique: (technique: Technique) => Promise<void>;
  selectTechnique: (id: string | null) => void;
  getTechniqueById: (id: string) => Technique | undefined;
  getTechniquesByCategory: (category: TechniqueCategory) => Technique[];

  // Filter actions
  setFilter: <K extends keyof KnowledgeFilters>(
    key: K,
    value: KnowledgeFilters[K]
  ) => void;
  clearFilters: () => void;
  getFilteredTechniques: () => Technique[];

  // Search
  searchTechniques: (query: string) => Technique[];

  // Stats
  getStats: () => Promise<{
    techniqueCount: number;
    abbreviationCount: number;
    graphNodeCount: number;
    graphEdgeCount: number;
  }>;

  // Clear
  clearAll: () => Promise<void>;
}

// ============================================================================
// STORE CREATION
// ============================================================================

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  // Initial state
  techniques: [],
  graph: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  filters: {
    category: null,
    difficulty: null,
    searchQuery: '',
  },
  selectedTechniqueId: null,

  // Initialize store from knowledge service
  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true, error: null });

    try {
      await KnowledgeService.initializeKnowledge();

      const [techniques, graph] = await Promise.all([
        KnowledgeService.getAllTechniques(),
        KnowledgeService.getKnowledgeGraph(),
      ]);

      set({
        techniques,
        graph,
        isInitialized: true,
        isLoading: false,
      });

      console.log(
        '[KnowledgeStore] Initialized with',
        techniques.length,
        'techniques'
      );
    } catch (error) {
      console.error('[KnowledgeStore] Initialization failed:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initialize knowledge base',
        isLoading: false,
        isInitialized: true, // Mark as initialized even on error
      });
    }
  },

  // Refresh data from service
  refreshData: async () => {
    set({ isLoading: true });

    try {
      await KnowledgeService.refreshKnowledge();

      const [techniques, graph] = await Promise.all([
        KnowledgeService.getAllTechniques(),
        KnowledgeService.getKnowledgeGraph(),
      ]);

      set({ techniques, graph, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh',
        isLoading: false,
      });
    }
  },

  // Technique actions
  addTechnique: async (technique) => {
    try {
      await KnowledgeService.saveTechnique(technique);
      const techniques = await KnowledgeService.getAllTechniques();
      const graph = await KnowledgeService.getKnowledgeGraph();
      set({ techniques, graph });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add technique',
      });
      throw error;
    }
  },

  updateTechnique: async (technique) => {
    try {
      await KnowledgeService.saveTechnique(technique);
      const techniques = await KnowledgeService.getAllTechniques();
      set({ techniques });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update technique',
      });
      throw error;
    }
  },

  selectTechnique: (id) => set({ selectedTechniqueId: id }),

  getTechniqueById: (id) => get().techniques.find((t) => t.id === id),

  getTechniquesByCategory: (category) =>
    get().techniques.filter((t) => t.category === category),

  // Filter actions
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  clearFilters: () =>
    set({
      filters: {
        category: null,
        difficulty: null,
        searchQuery: '',
      },
    }),

  getFilteredTechniques: () => {
    const { techniques, filters } = get();

    return techniques.filter((t) => {
      // Category filter
      if (filters.category && t.category !== filters.category) return false;

      // Difficulty filter
      if (filters.difficulty && t.difficulty !== filters.difficulty)
        return false;

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesDescription = t.description.toLowerCase().includes(query);
        const matchesAlias = t.aliases.some((a) =>
          a.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDescription && !matchesAlias) return false;
      }

      return true;
    });
  },

  // Search
  searchTechniques: (query) => {
    const { techniques } = get();
    const lowerQuery = query.toLowerCase();

    return techniques.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.aliases.some((a) => a.toLowerCase().includes(lowerQuery)) ||
        t.abbreviations.some((a) => a.toLowerCase().includes(lowerQuery))
    );
  },

  // Stats
  getStats: async () => {
    return KnowledgeService.getKnowledgeStats();
  },

  // Clear all data
  clearAll: async () => {
    await KnowledgeService.clearKnowledge();
    set({
      techniques: [],
      graph: null,
      selectedTechniqueId: null,
    });
  },
}));

// ============================================================================
// SELECTORS (for optimized re-renders)
// ============================================================================

export const selectTechniques = (state: KnowledgeState) => state.techniques;
export const selectIsLoading = (state: KnowledgeState) => state.isLoading;
export const selectError = (state: KnowledgeState) => state.error;
export const selectFilters = (state: KnowledgeState) => state.filters;
export const selectSelectedTechnique = (state: KnowledgeState) =>
  state.techniques.find((t) => t.id === state.selectedTechniqueId);
export const selectIsInitialized = (state: KnowledgeState) =>
  state.isInitialized;

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for technique-related operations
 */
export function useTechniques() {
  const techniques = useKnowledgeStore(selectTechniques);
  const isLoading = useKnowledgeStore(selectIsLoading);
  const error = useKnowledgeStore(selectError);
  const {
    addTechnique,
    updateTechnique,
    getTechniqueById,
    getTechniquesByCategory,
    searchTechniques,
  } = useKnowledgeStore();

  return {
    techniques,
    isLoading,
    error,
    addTechnique,
    updateTechnique,
    getTechniqueById,
    getTechniquesByCategory,
    searchTechniques,
  };
}

/**
 * Hook for filtering techniques
 */
export function useTechniqueFilters() {
  const filters = useKnowledgeStore(selectFilters);
  const { setFilter, clearFilters, getFilteredTechniques } = useKnowledgeStore();

  return {
    filters,
    setFilter,
    clearFilters,
    filteredTechniques: getFilteredTechniques(),
  };
}

/**
 * Hook for selected technique
 */
export function useSelectedTechnique() {
  const selectedTechnique = useKnowledgeStore(selectSelectedTechnique);
  const { selectTechnique } = useKnowledgeStore();

  return {
    selectedTechnique,
    selectTechnique,
  };
}

/**
 * Hook for knowledge initialization
 */
export function useKnowledgeInit() {
  const isInitialized = useKnowledgeStore(selectIsInitialized);
  const isLoading = useKnowledgeStore(selectIsLoading);
  const error = useKnowledgeStore(selectError);
  const { initialize } = useKnowledgeStore();

  return {
    isInitialized,
    isLoading,
    error,
    initialize,
  };
}
