# NutriAssist - Architectural Issues & Limitations

This document captures all issues and limitations discovered during testing phases (10-16). Issues are categorized by priority and include suggested solutions.

**Last Updated**: 2025-12-11 (All issues resolved)

---

## Table of Contents

1. [Issue #1: Scheduling Flow State Management](#issue-1-scheduling-flow-state-management) - HIGH ✅ RESOLVED
2. [Issue #2: OpenRouter Model Unavailable](#issue-2-openrouter-model-unavailable) - HIGH ✅ RESOLVED
3. [Issue #3: Chat Widget Session Persistence](#issue-3-chat-widget-session-persistence) - MEDIUM ✅ PARTIAL
4. [Issue #4: Quick Reply Buttons Send Wrong Format](#issue-4-quick-reply-buttons-send-wrong-format) - LOW ✅ RESOLVED
5. [Issue #5: Profile Validation Missing](#issue-5-profile-validation-missing) - LOW ✅ RESOLVED
6. [Issue #6: Appointment Notes Not Editable](#issue-6-appointment-notes-not-editable) - LOW ✅ RESOLVED
7. [Issue #7: Dashboard Reply Not Visible in Real-time](#issue-7-dashboard-reply-not-visible-in-real-time) - MEDIUM ✅ RESOLVED

---

## Issue #1: Scheduling Flow State Management

### Priority: HIGH ✅ RESOLVED

### Status: RESOLVED (2025-12-11)

**Solution implemented:** Option B (Message Metadata Analysis)
- Before intent classification, check the last Nina message metadata
- If `availableSlots` is present and user responds with a number (1-9), process as slot selection
- If `currentAppointmentId` is present (without slots) and user responds "sim", process cancellation confirmation
- Added `checkPendingConversationState()` function in `src/services/nina/index.ts`

**PR:** fix/issue-1-scheduling-state

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
- [x] Patient can complete booking by responding with slot number
- [x] Patient can confirm cancellation by responding "sim"
- [x] Patient can complete rescheduling flow
- [x] State is cleared after flow completion (metadata-based, no persistent state needed)

---

## Issue #2: OpenRouter Model Unavailable

### Priority: HIGH ✅ RESOLVED

### Status: RESOLVED (2025-12-11)

**Solution implemented:** Combined Options A + B + C
- Updated default models to best available free models (December 2025)
- Added `OPENROUTER_MODEL` env var for single model override
- Added `OPENROUTER_FALLBACK_MODELS` env var for custom fallback chain
- Implemented sticky primary with automatic failover on 404

**PR:** fix/issue-2-openrouter-fallback

### Problem
The OpenRouter API returns 404 for the model `meta-llama/llama-3.1-8b-instruct:free`. This blocks all LLM-powered features including intent classification and diet Q&A.

### Technical Details
- **Location**: `src/lib/openrouter.ts`
- **Error**: `{"error":{"message":"No endpoints found for meta-llama/llama-3.1-8b-instruct:free.","code":404}}`
- **Impact**:
  - Intent classification falls back to keyword matching (less accurate)
  - Diet Q&A completely broken (returns error message)

### Resolution

#### Default Fallback Chain (quality-based order)
```typescript
const DEFAULT_FALLBACK_MODELS = [
  "deepseek/deepseek-chat-v3-0324:free",           // Best for dialogue
  "mistralai/mistral-small-3.1-24b-instruct:free", // Great for structured output
  "google/gemini-2.5-pro-exp-03-25:free",          // Excellent reasoning
  "nousresearch/deephermes-3-llama-3-8b-preview:free", // Compact fallback
];
```

#### Environment Variables
```env
# Optional: Override the default model
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free

# Optional: Custom fallback chain (comma-separated)
OPENROUTER_FALLBACK_MODELS=model-1,model-2,model-3
```

#### Behavior
1. If `OPENROUTER_FALLBACK_MODELS` set → use custom chain only
2. If `OPENROUTER_MODEL` set → use it first, then defaults
3. Otherwise → use default fallback chain
4. Sticky primary: remembers which model is working
5. Auto-failover: skips 404 models immediately

### Files Modified
- `src/lib/openrouter.ts` - Fallback chain implementation
- `.env.example` - New environment variables documented

### Acceptance Criteria
- [x] LLM calls succeed without 404 errors
- [x] Intent classification works for ambiguous messages
- [x] Diet Q&A can generate responses from diet text

---

## Issue #3: Chat Widget Session Persistence

### Priority: MEDIUM ✅ PARTIAL

### Status: PARTIAL (2025-12-11)

**Solution implemented:** Option C (Real-time Updates)
- Added Supabase Realtime subscription to ChatWidget component
- Patient now sees nutritionist replies instantly without page refresh
- Full cross-device session persistence deferred (would require Supabase Auth)

**PR:** #23 fix/issue-3-chat-realtime

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

### Priority: LOW ✅ RESOLVED

### Status: RESOLVED (2025-12-11)

**Solution implemented:**
- Updated QuickReplies component to accept `{label, value}` objects
- Button displays formatted slot text but sends slot number
- ChatWidget maps slots with index as value

**PR:** #20 fix/issue-4-quick-reply-format

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

## Issue #5: Profile Validation Missing

### Priority: LOW ✅ RESOLVED

### Status: RESOLVED (2025-12-11)

**Solution implemented:**
- Added `validateForm()` function with error state management
- Validates required fields (name) before save
- Shows inline error messages on invalid fields

**PR:** #21 fix/issue-5-profile-validation

### Problem
The profile settings form accepts empty values for required fields like the nutritionist's name. Users can save a profile with an empty name, which could cause display issues throughout the application.

### Technical Details
- **Location**: `src/app/dashboard/settings/page.tsx`
- **Discovered**: Phase 15 - Dashboard Settings Testing
- **Current Behavior**: Form submits successfully even with empty name field
- **Expected Behavior**: Form should validate required fields and show error messages

### Suggested Solution
```typescript
// Add validation before save
const handleSaveProfile = async () => {
  // Validate required fields
  if (!profile.name?.trim()) {
    setError('Nome é obrigatório');
    return;
  }

  // Continue with save...
};

// Or use a validation library like zod
const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
});
```

### Files to Modify
- `src/app/dashboard/settings/page.tsx` - Add form validation

### Acceptance Criteria
- [ ] Empty name field shows validation error
- [ ] Form doesn't submit with invalid data
- [ ] Clear error messages displayed to user

---

## Issue #6: Appointment Notes Not Editable

### Priority: LOW ✅ RESOLVED

### Status: RESOLVED (2025-12-11)

**Solution implemented:**
- Added `updateAppointmentNotes()` function to appointments service
- Updated PATCH endpoint to handle notes updates
- Added editable notes section to AppointmentModal with local state management

**PR:** #22 fix/issue-6-appointment-notes

### Problem
When editing an existing appointment, there is no way to add or modify notes. The notes field is not exposed in the edit appointment UI, even though the database schema supports storing notes.

### Technical Details
- **Location**: `src/app/dashboard/appointments/page.tsx`
- **Discovered**: Phase 14 - Dashboard Appointments Testing
- **Database Column**: `appointments.notes` (exists in schema)
- **Current Behavior**: Edit modal doesn't include notes field
- **Expected Behavior**: Edit modal should allow viewing and editing notes

### Suggested Solution
```typescript
// In the appointment edit modal, add notes field
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Notas</label>
  <textarea
    value={editingAppointment?.notes || ''}
    onChange={(e) => setEditingAppointment({
      ...editingAppointment,
      notes: e.target.value
    })}
    className="w-full p-2 border rounded"
    rows={3}
    placeholder="Observações sobre a consulta..."
  />
</div>
```

### Files to Modify
- `src/app/dashboard/appointments/page.tsx` - Add notes field to edit modal
- `src/app/api/appointments/route.ts` - Ensure PUT handler accepts notes

### Acceptance Criteria
- [ ] Notes field visible in appointment edit modal
- [ ] Notes can be added to new appointments
- [ ] Notes can be edited on existing appointments
- [ ] Notes persist after save

---

## Issue #7: Dashboard Reply Not Visible in Real-time

### Priority: MEDIUM ✅ RESOLVED

### Status: RESOLVED (2025-12-11)

**Solution implemented:** Option C (Real-time Subscription)
- Enabled Supabase Realtime on messages table via SQL migration
- Added Realtime subscription to ConversationsPage
- Nutritionist replies appear instantly without page refresh

**PR:** #19 fix/issue-7-dashboard-reply

### Problem
When a nutritionist replies to a patient message from the dashboard conversations page, the reply is stored in the database but doesn't appear immediately in the conversation view. The nutritionist must refresh the page to see their own reply.

### Technical Details
- **Location**: `src/app/dashboard/conversations/page.tsx`
- **Discovered**: Phase 12 - Dashboard Conversations Testing
- **Root Cause**: After sending a reply, the local state isn't updated to include the new message
- **Current Flow**:
  1. Nutritionist types reply and clicks send
  2. Message is saved to database via API
  3. UI shows success but message list doesn't update
  4. Page refresh shows the message correctly

### Suggested Solutions

#### Option A: Optimistic Update (Recommended)
Add the new message to local state immediately after successful send:
```typescript
const handleSendReply = async () => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message: replyText, sender: 'nutritionist' })
  });

  if (response.ok) {
    const newMessage = await response.json();
    // Update local state with new message
    setMessages(prev => [...prev, newMessage]);
    setReplyText('');
  }
};
```

#### Option B: Refetch Messages
Reload the message list after successful send:
```typescript
const handleSendReply = async () => {
  await fetch('/api/chat', { /* ... */ });
  // Refetch all messages for this session
  await fetchMessages(sessionId);
  setReplyText('');
};
```

#### Option C: Real-time Subscription
Use Supabase real-time to subscribe to new messages:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel(`messages:session_id=eq.${sessionId}`)
    .on('postgres_changes', { event: 'INSERT' }, (payload) => {
      setMessages(prev => [...prev, payload.new]);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [sessionId]);
```

### Files to Modify
- `src/app/dashboard/conversations/page.tsx` - Add state update after reply

### Acceptance Criteria
- [ ] Nutritionist reply appears immediately in conversation view
- [ ] No page refresh required to see sent messages
- [ ] Message appears in correct chronological order

---

## Implementation Priority

| Issue | Priority | Effort | Impact | Status |
|-------|----------|--------|--------|--------|
| #2 OpenRouter Model | HIGH | Low | High | ✅ RESOLVED (PR #17) |
| #1 Scheduling State | HIGH | Medium | High | ✅ RESOLVED (PR #18) |
| #7 Dashboard Reply | MEDIUM | Low | Medium | ✅ RESOLVED (PR #19) |
| #4 Quick Reply Format | LOW | Low | Medium | ✅ RESOLVED (PR #20) |
| #5 Profile Validation | LOW | Low | Low | ✅ RESOLVED (PR #21) |
| #6 Appointment Notes | LOW | Low | Low | ✅ RESOLVED (PR #22) |
| #3 Session Persistence | MEDIUM | High | Medium | ✅ PARTIAL (PR #23) |

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
*Last updated: 2025-12-11 (resolved Issue #1: Scheduling Flow State Management)*
