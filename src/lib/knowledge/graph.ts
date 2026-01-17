// src/lib/knowledge/graph.ts
// Knowledge graph operations and utilities

import type {
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  EdgeType,
  SerializedKnowledgeGraph,
  UserSkillProfile,
  PatternRecommendation,
  TechniqueRecommendation,
  DifficultyLevel,
  GarmentCategory,
} from './types';

// ============================================================================
// GRAPH CREATION
// ============================================================================

/**
 * Create empty knowledge graph with all indexes initialized
 */
export function createKnowledgeGraph(): KnowledgeGraph {
  return {
    nodes: new Map(),
    edges: [],
    edgesBySource: new Map(),
    edgesByTarget: new Map(),
    edgesByType: new Map(),
  };
}

// ============================================================================
// NODE OPERATIONS
// ============================================================================

/**
 * Add a node to the graph
 */
export function addNode(graph: KnowledgeGraph, node: GraphNode): void {
  graph.nodes.set(node.id, node);
}

/**
 * Get a node by ID
 */
export function getNode(
  graph: KnowledgeGraph,
  nodeId: string
): GraphNode | undefined {
  return graph.nodes.get(nodeId);
}

/**
 * Remove a node and all its edges from the graph
 */
export function removeNode(graph: KnowledgeGraph, nodeId: string): void {
  // Remove node
  graph.nodes.delete(nodeId);

  // Remove all edges involving this node
  graph.edges = graph.edges.filter(
    (e) => e.source !== nodeId && e.target !== nodeId
  );

  // Rebuild edge indexes
  rebuildEdgeIndexes(graph);
}

/**
 * Get all nodes of a specific type
 */
export function getNodesByType(
  graph: KnowledgeGraph,
  type: GraphNode['type']
): GraphNode[] {
  return Array.from(graph.nodes.values()).filter((n) => n.type === type);
}

// ============================================================================
// EDGE OPERATIONS
// ============================================================================

/**
 * Add an edge to the graph with index updates
 */
export function addEdge(graph: KnowledgeGraph, edge: GraphEdge): void {
  // Check if edge already exists
  const existingEdge = graph.edges.find((e) => e.id === edge.id);
  if (existingEdge) return;

  graph.edges.push(edge);

  // Update source index
  const sourceEdges = graph.edgesBySource.get(edge.source) || [];
  sourceEdges.push(edge);
  graph.edgesBySource.set(edge.source, sourceEdges);

  // Update target index
  const targetEdges = graph.edgesByTarget.get(edge.target) || [];
  targetEdges.push(edge);
  graph.edgesByTarget.set(edge.target, targetEdges);

  // Update type index
  const typeEdges = graph.edgesByType.get(edge.type) || [];
  typeEdges.push(edge);
  graph.edgesByType.set(edge.type, typeEdges);
}

/**
 * Remove an edge from the graph
 */
export function removeEdge(graph: KnowledgeGraph, edgeId: string): void {
  graph.edges = graph.edges.filter((e) => e.id !== edgeId);
  rebuildEdgeIndexes(graph);
}

/**
 * Rebuild edge indexes after modifications
 */
function rebuildEdgeIndexes(graph: KnowledgeGraph): void {
  graph.edgesBySource.clear();
  graph.edgesByTarget.clear();
  graph.edgesByType.clear();

  for (const edge of graph.edges) {
    // Source index
    const sourceEdges = graph.edgesBySource.get(edge.source) || [];
    sourceEdges.push(edge);
    graph.edgesBySource.set(edge.source, sourceEdges);

    // Target index
    const targetEdges = graph.edgesByTarget.get(edge.target) || [];
    targetEdges.push(edge);
    graph.edgesByTarget.set(edge.target, targetEdges);

    // Type index
    const typeEdges = graph.edgesByType.get(edge.type) || [];
    typeEdges.push(edge);
    graph.edgesByType.set(edge.type, typeEdges);
  }
}

// ============================================================================
// TRAVERSAL OPERATIONS
// ============================================================================

/**
 * Find all nodes connected FROM a source node (outgoing edges)
 */
export function getConnectedNodes(
  graph: KnowledgeGraph,
  nodeId: string,
  edgeType?: EdgeType
): GraphNode[] {
  const edges = graph.edgesBySource.get(nodeId) || [];
  const filtered = edgeType ? edges.filter((e) => e.type === edgeType) : edges;

  return filtered
    .map((e) => graph.nodes.get(e.target))
    .filter((n): n is GraphNode => n !== undefined);
}

/**
 * Find all nodes that connect TO a target node (incoming edges)
 */
export function getIncomingNodes(
  graph: KnowledgeGraph,
  nodeId: string,
  edgeType?: EdgeType
): GraphNode[] {
  const edges = graph.edgesByTarget.get(nodeId) || [];
  const filtered = edgeType ? edges.filter((e) => e.type === edgeType) : edges;

  return filtered
    .map((e) => graph.nodes.get(e.source))
    .filter((n): n is GraphNode => n !== undefined);
}

/**
 * Get edges of a specific type
 */
export function getEdgesByType(
  graph: KnowledgeGraph,
  edgeType: EdgeType
): GraphEdge[] {
  return graph.edgesByType.get(edgeType) || [];
}

// ============================================================================
// PATTERN OPERATIONS
// ============================================================================

/**
 * Get techniques used by a pattern
 */
export function getPatternTechniques(
  graph: KnowledgeGraph,
  patternId: string
): GraphNode[] {
  return getConnectedNodes(graph, patternId, 'uses_technique');
}

/**
 * Get patterns that use a technique
 */
export function getPatternsUsingTechnique(
  graph: KnowledgeGraph,
  techniqueId: string
): GraphNode[] {
  return getIncomingNodes(graph, techniqueId, 'uses_technique');
}

// ============================================================================
// TECHNIQUE OPERATIONS
// ============================================================================

/**
 * Get technique prerequisites (recursive)
 */
export function getTechniquePrerequisites(
  graph: KnowledgeGraph,
  techniqueId: string,
  visited: Set<string> = new Set()
): GraphNode[] {
  if (visited.has(techniqueId)) return [];
  visited.add(techniqueId);

  const directPrereqs = getConnectedNodes(
    graph,
    techniqueId,
    'prerequisite_for'
  );
  const allPrereqs = [...directPrereqs];

  for (const prereq of directPrereqs) {
    const nested = getTechniquePrerequisites(graph, prereq.id, visited);
    allPrereqs.push(...nested);
  }

  return allPrereqs;
}

/**
 * Get techniques that this technique unlocks
 */
export function getTechniquesUnlockedBy(
  graph: KnowledgeGraph,
  techniqueId: string
): GraphNode[] {
  return getIncomingNodes(graph, techniqueId, 'prerequisite_for');
}

/**
 * Get technique variations
 */
export function getTechniqueVariations(
  graph: KnowledgeGraph,
  techniqueId: string
): GraphNode[] {
  return [
    ...getConnectedNodes(graph, techniqueId, 'variation_of'),
    ...getIncomingNodes(graph, techniqueId, 'variation_of'),
  ];
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

/**
 * Check if user can attempt a pattern based on known techniques
 */
export function canUserAttemptPattern(
  graph: KnowledgeGraph,
  patternId: string,
  userProfile: UserSkillProfile
): { canAttempt: boolean; missingTechniques: string[] } {
  const requiredTechniques = getPatternTechniques(graph, patternId);
  const missingTechniques: string[] = [];

  for (const tech of requiredTechniques) {
    if (!userProfile.knownTechniques.has(tech.id)) {
      missingTechniques.push(tech.id);
    }
  }

  return {
    canAttempt: missingTechniques.length === 0,
    missingTechniques,
  };
}

/**
 * Get patterns appropriate for user's skill level
 */
export function getAppropriatePatterns(
  graph: KnowledgeGraph,
  userProfile: UserSkillProfile,
  options?: {
    maxNewTechniques?: number;
    garmentTypes?: GarmentCategory[];
  }
): PatternRecommendation[] {
  const recommendations: PatternRecommendation[] = [];
  const maxNew = options?.maxNewTechniques ?? 2;

  // Get all pattern nodes
  const patterns = getNodesByType(graph, 'pattern');

  for (const pattern of patterns) {
    const { canAttempt, missingTechniques } = canUserAttemptPattern(
      graph,
      pattern.id,
      userProfile
    );

    // Skip if too many new techniques
    if (missingTechniques.length > maxNew) continue;

    // Filter by garment type if specified
    if (options?.garmentTypes) {
      const garmentType = pattern.properties.category as GarmentCategory;
      if (!options.garmentTypes.includes(garmentType)) continue;
    }

    // Calculate score
    let score = 100;
    const reasons: string[] = [];

    if (canAttempt) {
      reasons.push('Matches your current skills');
      score += 50;
    } else {
      reasons.push(`Learn ${missingTechniques.length} new technique(s)`);
      score += 20;
      score -= missingTechniques.length * 10;
    }

    recommendations.push({
      patternId: pattern.id,
      score,
      reasons,
      newTechniques: missingTechniques,
      missingPrerequisites: [],
      difficulty: (pattern.properties.difficulty as DifficultyLevel) ?? 1,
    });
  }

  return recommendations.sort((a, b) => b.score - a.score);
}

/**
 * Suggest next techniques to learn based on goals
 */
export function suggestNextTechniques(
  graph: KnowledgeGraph,
  userProfile: UserSkillProfile,
  limit: number = 5
): TechniqueRecommendation[] {
  const recommendations: TechniqueRecommendation[] = [];
  const techniques = getNodesByType(graph, 'technique');

  for (const tech of techniques) {
    // Skip if already known
    if (userProfile.knownTechniques.has(tech.id)) continue;

    // Check prerequisites
    const prereqs = getTechniquePrerequisites(graph, tech.id);
    const hasAllPrereqs = prereqs.every((p) =>
      userProfile.knownTechniques.has(p.id)
    );

    if (!hasAllPrereqs) continue;

    // Calculate how many patterns this unlocks
    const patternsUnlocked = getPatternsUsingTechnique(graph, tech.id).filter(
      (p) => !userProfile.completedPatterns.includes(p.id)
    );

    // Calculate score
    let score = 50;
    const reasons: string[] = [];

    if (patternsUnlocked.length > 0) {
      score += patternsUnlocked.length * 10;
      reasons.push(`Unlocks ${patternsUnlocked.length} patterns`);
    }

    if (userProfile.learningGoals.includes(tech.id)) {
      score += 30;
      reasons.push('In your learning goals');
    }

    recommendations.push({
      techniqueId: tech.id,
      score,
      reasons,
      prerequisitesMet: true,
      relatedPatterns: patternsUnlocked.map((p) => p.id),
      unlocks: patternsUnlocked.map((p) => p.id),
    });
  }

  return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ============================================================================
// SERIALIZATION
// ============================================================================

/**
 * Serialize graph for storage
 */
export function serializeGraph(
  graph: KnowledgeGraph
): SerializedKnowledgeGraph {
  return {
    nodes: Array.from(graph.nodes.entries()).map(([id, node]) => ({
      id,
      node,
    })),
    edges: graph.edges,
  };
}

/**
 * Deserialize graph from storage
 */
export function deserializeGraph(
  data: SerializedKnowledgeGraph
): KnowledgeGraph {
  const graph = createKnowledgeGraph();

  for (const { node } of data.nodes) {
    addNode(graph, node);
  }

  for (const edge of data.edges) {
    addEdge(graph, edge);
  }

  return graph;
}
