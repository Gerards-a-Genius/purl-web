// src/app/api/patterns/techniques/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  listTechniques,
  getPatternsByTechnique,
  repositoryExists,
} from '@/lib/patterns/repository';

export async function GET(request: NextRequest) {
  try {
    if (!repositoryExists()) {
      return NextResponse.json(
        { error: 'Pattern repository not found' },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const techniqueName = searchParams.get('name');

    // If technique name provided, get patterns using that technique
    if (techniqueName) {
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const patterns = getPatternsByTechnique(techniqueName, limit);
      return NextResponse.json({
        technique: techniqueName,
        count: patterns.length,
        patterns,
      });
    }

    // Otherwise return all techniques with counts
    const techniques = listTechniques();

    return NextResponse.json({
      count: techniques.length,
      techniques,
    });
  } catch (error) {
    console.error('Techniques error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch techniques' },
      { status: 500 }
    );
  }
}
