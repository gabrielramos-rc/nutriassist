import { complete } from "@/lib/openrouter";
import {
  INTENT_CLASSIFICATION_PROMPT,
  SCHEDULING_SUBINTENT_PROMPT,
  FAQ_KEYWORDS,
} from "@/constants/nina";
import type { NinaIntent, SchedulingSubIntent } from "@/types";

// Keyword patterns for fast classification
// IMPORTANT: Order matters! More specific patterns (faq) should be checked before broader ones (scheduling)
const INTENT_KEYWORDS: Record<NinaIntent, RegExp[]> = {
  greeting: [
    /^(oi|olá|ola|hey|hi|hello|e aí|eai|boa tarde|bom dia|boa noite|tudo bem|tudo bom)[\s!?.,]*$/i,
    /^(oi|olá|ola)[\s!?,.]*(tudo bem|tudo bom|como vai)?[\s!?.,]*$/i,
  ],
  faq: [
    // Price-related (check before scheduling since "consulta" might appear)
    /\b(preço|preco|valor|quanto custa|custo)\b/i,
    /quanto é/i,
    // Location-related
    /\b(endereço|endereco|onde fica|localização|localizacao)\b/i,
    // Preparation-related
    /\b(preparo|preparação|preparacao)\b.*\b(consulta)?\b/i,
    /\b(o que|que).*(levar|trazer)\b/i,
    /como.*(me )?(preparar|preparo)/i,
    // Duration-related
    /\b(duração|duracao)\b.*\b(consulta)?\b/i,
    /\b(quanto tempo).*(dura|leva|demora)\b/i,
    // Online consultation
    /\b(atende|consulta).*(online|remoto|videochamada|à distância|a distancia)\b/i,
    /\b(online|videochamada|remoto)\b/i,
  ],
  scheduling: [
    // Scheduling actions (without "consulta" alone to avoid false positives)
    /\b(agendar|marcar|remarcar|desmarcar|cancelar)\b/i,
    /\b(horário|horario|disponibilidade|agenda)\b/i,
    // "quero/preciso consulta" is scheduling, but "quanto custa consulta" is FAQ (handled above)
    /\b(quero|preciso|gostaria)\s*(de)?\s*(uma)?\s*consulta\b/i,
    /\b(próxima|proxima)\s*consulta\b/i,
  ],
  diet_question: [
    /\b(comer|comida|refeição|refeicao|almoço|almoco|jantar|café|cafe|lanche|dieta|plano alimentar)\b/i,
    /\b(trocar|substituir|substituição|substituicao|porção|porcao|quantidade|gramas|ml)\b/i,
    /\b(pode|posso|devo|preciso).*(comer|tomar|beber)/i,
  ],
  handoff: [
    /\b(falar com|conversar com|humano|pessoa|atendente|nutricionista)\b/i,
    /\b(reclamação|reclamacao|problema|insatisf)\b/i,
    /\b(sintoma|dor|mal estar|enjoo|náusea|nausea|vômito|vomito|diarreia|constipação)\b/i,
  ],
  off_topic: [
    // Sports, entertainment, jokes
    /\b(jogo|futebol|placar|time|campeonato|gol)\b/i,
    /\b(piada|piadas|conte uma|me conta uma|engraçado)\b/i,
    /\b(filme|série|serie|novela|música|musica)\b/i,
    /\b(política|politica|eleição|eleicao|presidente|governo)\b/i,
    /\b(clima|tempo|previsão|chuva|sol)\b/i,
    /\b(notícia|noticias|jornal|aconteceu)\b/i,
  ],
  dangerous: [],
};

// Explicit order for intent checking (more specific first)
const INTENT_CHECK_ORDER: NinaIntent[] = [
  "greeting", // Check greetings first (exact matches)
  "faq", // Check FAQ before scheduling (more specific patterns)
  "diet_question",
  "off_topic", // Check off-topic before handoff (off-topic has specific patterns)
  "handoff", // Handoff for medical/complaints
  "scheduling", // Broader patterns, check later
  "dangerous",
];

/**
 * Try to classify intent using keyword matching (fast path)
 */
function classifyByKeywords(message: string): NinaIntent | null {
  const normalizedMessage = message.toLowerCase().trim();

  // Check intents in explicit order (more specific patterns first)
  for (const intent of INTENT_CHECK_ORDER) {
    const patterns = INTENT_KEYWORDS[intent];
    for (const pattern of patterns) {
      if (pattern.test(normalizedMessage)) {
        return intent;
      }
    }
  }

  return null;
}

/**
 * Classify intent using LLM (fallback for ambiguous cases)
 */
async function classifyByLLM(message: string): Promise<NinaIntent> {
  try {
    const prompt = INTENT_CLASSIFICATION_PROMPT.replace("{message}", message);
    const response = await complete(prompt, { temperature: 0.1, maxTokens: 20 });

    const intent = response.toLowerCase().trim() as NinaIntent;

    // Validate the response is a valid intent
    const validIntents: NinaIntent[] = [
      "greeting",
      "scheduling",
      "diet_question",
      "faq",
      "handoff",
      "off_topic",
      "dangerous",
    ];

    if (validIntents.includes(intent)) {
      return intent;
    }

    // Default to off_topic if LLM returns invalid intent
    return "off_topic";
  } catch {
    // Default to handoff on error to be safe
    return "handoff";
  }
}

/**
 * Main intent classification function
 * Uses keyword matching first, then falls back to LLM
 */
export async function classifyIntent(message: string): Promise<NinaIntent> {
  // Try fast keyword matching first
  const keywordIntent = classifyByKeywords(message);
  if (keywordIntent) {
    return keywordIntent;
  }

  // Fall back to LLM for ambiguous messages
  return classifyByLLM(message);
}

/**
 * Classify scheduling sub-intent
 */
export async function classifySchedulingSubIntent(message: string): Promise<SchedulingSubIntent> {
  const normalizedMessage = message.toLowerCase();

  // Keyword-based classification
  if (/\b(remarcar|mudar|alterar|trocar.*horário)\b/i.test(normalizedMessage)) {
    return "reschedule";
  }
  if (/\b(cancelar|desmarcar)\b/i.test(normalizedMessage)) {
    return "cancel";
  }
  if (
    /\b(disponibilidade|horários disponíveis|quando tem|próxima consulta)\b/i.test(
      normalizedMessage
    )
  ) {
    return "check_availability";
  }
  if (/\b(agendar|marcar|quero.*consulta)\b/i.test(normalizedMessage)) {
    return "book";
  }

  // Fall back to LLM
  try {
    const prompt = SCHEDULING_SUBINTENT_PROMPT.replace("{message}", message);
    const response = await complete(prompt, { temperature: 0.1, maxTokens: 20 });

    const subIntent = response.toLowerCase().trim() as SchedulingSubIntent;
    const validSubIntents: SchedulingSubIntent[] = [
      "book",
      "reschedule",
      "cancel",
      "check_availability",
    ];

    if (validSubIntents.includes(subIntent)) {
      return subIntent;
    }

    return "book";
  } catch {
    return "book";
  }
}

/**
 * Match FAQ question to FAQ key
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
