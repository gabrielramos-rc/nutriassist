import { describe, it, expect } from "vitest";
import { matchFAQKey, handleFAQ, getAvailableFAQKeys, isFAQQuestion } from "../faq";
import type { Nutritionist, FAQResponses } from "@/types";

// Mock nutritionist with FAQ responses
const mockNutritionist: Nutritionist = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Dra. Ana",
  email: "ana@test.com",
  phone: "11999999999",
  business_hours: {},
  appointment_duration: 60,
  faq_responses: {
    price: "A consulta custa R$ 200,00.",
    location: "Rua das Flores, 123 - Centro",
    preparation: "Traga exames recentes e anote suas dúvidas.",
    duration: "A consulta dura aproximadamente 1 hora.",
    online: "Sim, atendo por videochamada.",
  } as FAQResponses,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Nutritionist without FAQ configured
const mockNutritionistNoFAQ: Nutritionist = {
  ...mockNutritionist,
  id: "22222222-2222-2222-2222-222222222222",
  faq_responses: null,
};

describe("matchFAQKey", () => {
  describe("price keywords", () => {
    it.each([
      "Quanto custa a consulta?",
      "Qual o valor?",
      "Qual é o preço?",
      "Quanto é a consulta?",
      "Como funciona o pagamento?",
    ])('matches "%s" to price', (message) => {
      expect(matchFAQKey(message)).toBe("price");
    });
  });

  describe("location keywords", () => {
    it.each([
      "Qual o endereço?",
      "Onde fica o consultório?",
      "Qual a localização?",
      "Onde é a clínica?",
    ])('matches "%s" to location', (message) => {
      expect(matchFAQKey(message)).toBe("location");
    });
  });

  describe("preparation keywords", () => {
    it.each([
      "O que devo levar?",
      "Como me preparar?",
      "O que trazer na primeira consulta?",
      "Preciso de algum preparo?",
    ])('matches "%s" to preparation', (message) => {
      expect(matchFAQKey(message)).toBe("preparation");
    });
  });

  describe("duration keywords", () => {
    it.each([
      "Quanto tempo dura a consulta?",
      "Qual a duração?",
      "Demora muito?",
      "Leva quanto tempo?",
    ])('matches "%s" to duration', (message) => {
      expect(matchFAQKey(message)).toBe("duration");
    });
  });

  describe("online keywords", () => {
    it.each(["Atende online?", "Tem videochamada?", "Atende remoto?", "Consulta à distância?"])(
      'matches "%s" to online',
      (message) => {
        expect(matchFAQKey(message)).toBe("online");
      }
    );
  });

  it("returns null for non-FAQ questions", () => {
    expect(matchFAQKey("Posso comer pão?")).toBeNull();
    expect(matchFAQKey("Quero agendar")).toBeNull();
    expect(matchFAQKey("Bom dia!")).toBeNull();
  });
});

describe("handleFAQ", () => {
  it("returns configured FAQ response for price", () => {
    const result = handleFAQ("Quanto custa?", mockNutritionist);
    expect(result.intent).toBe("faq");
    expect(result.content).toBe("A consulta custa R$ 200,00.");
    expect(result.metadata?.faqKey).toBe("price");
  });

  it("returns configured FAQ response for location", () => {
    const result = handleFAQ("Onde fica?", mockNutritionist);
    expect(result.intent).toBe("faq");
    expect(result.content).toBe("Rua das Flores, 123 - Centro");
    expect(result.metadata?.faqKey).toBe("location");
  });

  it("returns configured FAQ response for preparation", () => {
    const result = handleFAQ("O que levar?", mockNutritionist);
    expect(result.intent).toBe("faq");
    expect(result.content).toBe("Traga exames recentes e anote suas dúvidas.");
  });

  it("returns configured FAQ response for duration", () => {
    const result = handleFAQ("Quanto tempo dura?", mockNutritionist);
    expect(result.intent).toBe("faq");
    expect(result.content).toBe("A consulta dura aproximadamente 1 hora.");
  });

  it("returns configured FAQ response for online", () => {
    const result = handleFAQ("Atende online?", mockNutritionist);
    expect(result.intent).toBe("faq");
    expect(result.content).toBe("Sim, atendo por videochamada.");
  });

  it("triggers handoff when FAQ not configured", () => {
    const result = handleFAQ("Quanto custa?", mockNutritionistNoFAQ);
    expect(result.intent).toBe("handoff");
    expect(result.metadata?.requiresHandoff).toBe(true);
    expect(result.metadata?.handoffReason).toBe("faq_not_found");
  });

  it("triggers handoff when question not matched", () => {
    const result = handleFAQ("Posso comer chocolate?", mockNutritionist);
    expect(result.intent).toBe("handoff");
    expect(result.metadata?.requiresHandoff).toBe(true);
  });
});

describe("getAvailableFAQKeys", () => {
  it("returns all FAQ keys", () => {
    const keys = getAvailableFAQKeys();
    expect(keys).toContain("price");
    expect(keys).toContain("location");
    expect(keys).toContain("preparation");
    expect(keys).toContain("duration");
    expect(keys).toContain("online");
  });
});

describe("isFAQQuestion", () => {
  it("returns true for FAQ questions", () => {
    expect(isFAQQuestion("Quanto custa?")).toBe(true);
    expect(isFAQQuestion("Onde fica?")).toBe(true);
  });

  it("returns false for non-FAQ questions", () => {
    expect(isFAQQuestion("Posso comer pão?")).toBe(false);
    expect(isFAQQuestion("Quero agendar")).toBe(false);
  });
});
