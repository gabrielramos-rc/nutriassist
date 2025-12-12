const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default fallback chain: quality-based order (larger/better models first)
// These are the best free models available on OpenRouter as of December 2025
const DEFAULT_FALLBACK_MODELS = [
  "deepseek/deepseek-chat-v3-0324:free", // Best for dialogue/conversation
  "mistralai/mistral-small-3.1-24b-instruct:free", // Great for structured output
  "google/gemini-2.5-pro-exp-03-25:free", // Excellent reasoning, huge context
  "nousresearch/deephermes-3-llama-3-8b-preview:free", // Compact fallback
];

// Track which model is currently working (sticky primary)
let currentModelIndex = 0;

/**
 * Get the list of models to try, in priority order.
 *
 * Priority:
 * 1. OPENROUTER_FALLBACK_MODELS env var (comma-separated custom chain)
 * 2. OPENROUTER_MODEL env var + defaults (preferred model first)
 * 3. DEFAULT_FALLBACK_MODELS (built-in chain)
 */
function getModelsToTry(): string[] {
  // Priority 1: Custom fallback chain from env
  const customChain = process.env.OPENROUTER_FALLBACK_MODELS;
  if (customChain) {
    return customChain
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
  }

  // Priority 2: Single preferred model + defaults
  const preferredModel = process.env.OPENROUTER_MODEL;
  if (preferredModel) {
    return [preferredModel, ...DEFAULT_FALLBACK_MODELS.filter((m) => m !== preferredModel)];
  }

  // Priority 3: Use defaults
  return DEFAULT_FALLBACK_MODELS;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
}

/**
 * Make a single API call to OpenRouter with a specific model.
 * Returns the response content or throws an error with status code.
 */
async function callOpenRouter(
  model: string,
  messages: Message[],
  temperature: number,
  maxTokens: number,
  apiKey: string
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "NutriAssist",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`OpenRouter API error: ${response.status} - ${errorText}`) as Error & {
      status: number;
    };
    error.status = response.status;
    throw error;
  }

  const data: OpenRouterResponse = await response.json();

  const firstChoice = data.choices?.[0];
  if (!firstChoice) {
    throw new Error("No response from OpenRouter");
  }

  return firstChoice.message.content;
}

export async function generateResponse(
  messages: Message[],
  options: GenerateOptions = {}
): Promise<string> {
  const { model: explicitModel, temperature = 0.7, maxTokens = 1024, retries = 2 } = options;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  // If explicit model provided, use only that model (no fallback chain)
  if (explicitModel) {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await callOpenRouter(explicitModel, messages, temperature, maxTokens, apiKey);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }
    }
    throw lastError || new Error("Failed to generate response after retries");
  }

  // Use fallback chain with sticky primary
  const models = getModelsToTry();
  let lastError: Error | null = null;

  // Start from current working model index (sticky primary)
  for (let i = 0; i < models.length; i++) {
    const index = (currentModelIndex + i) % models.length;
    const model = models[index];
    if (!model) continue;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await callOpenRouter(model, messages, temperature, maxTokens, apiKey);

        // Success! Update sticky primary to this model
        if (currentModelIndex !== index) {
          console.log(`[OpenRouter] Switched to model: ${model}`);
          currentModelIndex = index;
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const status = (error as Error & { status?: number }).status;

        // If 404 (model unavailable), skip to next model immediately
        if (status === 404) {
          console.warn(`[OpenRouter] Model ${model} unavailable (404), trying next...`);
          break;
        }

        // Other errors: retry with exponential backoff
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }
    }
  }

  throw lastError || new Error("All models failed to generate response");
}

// Helper to create a chat completion with system prompt
export async function chat(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: Message[] = [],
  options: GenerateOptions = {}
): Promise<string> {
  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  return generateResponse(messages, options);
}

// Helper for simple single-turn completions
export async function complete(prompt: string, options: GenerateOptions = {}): Promise<string> {
  return generateResponse([{ role: "user", content: prompt }], options);
}

// Export for testing purposes
export function _resetModelIndex(): void {
  currentModelIndex = 0;
}

export function _getCurrentModel(): string {
  const models = getModelsToTry();
  return models[currentModelIndex] ?? models[0] ?? DEFAULT_FALLBACK_MODELS[0]!;
}
