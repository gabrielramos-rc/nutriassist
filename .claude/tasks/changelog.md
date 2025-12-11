# Changelog & Decisions Log

Technical decisions, bugs fixed, and lessons learned.

---

## Bug Fixes (PRs #17-23)

### PR #23: Chat Real-time Updates (Issue #3)
- **Problem:** Nutritionist replies not visible to patient in real-time
- **Solution:** Added Supabase Realtime subscription
- **File:** `src/components/chat/ChatWidget.tsx`

### PR #22: Appointment Notes (Issue #6)
- **Problem:** Notes field not editable in appointment modal
- **Solution:** Added editable notes field to modal
- **File:** `src/components/dashboard/AppointmentCalendar.tsx`

### PR #21: Profile Validation (Issue #5)
- **Problem:** Settings form had no validation
- **Solution:** Added required field validation
- **File:** `src/app/dashboard/settings/page.tsx`

### PR #20: Quick Reply Format (Issue #4)
- **Problem:** Quick reply buttons sent full text instead of slot number
- **Solution:** Send slot number for reliable parsing
- **File:** `src/components/chat/QuickReplies.tsx`

### PR #19: Dashboard Real-time (Issue #7)
- **Problem:** Dashboard didn't show new messages instantly
- **Solution:** Added Realtime subscription to conversation view
- **File:** `src/app/dashboard/conversations/page.tsx`

### PR #18: Scheduling State (Issue #1)
- **Problem:** Multi-turn booking couldn't complete - state lost between messages
- **Solution:** Added `checkPendingConversationState()` in Nina service
- **File:** `src/services/nina/index.ts`

### PR #17: OpenRouter Fallback (Issue #2)
- **Problem:** Primary model returned 404, blocking LLM features
- **Solution:** Implemented fallback chain with 4 free models
- **File:** `src/lib/openrouter.ts`

---

## Testing Phases (PRs #10-16)

### PR #16: Integration Testing
- Validated chat ↔ dashboard communication
- Found issues #1-7 during testing

### PR #15: Settings Testing
- **Bug:** Copy button failed on HTTP
- **Fix:** Added `document.execCommand` fallback

### PR #14: Appointments Testing
- Validated calendar/list views
- Confirmed status changes work

### PR #13: Patients Testing
- Validated CRUD operations
- Confirmed PDF upload/download

### PR #12: Conversations Testing
- **Bug:** Nutritionist replies not in history
- **Cause:** Messages queried ASC with LIMIT 50, cut off newest
- **Fix:** Changed to DESC + reverse
- **File:** `src/services/conversations.ts:410-424`

### PR #11: Chat Widget Testing
- Added off-topic keywords (sports, jokes, politics, weather, news)
- Added "preparar" to FAQ preparation keywords
- Reordered intent: off-topic checked before handoff

### PR #10: FAQ Intent Bug
- **Bug:** "Quanto custa?" routed to scheduling instead of FAQ
- **Fix:** Added `INTENT_CHECK_ORDER` - check FAQ before scheduling
- **File:** `src/services/nina/intents.ts`

---

## Build Phases (PRs #1-9)

### PR #9: Deployment (Phase 9)
- Vercel configuration
- Analytics and Speed Insights
- Production RLS migration

### PR #8: Polish (Phase 8)
- UI components (Button, Input, Card, Modal, Loading, Avatar)
- Landing page
- Error handling and toasts

### PR #7: Dashboard (Phase 7)
- Nutritionist dashboard layout
- Conversations, Patients, Appointments, Settings pages

### PR #6: Handoff System (Phase 6)
- `createHandoff()`, `getHandoffs()`, `resolveHandoff()`
- Handoff triggers in Nina service

### PR #5: Diet Q&A (Phase 5)
- PDF text extraction with pdf-parse
- Diet question handler with LLM

### PR #4: Scheduling (Phase 4)
- Appointment service (slots, booking, reschedule, cancel)
- Multi-turn scheduling flow

### PR #3: FAQ Handler (Phase 3)
- FAQ matching (price, location, preparation, duration, online)
- Default FAQ responses

### PR #2: Chat System (Phase 2)
- Conversation service
- Chat API endpoint
- ChatWidget, MessageBubble, MessageInput components

### PR #1: Core Infrastructure (Phase 1)
- OpenRouter integration
- Nina service (guardrails, intents, orchestrator)
- Constants and prompts

---

## Architectural Decisions

### Supabase Realtime
- **Context:** Need instant message updates in chat widget
- **Decision:** Use Supabase Realtime (free tier includes it)
- **Alternative rejected:** Polling (unnecessary load)

### OpenRouter Fallback Chain
- **Context:** Free models have availability issues
- **Decision:** Chain of 4 models, try next on failure
- **Models:** deepseek → mistral → gemini → deephermes
- **Config:** Override via `OPENROUTER_FALLBACK_MODELS` env var

### Documentation Structure
- **Context:** Claude Code context overflow with large docs
- **Decision:** Topic-based folders with lean summaries
- **Pattern:** `summary.md` → `detail.md` progressive disclosure

---

## Gotchas

### Intent Classification Order
Intent check order matters. Current order:
1. Dangerous (block immediately)
2. Greeting
3. FAQ (before scheduling - "quanto custa" fix)
4. Scheduling
5. Diet question
6. Off-topic (before handoff)
7. Handoff

### Supabase Message Queries
Always use DESC + reverse for message history, not ASC with LIMIT. ASC cuts off newest messages when hitting the limit.

### Clipboard API
`navigator.clipboard.writeText()` requires HTTPS. Always add `document.execCommand('copy')` fallback for development/HTTP contexts.

### Quick Reply Parsing
Send slot numbers (1, 2, 3) not full text. Full text varies by language and is harder to parse reliably.
