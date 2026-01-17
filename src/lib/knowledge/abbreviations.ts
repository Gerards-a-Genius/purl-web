// src/lib/knowledge/abbreviations.ts
// Standard knitting abbreviation dictionary

import type { AbbreviationEntry, TechniqueCategory } from './types';

/**
 * Master abbreviation dictionary - comprehensive list of standard knitting abbreviations
 * Each entry includes the abbreviation, its variations, full name, definition, and related technique
 */
export const STANDARD_ABBREVIATIONS: AbbreviationEntry[] = [
  // Basic stitches
  {
    abbreviation: 'k',
    variations: ['K', 'knit'],
    fullName: 'knit',
    definition:
      'Insert needle from left to right through front loop, wrap yarn, pull through',
    techniqueId: 'knit-stitch',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'p',
    variations: ['P', 'purl'],
    fullName: 'purl',
    definition:
      'Insert needle from right to left through front loop, wrap yarn, pull through',
    techniqueId: 'purl-stitch',
    category: 'basic-stitches',
    isStandard: true,
  },
  // Decreases
  {
    abbreviation: 'k2tog',
    variations: ['K2tog', 'K2TOG', 'k 2 tog', 'knit 2 together'],
    fullName: 'knit two together',
    definition:
      'Insert needle through 2 stitches as if to knit, knit them together as one (right-leaning decrease)',
    techniqueId: 'k2tog',
    category: 'decreases',
    isStandard: true,
  },
  {
    abbreviation: 'ssk',
    variations: ['SSK', 'Ssk', 'slip slip knit'],
    fullName: 'slip, slip, knit',
    definition:
      'Slip 2 stitches knitwise one at a time, insert left needle through front loops, knit together (left-leaning decrease)',
    techniqueId: 'ssk',
    category: 'decreases',
    isStandard: true,
  },
  {
    abbreviation: 'skp',
    variations: ['SKP', 'Skp', 'sl1-k1-psso'],
    fullName: 'slip, knit, pass slipped stitch over',
    definition:
      'Slip 1 knitwise, knit 1, pass slipped stitch over (left-leaning decrease)',
    techniqueId: 'skp',
    category: 'decreases',
    isStandard: true,
  },
  {
    abbreviation: 'p2tog',
    variations: ['P2tog', 'P2TOG', 'purl 2 together'],
    fullName: 'purl two together',
    definition:
      'Insert needle through 2 stitches as if to purl, purl them together as one',
    techniqueId: 'p2tog',
    category: 'decreases',
    isStandard: true,
  },
  {
    abbreviation: 'cdd',
    variations: ['CDD', 'central double decrease'],
    fullName: 'central double decrease',
    definition:
      'Slip 2 stitches together knitwise, knit 1, pass slipped stitches over (centered decrease)',
    techniqueId: 'cdd',
    category: 'decreases',
    isStandard: true,
  },
  {
    abbreviation: 's2kp',
    variations: ['S2KP', 'sl2-k1-p2sso'],
    fullName: 'slip 2, knit 1, pass 2 slipped stitches over',
    definition:
      'Same as CDD - slip 2 together knitwise, knit 1, pass slipped stitches over',
    techniqueId: 'cdd',
    category: 'decreases',
    isStandard: true,
  },
  // Increases
  {
    abbreviation: 'm1l',
    variations: ['M1L', 'M1-L', 'make 1 left'],
    fullName: 'make one left',
    definition:
      'Pick up bar between stitches from front to back, knit through back loop (left-leaning increase)',
    techniqueId: 'm1l',
    category: 'increases',
    isStandard: true,
  },
  {
    abbreviation: 'm1r',
    variations: ['M1R', 'M1-R', 'make 1 right'],
    fullName: 'make one right',
    definition:
      'Pick up bar between stitches from back to front, knit through front loop (right-leaning increase)',
    techniqueId: 'm1r',
    category: 'increases',
    isStandard: true,
  },
  {
    abbreviation: 'm1',
    variations: ['M1', 'make 1', 'make one'],
    fullName: 'make one',
    definition:
      'Generic make one increase - typically M1L unless otherwise specified',
    techniqueId: 'm1l',
    category: 'increases',
    isStandard: true,
  },
  {
    abbreviation: 'kfb',
    variations: ['KFB', 'Kfb', 'k1fb', 'knit front and back'],
    fullName: 'knit front and back',
    definition:
      'Knit into front loop, then back loop of same stitch before dropping (creates 2 stitches from 1)',
    techniqueId: 'kfb',
    category: 'increases',
    isStandard: true,
  },
  {
    abbreviation: 'pfb',
    variations: ['PFB', 'Pfb', 'purl front and back'],
    fullName: 'purl front and back',
    definition:
      'Purl into front loop, then back loop of same stitch (creates 2 stitches from 1)',
    techniqueId: 'pfb',
    category: 'increases',
    isStandard: true,
  },
  {
    abbreviation: 'yo',
    variations: ['YO', 'Yo', 'yarn over', 'yon', 'yfwd'],
    fullName: 'yarn over',
    definition:
      'Wrap yarn around needle to create a new stitch and decorative hole',
    techniqueId: 'yarn-over',
    category: 'increases',
    isStandard: true,
  },
  {
    abbreviation: 'kll',
    variations: ['KLL', 'knit left loop'],
    fullName: 'knit left loop',
    definition:
      'Pick up left leg of stitch in row below and knit it (left-leaning lifted increase)',
    techniqueId: 'kll',
    category: 'increases',
    isStandard: true,
  },
  {
    abbreviation: 'krl',
    variations: ['KRL', 'knit right loop'],
    fullName: 'knit right loop',
    definition:
      'Pick up right leg of stitch in row below and knit it (right-leaning lifted increase)',
    techniqueId: 'krl',
    category: 'increases',
    isStandard: true,
  },
  // Slipping
  {
    abbreviation: 'sl',
    variations: ['SL', 'Sl', 'slip'],
    fullName: 'slip',
    definition: 'Move stitch from left to right needle without working it',
    techniqueId: 'slip-stitch',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'sl1wyif',
    variations: ['sl1 wyif', 'slip 1 with yarn in front'],
    fullName: 'slip 1 with yarn in front',
    definition: 'Bring yarn to front, slip stitch purlwise',
    techniqueId: 'slip-stitch',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'sl1wyib',
    variations: ['sl1 wyib', 'slip 1 with yarn in back'],
    fullName: 'slip 1 with yarn in back',
    definition: 'Keep yarn in back, slip stitch purlwise',
    techniqueId: 'slip-stitch',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'slkw',
    variations: ['sl kw', 'slip knitwise'],
    fullName: 'slip knitwise',
    definition: 'Slip stitch as if to knit (twists the stitch)',
    techniqueId: 'slip-stitch',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'slpw',
    variations: ['sl pw', 'slip purlwise'],
    fullName: 'slip purlwise',
    definition: 'Slip stitch as if to purl (does not twist)',
    techniqueId: 'slip-stitch',
    category: 'basic-stitches',
    isStandard: true,
  },
  // Navigation markers
  {
    abbreviation: 'pm',
    variations: ['PM', 'Pm', 'place marker'],
    fullName: 'place marker',
    definition: 'Place a stitch marker on the needle',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'sm',
    variations: ['SM', 'Sm', 'slip marker'],
    fullName: 'slip marker',
    definition: 'Slip the stitch marker from left to right needle',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'rm',
    variations: ['RM', 'Rm', 'remove marker'],
    fullName: 'remove marker',
    definition: 'Remove the stitch marker from the needle',
    category: 'basic-stitches',
    isStandard: true,
  },
  // Row/round markers
  {
    abbreviation: 'bor',
    variations: ['BOR', 'BoR', 'beginning of round'],
    fullName: 'beginning of round',
    definition: 'The starting point of each round when knitting in the round',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'rs',
    variations: ['RS', 'right side'],
    fullName: 'right side',
    definition: 'The public-facing side of the work',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'ws',
    variations: ['WS', 'wrong side'],
    fullName: 'wrong side',
    definition: 'The private/inside facing side of the work',
    category: 'basic-stitches',
    isStandard: true,
  },
  // Short rows
  {
    abbreviation: 'gsr',
    variations: ['GSR', 'german short row'],
    fullName: 'German short row',
    definition:
      'Short row technique that creates a double stitch to prevent holes',
    techniqueId: 'german-short-rows',
    category: 'short-rows',
    isStandard: true,
  },
  {
    abbreviation: 'ds',
    variations: ['DS', 'double stitch'],
    fullName: 'double stitch',
    definition: 'The double stitch created by a German short row turn',
    techniqueId: 'german-short-rows',
    category: 'short-rows',
    isStandard: true,
  },
  {
    abbreviation: 'w&t',
    variations: ['W&T', 'wrap and turn', 'wrap & turn'],
    fullName: 'wrap and turn',
    definition:
      'Wrap yarn around next stitch and turn work for short row shaping',
    techniqueId: 'wrap-and-turn',
    category: 'short-rows',
    isStandard: true,
  },
  // Cast on/bind off
  {
    abbreviation: 'co',
    variations: ['CO', 'Co', 'cast on'],
    fullName: 'cast on',
    definition: 'Create the initial stitches on your needle',
    category: 'cast-on',
    isStandard: true,
  },
  {
    abbreviation: 'bo',
    variations: ['BO', 'Bo', 'bind off', 'cast off'],
    fullName: 'bind off',
    definition: 'Secure stitches to prevent unraveling and finish an edge',
    category: 'bind-off',
    isStandard: true,
  },
  // Through back loop
  {
    abbreviation: 'tbl',
    variations: ['TBL', 'through back loop'],
    fullName: 'through back loop',
    definition:
      'Work stitch through the back loop instead of front (twists the stitch)',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'ktbl',
    variations: ['KTBL', 'k tbl', 'knit through back loop'],
    fullName: 'knit through back loop',
    definition: 'Knit the stitch through its back loop (twisted knit)',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'ptbl',
    variations: ['PTBL', 'p tbl', 'purl through back loop'],
    fullName: 'purl through back loop',
    definition: 'Purl the stitch through its back loop (twisted purl)',
    category: 'basic-stitches',
    isStandard: true,
  },
  // Colorwork
  {
    abbreviation: 'mc',
    variations: ['MC', 'main color', 'main colour'],
    fullName: 'main color',
    definition: 'The primary/dominant color in a colorwork pattern',
    category: 'colorwork',
    isStandard: true,
  },
  {
    abbreviation: 'cc',
    variations: ['CC', 'contrast color', 'contrast colour'],
    fullName: 'contrast color',
    definition: 'The secondary color in a colorwork pattern',
    category: 'colorwork',
    isStandard: true,
  },
  {
    abbreviation: 'cc1',
    variations: ['CC1', 'contrast color 1'],
    fullName: 'contrast color 1',
    definition: 'First contrast color when multiple contrast colors are used',
    category: 'colorwork',
    isStandard: true,
  },
  {
    abbreviation: 'cc2',
    variations: ['CC2', 'contrast color 2'],
    fullName: 'contrast color 2',
    definition: 'Second contrast color when multiple contrast colors are used',
    category: 'colorwork',
    isStandard: true,
  },
  // Cables
  {
    abbreviation: 'cn',
    variations: ['CN', 'cable needle'],
    fullName: 'cable needle',
    definition: 'A short needle used to hold stitches while working cables',
    category: 'cables',
    isStandard: true,
  },
  {
    abbreviation: 'c4f',
    variations: ['C4F', 'cable 4 front'],
    fullName: 'cable 4 front',
    definition:
      'Slip 2 stitches to cable needle, hold in front, k2, k2 from cable needle',
    techniqueId: 'cable-4-front',
    category: 'cables',
    isStandard: true,
  },
  {
    abbreviation: 'c4b',
    variations: ['C4B', 'cable 4 back'],
    fullName: 'cable 4 back',
    definition:
      'Slip 2 stitches to cable needle, hold in back, k2, k2 from cable needle',
    techniqueId: 'cable-4-back',
    category: 'cables',
    isStandard: true,
  },
  {
    abbreviation: 'c6f',
    variations: ['C6F', 'cable 6 front'],
    fullName: 'cable 6 front',
    definition:
      'Slip 3 stitches to cable needle, hold in front, k3, k3 from cable needle',
    techniqueId: 'cable-6-front',
    category: 'cables',
    isStandard: true,
  },
  {
    abbreviation: 'c6b',
    variations: ['C6B', 'cable 6 back'],
    fullName: 'cable 6 back',
    definition:
      'Slip 3 stitches to cable needle, hold in back, k3, k3 from cable needle',
    techniqueId: 'cable-6-back',
    category: 'cables',
    isStandard: true,
  },
  // Repeats
  {
    abbreviation: 'rep',
    variations: ['REP', 'Rep', 'repeat'],
    fullName: 'repeat',
    definition: 'Work the specified stitches again',
    category: 'basic-stitches',
    isStandard: true,
  },
  // General
  {
    abbreviation: 'st',
    variations: ['ST', 'St', 'sts', 'STS', 'stitch', 'stitches'],
    fullName: 'stitch(es)',
    definition: 'One or more loops on the needle',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'rnd',
    variations: ['RND', 'Rnd', 'round'],
    fullName: 'round',
    definition: 'One complete circuit when knitting in the round',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'patt',
    variations: ['PATT', 'Patt', 'pattern'],
    fullName: 'pattern',
    definition: 'Continue in the established stitch pattern',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'rem',
    variations: ['REM', 'Rem', 'remaining'],
    fullName: 'remaining',
    definition: 'The stitches left on the needle',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'beg',
    variations: ['BEG', 'Beg', 'beginning'],
    fullName: 'beginning',
    definition: 'At the start of a row or round',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'alt',
    variations: ['ALT', 'Alt', 'alternate'],
    fullName: 'alternate',
    definition: 'Every other row/round',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'tog',
    variations: ['TOG', 'Tog', 'together'],
    fullName: 'together',
    definition: 'Work multiple stitches as one',
    category: 'basic-stitches',
    isStandard: true,
  },
  {
    abbreviation: 'inc',
    variations: ['INC', 'Inc', 'increase'],
    fullName: 'increase',
    definition: 'Add one or more stitches',
    category: 'increases',
    isStandard: true,
  },
  {
    abbreviation: 'dec',
    variations: ['DEC', 'Dec', 'decrease'],
    fullName: 'decrease',
    definition: 'Remove one or more stitches',
    category: 'decreases',
    isStandard: true,
  },
  // Special stitches
  {
    abbreviation: 'psso',
    variations: ['PSSO', 'pass slipped stitch over'],
    fullName: 'pass slipped stitch over',
    definition: 'Pass the slipped stitch over the stitch just worked',
    category: 'decreases',
    isStandard: true,
  },
  {
    abbreviation: 'dpn',
    variations: ['DPN', 'dpns', 'double pointed needles'],
    fullName: 'double pointed needles',
    definition: 'Needles pointed at both ends, used for small circumference knitting',
    category: 'construction',
    isStandard: true,
  },
];

/**
 * Find abbreviation entry by any variation
 */
export function findAbbreviation(
  abbr: string
): AbbreviationEntry | undefined {
  const normalized = abbr.toLowerCase().trim();
  return STANDARD_ABBREVIATIONS.find(
    (entry) =>
      entry.abbreviation.toLowerCase() === normalized ||
      entry.variations.some((v) => v.toLowerCase() === normalized)
  );
}

/**
 * Check if a string contains a known abbreviation
 */
export function containsAbbreviation(text: string): AbbreviationEntry[] {
  const found: AbbreviationEntry[] = [];
  for (const entry of STANDARD_ABBREVIATIONS) {
    const allVariants = [entry.abbreviation, ...entry.variations];
    for (const variant of allVariants) {
      // Match whole words only
      const regex = new RegExp(`\\b${variant}\\b`, 'i');
      if (regex.test(text) && !found.includes(entry)) {
        found.push(entry);
        break;
      }
    }
  }
  return found;
}

/**
 * Get abbreviations by category
 */
export function getAbbreviationsByCategory(
  category: TechniqueCategory
): AbbreviationEntry[] {
  return STANDARD_ABBREVIATIONS.filter((entry) => entry.category === category);
}

/**
 * Expand abbreviations in a pattern instruction
 */
export function expandAbbreviationsInText(text: string): string {
  let expanded = text;
  for (const entry of STANDARD_ABBREVIATIONS) {
    const allVariants = [entry.abbreviation, ...entry.variations];
    for (const variant of allVariants) {
      // Only replace exact abbreviation matches (not within words)
      const regex = new RegExp(`\\b${variant}\\b`, 'gi');
      expanded = expanded.replace(regex, entry.fullName);
    }
  }
  return expanded;
}
