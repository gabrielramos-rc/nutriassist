import { describe, it, expect, vi } from "vitest";
import { classifyIntent, classifySchedulingSubIntent, matchFAQKey } from "../intents";

// Mock the openrouter module to avoid actual API calls
vi.mock("@/lib/openrouter", () => ({
  complete: vi.fn().mockResolvedValue("off_topic"),
}));

describe("classifyIntent", () => {
  describe("greeting", () => {
    it.each(["oi", "Olá", "bom dia", "boa tarde", "boa noite", "oi, tudo bem?"])(
      'classifies "%s" as greeting',
      async (message) => {
        expect(await classifyIntent(message)).toBe("greeting");
      }
    );
  });

  describe("faq", () => {
    it.each([
      "Quanto custa a consulta?",
      "Qual o valor?",
      "Qual o preço?",
      "Onde fica o consultório?",
      "Qual o endereço?",
      "O que devo levar na consulta?",
      "Atende online?",
      "Quanto tempo dura a consulta?",
    ])('classifies "%s" as faq', async (message) => {
      expect(await classifyIntent(message)).toBe("faq");
    });

    it('classifies price questions with "consulta" as faq, not scheduling', async () => {
      // This was a bug - "quanto custa a consulta" was being classified as scheduling
      expect(await classifyIntent("quanto custa a consulta")).toBe("faq");
    });
  });

  describe("scheduling", () => {
    it.each([
      "Quero agendar uma consulta",
      "Quero marcar horário",
      "Qual a disponibilidade?",
      "Preciso remarcar",
      "Quero cancelar minha consulta",
    ])('classifies "%s" as scheduling', async (message) => {
      expect(await classifyIntent(message)).toBe("scheduling");
    });
  });

  describe("diet_question", () => {
    it.each([
      "Posso comer pão?",
      "O que posso comer no lanche?",
      "Posso substituir arroz por batata?",
      "Qual a quantidade de proteína?",
    ])('classifies "%s" as diet_question', async (message) => {
      expect(await classifyIntent(message)).toBe("diet_question");
    });
  });

  describe("handoff", () => {
    it.each([
      "Quero falar com a nutricionista",
      "Tenho uma reclamação",
      "Estou com dor de barriga",
      "Estou com náusea",
    ])('classifies "%s" as handoff', async (message) => {
      expect(await classifyIntent(message)).toBe("handoff");
    });
  });

  describe("off_topic", () => {
    it.each([
      "Quem vai ganhar o jogo?",
      "Me conta uma piada",
      "Que filme você recomenda?",
      "O que você acha do governo?",
    ])('classifies "%s" as off_topic', async (message) => {
      expect(await classifyIntent(message)).toBe("off_topic");
    });
  });
});

describe("classifySchedulingSubIntent", () => {
  it('classifies "agendar consulta" as book', async () => {
    expect(await classifySchedulingSubIntent("Quero agendar uma consulta")).toBe("book");
  });

  it('classifies "remarcar" as reschedule', async () => {
    expect(await classifySchedulingSubIntent("Preciso remarcar minha consulta")).toBe("reschedule");
  });

  it('classifies "cancelar" as cancel', async () => {
    expect(await classifySchedulingSubIntent("Quero cancelar")).toBe("cancel");
  });

  it("classifies availability check correctly", async () => {
    expect(await classifySchedulingSubIntent("Quais horários disponíveis?")).toBe(
      "check_availability"
    );
  });
});

describe("matchFAQKey", () => {
  it("matches price keywords", () => {
    expect(matchFAQKey("Quanto custa?")).toBe("price");
  });

  it("matches location keywords", () => {
    expect(matchFAQKey("Qual o endereço?")).toBe("location");
  });

  it("returns null for unknown questions", () => {
    expect(matchFAQKey("xyz123")).toBeNull();
  });
});
