// src/app/api/patterns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPattern, repositoryExists } from '@/lib/patterns/repository';

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
    const pattern = getPattern(id);

    if (!pattern) {
      return NextResponse.json(
        { error: 'Pattern not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pattern);
  } catch (error) {
    console.error('Pattern fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pattern' },
      { status: 500 }
    );
  }
}
