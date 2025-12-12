import { chat } from "@/lib/openrouter";
import { NINA_SYSTEM_PROMPT, DIET_QA_PROMPT, RESPONSE_TEMPLATES } from "@/constants/nina";
import type { NinaResponse, Nutritionist, Patient, Message } from "@/types";

/**
 * Handle diet-related questions by searching the patient's diet plan
 */
export async function handleDietQuestion(
  message: string,
  nutritionist: Nutritionist,
  patient: Patient | null | undefined,
  conversationHistory: Message[]
): Promise<NinaResponse> {
  // Check if patient has a diet plan
  if (!patient?.diet_extracted_text) {
    return {
      content: RESPONSE_TEMPLATES.noDietPlan(nutritionist.name),
      intent: "diet_question",
      metadata: {
        requiresHandoff: false,
      },
    };
  }

  try {
    // Build conversation context for LLM
    const historyMessages = conversationHistory.slice(-6).map((msg) => ({
      role: msg.sender === "patient" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));

    // Create the diet Q&A prompt
    const prompt = DIET_QA_PROMPT.replace("{dietText}", patient.diet_extracted_text).replace(
      "{question}",
      message
    );

    const response = await chat(NINA_SYSTEM_PROMPT, prompt, historyMessages, {
      temperature: 0.3,
      maxTokens: 512,
    });

    // Check if the response indicates the information wasn't found
    const notFoundIndicators = [
      "não encontrei",
      "não está no plano",
      "não consta",
      "não há informação",
      "não tenho essa informação",
    ];

    const requiresHandoff = notFoundIndicators.some((indicator) =>
      response.toLowerCase().includes(indicator)
    );

    return {
      content: response,
      intent: "diet_question",
      metadata: requiresHandoff
        ? {
            requiresHandoff: true,
            handoffReason: "diet_info_not_found",
          }
        : undefined,
    };
  } catch {
    return {
      content: RESPONSE_TEMPLATES.error,
      intent: "diet_question",
      metadata: {
        requiresHandoff: true,
        handoffReason: "error_processing_diet_question",
      },
    };
  }
}
