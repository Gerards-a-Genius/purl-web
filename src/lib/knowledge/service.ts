// src/lib/knowledge/service.ts
// Knowledge service for managing techniques and patterns
// Uses Supabase for persistence with local caching for performance

import { createClient } from '@/lib/supabase/client';
import type {
  Technique,
  TechniqueCategory,
  AbbreviationEntry,
  KnowledgeGraph,
  DifficultyLevel,
  GarmentCategory,
} from './types';
import {
  STANDARD_ABBREVIATIONS,
  findAbbreviation as findAbbreviationFromData,
} from './abbreviations';
import {
  createKnowledgeGraph,
  addNode,
  addEdge,
  serializeGraph,
  deserializeGraph,
} from './graph';
import type { GraphNode, GraphEdge, SerializedKnowledgeGraph } from './types';

// ============================================================================
// STORAGE KEYS (for localStorage caching)
// ============================================================================

const STORAGE_KEYS = {
  TECHNIQUES: 'purl-knowledge-techniques',
  ABBREVIATIONS: 'purl-knowledge-abbreviations',
  GRAPH: 'purl-knowledge-graph',
  CACHE_TIMESTAMP: 'purl-knowledge-cache-ts',
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// ============================================================================
// IN-MEMORY CACHES
// ============================================================================

let techniquesCache: Map<string, Technique> = new Map();
let abbreviationsCache: Map<string, AbbreviationEntry> = new Map();
let graphCache: KnowledgeGraph | null = null;
let isInitialized = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the knowledge service
 * Loads from localStorage cache if available, otherwise fetches from Supabase
 */
export async function initializeKnowledge(): Promise<void> {
  if (isInitialized) return;

  console.log('[KnowledgeService] Initializing...');

  try {
    // Check if we have a fresh cache
    const cacheTimestamp = localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP);
    const isCacheFresh =
      cacheTimestamp && Date.now() - parseInt(cacheTimestamp, 10) < CACHE_DURATION;

    if (isCacheFresh) {
      await loadFromLocalCache();
    } else {
      await loadFromSupabase();
    }

    // Always ensure standard abbreviations are loaded
    loadStandardAbbreviations();

    isInitialized = true;
    console.log(
      `[KnowledgeService] Initialized with ${techniquesCache.size} techniques`
    );
  } catch (error) {
    console.error('[KnowledgeService] Initialization failed:', error);
    // Initialize with empty caches on error
    techniquesCache = new Map();
    abbreviationsCache = new Map();
    graphCache = createKnowledgeGraph();
    loadStandardAbbreviations();
    isInitialized = true;
  }
}

/**
 * Load data from localStorage cache
 */
async function loadFromLocalCache(): Promise<void> {
  console.log('[KnowledgeService] Loading from localStorage cache...');

  // Load techniques
  const techniquesJson = localStorage.getItem(STORAGE_KEYS.TECHNIQUES);
  if (techniquesJson) {
    const techniques: Technique[] = JSON.parse(techniquesJson);
    techniques.forEach((t) => techniquesCache.set(t.id, t));
  }

  // Load custom abbreviations
  const abbreviationsJson = localStorage.getItem(STORAGE_KEYS.ABBREVIATIONS);
  if (abbreviationsJson) {
    const abbrs: AbbreviationEntry[] = JSON.parse(abbreviationsJson);
    abbrs.forEach((a) =>
      abbreviationsCache.set(a.abbreviation.toLowerCase(), a)
    );
  }

  // Load knowledge graph
  const graphJson = localStorage.getItem(STORAGE_KEYS.GRAPH);
  if (graphJson) {
    const serialized: SerializedKnowledgeGraph = JSON.parse(graphJson);
    graphCache = deserializeGraph(serialized);
  } else {
    graphCache = createKnowledgeGraph();
  }
}

/**
 * Load data from Supabase
 */
async function loadFromSupabase(): Promise<void> {
  console.log('[KnowledgeService] Loading from Supabase...');

  const supabase = createClient();

  // Load techniques from Supabase
  const { data: techniques, error } = await supabase
    .from('techniques')
    .select('*')
    .order('name');

  if (error) {
    console.warn(
      '[KnowledgeService] Failed to load techniques from Supabase:',
      error
    );
    // Fall back to localStorage cache
    await loadFromLocalCache();
    return;
  }

  if (techniques) {
    techniques.forEach((t) => techniquesCache.set(t.id, t as Technique));
    // Update local cache
    localStorage.setItem(STORAGE_KEYS.TECHNIQUES, JSON.stringify(techniques));
  }

  // Build/rebuild knowledge graph from techniques
  graphCache = createKnowledgeGraph();
  techniquesCache.forEach((technique) => {
    updateGraphForTechnique(technique);
  });
  persistGraph();

  // Update cache timestamp
  localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
}

/**
 * Load standard abbreviations into cache
 */
function loadStandardAbbreviations(): void {
  STANDARD_ABBREVIATIONS.forEach((a) => {
    if (!abbreviationsCache.has(a.abbreviation.toLowerCase())) {
      abbreviationsCache.set(a.abbreviation.toLowerCase(), a);
    }
  });
}

/**
 * Ensure the service is initialized before operations
 */
async function ensureInitialized(): Promise<void> {
  if (!isInitialized) {
    await initializeKnowledge();
  }
}

// ============================================================================
// TECHNIQUE OPERATIONS
// ============================================================================

/**
 * Get all techniques
 */
export async function getAllTechniques(): Promise<Technique[]> {
  await ensureInitialized();
  return Array.from(techniquesCache.values());
}

/**
 * Get a technique by ID
 */
export async function getTechnique(id: string): Promise<Technique | null> {
  await ensureInitialized();
  return techniquesCache.get(id) || null;
}

/**
 * Get techniques by category
 */
export async function getTechniquesByCategory(
  category: TechniqueCategory
): Promise<Technique[]> {
  await ensureInitialized();
  return Array.from(techniquesCache.values()).filter(
    (t) => t.category === category
  );
}

/**
 * Get techniques by difficulty
 */
export async function getTechniquesByDifficulty(
  maxDifficulty: DifficultyLevel
): Promise<Technique[]> {
  await ensureInitialized();
  return Array.from(techniquesCache.values()).filter(
    (t) => t.difficulty <= maxDifficulty
  );
}

/**
 * Find technique by name, slug, or alias
 */
export async function findTechniqueByName(
  nameOrAlias: string
): Promise<Technique | null> {
  await ensureInitialized();

  const lower = nameOrAlias.toLowerCase();
  return (
    Array.from(techniquesCache.values()).find(
      (t) =>
        t.name.toLowerCase() === lower ||
        t.slug === lower ||
        t.aliases.some((a) => a.toLowerCase() === lower) ||
        t.abbreviations.some((a) => a.toLowerCase() === lower)
    ) || null
  );
}

/**
 * Search techniques by query
 */
export async function searchTechniques(query: string): Promise<Technique[]> {
  await ensureInitialized();

  const lowerQuery = query.toLowerCase();
  return Array.from(techniquesCache.values()).filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.aliases.some((a) => a.toLowerCase().includes(lowerQuery)) ||
      t.abbreviations.some((a) => a.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Save a technique (creates or updates)
 */
export async function saveTechnique(technique: Technique): Promise<void> {
  await ensureInitialized();

  const supabase = createClient();

  // Upsert to Supabase
  const { error } = await supabase.from('techniques').upsert(technique);

  if (error) {
    console.error('[KnowledgeService] Failed to save technique:', error);
    throw new Error(`Failed to save technique: ${error.message}`);
  }

  // Update local cache
  techniquesCache.set(technique.id, technique);
  updateGraphForTechnique(technique);

  // Persist to localStorage
  persistTechniques();
  persistGraph();

  console.log(`[KnowledgeService] Saved technique: ${technique.name}`);
}

/**
 * Seed multiple techniques at once
 */
export async function seedTechniques(techniques: Technique[]): Promise<void> {
  await ensureInitialized();

  const supabase = createClient();

  // Upsert all to Supabase
  const { error } = await supabase.from('techniques').upsert(techniques);

  if (error) {
    console.error('[KnowledgeService] Failed to seed techniques:', error);
    throw new Error(`Failed to seed techniques: ${error.message}`);
  }

  // Update local caches
  for (const technique of techniques) {
    techniquesCache.set(technique.id, technique);
    updateGraphForTechnique(technique);
  }

  // Persist to localStorage
  persistTechniques();
  persistGraph();

  console.log(`[KnowledgeService] Seeded ${techniques.length} techniques`);
}

// ============================================================================
// ABBREVIATION OPERATIONS
// ============================================================================

/**
 * Look up an abbreviation
 */
export async function lookupAbbreviation(
  abbr: string
): Promise<AbbreviationEntry | null> {
  await ensureInitialized();

  // Check custom cache first
  const cached = abbreviationsCache.get(abbr.toLowerCase());
  if (cached) return cached;

  // Fall back to standard
  return findAbbreviationFromData(abbr) || null;
}

/**
 * Add a custom abbreviation
 */
export async function addCustomAbbreviation(
  entry: AbbreviationEntry
): Promise<void> {
  await ensureInitialized();

  abbreviationsCache.set(entry.abbreviation.toLowerCase(), entry);
  persistAbbreviations();
}

/**
 * Get all abbreviations
 */
export async function getAllAbbreviations(): Promise<AbbreviationEntry[]> {
  await ensureInitialized();
  return Array.from(abbreviationsCache.values());
}

// ============================================================================
// KNOWLEDGE GRAPH OPERATIONS
// ============================================================================

/**
 * Get the knowledge graph
 */
export async function getKnowledgeGraph(): Promise<KnowledgeGraph> {
  await ensureInitialized();
  return graphCache!;
}

/**
 * Update graph when a technique is saved
 */
function updateGraphForTechnique(technique: Technique): void {
  if (!graphCache) return;

  // Add technique node
  const techNode: GraphNode = {
    id: technique.id,
    type: 'technique',
    label: technique.name,
    properties: {
      category: technique.category,
      difficulty: technique.difficulty,
      slug: technique.slug,
    },
  };
  addNode(graphCache, techNode);

  // Add prerequisite edges
  technique.prerequisites.forEach((prereqId) => {
    const edge: GraphEdge = {
      id: `${technique.id}-requires-${prereqId}`,
      source: technique.id,
      target: prereqId,
      type: 'prerequisite_for',
    };
    addEdge(graphCache!, edge);
  });

  // Add related technique edges
  technique.relatedTechniques.forEach((relatedId) => {
    const edge: GraphEdge = {
      id: `${technique.id}-related-${relatedId}`,
      source: technique.id,
      target: relatedId,
      type: 'variation_of',
    };
    addEdge(graphCache!, edge);
  });

  // Add category node and edge
  const categoryNodeId = `category-${technique.category}`;
  const categoryNode: GraphNode = {
    id: categoryNodeId,
    type: 'technique' as const, // Using technique type for category grouping
    label: technique.category,
    properties: { isCategory: true },
  };
  addNode(graphCache, categoryNode);

  const categoryEdge: GraphEdge = {
    id: `${technique.id}-in-${technique.category}`,
    source: technique.id,
    target: categoryNodeId,
    type: 'in_category',
  };
  addEdge(graphCache, categoryEdge);
}

// ============================================================================
// PERSISTENCE
// ============================================================================

function persistTechniques(): void {
  const techniques = Array.from(techniquesCache.values());
  localStorage.setItem(STORAGE_KEYS.TECHNIQUES, JSON.stringify(techniques));
  localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
}

function persistAbbreviations(): void {
  // Only persist custom abbreviations
  const customAbbrs = Array.from(abbreviationsCache.values()).filter(
    (a) => !a.isStandard
  );
  localStorage.setItem(STORAGE_KEYS.ABBREVIATIONS, JSON.stringify(customAbbrs));
}

function persistGraph(): void {
  if (!graphCache) return;
  const serialized = serializeGraph(graphCache);
  localStorage.setItem(STORAGE_KEYS.GRAPH, JSON.stringify(serialized));
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Force refresh from Supabase
 */
export async function refreshKnowledge(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.CACHE_TIMESTAMP);
  isInitialized = false;
  techniquesCache.clear();
  await initializeKnowledge();
}

/**
 * Clear all knowledge data
 */
export async function clearKnowledge(): Promise<void> {
  techniquesCache.clear();
  abbreviationsCache.clear();
  graphCache = createKnowledgeGraph();

  localStorage.removeItem(STORAGE_KEYS.TECHNIQUES);
  localStorage.removeItem(STORAGE_KEYS.ABBREVIATIONS);
  localStorage.removeItem(STORAGE_KEYS.GRAPH);
  localStorage.removeItem(STORAGE_KEYS.CACHE_TIMESTAMP);

  // Re-load standard abbreviations
  loadStandardAbbreviations();

  console.log('[KnowledgeService] Knowledge cleared');
}

/**
 * Get knowledge service statistics
 */
export async function getKnowledgeStats(): Promise<{
  techniqueCount: number;
  abbreviationCount: number;
  graphNodeCount: number;
  graphEdgeCount: number;
}> {
  await ensureInitialized();

  return {
    techniqueCount: techniquesCache.size,
    abbreviationCount: abbreviationsCache.size,
    graphNodeCount: graphCache?.nodes.size || 0,
    graphEdgeCount: graphCache?.edges.length || 0,
  };
}
