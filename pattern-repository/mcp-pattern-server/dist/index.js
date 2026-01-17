#!/usr/bin/env node
/**
 * MCP Pattern Server
 *
 * Provides tools for searching, analyzing, and generating knitting/crochet patterns.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
// Repository paths - relative to this script's location
// From dist/index.js, go up 2 levels to reach pattern-repository root
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PATTERNS_DIR = path.join(REPO_ROOT, "processed", "patterns");
const INDEX_DIR = path.join(REPO_ROOT, "processed", "index");
const TRAINING_DIR = path.join(REPO_ROOT, "training");
// Pattern cache
let patternCache = new Map();
let catalogCache = null;
/**
 * Load the master catalog
 */
function loadCatalog() {
    if (catalogCache)
        return catalogCache;
    const catalogPath = path.join(INDEX_DIR, "master_catalog.json");
    if (fs.existsSync(catalogPath)) {
        catalogCache = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
    }
    else {
        catalogCache = { patterns: [], total_patterns: 0 };
    }
    return catalogCache;
}
/**
 * Load a specific pattern
 */
function loadPattern(patternId) {
    if (patternCache.has(patternId)) {
        return patternCache.get(patternId);
    }
    const patternDir = path.join(PATTERNS_DIR, patternId);
    const metadataPath = path.join(patternDir, "metadata.json");
    if (!fs.existsSync(metadataPath)) {
        return null;
    }
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    // Load instructions if available
    const instructionsPath = path.join(patternDir, "instructions.md");
    if (fs.existsSync(instructionsPath)) {
        metadata.instructions_text = fs.readFileSync(instructionsPath, "utf-8");
    }
    patternCache.set(patternId, metadata);
    return metadata;
}
/**
 * Search patterns by query
 */
function searchPatterns(query, filters, limit = 10) {
    const catalog = loadCatalog();
    const queryLower = query.toLowerCase();
    let results = catalog.patterns.filter((p) => {
        // Text search
        const matchesQuery = p.title?.toLowerCase().includes(queryLower) ||
            p.category?.toLowerCase().includes(queryLower) ||
            p.type?.toLowerCase().includes(queryLower);
        if (!matchesQuery)
            return false;
        // Apply filters
        if (filters?.type && p.type !== filters.type)
            return false;
        if (filters?.difficulty && p.difficulty !== filters.difficulty)
            return false;
        if (filters?.category && p.category !== filters.category)
            return false;
        return true;
    });
    // Load full metadata for results
    results = results.slice(0, limit).map((p) => {
        const full = loadPattern(p.id);
        return full || p;
    });
    return results;
}
/**
 * Get pattern by ID
 */
function getPattern(patternId) {
    return loadPattern(patternId);
}
/**
 * List all techniques used across patterns
 */
function listTechniques() {
    const catalog = loadCatalog();
    const techniques = new Map();
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
function getStats() {
    const catalog = loadCatalog();
    const stats = {
        total_patterns: catalog.total_patterns || 0,
        sources: catalog.sources || {},
        types: {},
        difficulties: {},
        categories: {},
    };
    for (const p of catalog.patterns) {
        stats.types[p.type] = (stats.types[p.type] || 0) + 1;
        stats.difficulties[p.difficulty] = (stats.difficulties[p.difficulty] || 0) + 1;
        stats.categories[p.category] = (stats.categories[p.category] || 0) + 1;
    }
    return stats;
}
// Create MCP server
const server = new Server({
    name: "pattern-repository",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        resources: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search_patterns",
                description: "Search the pattern repository by keyword, technique, or attributes. Returns matching patterns with metadata.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query (keywords, technique names, etc.)",
                        },
                        type: {
                            type: "string",
                            enum: ["knitting", "crochet", "machine_knit"],
                            description: "Filter by pattern type",
                        },
                        difficulty: {
                            type: "string",
                            enum: ["beginner", "easy", "intermediate", "advanced", "expert"],
                            description: "Filter by difficulty level",
                        },
                        category: {
                            type: "string",
                            description: "Filter by category (sweater, hat, scarf, etc.)",
                        },
                        limit: {
                            type: "number",
                            default: 10,
                            description: "Maximum results to return",
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "get_pattern",
                description: "Get full details for a specific pattern by ID, including materials, instructions, and metadata.",
                inputSchema: {
                    type: "object",
                    properties: {
                        pattern_id: {
                            type: "string",
                            description: "The pattern UUID",
                        },
                    },
                    required: ["pattern_id"],
                },
            },
            {
                name: "list_techniques",
                description: "List all knitting/crochet techniques found across patterns in the repository, with counts.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "get_repository_stats",
                description: "Get statistics about the pattern repository including total counts and breakdowns.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "get_similar_patterns",
                description: "Find patterns similar to a given pattern based on techniques and attributes.",
                inputSchema: {
                    type: "object",
                    properties: {
                        pattern_id: {
                            type: "string",
                            description: "The pattern ID to find similar patterns for",
                        },
                        limit: {
                            type: "number",
                            default: 5,
                            description: "Maximum similar patterns to return",
                        },
                    },
                    required: ["pattern_id"],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "search_patterns": {
                const results = searchPatterns(args?.query, {
                    type: args?.type,
                    difficulty: args?.difficulty,
                    category: args?.category,
                }, args?.limit || 10);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                count: results.length,
                                patterns: results.map((p) => ({
                                    id: p.id,
                                    title: p.title,
                                    type: p.type,
                                    category: p.category,
                                    difficulty: p.difficulty?.level,
                                    techniques: p.techniques?.map((t) => t.name),
                                })),
                            }, null, 2),
                        },
                    ],
                };
            }
            case "get_pattern": {
                const pattern = getPattern(args?.pattern_id);
                if (!pattern) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ error: "Pattern not found" }),
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(pattern, null, 2),
                        },
                    ],
                };
            }
            case "list_techniques": {
                const techniques = listTechniques();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ techniques }, null, 2),
                        },
                    ],
                };
            }
            case "get_repository_stats": {
                const stats = getStats();
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(stats, null, 2),
                        },
                    ],
                };
            }
            case "get_similar_patterns": {
                const sourcePattern = getPattern(args?.pattern_id);
                if (!sourcePattern) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({ error: "Pattern not found" }),
                            },
                        ],
                    };
                }
                // Find patterns with similar techniques
                const sourceTechniques = new Set(sourcePattern.techniques?.map((t) => t.name) || []);
                const catalog = loadCatalog();
                const similar = catalog.patterns
                    .filter((p) => p.id !== args?.pattern_id)
                    .map((p) => {
                    const pattern = loadPattern(p.id);
                    if (!pattern)
                        return null;
                    const patternTechniques = new Set(pattern.techniques?.map((t) => t.name) || []);
                    // Calculate similarity score
                    let overlap = 0;
                    for (const tech of sourceTechniques) {
                        if (patternTechniques.has(tech))
                            overlap++;
                    }
                    const score = overlap /
                        Math.max(sourceTechniques.size, patternTechniques.size, 1);
                    return { pattern, score };
                })
                    .filter((r) => r && r.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, args?.limit || 5)
                    .map((r) => ({
                    id: r.pattern.id,
                    title: r.pattern.title,
                    similarity_score: r.score,
                    techniques: r.pattern.techniques?.map((t) => t.name),
                }));
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ similar_patterns: similar }, null, 2),
                        },
                    ],
                };
            }
            default:
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ error: `Unknown tool: ${name}` }),
                        },
                    ],
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ error: String(error) }),
                },
            ],
        };
    }
});
// List resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "pattern://catalog",
                name: "Pattern Catalog",
                description: "Master catalog of all patterns in the repository",
                mimeType: "application/json",
            },
            {
                uri: "pattern://techniques",
                name: "Technique Taxonomy",
                description: "List of all knitting/crochet techniques",
                mimeType: "application/json",
            },
            {
                uri: "pattern://stats",
                name: "Repository Statistics",
                description: "Statistics about the pattern repository",
                mimeType: "application/json",
            },
        ],
    };
});
// Read resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    switch (uri) {
        case "pattern://catalog":
            return {
                contents: [
                    {
                        uri,
                        mimeType: "application/json",
                        text: JSON.stringify(loadCatalog(), null, 2),
                    },
                ],
            };
        case "pattern://techniques":
            return {
                contents: [
                    {
                        uri,
                        mimeType: "application/json",
                        text: JSON.stringify({ techniques: listTechniques() }, null, 2),
                    },
                ],
            };
        case "pattern://stats":
            return {
                contents: [
                    {
                        uri,
                        mimeType: "application/json",
                        text: JSON.stringify(getStats(), null, 2),
                    },
                ],
            };
        default:
            throw new Error(`Unknown resource: ${uri}`);
    }
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Pattern Repository MCP Server running");
}
main().catch(console.error);
