// src/lib/patterns/repository.ts
// Service layer for accessing the pattern repository

import * as fs from 'fs';
import * as path from 'path';

// Repository paths - relative to project root
const REPO_ROOT = path.join(process.cwd(), 'pattern-repository');
const PATTERNS_DIR = path.join(REPO_ROOT, 'processed', 'patterns');
const INDEX_DIR = path.join(REPO_ROOT, 'processed', 'index');

// ============================================================================
// TYPES
// ============================================================================

export interface PatternTechnique {
  name: string;
  complexity?: number;
}

export interface PatternMaterials {
  yarn_weight?: string;
  fiber_content?: string[];
  yardage?: number;
  needle_size?: string;
  hook_size?: string;
  notions?: string[];
}

export interface PatternDifficulty {
  level: 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert';
  score?: number;
}

export interface PatternMetadata {
  id: string;
  source: string;
  source_id?: string;
  title: string;
  type: 'knitting' | 'crochet' | 'machine_knit';
  category: string;
  difficulty?: PatternDifficulty;
  techniques?: PatternTechnique[];
  materials?: PatternMaterials;
  gauge?: {
    stitches_per_inch?: number;
    rows_per_inch?: number;
    swatch_size?: string;
  };
  instructions?: {
    format?: string;
    sections?: string[];
    stitch_count?: number;
    row_count?: number;
  };
  images?: {
    preview?: string;
    chart?: string;
    swatches?: string[];
  };
  license?: string;
  attribution?: string;
  date_added?: string;
  instructions_text?: string;
}

export interface CatalogPattern {
  id: string;
  title: string;
  type: string;
  category: string;
  difficulty?: string;
  source?: string;
}

export interface Catalog {
  patterns: CatalogPattern[];
  total_patterns: number;
  sources?: Record<string, number>;
}

export interface SearchFilters {
  type?: 'knitting' | 'crochet' | 'machine_knit';
  difficulty?: string;
  category?: string;
  techniques?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
  category: string;
  difficulty?: string;
  techniques?: string[];
  score?: number;
}

export interface RepositoryStats {
  total_patterns: number;
  sources: Record<string, number>;
  types: Record<string, number>;
  difficulties: Record<string, number>;
  categories: Record<string, number>;
}

export interface TechniqueCount {
  name: string;
  count: number;
}

// ============================================================================
// CACHING
// ============================================================================

let catalogCache: Catalog | null = null;
const patternCache: Map<string, PatternMetadata> = new Map();

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Check if repository exists
 */
export function repositoryExists(): boolean {
  return fs.existsSync(REPO_ROOT) && fs.existsSync(INDEX_DIR);
}

/**
 * Load the master catalog
 */
export function loadCatalog(): Catalog {
  if (catalogCache) return catalogCache;

  const catalogPath = path.join(INDEX_DIR, 'master_catalog.json');
  if (fs.existsSync(catalogPath)) {
    catalogCache = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  } else {
    catalogCache = { patterns: [], total_patterns: 0 };
  }
  return catalogCache!;
}

/**
 * Load a specific pattern by ID
 */
export function loadPattern(patternId: string): PatternMetadata | null {
  if (patternCache.has(patternId)) {
    return patternCache.get(patternId)!;
  }

  const patternDir = path.join(PATTERNS_DIR, patternId);
  const metadataPath = path.join(patternDir, 'metadata.json');

  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  const metadata: PatternMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

  // Load instructions if available
  const instructionsPath = path.join(patternDir, 'instructions.md');
  if (fs.existsSync(instructionsPath)) {
    metadata.instructions_text = fs.readFileSync(instructionsPath, 'utf-8');
  }

  patternCache.set(patternId, metadata);
  return metadata;
}

/**
 * Search patterns by query and filters
 */
export function searchPatterns(
  query: string,
  filters?: SearchFilters,
  limit: number = 10
): SearchResult[] {
  const catalog = loadCatalog();
  const queryLower = query.toLowerCase();

  let results = catalog.patterns.filter((p) => {
    // Text search
    const matchesQuery =
      p.title?.toLowerCase().includes(queryLower) ||
      p.category?.toLowerCase().includes(queryLower) ||
      p.type?.toLowerCase().includes(queryLower);

    if (!matchesQuery && query.length > 0) return false;

    // Apply filters
    if (filters?.type && p.type !== filters.type) return false;
    if (filters?.difficulty && p.difficulty !== filters.difficulty) return false;
    if (filters?.category && p.category !== filters.category) return false;

    return true;
  });

  // Load full metadata and return results
  return results.slice(0, limit).map((p) => {
    const full = loadPattern(p.id);
    return {
      id: p.id,
      title: full?.title || p.title,
      type: full?.type || p.type,
      category: full?.category || p.category,
      difficulty: full?.difficulty?.level || p.difficulty,
      techniques: full?.techniques?.map((t) => t.name) || [],
    };
  });
}

/**
 * Get pattern by ID
 */
export function getPattern(patternId: string): PatternMetadata | null {
  return loadPattern(patternId);
}

/**
 * List all techniques with counts
 */
export function listTechniques(): TechniqueCount[] {
  const catalog = loadCatalog();
  const techniques: Map<string, number> = new Map();

  for (const patternInfo of catalog.patterns) {
    const pattern = loadPattern(patternInfo.id);
    if (pattern?.techniques) {
      for (const tech of pattern.techniques) {
        const count = techniques.get(tech.name) || 0;
        techniques.set(tech.name, count + 1);
      }
    }
  }

  return Array.from(techniques.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get repository statistics
 */
export function getStats(): RepositoryStats {
  const catalog = loadCatalog();

  const stats: RepositoryStats = {
    total_patterns: catalog.total_patterns || catalog.patterns.length,
    sources: catalog.sources || {},
    types: {},
    difficulties: {},
    categories: {},
  };

  for (const p of catalog.patterns) {
    stats.types[p.type] = (stats.types[p.type] || 0) + 1;
    if (p.difficulty) {
      stats.difficulties[p.difficulty] = (stats.difficulties[p.difficulty] || 0) + 1;
    }
    stats.categories[p.category] = (stats.categories[p.category] || 0) + 1;
  }

  return stats;
}

/**
 * Find patterns similar to a given pattern
 */
export function getSimilarPatterns(
  patternId: string,
  limit: number = 5
): Array<SearchResult & { similarity_score: number }> {
  const sourcePattern = getPattern(patternId);
  if (!sourcePattern) return [];

  const sourceTechniques = new Set(
    sourcePattern.techniques?.map((t) => t.name) || []
  );

  const catalog = loadCatalog();
  const similar = catalog.patterns
    .filter((p) => p.id !== patternId)
    .map((p) => {
      const pattern = loadPattern(p.id);
      if (!pattern) return null;

      const patternTechniques = new Set(
        pattern.techniques?.map((t) => t.name) || []
      );

      // Calculate Jaccard similarity
      let intersection = 0;
      for (const tech of sourceTechniques) {
        if (patternTechniques.has(tech)) intersection++;
      }

      const union = sourceTechniques.size + patternTechniques.size - intersection;
      const score = union > 0 ? intersection / union : 0;

      return { pattern, score };
    })
    .filter((r): r is { pattern: PatternMetadata; score: number } =>
      r !== null && r.score > 0
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => ({
      id: r.pattern.id,
      title: r.pattern.title,
      type: r.pattern.type,
      category: r.pattern.category,
      difficulty: r.pattern.difficulty?.level,
      techniques: r.pattern.techniques?.map((t) => t.name) || [],
      similarity_score: r.score,
    }));

  return similar;
}

/**
 * Get patterns by technique name
 */
export function getPatternsByTechnique(
  techniqueName: string,
  limit: number = 10
): SearchResult[] {
  const catalog = loadCatalog();
  const techLower = techniqueName.toLowerCase();

  const results: SearchResult[] = [];

  for (const p of catalog.patterns) {
    if (results.length >= limit) break;

    const pattern = loadPattern(p.id);
    if (!pattern?.techniques) continue;

    const hasTechnique = pattern.techniques.some(
      (t) => t.name.toLowerCase().includes(techLower)
    );

    if (hasTechnique) {
      results.push({
        id: pattern.id,
        title: pattern.title,
        type: pattern.type,
        category: pattern.category,
        difficulty: pattern.difficulty?.level,
        techniques: pattern.techniques.map((t) => t.name),
      });
    }
  }

  return results;
}

/**
 * Clear caches (useful for development)
 */
export function clearCaches(): void {
  catalogCache = null;
  patternCache.clear();
}
