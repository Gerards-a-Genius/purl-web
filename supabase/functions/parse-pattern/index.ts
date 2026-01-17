// supabase/functions/parse-pattern/index.ts
// Edge Function for parsing knitting patterns using AI

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAIClient, extractJSON } from '../_shared/aiClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pattern parsing prompt - comprehensive instructions for AI
const PATTERN_PARSE_PROMPT = `You are an expert knitting pattern analyst with 20 years of experience translating patterns from every major publisher into clear, beginner-friendly instructions. Your specialty is taking complex or ambiguous pattern language and converting it into step-by-step guidance that any knitter can follow.

## YOUR PARSING PROCESS

Before generating output, analyze the pattern by thinking through these steps:

1. **FORMAT RECOGNITION**
   - Is this a written pattern, chart, or combination?
   - Is terminology British (cast off, tension, stocking stitch) or American (bind off, gauge, stockinette)?
   - What is the skill level implied by the techniques used?

2. **STRUCTURE IDENTIFICATION**
   - Identify major sections (cast on, body, shaping, finishing)
   - Note any repeated sections or pattern repeats
   - Flag any unclear or ambiguous instructions internally

3. **TECHNIQUE EXTRACTION**
   - List all techniques explicitly mentioned
   - Infer techniques from abbreviations and context
   - Map to available technique IDs

4. **AMBIGUITY RESOLUTION**
   - When instructions are vague, infer the most common interpretation
   - Document assumptions made in the notes field

## TERMINOLOGY TRANSLATION

Automatically translate between British and American terms:
| British | American |
|---------|----------|
| Cast off | Bind off |
| Tension | Gauge |
| Stocking stitch | Stockinette |
| Moss stitch | Seed stitch |
| DK (double knitting) | Light worsted |
| Aran | Worsted |
| Chunky | Bulky |

## TECHNIQUE ID MAPPING

Map pattern abbreviations to these EXACT technique IDs:
| Pattern Says | Technique ID |
|--------------|-------------|
| K, knit, knit stitch | knit |
| P, purl, purl stitch | purl |
| CO, cast on (unspecified) | long-tail-cast-on |
| Long-tail cast on | long-tail-cast-on |
| Cable cast on | cable-cast-on |
| BO, bind off, cast off | basic-bind-off |
| K2tog, knit 2 together | k2tog |
| SSK, slip slip knit | ssk |
| P2tog, purl 2 together | p2tog |
| YO, yarn over | yo |
| KFB, knit front and back | kfb |
| M1L, M1R, make 1 | m1 |
| Garter stitch | garter-stitch |
| Stockinette, stocking stitch | stockinette |
| 1x1 rib, K1P1 rib | rib-1x1 |
| 2x2 rib, K2P2 rib | rib-2x2 |

## OUTPUT FORMAT

Return a JSON object with this EXACT structure:
{
  "projectName": "Pattern name (from document or inferred from project type)",
  "projectType": "scarf|hat|mittens|socks|blanket|sweater|other",
  "difficulty": 1-5,
  "yarn": "Yarn weight and fiber if specified",
  "needles": "Needle size (provide both metric and US if possible)",
  "gauge": "Gauge with stitch and row count per inch/cm",
  "size": "Finished dimensions or sizing info",
  "sections": [
    {
      "title": "Section title",
      "content": "Raw content from pattern",
      "type": "materials|gauge|abbreviations|instructions|notes|other"
    }
  ],
  "steps": [
    {
      "label": "Row 1",
      "title": "Step title",
      "description": "Detailed instruction with sub-steps. Step 1: [action]. Step 2: [action]. Step 3: [verification].",
      "techniques": ["knit", "purl"],
      "rowCount": 1,
      "startRow": 1,
      "endRow": 1,
      "stitchCount": 48
    }
  ],
  "techniques": ["technique-id-1", "technique-id-2"],
  "warnings": ["Any warnings or assumptions made"],
  "confidence": 0.0-1.0
}

## STEP DESCRIPTION FORMAT (CRITICAL)

EVERY step description MUST follow this exact pattern:

"[Brief summary of what this step accomplishes]. Step 1: [First atomic action]. Step 2: [Second atomic action]. Step 3: [Continue as needed]. Step N: [Verification step]."

### What Makes a Good Sub-Step:
- ONE physical action only
- Specific hand/needle positions when helpful
- Measurable outcomes where applicable

## HANDLING AMBIGUITY

When a pattern is unclear:
1. Make a reasonable assumption based on common knitting practice
2. State the assumption in the step description
3. Add a warning to the warnings array

## FORMATTING RULES

1. Return ONLY valid JSON, no markdown formatting
2. Every step MUST have numbered sub-steps (Step 1:, Step 2:, etc.)
3. Technique IDs must match EXACTLY from the available list
4. Always include a verification sub-step at the end of complex operations
5. Use clear, imperative language ("Insert the needle", "Wrap the yarn")
6. Include stitch counts in every step where applicable
7. Set confidence based on how much you could parse (1.0 = fully parsed, 0.5 = partial)

Parse the pattern now, applying your expert analysis to create clear, beginner-friendly instructions:`;

interface ParsePatternRequest {
  fileUrl?: string;
  base64Data?: string;
  mimeType: string;
  fileName: string;
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
    const body: ParsePatternRequest = await req.json();
    const { fileUrl, base64Data, mimeType, fileName } = body;

    if (!base64Data && !fileUrl) {
      return new Response(
        JSON.stringify({ error: 'Either base64Data or fileUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!mimeType) {
      return new Response(
        JSON.stringify({ error: 'mimeType is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the file data
    let patternData = base64Data;

    // If fileUrl provided, download the file
    if (fileUrl && !patternData) {
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file from URL: ${fileResponse.status}`);
      }
      const arrayBuffer = await fileResponse.arrayBuffer();
      patternData = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    }

    if (!patternData) {
      return new Response(
        JSON.stringify({ error: 'Could not get pattern data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[parse-pattern] Processing pattern: ${fileName}, type: ${mimeType}`);

    // Call AI to parse the pattern
    const client = getAIClient();
    const responseText = await client.generateContent(PATTERN_PARSE_PROMPT, {
      base64Data: patternData,
      mimeType,
    });

    // Extract JSON from response
    const parsed = extractJSON<{
      projectName: string;
      projectType: string;
      difficulty: number;
      yarn: string;
      needles: string;
      gauge?: string;
      size?: string;
      sections: Array<{ title: string; content: string; type: string }>;
      steps: Array<{
        label: string;
        title: string;
        description: string;
        techniques: string[];
        rowCount?: number;
        startRow?: number;
        endRow?: number;
        stitchCount?: number;
      }>;
      techniques: string[];
      warnings: string[];
      confidence: number;
    }>(responseText);

    // Ensure all steps have unique IDs (adding them if not present from AI)
    const stepsWithIds = parsed.steps.map((step, index) => ({
      ...step,
      id: generateStepId(),
    }));

    const result = {
      ...parsed,
      steps: stepsWithIds,
    };

    console.log(`[parse-pattern] Successfully parsed pattern with ${result.steps.length} steps`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[parse-pattern] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
