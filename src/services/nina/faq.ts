import { FAQ_KEYWORDS, RESPONSE_TEMPLATES } from "@/constants/nina";
import type { Nutritionist, NinaResponse, FAQResponses } from "@/types";

/**
 * Match user question to FAQ key using keyword matching
 */
export function matchFAQKey(message: string): string | null {
  const normalizedMessage = message.toLowerCase();

  for (const [key, keywords] of Object.entries(FAQ_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedMessage.includes(keyword)) {
        return key;
      }
    }
  }

  return null;
}

/**
 * Handle FAQ questions
 * Returns the nutritionist's configured response for the matched FAQ
 */
export function handleFAQ(message: string, nutritionist: Nutritionist): NinaResponse {
  const faqKey = matchFAQKey(message);
  const faqResponses = nutritionist.faq_responses as FAQResponses | null;

  // Check if we have a match and the nutritionist has a response configured
  if (faqKey && faqResponses && faqResponses[faqKey]) {
    return {
      content: faqResponses[faqKey]!,
      intent: "faq",
      metadata: {
        faqKey,
      },
    };
  }

  // No FAQ match - trigger handoff
  return {
    content: RESPONSE_TEMPLATES.handoff(nutritionist.name),
    intent: "handoff",
    metadata: {
      requiresHandoff: true,
      handoffReason: "faq_not_found",
    },
  };
}

/**
 * Get all available FAQ keys
 */
export function getAvailableFAQKeys(): string[] {
  return Object.keys(FAQ_KEYWORDS);
}

/**
 * Check if a message is likely an FAQ question
 */
export function isFAQQuestion(message: string): boolean {
  return matchFAQKey(message) !== null;
}
