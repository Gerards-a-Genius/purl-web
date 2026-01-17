// src/app/api/patterns/[id]/similar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSimilarPatterns, repositoryExists } from '@/lib/patterns/repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!repositoryExists()) {
      return NextResponse.json(
        { error: 'Pattern repository not found' },
        { status: 503 }
      );
    }

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const similar = getSimilarPatterns(id, limit);

    return NextResponse.json({
      source_pattern_id: id,
      count: similar.length,
      similar_patterns: similar,
    });
  } catch (error) {
    console.error('Similar patterns error:', error);
    return NextResponse.json(
      { error: 'Failed to find similar patterns' },
      { status: 500 }
    );
  }
}
