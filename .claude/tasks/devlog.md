# Development Log

Technical decisions, bugs fixed, and lessons learned during development.

---

## Security Phase (PRs #28-34)

### PR #34: API Input Validation & Rate Limiting (Phase 22.6)

- **Change:** Added Zod validation and rate limiting to all API routes
- **Rate limits:** Chat 20/min, APIs 60/min, Upload 10/min
- **Files:** `src/lib/validations.ts`, `src/lib/rate-limit.ts`, all API routes

### PR #32: Security Headers (Phase 22.5)

- **Change:** Added HTTP security headers via next.config.ts
- **Headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **File:** `next.config.ts`

### PR #31: Pre-commit Secret Detection (Phase 22.4)

- **Change:** Added secretlint for pre-commit secret scanning
- **Note:** Chose secretlint over gitleaks (see Gotchas)
- **Files:** `.secretlintrc.json`, `.husky/pre-commit`

### PR #30: GitHub Actions Security Workflow (Phase 22.3)

- **Change:** Added security.yml with npm audit and CodeQL
- **Triggers:** Push/PR to main/dev, weekly schedule
- **File:** `.github/workflows/security.yml`

### PR #29: GitHub Dependabot (Phase 22.2)

- **Change:** Added Dependabot for automated dependency updates
- **Schedule:** Weekly on Monday 9am BRT
- **File:** `.github/dependabot.yml`

### PR #28: Fix Vulnerabilities (Phase 22.1)

- **Change:** Updated Next.js 16.0.8 → 16.0.10, removed 46 console.log statements
- **Vulnerabilities fixed:** GHSA-w37m-7fhw-fmv9, GHSA-mwv6-3258-q52c

---

## Code Quality Phase (PR #27)

### PR #27: Code Quality Improvements (Phase 21)

- **Changes:**
  - Added Prettier with eslint-config-prettier
  - Added Husky + lint-staged for pre-commit hooks
  - Added stricter ESLint rules (no-console, complexity, max-lines)
  - Increased test coverage to 209 tests
  - Enabled stricter TypeScript options
- **Files:** `.prettierrc`, `.husky/*`, `eslint.config.mjs`, `tsconfig.json`

---

## Bug Fixes (PRs #17-23)

### PR #23: Chat Real-time Updates (Issue #3)

- **Problem:** Nutritionist replies not visible to patient in real-time
- **Solution:** Added Supabase Realtime subscription to ChatWidget
- **File:** `src/components/chat/ChatWidget.tsx`
- **Note:** Partial fix - full cross-device persistence would need Supabase Auth

### PR #22: Appointment Notes (Issue #6)

- **Problem:** Notes field not editable in appointment modal
- **Solution:** Added editable notes UI with edit/save/cancel buttons
- **Files:** `src/components/dashboard/AppointmentModal.tsx`, `src/services/appointments.ts`

### PR #21: Profile Validation (Issue #5)

- **Problem:** Settings form had no validation
- **Solution:** Added required field validation with visual indicators (\*)
- **Messages:** "Nome é obrigatório", "E-mail inválido"
- **File:** `src/app/dashboard/settings/page.tsx`

### PR #20: Quick Reply Format (Issue #4)

- **Problem:** Quick reply buttons sent full text (e.g., "sexta 12/12 às 09:30")
- **Why it broke:** Nina couldn't parse formatted text as slot selection
- **Solution:** Send slot number (1, 2, 3) instead - QuickReplies now uses `{label, value}`
- **Files:** `src/components/chat/QuickReplies.tsx`, `src/components/chat/ChatWidget.tsx`

### PR #19: Dashboard Real-time (Issue #7)

- **Problem:** Dashboard didn't show new messages instantly
- **Solution:** Added Realtime subscription to conversation view
- **Migration:** `003_enable_realtime.sql` - enables Realtime on messages table
- **File:** `src/app/dashboard/conversations/page.tsx`

### PR #18: Scheduling State (Issue #1)

- **Problem:** Multi-turn booking failed - slot selection ("3") treated as new message
- **Root cause:** No conversation state management between messages
- **Solution:** `checkPendingConversationState()` checks last Nina message metadata
  - If `availableSlots` + user sends number → process as slot selection
  - If `currentAppointmentId` + user sends "sim" → confirm cancellation
- **File:** `src/services/nina/index.ts`

### PR #17: OpenRouter Fallback (Issue #2)

- **Problem:** `meta-llama/llama-3.1-8b-instruct:free` returns 404
- **Solution:** Fallback chain with sticky primary model
- **Models (Dec 2024):**
  1. `deepseek/deepseek-chat-v3-0324:free` - Best for dialogue
  2. `mistralai/mistral-small-3.1-24b-instruct:free` - Structured output
  3. `google/gemini-2.5-pro-exp-03-25:free` - Reasoning, huge context
  4. `nousresearch/deephermes-3-llama-3-8b-preview:free` - Compact fallback
- **Behavior:** Tries models in order, remembers working model, skips 404s immediately
- **File:** `src/lib/openrouter.ts`

---

## Testing Phases (PRs #10-16)

### PR #16: Integration Testing

- Found 7 architectural issues during testing
- Created ARCHITECTURAL-ISSUES.md to track them
- Issues #1-7 fixed in PRs #17-23

### PR #15: Settings Testing

- **Bug:** Copy button failed on HTTP (non-HTTPS)
- **Fix:** Added `document.execCommand('copy')` fallback

### PR #14: Appointments Testing

- Validated calendar/list views
- Confirmed status changes work

### PR #13: Patients Testing

- Validated CRUD operations
- Confirmed PDF upload/download (10MB limit)

### PR #12: Conversations Testing

- **Bug:** Nutritionist replies not in history
- **Root cause:** Messages queried ASC with LIMIT 50, cut off newest
- **Fix:** Changed to DESC + reverse
- **File:** `src/services/conversations.ts:410-424`

### PR #11: Chat Widget Testing

- **Bug fixes found:**
  - Added off-topic keywords (sports, jokes, politics, weather, news)
  - Added "preparar" to FAQ preparation keywords
  - Reordered intent: off-topic checked before handoff
- **Files:** `src/services/nina/intents.ts`, `src/constants/nina.ts`

### PR #10: FAQ Intent Bug

- **Bug:** "Quanto custa a consulta?" routed to scheduling
- **Root cause:** `Object.entries()` iteration order + overly broad "consulta" pattern
- **Fix:** Added `INTENT_CHECK_ORDER` array - check FAQ before scheduling
- **File:** `src/services/nina/intents.ts`

---

## Build Phases (PRs #1-9)

### PR #9: Deployment (Phase 9)

- Vercel configuration with `gru1` region (São Paulo)
- Analytics and Speed Insights
- Production RLS migration (`002_production_rls.sql`)

### PR #8: Polish (Phase 8)

- UI components (Button, Input, Card, Modal, Loading, Avatar)
- Landing page with hero, features, CTA
- Error handling with toast notifications

### PR #7: Dashboard (Phase 7)

- Nutritionist dashboard with sidebar navigation
- Pages: Conversations, Patients, Appointments, Settings
- Stats: Active conversations, pending handoffs, today's appointments, total patients

### PR #6: Handoff System (Phase 6)

- `createHandoff()`, `getHandoffs()`, `resolveHandoff()`
- Triggers: medical symptoms, complaints, explicit human request, question not in PDF

### PR #5: Diet Q&A (Phase 5)

- PDF text extraction with `pdf-parse` library
- Diet question handler sends question + extracted text to LLM
- Answers include page/section reference

### PR #4: Scheduling (Phase 4)

- `getAvailableSlots()` - parses business_hours, excludes existing appointments
- `createAppointment()`, `rescheduleAppointment()`, `cancelAppointment()`
- Multi-turn scheduling flow with sub-intents (book, reschedule, cancel, check)

### PR #3: FAQ Handler (Phase 3)

- FAQ matching: price, location, preparation, duration, online
- Returns nutritionist's configured response
- Fallback to handoff if no match

### PR #2: Chat System (Phase 2)

- Conversation service: `getOrCreateSession()`, `saveMessage()`, `closeSession()`
- Chat API endpoint at `/api/chat`
- Components: ChatWidget, MessageBubble, MessageInput, QuickReplies

### PR #1: Core Infrastructure (Phase 1)

- OpenRouter integration with retry logic
- Nina service: guardrails → intent classification → handler → response
- Constants: system prompt, intent prompts, response templates

---

## Architectural Decisions

### Supabase Realtime

- **Context:** Need instant message updates in chat widget and dashboard
- **Decision:** Use Supabase Realtime (free tier includes it)
- **Migration:** `003_enable_realtime.sql`
- **Alternative rejected:** Polling (unnecessary load)

### OpenRouter Fallback Chain

- **Context:** Free models have availability issues
- **Decision:** Chain of 4 models, try next on failure
- **Behavior:** Sticky primary - remembers working model for session
- **Config:** Override via `OPENROUTER_MODEL` or `OPENROUTER_FALLBACK_MODELS`

### Message Metadata for State

- **Context:** Multi-turn flows need state between messages
- **Decision:** Store state in Nina message metadata (`availableSlots`, `currentAppointmentId`)
- **Why:** No session storage needed, state visible in database
- **Alternative rejected:** Redis/session storage (overkill for MVP)

### Documentation Structure

- **Context:** Claude Code context overflow with large docs
- **Decision:** Topic-based folders with lean summaries
- **Pattern:** `summary.md` → `detail.md` progressive disclosure

### Zod for API Validation

- **Context:** Manual validation in API routes was verbose and inconsistent
- **Decision:** Use Zod schemas for all API input validation
- **Benefits:** Type inference, consistent error messages, input sanitization (trim, max length)
- **File:** `src/lib/validations.ts`

### In-Memory Rate Limiting

- **Context:** Need to protect APIs from abuse, especially LLM calls
- **Decision:** Simple in-memory sliding window rate limiter
- **Limits:** Chat 20/min, APIs 60/min, Upload 10/min
- **Trade-off:** Doesn't scale across instances - for production, use Upstash Redis
- **File:** `src/lib/rate-limit.ts`

### secretlint over gitleaks

- **Context:** Need pre-commit secret detection
- **Decision:** Use secretlint (pure Node.js) instead of gitleaks
- **Why:** gitleaks npm package is just a wrapper that requires the Go binary installed separately
- **Benefit:** Works out of the box with `npm install`, no external dependencies

---

## Gotchas

### Intent Classification Order

Intent check order matters. Current order in `INTENT_CHECK_ORDER`:

1. Dangerous (block immediately)
2. Greeting
3. FAQ (before scheduling - "quanto custa" fix)
4. Scheduling
5. Diet question
6. Off-topic (before handoff)
7. Handoff

**Why:** "consulta" appears in both FAQ ("quanto custa a consulta") and scheduling ("agendar consulta"). Must check more specific (FAQ) before broader (scheduling).

### Object.entries() Order

Don't rely on `Object.entries()` iteration order for pattern matching. Use explicit arrays like `INTENT_CHECK_ORDER`.

### Supabase Message Queries

Always use DESC + reverse for message history, not ASC with LIMIT. ASC cuts off newest messages when hitting the limit.

### Clipboard API

`navigator.clipboard.writeText()` requires HTTPS. Always add `document.execCommand('copy')` fallback for development/HTTP contexts.

### Quick Reply Values

Send slot numbers (1, 2, 3) not formatted text. Formatted text varies by language/date and is harder to parse reliably.

### Realtime Migration

After adding Realtime subscription code, must run migration:

```sql
alter publication supabase_realtime add table messages;
```

### gitleaks npm Package

The `gitleaks` npm package does NOT include the binary. It's just a wrapper that expects gitleaks to be installed via Homebrew/Go. Use `secretlint` instead for pure Node.js secret detection.

### Rate Limiting in Serverless

In-memory rate limiting resets on each cold start and doesn't share state across instances. For production with multiple instances, use Upstash Redis or similar distributed store.
