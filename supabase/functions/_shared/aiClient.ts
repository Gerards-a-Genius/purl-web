// supabase/functions/_shared/aiClient.ts
// Shared AI client with model fallback chain for Edge Functions

// Model fallback chain - ordered by preference (fastest/cheapest first)
const MODEL_FALLBACK_CHAIN = [
  'gemini-2.5-flash',      // Primary: fastest, good for most patterns
  'gemini-2.0-flash',      // Fallback 1: slightly older, stable
  'gemini-1.5-pro',        // Fallback 2: more capable, slower
  'gemini-1.5-flash',      // Fallback 3: older flash model
];

const DEFAULT_MODEL = MODEL_FALLBACK_CHAIN[0];
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TIMEOUT = 60000; // 60 seconds

// Errors that should trigger model fallback
const FALLBACK_TRIGGER_ERRORS = [
  'model not found',
  'model is not available',
  'overloaded',
  'resource exhausted',
  '503',
  '429',
  'rate limit',
  'capacity',
  'timeout',
];

// Errors that should NOT trigger fallback (hard failures)
const HARD_FAILURE_ERRORS = [
  'API key',
  'invalid_api_key',
  'permission denied',
  'billing',
  'quota exceeded',
];

export interface AIClientConfig {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface GenerateOptions {
  base64Data?: string;
  mimeType?: string;
  systemInstruction?: string;
}

export interface AIError {
  code: 'API_ERROR' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR';
  message: string;
  details?: Record<string, unknown>;
}

class AIClient {
  private apiKey: string;
  private modelChain: string[];
  private currentModel: string;
  private maxRetries: number;
  private timeout: number;
  private lastSuccessfulModel: string | null = null;

  constructor(config?: AIClientConfig) {
    const apiKey = config?.apiKey || Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');

    if (!apiKey) {
      throw new Error('Gemini API key is required. Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.');
    }

    this.apiKey = apiKey;
    this.currentModel = config?.model || DEFAULT_MODEL;
    this.modelChain = this.buildModelChain(this.currentModel);
    this.maxRetries = config?.maxRetries || DEFAULT_MAX_RETRIES;
    this.timeout = config?.timeout || DEFAULT_TIMEOUT;
  }

  // Build fallback chain starting from specified model
  private buildModelChain(startModel: string): string[] {
    const startIndex = MODEL_FALLBACK_CHAIN.indexOf(startModel);
    if (startIndex === -1) {
      return [startModel, ...MODEL_FALLBACK_CHAIN];
    }
    return MODEL_FALLBACK_CHAIN.slice(startIndex);
  }

  // Check if error should trigger model fallback
  private shouldTryFallback(errorMsg: string): boolean {
    const lowerMsg = errorMsg.toLowerCase();

    // Check for hard failures first
    if (HARD_FAILURE_ERRORS.some(e => lowerMsg.includes(e.toLowerCase()))) {
      return false;
    }

    // Check if error matches fallback triggers
    return FALLBACK_TRIGGER_ERRORS.some(e => lowerMsg.includes(e.toLowerCase()));
  }

  async generateContent(prompt: string, options?: GenerateOptions): Promise<string> {
    let lastError: Error | null = null;
    const modelsAttempted: string[] = [];

    // Try each model in the fallback chain
    for (const model of this.modelChain) {
      modelsAttempted.push(model);
      console.log(`[AIClient] Attempting model: ${model}`);

      // Retry loop for current model
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
          // Build request body
          const contents: Array<{ parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> }> = [];

          // Add user content
          const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];

          if (options?.base64Data && options?.mimeType) {
            parts.push({
              inline_data: {
                mime_type: options.mimeType,
                data: options.base64Data,
              },
            });
          }

          parts.push({ text: prompt });
          contents.push({ parts });

          const requestBody: Record<string, unknown> = { contents };

          // Add system instruction if provided
          if (options?.systemInstruction) {
            requestBody.system_instruction = {
              parts: [{ text: options.systemInstruction }],
            };
          }

          // Make API request
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error?.message || response.statusText || `HTTP ${response.status}`;
            throw new Error(errorMessage);
          }

          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!text) {
            throw new Error('Empty response from model');
          }

          // Success!
          this.lastSuccessfulModel = model;
          this.currentModel = model;
          console.log(`[AIClient] Success with model: ${model}`);

          return text;
        } catch (error: unknown) {
          clearTimeout(timeoutId);
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(`[AIClient] Model ${model} attempt ${attempt + 1} failed:`, lastError.message);

          // Check for hard failures
          if (!this.shouldTryFallback(lastError.message) &&
              HARD_FAILURE_ERRORS.some(e => lastError!.message.toLowerCase().includes(e.toLowerCase()))) {
            throw this.createError('API_ERROR', lastError.message);
          }

          // Exponential backoff for retries within same model
          if (attempt < this.maxRetries) {
            const delay = Math.pow(2, attempt) * 500;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }

      // All retries for this model failed
      if (lastError && !this.shouldTryFallback(lastError.message)) {
        console.error(`[AIClient] Hard failure, not trying fallback models`);
        break;
      }

      // Log fallback attempt
      const nextModelIndex = this.modelChain.indexOf(model) + 1;
      if (nextModelIndex < this.modelChain.length) {
        console.log(`[AIClient] Falling back from ${model} to ${this.modelChain[nextModelIndex]}`);
      }
    }

    // All models failed
    const attemptedStr = modelsAttempted.join(' -> ');
    console.error(`[AIClient] All models failed: ${attemptedStr}`);
    throw this.createError(
      'NETWORK_ERROR',
      `All models failed (${attemptedStr}): ${lastError?.message || 'Unknown error'}`
    );
  }

  private createError(code: AIError['code'], message: string): AIError {
    return {
      code,
      message,
      details: {
        model: this.currentModel,
        lastSuccessfulModel: this.lastSuccessfulModel,
        modelChain: this.modelChain,
      },
    };
  }

  getModel(): string {
    return this.currentModel;
  }

  getLastSuccessfulModel(): string | null {
    return this.lastSuccessfulModel;
  }

  getModelChain(): string[] {
    return [...this.modelChain];
  }
}

// Singleton instance
let clientInstance: AIClient | null = null;

export function getAIClient(config?: AIClientConfig): AIClient {
  if (!clientInstance) {
    clientInstance = new AIClient(config);
  }
  return clientInstance;
}

export { AIClient };

// JSON extraction utility
export function extractJSON<T>(text: string): T {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim());
  }

  // Try parsing the entire response
  try {
    return JSON.parse(text);
  } catch {
    // Try to find JSON-like content
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    }

    // Try array format
    const arrayStart = text.indexOf('[');
    const arrayEnd = text.lastIndexOf(']');
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      return JSON.parse(text.slice(arrayStart, arrayEnd + 1));
    }

    throw new Error('Could not extract valid JSON from response');
  }
}
