# Nina Service

Nina is the AI assistant. Located in `src/services/nina/`.

## Files

| File | Purpose |
|------|---------|
| `index.ts` | Main orchestrator, `processMessage()` entry point |
| `intents.ts` | Intent classification (keyword + LLM fallback) |
| `scheduling.ts` | Appointment booking, reschedule, cancel flows |
| `dietQA.ts` | Diet questions from patient PDF |
| `faq.ts` | FAQ responses (price, location, etc.) |
| `guardrails.ts` | Block dangerous content |

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

| Intent | Trigger Examples | Handler |
|--------|------------------|---------|
| `greeting` | "oi", "olá", "bom dia" | Simple greeting response |
| `scheduling` | "agendar", "marcar", "cancelar" | Multi-turn booking flow |
| `diet_question` | "posso comer", "substituir" | LLM + patient diet PDF |
| `faq` | "quanto custa", "endereço" | Nutritionist FAQ config |
| `handoff` | "falar com nutricionista" | Escalate to human |
| `off_topic` | "futebol", "política" | Redirect to nutrition |
| `dangerous` | weapons, drugs, harm | Block immediately |

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
