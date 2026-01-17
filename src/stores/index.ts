// src/stores/index.ts
// Central export for all Zustand stores

export {
  useKnowledgeStore,
  // Selectors
  selectTechniques,
  selectIsLoading,
  selectError,
  selectFilters,
  selectSelectedTechnique,
  selectIsInitialized,
  // Hooks
  useTechniques,
  useTechniqueFilters,
  useSelectedTechnique,
  useKnowledgeInit,
} from './knowledgeStore';

export type { } from './knowledgeStore';
