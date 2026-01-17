// src/app/api/patterns/sync-techniques/route.ts
// Sync techniques from pattern repository to knowledge service

import { NextResponse } from 'next/server';
import { listTechniques, repositoryExists } from '@/lib/patterns/repository';

/**
 * GET /api/patterns/sync-techniques
 * Returns techniques from the pattern repository formatted for the knowledge service
 *
 * This endpoint provides data that can be used to seed/sync the app's
 * knowledge service with techniques discovered in the pattern repository.
 */
export async function GET() {
  try {
    if (!repositoryExists()) {
      return NextResponse.json(
        { error: 'Pattern repository not found' },
        { status: 503 }
      );
    }

    const techniques = listTechniques();

    // Map to knowledge service format
    const knowledgeTechniques = techniques.map((tech, index) => {
      // Normalize technique name to create slug
      const slug = tech.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Categorize based on common patterns
      let category = 'other';
      const name = tech.name.toLowerCase();

      if (name.includes('cable') || name.includes('twist')) {
        category = 'cables';
      } else if (name.includes('lace') || name.includes('eyelet') || name.includes('yarn over')) {
        category = 'lace';
      } else if (name.includes('color') || name.includes('intarsia') || name.includes('fair isle') || name.includes('stranded')) {
        category = 'colorwork';
      } else if (name.includes('increase') || name.includes('decrease') || name.includes('shaping')) {
        category = 'shaping';
      } else if (name.includes('cast') || name.includes('bind')) {
        category = 'cast_on_bind_off';
      } else if (name.includes('stitch') || name.includes('knit') || name.includes('purl')) {
        category = 'basic_stitches';
      } else if (name.includes('rib') || name.includes('seed') || name.includes('moss') || name.includes('texture')) {
        category = 'texture';
      } else if (name.includes('join') || name.includes('seam') || name.includes('graft')) {
        category = 'finishing';
      }

      // Estimate difficulty based on complexity
      let difficulty = 1;
      if (name.includes('advanced') || name.includes('complex')) {
        difficulty = 4;
      } else if (name.includes('cable') || name.includes('intarsia') || name.includes('lace')) {
        difficulty = 3;
      } else if (name.includes('color') || name.includes('increase') || name.includes('decrease')) {
        difficulty = 2;
      }

      return {
        id: `repo-${slug}-${index}`,
        name: tech.name,
        slug,
        category,
        difficulty,
        description: `${tech.name} - found in ${tech.count} pattern(s) in the repository`,
        patternCount: tech.count,
        source: 'pattern-repository',
        aliases: [],
        abbreviations: [],
        prerequisites: [],
        relatedTechniques: [],
      };
    });

    return NextResponse.json({
      count: knowledgeTechniques.length,
      techniques: knowledgeTechniques,
      categories: [...new Set(knowledgeTechniques.map(t => t.category))],
    });
  } catch (error) {
    console.error('Sync techniques error:', error);
    return NextResponse.json(
      { error: 'Failed to sync techniques' },
      { status: 500 }
    );
  }
}
