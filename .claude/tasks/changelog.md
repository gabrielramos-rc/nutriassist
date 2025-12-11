# Changelog & Decisions Log

Technical decisions, bugs fixed, and lessons learned.

---

## 2024-12: Integration Fixes

### Issue #1: Scheduling Flow State Management
- **Problem:** Multi-turn booking couldn't complete - state lost between messages
- **Solution:** Added `checkPendingConversationState()` in Nina service
- **File:** `src/services/nina/index.ts`
- **PR:** #18

### Issue #2: OpenRouter Model Unavailable
- **Problem:** Primary model returned 404, blocking LLM features
- **Solution:** Implemented fallback chain with 4 free models
- **File:** `src/lib/openrouter.ts`
- **PR:** #17

### Issue #3: Chat Widget Session Persistence
- **Problem:** Nutritionist replies not visible to patient in real-time
- **Solution:** Added Supabase Realtime subscription
- **File:** `src/components/chat/ChatWidget.tsx`
- **PR:** #23

---

## 2024-12: Testing Phase Bugs

### Phase 10: FAQ Intent
- **Bug:** "Quanto custa?" routed to scheduling instead of FAQ
- **Fix:** Added `INTENT_CHECK_ORDER` - check FAQ before scheduling
- **File:** `src/services/nina/intents.ts`
- **PR:** #10

### Phase 11: Chat Widget
- Added off-topic keywords (sports, jokes, politics, weather, news)
- Added "preparar" to FAQ preparation keywords
- Reordered intent: off-topic checked before handoff

### Phase 12: Conversations
- **Bug:** Nutritionist replies not in history
- **Cause:** Messages queried ASC with LIMIT 50, cut off newest
- **Fix:** Changed to DESC + reverse
- **File:** `src/services/conversations.ts:410-424`

### Phase 15: Settings
- **Bug:** Copy button failed on HTTP (non-HTTPS contexts)
- **Fix:** Added `document.execCommand` fallback for clipboard

---

## Architectural Decisions

### Supabase Realtime (Dec 2024)
- **Context:** Need instant message updates in chat widget
- **Decision:** Use Supabase Realtime (free tier includes it)
- **Alternative considered:** Polling (rejected - unnecessary load)

### OpenRouter Fallback Chain (Dec 2024)
- **Context:** Free models have availability issues
- **Decision:** Chain of 4 models, try next on failure
- **Models:** deepseek → mistral → gemini → deephermes
- **Config:** Override via `OPENROUTER_FALLBACK_MODELS` env var

### Documentation Structure (Dec 2024)
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
