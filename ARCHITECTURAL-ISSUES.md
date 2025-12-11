# NutriAssist - Architectural Issues & Limitations

This document captures critical architectural issues discovered during Phase 16 Integration Testing (2025-12-11). These issues need to be addressed before the application can be considered production-ready.

---

## Issue #1: Scheduling Flow State Management

### Priority: HIGH

### Problem
The multi-turn scheduling flow doesn't work. When a patient asks to book an appointment, Nina shows available slots and asks the patient to respond with a number (1-5). However, when the patient responds with the number, the system doesn't recognize it as a slot selection and instead treats it as a new, unrelated message (often creating a handoff).

### Technical Details
- **Location**: `src/services/nina/index.ts` (processMessage function)
- **Root Cause**: Each message is processed independently without conversation context
- **Current Flow**:
  1. Patient: "Quero agendar uma consulta"
  2. Nina: "Ótimo! Tenho esses horários: 1. sexta 12/12 às 08:00... Qual prefere?"
  3. Patient: "3"
  4. Nina: "Essa é uma ótima pergunta para a Dra. Ana Silva!" (WRONG - treats as unknown query)

### Why It Happens
```typescript
// Current: Each message classified independently
export async function processMessage(userMessage: string, context: ProcessMessageContext) {
  const intent = await classifyIntent(userMessage); // "3" doesn't match any intent
  switch (intent) {
    case "scheduling": return handleScheduling(...);
    // ... "3" falls through to default/handoff
  }
}
```

### Suggested Solutions

#### Option A: Session State Storage (Recommended)
Store conversation state in the database or session:
```typescript
interface ConversationState {
  pendingAction?: 'slot_selection' | 'cancellation_confirm' | 'reschedule';
  availableSlots?: AppointmentSlot[];
  currentAppointmentId?: string;
}

// In chat_sessions table, add: state JSONB
```

#### Option B: Message Metadata Analysis
Check previous message metadata to determine expected response:
```typescript
// Look at last Nina message metadata
const lastNinaMessage = conversationHistory.findLast(m => m.sender === 'nina');
if (lastNinaMessage?.metadata?.availableSlots) {
  return processSlotSelection(userMessage, lastNinaMessage.metadata.availableSlots, ...);
}
```

#### Option C: Context-Aware Intent Classification
Pass conversation history to intent classifier:
```typescript
const intent = await classifyIntent(userMessage, conversationHistory);
// LLM can see: "Nina just offered slots, user said '3' = slot selection"
```

### Files to Modify
- `src/services/nina/index.ts` - Add state checking before intent classification
- `src/app/api/chat/route.ts` - Pass conversation history to processMessage
- `supabase/migrations/` - Add state column to chat_sessions (if Option A)

### Acceptance Criteria
- [ ] Patient can complete booking by responding with slot number
- [ ] Patient can confirm cancellation by responding "sim"
- [ ] Patient can complete rescheduling flow
- [ ] State is cleared after flow completion or timeout

---

## Issue #2: OpenRouter Model Unavailable

### Priority: HIGH

### Problem
The OpenRouter API returns 404 for the model `meta-llama/llama-3.1-8b-instruct:free`. This blocks all LLM-powered features including intent classification and diet Q&A.

### Technical Details
- **Location**: `src/lib/openrouter.ts`
- **Error**: `{"error":{"message":"No endpoints found for meta-llama/llama-3.1-8b-instruct:free.","code":404}}`
- **Impact**:
  - Intent classification falls back to keyword matching (less accurate)
  - Diet Q&A completely broken (returns error message)

### Current Configuration
```typescript
// src/lib/openrouter.ts
const DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct:free";
```

### Suggested Solutions

#### Option A: Update to Available Free Model
Check OpenRouter for currently available free models:
- `meta-llama/llama-3.2-3b-instruct:free`
- `mistralai/mistral-7b-instruct:free`
- `google/gemma-2-9b-it:free`

#### Option B: Use Environment Variable
Make model configurable via environment:
```typescript
const MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.2-3b-instruct:free";
```

#### Option C: Add Fallback Chain
Try multiple models in sequence:
```typescript
const MODELS = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-2-9b-it:free"
];
```

### Files to Modify
- `src/lib/openrouter.ts` - Update DEFAULT_MODEL or add fallback
- `.env.local` - Add OPENROUTER_MODEL if making configurable

### Acceptance Criteria
- [ ] LLM calls succeed without 404 errors
- [ ] Intent classification works for ambiguous messages
- [ ] Diet Q&A can generate responses from diet text

---

## Issue #3: Chat Widget Session Persistence

### Priority: MEDIUM

### Problem
When the nutritionist replies to a patient message from the dashboard, the reply is stored in the database but the patient doesn't see it in the chat widget. The chat widget creates a new session each time, losing the conversation history.

### Technical Details
- **Location**: `src/app/chat/[nutritionistId]/page.tsx`
- **Root Cause**:
  - Session ID is stored in localStorage per browser tab
  - New tab/session = new session ID = new conversation
  - No way to link anonymous user to previous conversation
- **Current Flow**:
  1. Patient sends message (session A)
  2. Nutritionist replies via dashboard
  3. Patient refreshes/reopens chat (session B - different)
  4. Patient sees only welcome message, not the reply

### Why It Happens
```typescript
// Current: Generate new session ID for each chat instance
useEffect(() => {
  let sessionId = localStorage.getItem(`chat_session_${nutritionistId}`);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(`chat_session_${nutritionistId}`, sessionId);
  }
  setSessionId(sessionId);
}, []);
```

### Suggested Solutions

#### Option A: Patient Identification (Recommended for Production)
Add optional patient login/identification:
```typescript
// Patient can enter email/phone to resume conversation
const identifyPatient = async (email: string) => {
  const patient = await findPatientByEmail(email);
  if (patient) {
    const session = await findOrCreateSession(nutritionistId, patient.id);
    loadConversationHistory(session.id);
  }
};
```

#### Option B: Longer Session Persistence
Use more persistent storage with longer TTL:
```typescript
// Use cookie with 30-day expiry instead of localStorage
const sessionId = Cookies.get(`chat_session_${nutritionistId}`) || createNewSession();
```

#### Option C: Real-time Updates (WebSocket/SSE)
Add real-time message delivery:
```typescript
// Subscribe to new messages for current session
useEffect(() => {
  const subscription = supabase
    .channel(`messages:${sessionId}`)
    .on('INSERT', handleNewMessage)
    .subscribe();
  return () => subscription.unsubscribe();
}, [sessionId]);
```

### Files to Modify
- `src/app/chat/[nutritionistId]/page.tsx` - Add identification or persistence
- `src/components/chat/ChatWidget.tsx` - Handle real-time updates
- `src/app/api/chat/route.ts` - Link messages to identified patients

### Acceptance Criteria
- [ ] Patient can see nutritionist replies (either via identification or real-time)
- [ ] Conversation history persists across reasonable time periods
- [ ] Clear UX for how patient can access their conversation

---

## Issue #4: Quick Reply Buttons Send Wrong Format

### Priority: LOW

### Problem
The quick reply buttons for scheduling slots send the full slot text (e.g., "sexta 12/12 às 09:30") instead of the expected number format ("3"). This causes the scheduling flow to fail even when using the buttons.

### Technical Details
- **Location**: `src/components/chat/QuickReplies.tsx`
- **Current Behavior**: Button click sends the button label as message
- **Expected Behavior**: Button click should send the slot number

### Suggested Solution
```typescript
// QuickReplies component
interface QuickReply {
  label: string;
  value: string; // Add separate value field
}

// When displaying slots
const replies = slots.map((slot, index) => ({
  label: slot.formatted,  // "sexta 12/12 às 09:30"
  value: String(index + 1) // "3"
}));

// On click, send value not label
onClick={() => sendMessage(reply.value)}
```

### Files to Modify
- `src/components/chat/QuickReplies.tsx`
- `src/services/nina/scheduling.ts` - Ensure slot formatting includes value

### Acceptance Criteria
- [ ] Clicking slot button sends correct number
- [ ] Booking completes when using quick reply buttons

---

## Implementation Priority

| Issue | Priority | Effort | Impact | Suggested Order |
|-------|----------|--------|--------|-----------------|
| #2 OpenRouter Model | HIGH | Low | High | 1st - Quick fix |
| #1 Scheduling State | HIGH | Medium | High | 2nd - Core functionality |
| #4 Quick Reply Format | LOW | Low | Medium | 3rd - Easy fix |
| #3 Session Persistence | MEDIUM | High | Medium | 4th - Requires design decisions |

---

## Testing After Fixes

After implementing fixes, re-run Phase 16 Integration Tests:

```bash
# Create new test branch
git checkout dev
git pull origin dev
git checkout -b fix/architectural-issues

# After fixes, test:
# 1. Complete scheduling flow via chat
# 2. Diet Q&A with uploaded PDF
# 3. Nutritionist reply visibility (if #3 implemented)
```

---

## Related PRs and Issues

- PR #16: Phase 16 Integration Testing (documents these issues)
- test-plan.md: Section "Phase 16 - Integration Testing"
- TASKS.md: Phase 16 status and issues

---

*Document created: 2025-12-11*
*Last updated: 2025-12-11*
