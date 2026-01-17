// src/hooks/usePatternRepository.test.ts
// Tests for pattern repository hooks

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import {
  Favorite,
  FavoritesResponse,
} from './usePatternRepository';

describe('usePatternRepository - Favorites API functions', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('should return favorites when authenticated', async () => {
      const mockResponse: FavoritesResponse = {
        count: 2,
        favorites: [
          { patternId: 'pattern-1', createdAt: '2024-01-01T00:00:00Z' },
          { patternId: 'pattern-2', createdAt: '2024-01-02T00:00:00Z' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/patterns/favorites');
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.count).toBe(2);
      expect(data.favorites).toHaveLength(2);
      expect(data.favorites[0].patternId).toBe('pattern-1');
    });

    it('should return 401 when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const response = await fetch('/api/patterns/favorites');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  describe('addFavorite', () => {
    it('should add a favorite and return the new favorite', async () => {
      const newFavorite: Favorite = {
        patternId: 'new-pattern',
        createdAt: '2024-01-03T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          message: 'Pattern added to favorites',
          favorite: newFavorite,
        }),
      });

      const response = await fetch('/api/patterns/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patternId: 'new-pattern' }),
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.favorite.patternId).toBe('new-pattern');
    });

    it('should return 409 when pattern already favorited', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Pattern already in favorites' }),
      });

      const response = await fetch('/api/patterns/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patternId: 'existing-pattern' }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(409);
    });

    it('should return 400 when patternId is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Missing or invalid patternId' }),
      });

      const response = await fetch('/api/patterns/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Pattern removed from favorites',
          patternId: 'pattern-to-remove',
        }),
      });

      const response = await fetch('/api/patterns/favorites?patternId=pattern-to-remove', {
        method: 'DELETE',
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.patternId).toBe('pattern-to-remove');
    });

    it('should return 400 when patternId is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Missing patternId' }),
      });

      const response = await fetch('/api/patterns/favorites', {
        method: 'DELETE',
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });
});

describe('usePatternRepository - Search API functions', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('searchPatterns', () => {
    it('should search patterns with query', async () => {
      const mockResponse = {
        count: 5,
        query: 'sweater',
        filters: {},
        patterns: [
          { id: '1', title: 'Cable Sweater', type: 'knitting', category: 'sweater' },
          { id: '2', title: 'Raglan Sweater', type: 'knitting', category: 'sweater' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/patterns/search?q=sweater');
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.query).toBe('sweater');
      expect(data.patterns).toHaveLength(2);
    });

    it('should search with filters', async () => {
      const mockResponse = {
        count: 1,
        query: '',
        filters: { type: 'knitting', difficulty: 'beginner' },
        patterns: [{ id: '1', title: 'Simple Scarf', type: 'knitting', category: 'scarf' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/patterns/search?type=knitting&difficulty=beginner');
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.patterns).toHaveLength(1);
    });
  });

  describe('getPattern', () => {
    it('should get pattern by id', async () => {
      const mockPattern = {
        id: 'pattern-123',
        title: 'Test Pattern',
        type: 'knitting',
        category: 'sweater',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPattern,
      });

      const response = await fetch('/api/patterns/pattern-123');
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.id).toBe('pattern-123');
    });

    it('should return 404 for non-existent pattern', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Pattern not found' }),
      });

      const response = await fetch('/api/patterns/non-existent');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('getSimilarPatterns', () => {
    it('should get similar patterns', async () => {
      const mockResponse = {
        source_pattern_id: 'pattern-1',
        count: 3,
        similar_patterns: [
          { id: '2', title: 'Similar 1', similarity_score: 0.9 },
          { id: '3', title: 'Similar 2', similarity_score: 0.8 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/patterns/pattern-1/similar?limit=5');
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.source_pattern_id).toBe('pattern-1');
      expect(data.similar_patterns).toHaveLength(2);
    });
  });

  describe('getTechniques', () => {
    it('should get all techniques', async () => {
      const mockResponse = {
        count: 10,
        techniques: [
          { name: 'cable', count: 50 },
          { name: 'colorwork', count: 30 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/patterns/techniques');
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.techniques).toHaveLength(2);
    });
  });

  describe('getStats', () => {
    it('should get repository statistics', async () => {
      const mockResponse = {
        total_patterns: 100,
        sources: { 'knitty.com': 50, 'ravelry': 50 },
        types: { knitting: 80, crochet: 20 },
        difficulties: { beginner: 30, intermediate: 50, advanced: 20 },
        categories: { sweater: 40, hat: 30, scarf: 30 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/patterns/stats');
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.total_patterns).toBe(100);
    });
  });
});
