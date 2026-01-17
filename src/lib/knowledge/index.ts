// src/lib/knowledge/index.ts
// Central export for knowledge system

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Enums and basic types
  DifficultyLevel,
  YarnWeight,
  GarmentCategory,
  TechniqueCategory,
  // Technique interfaces
  Technique,
  TechniqueStep,
  TechniqueMistake,
  TechniqueVariation,
  TechniqueImage,
  // Abbreviation interfaces
  KnittingAbbreviation,
  AbbreviationEntry,
  // Knowledge graph types
  NodeType,
  GraphNode,
  EdgeType,
  GraphEdge,
  KnowledgeGraph,
  SerializedKnowledgeGraph,
  // Recommendation types
  TechniqueProficiency,
  UserSkillProfile,
  PatternRecommendation,
  TechniqueRecommendation,
} from './types';

export {
  // Label helpers
  DIFFICULTY_LABELS,
  YARN_WEIGHT_LABELS,
  TECHNIQUE_CATEGORY_LABELS,
  getDifficultyLabel,
  getYarnWeightLabel,
  getCategoryLabel,
} from './types';

// ============================================================================
// ABBREVIATIONS
// ============================================================================

export {
  STANDARD_ABBREVIATIONS,
  findAbbreviation,
  containsAbbreviation,
  getAbbreviationsByCategory,
  expandAbbreviationsInText,
} from './abbreviations';

// ============================================================================
// KNOWLEDGE GRAPH
// ============================================================================

export {
  // Graph creation
  createKnowledgeGraph,
  // Node operations
  addNode,
  getNode,
  removeNode,
  getNodesByType,
  // Edge operations
  addEdge,
  removeEdge,
  getEdgesByType,
  // Traversal
  getConnectedNodes,
  getIncomingNodes,
  // Pattern operations
  getPatternTechniques,
  getPatternsUsingTechnique,
  // Technique operations
  getTechniquePrerequisites,
  getTechniquesUnlockedBy,
  getTechniqueVariations,
  // Recommendations
  canUserAttemptPattern,
  getAppropriatePatterns,
  suggestNextTechniques,
  // Serialization
  serializeGraph,
  deserializeGraph,
} from './graph';

// ============================================================================
// KNOWLEDGE SERVICE
// ============================================================================

export {
  // Initialization
  initializeKnowledge,
  refreshKnowledge,
  clearKnowledge,
  // Techniques
  getAllTechniques,
  getTechnique,
  getTechniquesByCategory,
  getTechniquesByDifficulty,
  findTechniqueByName,
  searchTechniques,
  saveTechnique,
  seedTechniques,
  // Abbreviations
  lookupAbbreviation,
  addCustomAbbreviation,
  getAllAbbreviations,
  // Knowledge graph
  getKnowledgeGraph,
  // Stats
  getKnowledgeStats,
} from './service';
