// supabase/functions/contextual-help/index.ts
// Edge Function for AI-powered contextual technique explanations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAIClient, extractJSON } from '../_shared/aiClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Build the contextual help prompt with skill level adaptation
const buildContextualHelpPrompt = (skillLevel: string = 'beginner') => `You are Purl's expert technique instructor - a patient, encouraging teacher who has taught thousands of knitters of all levels. You explain knitting techniques in context, helping knitters understand not just HOW to do something, but WHY it's used at this specific point in their pattern.

## YOUR ANALYSIS PROCESS

Before responding, analyze the context by answering these questions internally:

1. **What is this technique achieving?**
   - What physical result does it create (increase, decrease, texture, join)?
   - How does it contribute to the final garment shape or design?

2. **Why is it used HERE specifically?**
   - What would happen if we used a different technique?
   - Why this technique and not an alternative?

3. **What does the knitter already know?**
   - Skill level: ${skillLevel.toUpperCase()}

4. **What will they likely struggle with?**
   - Physical coordination challenges
   - Common confusion points
   - Timing/rhythm issues

## SKILL LEVEL ADAPTATION: ${skillLevel.toUpperCase()}

${skillLevel === 'beginner' ? `For BEGINNERS:
- Explain every physical movement in detail
- Use simple, everyday language (avoid jargon)
- Include reassurance ("This might feel awkward at first - that's normal!")
- Break complex motions into tiny steps
- Explain what "correct" looks like
- Mention what to do if something goes wrong` :
skillLevel === 'intermediate' ? `For INTERMEDIATE knitters:
- Reference technique names (they know the basics)
- Focus on the "why" more than the "how"
- Include efficiency tips and shortcuts
- Mention variations they might encounter
- Point out common plateau issues at this level` :
`For ADVANCED knitters:
- Be concise - they know the mechanics
- Focus on pattern-specific nuances
- Discuss technique selection rationale
- Include advanced tips for better results
- Note any unconventional applications`}

## "WHY" EXPLANATION GUIDELINES

The "whyItMatters" field is CRITICAL - it connects the technique to the project and makes knitting meaningful.

GOOD "WHY" explanations (specific to the pattern):
- "K2tog here creates the left-leaning decrease that shapes the neckline. Paired with SSK on the other side, it creates symmetrical shaping that will look professional."
- "The yarn over between these stitches creates an intentional hole that forms part of the lace pattern."
- "Using a stretchy bind-off for the ribbing ensures the hat will still fit over your head."

BAD "WHY" explanations (generic, not helpful):
- "K2tog is a decrease stitch." (describes WHAT, not WHY)
- "This is a common technique in knitting." (says nothing)
- "You need to decrease here." (no context)

## RESPONSE FORMAT

Return a JSON object with this EXACT structure:
{
  "techniqueName": "Full name of the technique",
  "explanation": "Clear, concise explanation of what this technique is and what it does",
  "whyItMatters": "2-3 sentences explaining WHY this technique is used at THIS point. Be specific about what it achieves.",
  "stepByStep": [
    "Step 1: Clear physical instruction",
    "Step 2: Continue with next action",
    "Step N: Final action"
  ],
  "tips": ["2-3 tips SPECIFIC to this technique"],
  "commonMistakes": [
    "Specific mistake beginners make and how to avoid it"
  ],
  "videoTimestamp": {
    "start": 0,
    "end": 30,
    "description": "What to look for in tutorial videos"
  },
  "relatedTechniques": ["technique-ids that are related or similar"]
}

## STEP COUNT BY SKILL LEVEL

- BEGINNER: 6-10 detailed steps
- INTERMEDIATE: 4-6 focused steps
- ADVANCED: 3-4 concise steps

## RULES

1. Return ONLY valid JSON, no markdown formatting
2. The "whyItMatters" MUST reference the specific project context if provided
3. Tips MUST be actionable and specific
4. Always be encouraging, never condescending`;

interface ContextualHelpRequest {
  techniqueId: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  context?: {
    projectType?: string;
    currentStep?: string;
    specificQuestion?: string;
  };
}

interface ContextualHelpResponse {
  techniqueName: string;
  explanation: string;
  whyItMatters: string;
  stepByStep: string[];
  tips: string[];
  commonMistakes: string[];
  videoTimestamp?: {
    start: number;
    end: number;
    description: string;
  };
  relatedTechniques: string[];
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
    const body: ContextualHelpRequest = await req.json();
    const { techniqueId, skillLevel, context } = body;

    if (!techniqueId) {
      return new Response(
        JSON.stringify({ error: 'techniqueId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[contextual-help] Getting help for technique: ${techniqueId}, skill: ${skillLevel}`);

    // Build context prompt
    let contextPrompt = '';
    if (context) {
      if (context.projectType) {
        contextPrompt += `\nProject type: ${context.projectType}`;
      }
      if (context.currentStep) {
        contextPrompt += `\nCurrent step: ${context.currentStep}`;
      }
      if (context.specificQuestion) {
        contextPrompt += `\nUser's specific question: ${context.specificQuestion}`;
      }
    }

    const systemPrompt = buildContextualHelpPrompt(skillLevel || 'beginner');

    const userPrompt = `${systemPrompt}

## CONTEXT
${contextPrompt || 'No specific context provided'}

## TECHNIQUE TO EXPLAIN

Technique ID: ${techniqueId}

Provide a contextual explanation of this technique:`;

    // Call AI
    const client = getAIClient();
    const responseText = await client.generateContent(userPrompt);

    // Extract JSON from response
    const response = extractJSON<ContextualHelpResponse>(responseText);

    // Validate and normalize response
    const result: ContextualHelpResponse = {
      techniqueName: response.techniqueName || techniqueId,
      explanation: response.explanation || 'A knitting technique.',
      whyItMatters: response.whyItMatters || 'This technique helps create the desired fabric.',
      stepByStep: Array.isArray(response.stepByStep) ? response.stepByStep : [],
      tips: Array.isArray(response.tips) ? response.tips : [],
      commonMistakes: Array.isArray(response.commonMistakes)
        ? response.commonMistakes.map((m: string | { mistake?: string }) =>
            typeof m === 'string' ? m : m.mistake || String(m)
          )
        : [],
      videoTimestamp: response.videoTimestamp,
      relatedTechniques: Array.isArray(response.relatedTechniques) ? response.relatedTechniques : [],
    };

    console.log(`[contextual-help] Successfully generated help for ${techniqueId}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[contextual-help] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
