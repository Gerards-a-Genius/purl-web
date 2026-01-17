// supabase/functions/generate-steps/index.ts
// Edge Function for AI-powered step generation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAIClient, extractJSON } from '../_shared/aiClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProjectInfo {
  projectType: 'scarf' | 'hat' | 'mittens' | 'socks' | 'blanket' | 'sweater' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  yarn: string;
  needles: string;
  size?: string;
  notes?: string;
  customInstructions?: string;
}

interface GeneratedStep {
  label: string;
  title: string;
  description: string;
  techniques: string[];
  type: 'single' | 'group' | 'repeat';
  rowCount?: number;
  startRow?: number;
  endRow?: number;
  stitchCount?: number;
  repeatCount?: number;
  repeatPattern?: string[];
  milestone?: boolean;
}

interface GenerateStepsResult {
  steps: GeneratedStep[];
  techniques: string[];
  totalRows: number;
  estimatedTime: string;
  tips: string[];
}

/**
 * Get gauge information based on yarn weight
 */
function getGaugeInfo(yarn: string): { stitchesPerInch: number; rowsPerInch: number; description: string } {
  const yarnLower = yarn.toLowerCase();

  if (yarnLower.includes('fingering') || yarnLower.includes('sock')) {
    return { stitchesPerInch: 7, rowsPerInch: 10, description: 'Fingering weight: 7 sts × 10 rows = 1 inch' };
  }
  if (yarnLower.includes('dk') || yarnLower.includes('light worsted')) {
    return { stitchesPerInch: 5.5, rowsPerInch: 8, description: 'DK weight: 5.5 sts × 8 rows = 1 inch' };
  }
  if (yarnLower.includes('worsted') || yarnLower.includes('aran')) {
    return { stitchesPerInch: 4.5, rowsPerInch: 6, description: 'Worsted weight: 4.5 sts × 6 rows = 1 inch' };
  }
  if (yarnLower.includes('bulky') || yarnLower.includes('chunky')) {
    return { stitchesPerInch: 3.5, rowsPerInch: 5, description: 'Bulky weight: 3.5 sts × 5 rows = 1 inch' };
  }
  if (yarnLower.includes('super bulky')) {
    return { stitchesPerInch: 2.5, rowsPerInch: 4, description: 'Super bulky: 2.5 sts × 4 rows = 1 inch' };
  }

  return { stitchesPerInch: 4.5, rowsPerInch: 6, description: 'Worsted weight (default): 4.5 sts × 6 rows = 1 inch' };
}

/**
 * Get difficulty description
 */
function getDifficultyDescription(difficulty: number): string {
  switch (difficulty) {
    case 1: return 'BEGINNER - Use basic stitches only (knit, purl). Explain every step in detail.';
    case 2: return 'EASY - Can include simple shaping (K2tog, M1). Some details can be abbreviated.';
    case 3: return 'INTERMEDIATE - Can include multiple techniques. Standard pattern terminology.';
    case 4: return 'ADVANCED - Complex patterns, cables, colorwork. Concise instructions.';
    case 5: return 'EXPERT - Professional-level techniques. Minimal explanation needed.';
    default: return 'BEGINNER - Use basic stitches only (knit, purl). Explain every step in detail.';
  }
}

/**
 * Build the step generation prompt
 */
function buildPrompt(projectInfo: ProjectInfo, gauge: { stitchesPerInch: number; rowsPerInch: number; description: string }): string {
  const difficultyDesc = getDifficultyDescription(projectInfo.difficulty);

  return `You are an expert knitting pattern designer with 25 years of experience creating patterns for all skill levels. Generate a complete, step-by-step knitting pattern for the project described below.

## PROJECT SPECIFICATIONS

**Project Type:** ${projectInfo.projectType}
**Size:** ${projectInfo.size || 'standard'}
**Yarn:** ${projectInfo.yarn}
**Needles:** ${projectInfo.needles}
**Difficulty Level:** ${projectInfo.difficulty}/5 - ${difficultyDesc}
${projectInfo.notes ? `**Notes:** ${projectInfo.notes}` : ''}
${projectInfo.customInstructions ? `**Custom Instructions:** ${projectInfo.customInstructions}` : ''}

## GAUGE REFERENCE

${gauge.description}
- Stitches per inch: ${gauge.stitchesPerInch}
- Rows per inch: ${gauge.rowsPerInch}

**Use these calculations:**
- Width in inches × ${gauge.stitchesPerInch} = cast-on stitches (round to nearest even number)
- Length in inches × ${gauge.rowsPerInch} = total rows

## PROJECT-SPECIFIC GUIDELINES

${projectInfo.projectType === 'scarf' ? `
**SCARF Structure:**
- Standard dimensions: 6-8" wide × 60-72" long
- Cast on: ${Math.round(7 * gauge.stitchesPerInch)} stitches (for 7" width)
- Total rows: approximately ${Math.round(66 * gauge.rowsPerInch)} rows
- Recommended pattern: Garter stitch (all knit) for no-curl edges` :
projectInfo.projectType === 'hat' ? `
**HAT Structure:**
- Worked in the round
- Circumference: 20-21" (adult medium)
- Cast on: ${Math.round(20.5 * gauge.stitchesPerInch)} stitches
- Brim: 1-2" of ribbing
- Body: Work until 7" from cast-on
- Crown: Decrease evenly to close` :
projectInfo.projectType === 'blanket' ? `
**BLANKET Structure:**
- Standard throw: 50" × 60"
- Worked flat in rows
- Consider border stitches for clean edges
- Modular sections can make it more manageable` :
`**${projectInfo.projectType.toUpperCase()} Structure:**
- Generate appropriate structure for this project type
- Include all necessary sections from setup to finishing`}

## OUTPUT FORMAT

Return a JSON object with this EXACT structure:
{
  "steps": [
    {
      "label": "Setup",
      "title": "Cast On X Stitches",
      "description": "Detailed instructions with numbered sub-steps. Step 1: [action]. Step 2: [action].",
      "techniques": ["long-tail-cast-on"],
      "type": "single",
      "rowCount": 1,
      "stitchCount": 32,
      "milestone": true
    },
    {
      "label": "Rows 1-20",
      "title": "Body Section",
      "description": "Work the body pattern.",
      "techniques": ["knit", "purl"],
      "type": "repeat",
      "rowCount": 20,
      "startRow": 1,
      "endRow": 20,
      "repeatCount": 10,
      "repeatPattern": ["Knit all stitches (RS)", "Purl all stitches (WS)"]
    }
  ],
  "techniques": ["long-tail-cast-on", "knit", "purl", "basic-bind-off"],
  "totalRows": 44,
  "estimatedTime": "8-12 hours",
  "tips": [
    "Count your stitches at the end of every row for the first few rows",
    "Mark your right side with a safety pin or stitch marker"
  ]
}

## TECHNIQUE IDS TO USE

Use these exact technique IDs:
- knit, purl
- long-tail-cast-on, cable-cast-on
- basic-bind-off
- k2tog, ssk, p2tog
- yo, kfb, m1
- garter-stitch, stockinette
- rib-1x1, rib-2x2

## STEP REQUIREMENTS

1. **Every step MUST include:**
   - label: Short identifier (e.g., "Row 1", "Setup", "Rows 1-20")
   - title: Descriptive title
   - description: Detailed instructions with numbered sub-steps
   - techniques: Array of technique IDs used
   - type: "single", "group", or "repeat"
   - rowCount: Number of rows this step covers

2. **For repeat sections:** Include repeatCount and repeatPattern

3. **Milestones:** Mark key checkpoints (cast-on, bind-off, section completions) with milestone: true

4. **Descriptions MUST include:**
   - Summary sentence
   - Numbered sub-steps (Step 1:, Step 2:, etc.)
   - Specific stitch counts
   - Verification step at the end

## RULES

1. Return ONLY valid JSON - no markdown, no explanation
2. Difficulty 1-2: Include detailed explanations, 8-12 sub-steps
3. Difficulty 3-4: Standard instructions, 5-8 sub-steps
4. Difficulty 5: Concise notation, 3-5 sub-steps
5. Always include verification steps ("Count to confirm X stitches")
6. Be encouraging, especially for beginners

Generate the complete pattern now:`;
}

function generateStepId(): string {
  return `step-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase client to verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: ProjectInfo = await req.json();
    const { projectType, difficulty, yarn, needles, size, notes, customInstructions } = body;

    if (!projectType || !yarn || !needles) {
      return new Response(
        JSON.stringify({ error: 'projectType, yarn, and needles are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-steps] Generating steps for ${projectType}, difficulty ${difficulty}`);

    // Get gauge info based on yarn
    const gauge = getGaugeInfo(yarn);

    // Build prompt
    const prompt = buildPrompt(
      { projectType, difficulty: difficulty || 1, yarn, needles, size, notes, customInstructions },
      gauge
    );

    // Call AI
    const client = getAIClient();
    const responseText = await client.generateContent(prompt);

    // Extract JSON from response
    const response = extractJSON<GenerateStepsResult>(responseText);

    // Validate and ensure IDs
    const stepsWithIds = response.steps.map((step, index) => ({
      ...step,
      id: generateStepId(),
      rowCount: step.rowCount || 1,
    }));

    const result: GenerateStepsResult = {
      steps: stepsWithIds,
      techniques: response.techniques || [],
      totalRows: response.totalRows || stepsWithIds.reduce((sum, s) => sum + (s.rowCount || 1), 0),
      estimatedTime: response.estimatedTime || 'Varies by experience',
      tips: response.tips || [],
    };

    console.log(`[generate-steps] Successfully generated ${result.steps.length} steps`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[generate-steps] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
