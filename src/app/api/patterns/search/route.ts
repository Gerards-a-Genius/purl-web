// src/app/api/patterns/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  searchPatterns,
  repositoryExists,
  type SearchFilters,
} from '@/lib/patterns/repository';

export async function GET(request: NextRequest) {
  try {
    // Check if repository exists
    if (!repositoryExists()) {
      return NextResponse.json(
        { error: 'Pattern repository not found' },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Build filters
    const filters: SearchFilters = {};
    const type = searchParams.get('type');
    if (type === 'knitting' || type === 'crochet' || type === 'machine_knit') {
      filters.type = type;
    }
    const difficulty = searchParams.get('difficulty');
    if (difficulty) {
      filters.difficulty = difficulty;
    }
    const category = searchParams.get('category');
    if (category) {
      filters.category = category;
    }

    const results = searchPatterns(query, filters, limit);

    return NextResponse.json({
      count: results.length,
      query,
      filters,
      patterns: results,
    });
  } catch (error) {
    console.error('Pattern search error:', error);
    return NextResponse.json(
      { error: 'Failed to search patterns' },
      { status: 500 }
    );
  }
}
