// src/app/api/patterns/favorites/route.ts
// API endpoint for user pattern favorites

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// GET /api/patterns/favorites - List user's favorite patterns
// ============================================================================

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's favorites
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select('pattern_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: favorites.length,
      favorites: favorites.map(f => ({
        patternId: f.pattern_id,
        createdAt: f.created_at,
      })),
    });

  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/patterns/favorites - Add a pattern to favorites
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get pattern ID from body
    const body = await request.json();
    const { patternId } = body;

    if (!patternId || typeof patternId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid patternId' },
        { status: 400 }
      );
    }

    // Add to favorites
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        pattern_id: patternId,
      })
      .select('pattern_id, created_at')
      .single();

    if (error) {
      // Handle duplicate entry (already favorited)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Pattern already in favorites' },
          { status: 409 }
        );
      }
      console.error('Error adding favorite:', error);
      return NextResponse.json(
        { error: 'Failed to add favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Pattern added to favorites',
      favorite: {
        patternId: data.pattern_id,
        createdAt: data.created_at,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/patterns/favorites - Remove a pattern from favorites
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get pattern ID from query params or body
    const { searchParams } = new URL(request.url);
    let patternId = searchParams.get('patternId');

    // Also support body for DELETE
    if (!patternId) {
      try {
        const body = await request.json();
        patternId = body.patternId;
      } catch {
        // Body parsing failed, patternId remains null
      }
    }

    if (!patternId) {
      return NextResponse.json(
        { error: 'Missing patternId' },
        { status: 400 }
      );
    }

    // Remove from favorites
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('pattern_id', patternId);

    if (error) {
      console.error('Error removing favorite:', error);
      return NextResponse.json(
        { error: 'Failed to remove favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Pattern removed from favorites',
      patternId,
    });

  } catch (error) {
    console.error('Favorites DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
