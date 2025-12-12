# Nina Service

Nina is the AI assistant. Located in `src/services/nina/`.

## Files

| File            | Purpose                                           |
| --------------- | ------------------------------------------------- |
| `index.ts`      | Main orchestrator, `processMessage()` entry point |
| `intents.ts`    | Intent classification (keyword + LLM fallback)    |
| `scheduling.ts` | Appointment booking, reschedule, cancel flows     |
| `dietQA.ts`     | Diet questions from patient PDF                   |
| `faq.ts`        | FAQ responses (price, location, etc.)             |
| `guardrails.ts` | Block dangerous content                           |

## Processing Flow

```
User Message
     │
     ▼
1. Guardrails ──▶ Block if dangerous
     │
     ▼
2. Check Pending State ──▶ Handle multi-turn (slot selection, cancellation)
     │
     ▼
3. Classify Intent
     │
     ▼
4. Route to Handler ──▶ greeting | scheduling | diet_question | faq | handoff | off_topic
     │
     ▼
5. Return Response + Intent + Metadata
```

## Intents

| Intent          | Trigger Examples                | Handler                  |
| --------------- | ------------------------------- | ------------------------ |
| `greeting`      | "oi", "olá", "bom dia"          | Simple greeting response |
| `scheduling`    | "agendar", "marcar", "cancelar" | Multi-turn booking flow  |
| `diet_question` | "posso comer", "substituir"     | LLM + patient diet PDF   |
| `faq`           | "quanto custa", "endereço"      | Nutritionist FAQ config  |
| `handoff`       | "falar com nutricionista"       | Escalate to human        |
| `off_topic`     | "futebol", "política"           | Redirect to nutrition    |
| `dangerous`     | weapons, drugs, harm            | Block immediately        |

## Multi-turn State

For flows requiring multiple messages (booking, cancellation):

1. Nina sends response with `metadata.availableSlots` or `metadata.currentAppointmentId`
2. Next user message checks last Nina message metadata
3. If metadata exists, process as continuation (skip intent classification)

**Key function**: `checkPendingConversationState()` in `index.ts`

## LLM Integration

- Uses OpenRouter with fallback chain
- Intent classification: keyword match first, LLM for ambiguous
- Diet Q&A: sends question + extracted PDF text to LLM
- Config: `src/lib/openrouter.ts`

---

## How to Add New Intents

### 1. Define the Intent Type

```typescript
// src/types/index.ts
export type NinaIntent =
  | "greeting"
  | "scheduling"
  | "diet_question"
  | "faq"
  | "handoff"
  | "off_topic"
  | "dangerous"
  | "your_new_intent"; // Add here
```

### 2. Add Keywords Pattern

```typescript
// src/services/nina/intents.ts
const INTENT_PATTERNS: Record<NinaIntent, RegExp[]> = {
  // ... existing patterns
  your_new_intent: [/keyword1/i, /keyword2/i],
};
```

### 3. Add to Check Order (Important!)

```typescript
// src/services/nina/intents.ts
const INTENT_CHECK_ORDER: NinaIntent[] = [
  "dangerous",
  "greeting",
  "faq", // More specific patterns first
  "scheduling",
  "diet_question",
  "your_new_intent", // Add in correct position
  "off_topic",
  "handoff",
];
```

**Rule:** More specific patterns before broader ones.

### 4. Create Handler (if needed)

```typescript
// src/services/nina/yourNewIntent.ts
export async function handleYourNewIntent(
  message: string,
  context: NinaContext
): Promise<NinaResponse> {
  // Implementation
}
```

### 5. Add Route in Orchestrator

```typescript
// src/services/nina/index.ts
case 'your_new_intent':
  return handleYourNewIntent(message, context)
```

### 6. Add Response Template

```typescript
// src/constants/nina.ts
export const NINA_RESPONSES = {
  // ... existing
  your_new_intent: "Response template here",
};
```

### 7. Write Tests

```typescript
// src/services/nina/__tests__/intents.test.ts
it("classifies your_new_intent correctly", () => {
  expect(classifyIntent("keyword1")).toBe("your_new_intent");
});
```
