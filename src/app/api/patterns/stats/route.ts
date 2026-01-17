// src/app/api/patterns/stats/route.ts
import { NextResponse } from 'next/server';
import { getStats, repositoryExists } from '@/lib/patterns/repository';

export async function GET() {
  try {
    if (!repositoryExists()) {
      return NextResponse.json(
        { error: 'Pattern repository not found' },
        { status: 503 }
      );
    }

    const stats = getStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
