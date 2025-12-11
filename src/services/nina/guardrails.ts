import { DANGEROUS_PATTERNS } from "@/constants/nina";

export interface GuardrailResult {
  blocked: boolean;
  reason?: string;
}

/**
 * Check if message contains dangerous content that should be blocked immediately
 */
export function checkDangerousContent(message: string): GuardrailResult {
  const normalizedMessage = message.toLowerCase().trim();

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(normalizedMessage)) {
      return {
        blocked: true,
        reason: "dangerous_content",
      };
    }
  }

  return { blocked: false };
}

/**
 * Check if message is attempting prompt injection
 */
export function checkPromptInjection(message: string): GuardrailResult {
  const injectionPatterns = [
    /ignore.*previous.*instructions/i,
    /ignore.*above.*instructions/i,
    /disregard.*previous/i,
    /forget.*instructions/i,
    /new.*instructions/i,
    /you.*are.*now/i,
    /act.*as.*if/i,
    /pretend.*you.*are/i,
    /system.*prompt/i,
    /\[system\]/i,
    /\[assistant\]/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(message)) {
      return {
        blocked: true,
        reason: "prompt_injection_attempt",
      };
    }
  }

  return { blocked: false };
}

/**
 * Run all guardrail checks on a message
 */
export function runGuardrails(message: string): GuardrailResult {
  // Check dangerous content first
  const dangerousCheck = checkDangerousContent(message);
  if (dangerousCheck.blocked) {
    return dangerousCheck;
  }

  // Check prompt injection
  const injectionCheck = checkPromptInjection(message);
  if (injectionCheck.blocked) {
    return injectionCheck;
  }

  return { blocked: false };
}
