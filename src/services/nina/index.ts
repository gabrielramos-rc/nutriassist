import { runGuardrails } from "./guardrails";
import { classifyIntent, matchFAQKey } from "./intents";
import { handleScheduling } from "./scheduling";
import { handleDietQuestion } from "./dietQA";
import { RESPONSE_TEMPLATES } from "@/constants/nina";
import type {
  NinaResponse,
  NinaIntent,
  Nutritionist,
  Patient,
  Message,
  FAQResponses,
} from "@/types";

export interface ProcessMessageContext {
  nutritionist: Nutritionist;
  patient?: Patient | null;
  conversationHistory?: Message[];
}

/**
 * Main entry point for processing messages through Nina
 */
export async function processMessage(
  userMessage: string,
  context: ProcessMessageContext
): Promise<NinaResponse> {
  const { nutritionist, patient, conversationHistory = [] } = context;

  // 1. Run guardrails check
  const guardrailResult = runGuardrails(userMessage);
  if (guardrailResult.blocked) {
    return {
      content: RESPONSE_TEMPLATES.offTopicDangerous,
      intent: "dangerous",
      metadata: {
        requiresHandoff: false,
      },
    };
  }

  // 2. Classify intent
  const intent = await classifyIntent(userMessage);

  // 3. Route to appropriate handler
  switch (intent) {
    case "greeting":
      return handleGreeting(nutritionist, patient);

    case "scheduling":
      return handleScheduling(userMessage, nutritionist, patient);

    case "diet_question":
      return handleDietQuestion(userMessage, nutritionist, patient, conversationHistory);

    case "faq":
      return handleFAQ(userMessage, nutritionist);

    case "handoff":
      return handleHandoff(nutritionist);

    case "off_topic":
      return handleOffTopic();

    case "dangerous":
      return {
        content: RESPONSE_TEMPLATES.offTopicDangerous,
        intent: "dangerous",
      };

    default:
      return handleHandoff(nutritionist);
  }
}

/**
 * Handle greeting messages
 */
function handleGreeting(
  nutritionist: Nutritionist,
  patient?: Patient | null
): NinaResponse {
  const content = patient?.name
    ? RESPONSE_TEMPLATES.greetingWithPatientName(patient.name, nutritionist.name)
    : RESPONSE_TEMPLATES.greeting(nutritionist.name);

  return {
    content,
    intent: "greeting",
  };
}



/**
 * Handle FAQ questions
 */
function handleFAQ(message: string, nutritionist: Nutritionist): NinaResponse {
  const faqKey = matchFAQKey(message);
  const faqResponses = nutritionist.faq_responses as FAQResponses | null;

  if (faqKey && faqResponses && faqResponses[faqKey]) {
    return {
      content: faqResponses[faqKey]!,
      intent: "faq",
    };
  }

  // If no FAQ match, trigger handoff
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
 * Handle messages that need human intervention
 */
function handleHandoff(nutritionist: Nutritionist): NinaResponse {
  return {
    content: RESPONSE_TEMPLATES.handoff(nutritionist.name),
    intent: "handoff",
    metadata: {
      requiresHandoff: true,
      handoffReason: "user_request_or_complex_question",
    },
  };
}

/**
 * Handle off-topic messages (harmless)
 */
function handleOffTopic(): NinaResponse {
  return {
    content: RESPONSE_TEMPLATES.offTopicHarmless(),
    intent: "off_topic",
  };
}

// Re-export for convenience
export { runGuardrails } from "./guardrails";
export { classifyIntent, classifySchedulingSubIntent, matchFAQKey } from "./intents";
export { handleScheduling, processSlotSelection, processCancellation } from "./scheduling";
export { handleDietQuestion } from "./dietQA";
