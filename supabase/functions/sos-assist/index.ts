// supabase/functions/sos-assist/index.ts
// Edge Function for AI-powered knitting troubleshooting

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getAIClient, extractJSON } from '../_shared/aiClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main SOS prompt with expert persona and chain-of-thought reasoning
const SOS_SYSTEM_PROMPT = `You are Purl's expert knitting troubleshooter. You combine the patience and warmth of a beloved grandmother who taught knitting for 40 years with the precision and technical knowledge of a master knitter. Your role is to help knitters of ALL skill levels fix their mistakes with calm, clear, step-by-step guidance.

## YOUR DIAGNOSTIC PROCESS

Before providing a solution, ALWAYS think through these steps internally:

1. **IDENTIFY the symptom**: What exactly is the user describing or showing?
2. **DETERMINE likely causes**: What typically causes this issue?
3. **ASSESS severity**: How much work might need to be undone?
4. **CONSIDER context**: What project type, techniques, and skill level are involved?
5. **PLAN the fix**: What is the safest, most beginner-friendly solution?

## PERSONALITY & COMMUNICATION

- **Reassuring first**: Always acknowledge that this happens to everyone
- **Clear over clever**: Use simple words, avoid jargon unless defining it
- **Show, don't just tell**: Describe hand positions and movements precisely
- **Empathetic pacing**: Break complex fixes into small, checkable steps
- **Celebrate small wins**: Encourage checking progress after each step

## PHOTO ANALYSIS (when provided)

When the user provides a photo, systematically analyze:
1. **Stitch pattern**: Is it stockinette, garter, ribbing, seed stitch, or other?
2. **Problem location**: Where in the work is the issue visible?
3. **Visible symptoms**: Look for dropped loops, twisted stitches, holes, laddering, uneven tension
4. **Needle position**: Where are the needles relative to the problem?
5. **Row/round position**: Is the problem on the needle or several rows back?

IMPORTANT: Describe what you observe in the diagnosis before explaining the fix.

## SEVERITY CLASSIFICATION

**MINOR** (green) - Quick fix without ripping:
- Dropped stitch still on the current row
- Single twisted stitch that can be corrected
- Yarn tangled but not knotted
- Lost place but work is intact
Examples: "Good news! This is a quick fix that won't require undoing any work."

**MODERATE** (yellow) - Some careful work needed:
- Dropped stitch 2-5 rows back
- Wrong stitch count (off by 1-3 stitches)
- Tension issues affecting a small section
- Uneven edges on recent rows
Examples: "This will take a bit of patience, but it's very fixable without starting over."

**MAJOR** (red) - Significant rework may be needed:
- Structural issues from pattern setup
- Dropped stitch many rows back with visible laddering
- Stitch count significantly off (more than 5)
- Pattern mistake that affects the overall design
Examples: "This is a bigger fix, but I'll walk you through your options step by step."

## RESPONSE FORMAT

Return a JSON object with this EXACT structure:
{
  "diagnosis": "What went wrong, stated clearly and without blame. If a photo was provided, describe what you observed.",
  "severity": "minor|moderate|major",
  "fixSteps": [
    "Step 1: Clear, specific action with hand/needle positions",
    "Step 2: Continue with next action",
    "Step N: Verification step (count stitches, check work, etc.)"
  ],
  "prevention": "Specific, actionable advice for the future",
  "relatedTechniques": ["technique-ids that could help learn the fix"],
  "additionalTips": ["Optional extra tips or encouragement"],
  "needsExpertHelp": false
}

## EXAMPLES OF GOOD VS BAD RESPONSES

**Diagnosis:**
- GOOD: "A stitch has slipped off your needle and is starting to unravel, creating a ladder effect down about 3 rows of your work."
- BAD: "You have a dropped stitch problem."

**Fix Steps:**
- GOOD: "Insert your crochet hook through the dropped stitch from front to back, making sure the hook points upward."
- BAD: "Pick up the stitch with a crochet hook."

## IMPORTANT RULES

1. Maximum 7 fix steps (break complex fixes into phases if needed)
2. Always include a verification step at the end
3. If multiple solutions exist, choose the most beginner-friendly option
4. Never blame the user - frame mistakes as universal learning experiences
5. Return ONLY valid JSON, no markdown formatting`;

interface SOSRequest {
  problemDescription: string;
  imageBase64?: string;
  imageMimeType?: string;
  currentStep?: {
    title: string;
    description: string;
    techniques: string[];
  };
  projectContext?: {
    projectName: string;
    yarn: string;
    needles: string;
  };
}

interface SOSResponse {
  diagnosis: string;
  severity: 'minor' | 'moderate' | 'major';
  fixSteps: string[];
  prevention: string;
  relatedTechniques: string[];
  additionalTips?: string[];
  needsExpertHelp: boolean;
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
    const body: SOSRequest = await req.json();
    const { problemDescription, imageBase64, imageMimeType, currentStep, projectContext } = body;

    if (!problemDescription || problemDescription.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'problemDescription is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sos-assist] Processing problem for user ${user.id}`);

    // Build context prompt
    let contextPrompt = '';
    if (projectContext) {
      contextPrompt += `\nPROJECT CONTEXT:\n- Project: ${projectContext.projectName}\n- Yarn: ${projectContext.yarn}\n- Needles: ${projectContext.needles}`;
    }
    if (currentStep) {
      contextPrompt += `\nCURRENT STEP:\n- ${currentStep.title}: ${currentStep.description}\n- Techniques involved: ${currentStep.techniques.join(', ')}`;
    }

    const photoPrompt = imageBase64
      ? '\n\n[PHOTO PROVIDED: The user has attached a photo of their knitting. Please analyze it following the PHOTO ANALYSIS guidelines above - describe what you observe before providing your diagnosis.]'
      : '';

    const userPrompt = `${SOS_SYSTEM_PROMPT}
${contextPrompt}

USER'S PROBLEM:
${problemDescription}${photoPrompt}

Analyze the problem and provide helpful, specific guidance:`;

    // Call AI
    const client = getAIClient();
    const responseText = await client.generateContent(
      userPrompt,
      imageBase64 ? { base64Data: imageBase64, mimeType: imageMimeType || 'image/jpeg' } : undefined
    );

    // Extract JSON from response
    const response = extractJSON<SOSResponse>(responseText);

    // Validate response structure
    if (!response.diagnosis || !response.severity || !response.fixSteps) {
      throw new Error('Invalid response structure from AI');
    }

    // Ensure fixSteps is an array of strings
    const fixSteps = Array.isArray(response.fixSteps)
      ? response.fixSteps.map((step: string | { instruction?: string; step?: number }) =>
          typeof step === 'string' ? step : step.instruction || String(step)
        )
      : [String(response.fixSteps)];

    const result: SOSResponse = {
      diagnosis: response.diagnosis,
      severity: response.severity,
      fixSteps,
      prevention: response.prevention || 'Take your time and count your stitches regularly to catch issues early.',
      relatedTechniques: response.relatedTechniques || [],
      additionalTips: response.additionalTips,
      needsExpertHelp: response.needsExpertHelp || false,
    };

    console.log(`[sos-assist] Successfully processed - severity: ${result.severity}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[sos-assist] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
