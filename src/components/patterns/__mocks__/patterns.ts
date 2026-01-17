// src/components/patterns/__mocks__/patterns.ts
// Mock data for Pattern Library Storybook stories and development

import type { LibraryPattern, PatternCardData } from '@/types/pattern';

// ============================================================================
// FULL PATTERNS (for detail views)
// ============================================================================

export const mockPatterns: LibraryPattern[] = [
  {
    id: 'pattern-001',
    title: 'Classic Cable Knit Sweater',
    description:
      'A timeless Aran-style sweater featuring traditional cable patterns. Perfect for showcasing your cable knitting skills.',
    type: 'knitting',
    category: 'sweater',
    difficulty: 'intermediate',
    imageUrl: '/images/patterns/cable-sweater.jpg',
    thumbnailUrl: '/images/patterns/cable-sweater-thumb.jpg',
    techniques: [
      { id: 'cable', name: 'Cable', complexity: 0.7 },
      { id: 'ribbing', name: 'Ribbing', complexity: 0.3 },
      { id: 'seaming', name: 'Seaming', complexity: 0.4 },
    ],
    materials: {
      yarnWeight: 'worsted',
      fiberContent: ['wool'],
      yardage: 1200,
      needleSize: 'US 7 / 4.5mm',
      notions: ['cable needle', 'stitch markers', 'tapestry needle'],
    },
    gauge: {
      stitchesPerInch: 5,
      rowsPerInch: 7,
      swatchSize: '4x4 inches',
    },
    sizing: {
      availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    },
    instructionFormat: 'both',
    estimatedTime: '40-60 hours',
    source: 'Public Domain',
    license: 'public_domain',
    tags: ['classic', 'aran', 'warm', 'winter'],
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'pattern-002',
    title: 'Lace Shawl',
    description:
      'An elegant triangular shawl with intricate lace patterns. A beautiful accessory for special occasions.',
    type: 'knitting',
    category: 'shawl',
    difficulty: 'advanced',
    imageUrl: '/images/patterns/lace-shawl.jpg',
    thumbnailUrl: '/images/patterns/lace-shawl-thumb.jpg',
    techniques: [
      { id: 'lace', name: 'Lace', complexity: 0.8 },
      { id: 'yo', name: 'Yarn Over', complexity: 0.3 },
      { id: 'k2tog', name: 'K2tog', complexity: 0.2 },
      { id: 'ssk', name: 'SSK', complexity: 0.2 },
      { id: 'blocking', name: 'Blocking', complexity: 0.4 },
    ],
    materials: {
      yarnWeight: 'lace',
      fiberContent: ['silk', 'wool'],
      yardage: 800,
      needleSize: 'US 4 / 3.5mm',
      notions: ['stitch markers', 'blocking pins', 'blocking mats'],
    },
    gauge: {
      stitchesPerInch: 6.5,
      rowsPerInch: 9,
      swatchSize: '4x4 inches blocked',
    },
    sizing: {
      availableSizes: ['One Size'],
    },
    instructionFormat: 'charted',
    estimatedTime: '30-40 hours',
    source: 'MIT CSAIL KnitDB',
    license: 'mit',
    tags: ['elegant', 'lace', 'spring', 'wedding'],
    createdAt: '2025-01-09T10:00:00Z',
  },
  {
    id: 'pattern-003',
    title: 'Cozy Beginner Hat',
    description:
      'A simple stockinette hat perfect for beginners. Learn the basics of knitting in the round with this quick project.',
    type: 'knitting',
    category: 'hat',
    difficulty: 'beginner',
    imageUrl: '/images/patterns/beginner-hat.jpg',
    thumbnailUrl: '/images/patterns/beginner-hat-thumb.jpg',
    techniques: [
      { id: 'knit', name: 'Knit', complexity: 0.1 },
      { id: 'purl', name: 'Purl', complexity: 0.1 },
      { id: 'ribbing', name: 'Ribbing', complexity: 0.3 },
      { id: 'decreases', name: 'Decreases', complexity: 0.3 },
    ],
    materials: {
      yarnWeight: 'bulky',
      fiberContent: ['wool', 'acrylic'],
      yardage: 150,
      needleSize: 'US 10 / 6mm',
      notions: ['stitch marker', 'dpns or magic loop'],
    },
    gauge: {
      stitchesPerInch: 3.5,
      rowsPerInch: 5,
      swatchSize: '4x4 inches',
    },
    sizing: {
      availableSizes: ['Child', 'Adult S/M', 'Adult L/XL'],
    },
    instructionFormat: 'written',
    estimatedTime: '3-5 hours',
    source: 'Public Domain',
    license: 'public_domain',
    tags: ['beginner-friendly', 'quick', 'gift'],
    createdAt: '2025-01-08T10:00:00Z',
  },
  {
    id: 'pattern-004',
    title: 'Fair Isle Mittens',
    description:
      'Traditional Nordic-style mittens with colorwork patterns. A great introduction to stranded knitting.',
    type: 'knitting',
    category: 'mittens',
    difficulty: 'intermediate',
    imageUrl: '/images/patterns/fairisle-mittens.jpg',
    thumbnailUrl: '/images/patterns/fairisle-mittens-thumb.jpg',
    techniques: [
      { id: 'colorwork', name: 'Colorwork', complexity: 0.6 },
      { id: 'stranded', name: 'Stranded', complexity: 0.6 },
      { id: 'dpns', name: 'DPNs', complexity: 0.4 },
      { id: 'thumb-gusset', name: 'Thumb Gusset', complexity: 0.5 },
    ],
    materials: {
      yarnWeight: 'fingering',
      fiberContent: ['wool'],
      yardage: 250,
      needleSize: 'US 2 / 2.75mm',
      notions: ['dpns', 'stitch markers', 'waste yarn'],
    },
    gauge: {
      stitchesPerInch: 8,
      rowsPerInch: 10,
      swatchSize: '4x4 inches',
    },
    sizing: {
      availableSizes: ['S', 'M', 'L'],
    },
    instructionFormat: 'both',
    estimatedTime: '15-20 hours',
    source: 'Neural Inverse Knitting',
    license: 'mit',
    tags: ['nordic', 'colorful', 'winter', 'traditional'],
    createdAt: '2025-01-07T10:00:00Z',
  },
  {
    id: 'pattern-005',
    title: 'Granny Square Blanket',
    description:
      'A classic crochet blanket made from traditional granny squares. Mix and match colors for endless possibilities.',
    type: 'crochet',
    category: 'blanket',
    difficulty: 'easy',
    imageUrl: '/images/patterns/granny-blanket.jpg',
    thumbnailUrl: '/images/patterns/granny-blanket-thumb.jpg',
    techniques: [
      { id: 'granny-square', name: 'Granny Square', complexity: 0.3 },
      { id: 'joining', name: 'Joining Squares', complexity: 0.3 },
      { id: 'border', name: 'Border', complexity: 0.2 },
    ],
    materials: {
      yarnWeight: 'worsted',
      fiberContent: ['acrylic'],
      yardage: 2000,
      hookSize: 'H/8 (5mm)',
      notions: ['tapestry needle'],
    },
    sizing: {
      availableSizes: ['Baby', 'Throw', 'Full'],
    },
    instructionFormat: 'written',
    estimatedTime: '30-50 hours',
    source: 'Antique Pattern Library',
    license: 'public_domain',
    tags: ['cozy', 'colorful', 'modular', 'classic'],
    createdAt: '2025-01-06T10:00:00Z',
  },
  {
    id: 'pattern-006',
    title: 'Amigurumi Bunny',
    description:
      'An adorable stuffed bunny worked in single crochet. Perfect for gifts or nursery decor.',
    type: 'crochet',
    category: 'toy',
    difficulty: 'easy',
    imageUrl: '/images/patterns/amigurumi-bunny.jpg',
    thumbnailUrl: '/images/patterns/amigurumi-bunny-thumb.jpg',
    techniques: [
      { id: 'sc', name: 'Single Crochet', complexity: 0.2 },
      { id: 'magic-ring', name: 'Magic Ring', complexity: 0.4 },
      { id: 'inc-dec', name: 'Inc/Dec', complexity: 0.3 },
      { id: 'assembly', name: 'Assembly', complexity: 0.4 },
    ],
    materials: {
      yarnWeight: 'dk',
      fiberContent: ['cotton'],
      yardage: 200,
      hookSize: 'E/4 (3.5mm)',
      notions: ['safety eyes', 'polyfill stuffing', 'tapestry needle'],
    },
    sizing: {
      availableSizes: ['One Size (8 inches)'],
    },
    instructionFormat: 'written',
    estimatedTime: '8-12 hours',
    source: 'FOSSASIA',
    license: 'mit',
    tags: ['cute', 'gift', 'stuffed', 'kids'],
    createdAt: '2025-01-05T10:00:00Z',
  },
  {
    id: 'pattern-007',
    title: 'Textured Scarf',
    description:
      'A reversible scarf featuring seed stitch and basketweave patterns. Great for practicing texture stitches.',
    type: 'knitting',
    category: 'scarf',
    difficulty: 'easy',
    imageUrl: '/images/patterns/textured-scarf.jpg',
    thumbnailUrl: '/images/patterns/textured-scarf-thumb.jpg',
    techniques: [
      { id: 'knit', name: 'Knit', complexity: 0.1 },
      { id: 'purl', name: 'Purl', complexity: 0.1 },
      { id: 'seed-stitch', name: 'Seed Stitch', complexity: 0.2 },
      { id: 'basketweave', name: 'Basketweave', complexity: 0.3 },
    ],
    materials: {
      yarnWeight: 'aran',
      fiberContent: ['merino wool'],
      yardage: 400,
      needleSize: 'US 8 / 5mm',
    },
    sizing: {
      availableSizes: ['One Size (8" x 60")'],
    },
    instructionFormat: 'written',
    estimatedTime: '10-15 hours',
    source: 'Public Domain',
    license: 'public_domain',
    tags: ['reversible', 'texture', 'unisex'],
    createdAt: '2025-01-04T10:00:00Z',
  },
  {
    id: 'pattern-008',
    title: 'Intricate Lace Socks',
    description:
      'Delicate lace socks with a complex stitch pattern. A challenging project for experienced knitters.',
    type: 'knitting',
    category: 'socks',
    difficulty: 'expert',
    imageUrl: '/images/patterns/lace-socks.jpg',
    thumbnailUrl: '/images/patterns/lace-socks-thumb.jpg',
    techniques: [
      { id: 'lace', name: 'Lace', complexity: 0.8 },
      { id: 'heel-flap', name: 'Heel Flap', complexity: 0.6 },
      { id: 'kitchener', name: 'Kitchener Stitch', complexity: 0.7 },
      { id: 'magic-loop', name: 'Magic Loop', complexity: 0.5 },
    ],
    materials: {
      yarnWeight: 'fingering',
      fiberContent: ['merino', 'nylon'],
      yardage: 400,
      needleSize: 'US 1 / 2.25mm',
      notions: ['dpns or magic loop needles', 'stitch markers'],
    },
    gauge: {
      stitchesPerInch: 8,
      rowsPerInch: 11,
      swatchSize: '4x4 inches',
    },
    sizing: {
      availableSizes: ['S (7")', 'M (8")', 'L (9")'],
    },
    instructionFormat: 'both',
    estimatedTime: '25-35 hours',
    source: 'Yarn Master Dataset',
    license: 'cc-by',
    tags: ['delicate', 'feminine', 'challenge'],
    createdAt: '2025-01-03T10:00:00Z',
  },
  {
    id: 'pattern-009',
    title: 'Chunky Cardigan',
    description:
      'A quick-to-knit oversized cardigan in super bulky yarn. Cozy and trendy.',
    type: 'knitting',
    category: 'cardigan',
    difficulty: 'beginner',
    imageUrl: '/images/patterns/chunky-cardigan.jpg',
    thumbnailUrl: '/images/patterns/chunky-cardigan-thumb.jpg',
    techniques: [
      { id: 'knit', name: 'Knit', complexity: 0.1 },
      { id: 'purl', name: 'Purl', complexity: 0.1 },
      { id: 'seaming', name: 'Seaming', complexity: 0.4 },
      { id: 'picking-up', name: 'Picking Up Stitches', complexity: 0.4 },
    ],
    materials: {
      yarnWeight: 'super_bulky',
      fiberContent: ['wool', 'alpaca'],
      yardage: 800,
      needleSize: 'US 15 / 10mm',
      notions: ['large buttons (5)', 'tapestry needle'],
    },
    gauge: {
      stitchesPerInch: 2,
      rowsPerInch: 3,
      swatchSize: '4x4 inches',
    },
    sizing: {
      availableSizes: ['XS/S', 'M/L', 'XL/2XL'],
    },
    instructionFormat: 'written',
    estimatedTime: '15-20 hours',
    source: 'Public Domain',
    license: 'public_domain',
    tags: ['cozy', 'oversized', 'trendy', 'quick'],
    createdAt: '2025-01-02T10:00:00Z',
  },
  {
    id: 'pattern-010',
    title: 'Market Tote Bag',
    description:
      'A sturdy crocheted tote bag perfect for shopping or everyday use. Features a reinforced base.',
    type: 'crochet',
    category: 'bag',
    difficulty: 'intermediate',
    imageUrl: '/images/patterns/market-tote.jpg',
    thumbnailUrl: '/images/patterns/market-tote-thumb.jpg',
    techniques: [
      { id: 'sc', name: 'Single Crochet', complexity: 0.2 },
      { id: 'hdc', name: 'Half Double Crochet', complexity: 0.2 },
      { id: 'working-in-round', name: 'Working in Round', complexity: 0.3 },
      { id: 'handles', name: 'Handle Construction', complexity: 0.5 },
    ],
    materials: {
      yarnWeight: 'worsted',
      fiberContent: ['cotton'],
      yardage: 500,
      hookSize: 'G/6 (4mm)',
      notions: ['stitch markers'],
    },
    sizing: {
      availableSizes: ['One Size (14" x 16")'],
    },
    instructionFormat: 'written',
    estimatedTime: '12-16 hours',
    source: 'Public Domain',
    license: 'public_domain',
    tags: ['practical', 'eco-friendly', 'sturdy'],
    createdAt: '2025-01-01T10:00:00Z',
  },
  {
    id: 'pattern-011',
    title: 'Twisted Rib Fingerless Gloves',
    description:
      'Elegant fingerless gloves featuring twisted rib stitch. Quick to knit, perfect for texting weather.',
    type: 'knitting',
    category: 'gloves',
    difficulty: 'easy',
    imageUrl: '/images/patterns/fingerless-gloves.jpg',
    thumbnailUrl: '/images/patterns/fingerless-gloves-thumb.jpg',
    techniques: [
      { id: 'twisted-rib', name: 'Twisted Rib', complexity: 0.3 },
      { id: 'dpns', name: 'DPNs', complexity: 0.4 },
      { id: 'thumb-opening', name: 'Thumb Opening', complexity: 0.3 },
    ],
    materials: {
      yarnWeight: 'dk',
      fiberContent: ['wool'],
      yardage: 150,
      needleSize: 'US 5 / 3.75mm',
      notions: ['dpns', 'stitch marker', 'waste yarn'],
    },
    sizing: {
      availableSizes: ['S', 'M', 'L'],
    },
    instructionFormat: 'written',
    estimatedTime: '6-8 hours',
    source: 'Public Domain',
    license: 'public_domain',
    tags: ['quick', 'gift', 'practical'],
    createdAt: '2024-12-30T10:00:00Z',
  },
  {
    id: 'pattern-012',
    title: 'Cabled Throw Pillow',
    description:
      'A decorative pillow cover featuring an intricate cable panel. Add texture to your home decor.',
    type: 'knitting',
    category: 'home',
    difficulty: 'advanced',
    imageUrl: '/images/patterns/cable-pillow.jpg',
    thumbnailUrl: '/images/patterns/cable-pillow-thumb.jpg',
    techniques: [
      { id: 'cable', name: 'Cable', complexity: 0.7 },
      { id: 'bobbles', name: 'Bobbles', complexity: 0.6 },
      { id: 'seed-stitch', name: 'Seed Stitch', complexity: 0.2 },
      { id: 'buttonhole', name: 'Buttonhole', complexity: 0.4 },
    ],
    materials: {
      yarnWeight: 'aran',
      fiberContent: ['cotton', 'wool'],
      yardage: 350,
      needleSize: 'US 8 / 5mm',
      notions: ['cable needle', 'buttons (3)', '18" pillow form'],
    },
    sizing: {
      availableSizes: ['18" x 18"'],
    },
    instructionFormat: 'both',
    estimatedTime: '15-20 hours',
    source: 'MIT CSAIL KnitDB',
    license: 'mit',
    tags: ['home', 'decor', 'texture', 'gift'],
    createdAt: '2024-12-28T10:00:00Z',
  },
];

// ============================================================================
// CARD DATA (simplified for grid display)
// ============================================================================

export const mockPatternCards: PatternCardData[] = mockPatterns.map((p) => ({
  id: p.id,
  title: p.title,
  type: p.type,
  category: p.category,
  difficulty: p.difficulty,
  thumbnailUrl: p.thumbnailUrl,
  techniques: p.techniques,
  materials: p.materials,
  isFavorited: p.isFavorited,
}));

// ============================================================================
// FILTER OPTIONS (derived from mock data)
// ============================================================================

export const mockTechniques = [
  { id: 'knit', name: 'Knit Stitch' },
  { id: 'purl', name: 'Purl Stitch' },
  { id: 'cable', name: 'Cable' },
  { id: 'lace', name: 'Lace' },
  { id: 'colorwork', name: 'Colorwork' },
  { id: 'ribbing', name: 'Ribbing' },
  { id: 'seed-stitch', name: 'Seed Stitch' },
  { id: 'basketweave', name: 'Basketweave' },
  { id: 'stranded', name: 'Stranded Knitting' },
  { id: 'granny-square', name: 'Granny Square' },
  { id: 'sc', name: 'Single Crochet' },
  { id: 'hdc', name: 'Half Double Crochet' },
  { id: 'magic-ring', name: 'Magic Ring' },
  { id: 'bobbles', name: 'Bobbles' },
  { id: 'blocking', name: 'Blocking' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPatternById(id: string): LibraryPattern | undefined {
  return mockPatterns.find((p) => p.id === id);
}

export function getPatternsByDifficulty(
  difficulty: LibraryPattern['difficulty']
): LibraryPattern[] {
  return mockPatterns.filter((p) => p.difficulty === difficulty);
}

export function getPatternsByType(type: LibraryPattern['type']): LibraryPattern[] {
  return mockPatterns.filter((p) => p.type === type);
}

export function getPatternsByCategory(
  category: LibraryPattern['category']
): LibraryPattern[] {
  return mockPatterns.filter((p) => p.category === category);
}

export function getPatternsByTechnique(techniqueId: string): LibraryPattern[] {
  return mockPatterns.filter((p) =>
    p.techniques.some((t) => t.id === techniqueId)
  );
}

export function searchPatterns(query: string): LibraryPattern[] {
  const lowerQuery = query.toLowerCase();
  return mockPatterns.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.tags?.some((t) => t.toLowerCase().includes(lowerQuery)) ||
      p.techniques.some((t) => t.name.toLowerCase().includes(lowerQuery))
  );
}
