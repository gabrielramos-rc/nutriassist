# NutriAssist - Development Tasks

## Overview

This document contains all tasks needed to build NutriAssist MVP. Tasks are organized by phase and should be completed in order.

**Current Status:** v1.0.0 (Full MVP Complete) - Testing Phase

---

## Current Sprint: Testing & Bug Fixes

---

## Release Plan

| Release | Phases | Focus | Tests | Branch |
|---------|--------|-------|-------|--------|
| **v1.0.1** | 10, 11, 12 | Core Chat & Conversations | 29 | `release/v1.0.1-chat-fixes` |
| **v1.0.2** | 13, 14, 15 | Dashboard CRUD | 40 | `release/v1.0.2-dashboard-crud` |
| **v1.0.3** | 16 | Integration (End-to-End) | 7 | `release/v1.0.3-integration` |
| **v1.0.4** | 17, 18, 19, 20 | Quality (Perf, Errors, A11y, Responsive) | 27 | `release/v1.0.4-quality` |

---

### Release v1.0.1 - Core Chat & Conversations
**Phases:** 10, 11, 12 | **Tests:** 29

| Phase | Description | Tests | Status |
|-------|-------------|-------|--------|
| 10 | Bug Fixes (FAQ intent) | 3 | ✅ Complete |
| 11 | Chat Widget Testing | 20 | ✅ Complete |
| 12 | Dashboard Conversations | 9 | ✅ Complete |

**Why together:** These phases validate the core chat experience - the primary user-facing feature. Phase 10 fixes a bug that affects Phase 11 FAQ tests.

---

### Release v1.0.2 - Dashboard CRUD
**Phases:** 13, 14, 15 | **Tests:** 40

| Phase | Description | Tests | Status |
|-------|-------------|-------|--------|
| 13 | Patients CRUD | 17 | ✅ Complete |
| 14 | Appointments CRUD | 11 | ✅ Complete |
| 15 | Settings CRUD | 12 | ✅ Complete |

**Why together:** All dashboard data management features. Can be tested independently of chat. May require code fixes for CRUD operations.

---

### Release v1.0.3 - Integration
**Phases:** 16 | **Tests:** 7

| Phase | Description | Tests | Status |
|-------|-------------|-------|--------|
| 16 | End-to-End Flows | 7 | Pending |

**Why separate:** Integration tests validate that v1.0.1 (chat) and v1.0.2 (dashboard) work together. Should only run after both are stable.

---

### Release v1.0.4 - Quality
**Phases:** 17, 18, 19, 20 | **Tests:** 27

| Phase | Description | Tests | Status |
|-------|-------------|-------|--------|
| 17 | Performance | 5 | Pending |
| 18 | Error Handling | 8 | Pending |
| 19 | Accessibility | 10 | Pending |
| 20 | Responsive Design | 2 | Pending |

**Why together:** Non-functional quality requirements. These often require code changes (a11y fixes, error handling improvements) but don't affect core functionality.

---

### Phase 10: Bug Fixes (Priority) ✅ COMPLETE

#### 10.1 FAQ Intent Classification Bug
- [x] **Fix FAQ Intent Misrouting** - Nina responds with scheduling slots instead of price when asked "Quanto custa a consulta?"
  - **File:** `src/services/nina/intents.ts`
  - **Fix:** Added explicit `INTENT_CHECK_ORDER` to check FAQ patterns before scheduling
  - **PR:** https://github.com/gabrielramos-rc/nutriassist/pull/10
- [x] Add unit tests for FAQ intent keywords (preço, valor, quanto custa)
- [x] Verify fix works for all price-related variations (20 test cases passed)

---

### Phase 11: Chat Widget Testing ✅ COMPLETE

#### 11.1 Scheduling Flow (4 tests)
- [x] Select slot → confirm appointment
- [x] Reschedule existing appointment
- [x] Cancel appointment
- [x] Check next appointment ("Qual meu próximo horário?")

#### 11.2 FAQ Flow (3 tests)
- [x] "Como me preparar para a consulta?" → preparation instructions
- [x] "Quanto tempo dura a consulta?" → duration response
- [x] "Você atende online?" → online consultation info

#### 11.3 Diet Q&A Flow (4 tests)
- [x] "O que posso comer no café da manhã?" → answer from PDF
- [x] "Posso trocar frango por peixe?" → substitution info
- [x] "Quantas calorias tem minha dieta?" → calorie info
- [x] Question not found in PDF → suggest handoff

#### 11.4 Handoff Flow (4 tests)
- [x] Medical symptom triggers handoff ("Estou sentindo dor de estômago")
- [x] Explicit request for nutritionist ("Quero falar com a nutricionista")
- [x] Complaint triggers handoff ("Tenho uma reclamação")
- [x] Handoff appears in dashboard

#### 11.5 Guardrails (4 tests)
- [x] Block dangerous content: drugs
- [x] Block dangerous content: weapons
- [x] Block dangerous content: self-harm
- [x] Off-topic joke request → redirect to nutrition

#### 11.6 UI/UX (1 test)
- [x] Loading indicator appears while Nina processes

**Bugs Fixed During Testing:**
- Added off-topic keyword patterns (sports, jokes, politics, weather, news)
- Added "preparar" to FAQ preparation keywords
- Reordered intent check to process off-topic before handoff

---

### Phase 12: Dashboard Conversations Testing ✅ COMPLETE

#### 12.1 Conversation List (5 tests) ✅
- [x] Conversations with handoff are highlighted
- [x] Click conversation opens details
- [x] Message history loads correctly
- [x] Messages ordered chronologically
- [x] Intent visible on messages

#### 12.2 Nutritionist Reply (2 tests) ✅
- [x] Nutritionist can reply to conversation
- [x] Reply appears as "nutritionist" not "nina"

**Bug Found & Fixed:**
- **Issue:** Nutritionist replies not visible in conversation history
- **Root Cause:** `getConversationWithMessages` queried messages ASC with LIMIT 50, cutting off newest messages
- **Fix:** Changed to DESC order + reverse, ensuring latest 50 messages are shown
- **File:** `src/services/conversations.ts:410-424`

#### 12.3 Handoff Management (2 tests) ✅
- [x] Resolve handoff button works
- [x] Handoff counter decreases after resolve

---

### Phase 13: Dashboard Patients Testing ✅ COMPLETE

#### 13.1 Search & Filter (2 tests) ✅
- [x] Search by email works
- [x] Search by phone works

#### 13.2 Create Patient (6 tests) ✅
- [x] "Novo Paciente" button opens modal
- [x] Required fields validated (name)
- [x] Email format validated
- [x] Phone accepts Brazilian format
- [x] Save creates patient
- [x] New patient appears in list

#### 13.3 Edit Patient (4 tests) ✅
- [x] Click patient opens edit modal
- [x] Edit data loads correctly
- [x] Changes are saved
- [x] List updates after save

#### 13.4 Delete Patient (2 tests) ✅
- [x] Delete button visible
- [x] Delete shows confirmation dialog

#### 13.5 Diet PDF Management (3 tests) ✅
- [x] Upload accepts only PDF files
- [x] Upload rejects files > 10MB
- [x] View/download diet PDF works

---

### Phase 14: Dashboard Appointments Testing ✅ COMPLETE

#### 14.1 Calendar View (2 tests) ✅
- [x] Appointments appear on correct days
- [x] Different colors by status (scheduled/completed/cancelled)

#### 14.2 List View (3 tests) ✅
- [x] Toggle to list view works
- [x] List ordered by date
- [x] Filter by status works (shows only scheduled/upcoming by design)

#### 14.3 Appointment Details (4 tests) ✅
- [x] Click appointment opens modal
- [x] Patient info visible
- [x] Status can be changed (completed/no-show)
- [ ] Notes can be added (not implemented in UI)

#### 14.4 Cancel Appointment (2 tests) ✅
- [x] Cancel appointment works
- [x] Cancelled appointment shows different style

---

### Phase 15: Dashboard Settings Testing ✅ COMPLETE (11/12 tests)

#### 15.1 Profile Settings (2 tests)
- [x] Edit profile and save
- [ ] Profile validations work (NOT IMPLEMENTED)

#### 15.2 Business Hours (4 tests)
- [x] Days of week listed
- [x] Start/end time editable
- [x] Toggle day on/off works
- [x] Changes persist after save

#### 15.3 Consultation Settings (2 tests)
- [x] Duration editable
- [x] Duration affects scheduling slots

#### 15.4 FAQ Settings (2 tests)
- [x] FAQ responses listed
- [x] FAQ editing works

#### 15.5 Widget Embed (2 tests)
- [x] Embed code displayed with correct nutritionist ID
- [x] Copy button works (BUG FIXED: added fallback for non-HTTPS contexts)

---

### Phase 16: Integration Testing

#### 16.1 Chat ↔ Dashboard (3 tests)
- [ ] Chat message appears in Dashboard Conversations
- [ ] Handoff in chat appears as pending in dashboard
- [ ] Nutritionist reply reaches chat widget

#### 16.2 Scheduling End-to-End (2 tests)
- [ ] Patient books via chat → appears in calendar
- [ ] Nutritionist cancels → patient notified (next interaction)

#### 16.3 Diet Q&A End-to-End (2 tests)
- [ ] Upload PDF in dashboard → patient can ask diet questions
- [ ] Diet question answered correctly from uploaded PDF

---

### Phase 17: Performance Testing

#### 17.1 Page Load Times (4 tests)
- [ ] Landing page loads < 3s
- [ ] Chat widget loads < 2s
- [ ] Dashboard loads < 3s
- [ ] Nina response < 5s

#### 17.2 Lighthouse Audit (1 test)
- [ ] Mobile Lighthouse score > 80

---

### Phase 18: Error Handling Testing

#### 18.1 Network Errors (3 tests)
- [ ] Chat shows error if API fails
- [ ] Dashboard shows error if data doesn't load
- [ ] Retry available on errors

#### 18.2 Validation Errors (3 tests)
- [ ] Form validation errors clear on fix
- [ ] Invalid fields highlighted
- [ ] Error messages in Portuguese

#### 18.3 404 Handling (2 tests)
- [ ] Invalid URL shows 404 page
- [ ] Invalid nutritionist ID shows error

---

### Phase 19: Accessibility Testing

#### 19.1 Keyboard Navigation (4 tests)
- [ ] Tab navigates between elements
- [ ] Enter activates buttons/links
- [ ] Escape closes modals
- [ ] Focus visible on all elements

#### 19.2 Screen Reader Support (4 tests)
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Buttons have descriptive text
- [ ] Heading structure correct (h1 → h2 → h3)

#### 19.3 Visual Accessibility (2 tests)
- [ ] Text readable on all backgrounds
- [ ] Links distinguishable from text

---

### Phase 20: Responsive Design Testing

#### 20.1 Layout (2 tests)
- [ ] Layout responsive on mobile/tablet/desktop
- [ ] Footer links work on all screen sizes

---

## Phase 0: Project Setup

### 0.1 Initialize Project
- [X] Clone repository from https://github.com/gabrielramos-rc/nutriassist.git
- [X] Run `npx create-next-app@16 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [X] Install dependencies:
```bash
  npm install @supabase/supabase-js @supabase/ssr openai uuid date-fns lucide-react clsx tailwind-merge pdf-parse
  npm install -D @types/uuid @types/pdf-parse
```

### 0.2 Environment Configuration
- [X] Create `.env.local` with required variables
- [X] Add `.env.local` to `.gitignore`
- [X] Create `.env.example` template for documentation

### 0.3 Supabase Setup
- [X] Verify database tables exist (run migration if needed)
- [X] Create Supabase client utilities:
  - [X] `src/lib/supabase/client.ts` (browser client)
  - [X] `src/lib/supabase/server.ts` (server component client)
  - [X] `src/lib/supabase/admin.ts` (service role client)

### 0.4 Type Definitions
- [X] Create `src/types/database.ts` with Supabase types
- [X] Create `src/types/index.ts` with app-wide types
- [X] Define types for:
  - [X] Nutritionist
  - [X] Patient
  - [X] ChatSession
  - [X] Message
  - [X] Appointment
  - [X] Handoff
  - [X] Nina responses

### 0.5 Utility Functions
- [X] Create `src/lib/utils.ts` with:
  - [X] `cn()` - className merger (clsx + tailwind-merge)
  - [X] Date formatting helpers
  - [X] Validation helpers

---

## Phase 1: Core Infrastructure

### 1.1 OpenRouter Integration
- [X] Create `src/lib/openrouter.ts`
- [X] Implement `generateResponse()` function
- [X] Use model: `meta-llama/llama-3.1-8b-instruct:free`
- [X] Add error handling and retries
- [ ] Add response streaming support (optional for MVP)

### 1.2 Nina Constants and Prompts
- [X] Create `src/constants/nina.ts`
- [X] Define Nina's system prompt
- [X] Define intent classification prompt
- [X] Define response templates for each intent
- [X] Define guardrail keywords and patterns

### 1.3 Nina Service - Guardrails
- [X] Create `src/services/nina/guardrails.ts`
- [X] Implement `checkDangerousContent()` function
- [X] Block patterns: weapons, drugs, illegal activities, self-harm
- [X] Return boolean + reason if blocked

### 1.4 Nina Service - Intent Classification
- [X] Create `src/services/nina/intents.ts`
- [X] Implement `classifyIntent()` function
- [X] Intents to detect:
  - [X] `greeting`
  - [X] `scheduling` (with sub-intents: book, reschedule, cancel, check)
  - [X] `diet_question`
  - [X] `faq`
  - [X] `handoff`
  - [X] `off_topic`
  - [X] `dangerous`
- [X] Use keyword matching first, then LLM for ambiguous cases

### 1.5 Nina Service - Main Orchestrator
- [X] Create `src/services/nina/index.ts`
- [X] Implement `processMessage()` function
- [X] Flow:
  1. Run guardrails check
  2. Classify intent
  3. Route to appropriate handler
  4. Generate response
  5. Return response with metadata

---

## Phase 2: Chat System

### 2.1 Conversation Service
- [X] Create `src/services/conversations.ts`
- [X] Implement `getOrCreateSession()` - find active session or create new
- [X] Implement `getSessionMessages()` - get last N messages for context
- [X] Implement `saveMessage()` - save message with intent
- [X] Implement `closeSession()` - mark session as closed

### 2.2 Chat API Endpoint
- [X] Create `src/app/api/chat/route.ts`
- [X] POST handler:
  - [X] Validate request body (message, sessionId or nutritionistId)
  - [X] Get or create chat session
  - [X] Load conversation context
  - [X] Load patient diet text (if patient identified)
  - [X] Process through Nina service
  - [X] Save messages to database
  - [X] Return response
- [X] Add error handling

### 2.3 Chat UI Components
- [X] Create `src/components/chat/ChatWidget.tsx`
  - [X] Full chat interface component
  - [X] Message list with auto-scroll
  - [X] Input field with send button
  - [X] Loading states
  - [X] Error states
- [X] Create `src/components/chat/MessageBubble.tsx`
  - [X] Patient message style (right aligned)
  - [X] Nina message style (left aligned)
  - [X] Timestamp display
  - [X] Typing indicator
- [X] Create `src/components/chat/MessageInput.tsx`
  - [X] Text input with submit
  - [X] Enter to send
  - [X] Disabled state while sending
- [X] Create `src/components/chat/QuickReplies.tsx`
  - [X] Suggested response buttons
  - [X] Used for scheduling options

### 2.4 Patient Chat Page
- [X] Create `src/app/chat/[nutritionistId]/page.tsx`
- [X] Load nutritionist info
- [X] Initialize chat widget
- [X] Handle session creation
- [X] Display Nina greeting on first load

---

## Phase 3: FAQ Handler

### 3.1 FAQ Service
- [X] Create `src/services/nina/faq.ts`
- [X] Implement `handleFAQ()` function
- [X] Match question to FAQ keys:
  - [X] price / valor / preço / quanto custa
  - [X] location / endereço / onde fica / localização
  - [X] preparation / preparo / preparação
  - [X] duration / duração / quanto tempo
  - [X] online / atende online / consulta online
- [X] Return nutritionist's configured response
- [X] Fallback to handoff if no match

### 3.2 Nutritionist FAQ Settings
- [ ] Add FAQ management to dashboard settings (later)
- [X] For MVP: seed default FAQ responses in database

---

## Phase 4: Scheduling System

### 4.1 Appointment Service
- [X] Create `src/services/appointments.ts`
- [X] Implement `getAvailableSlots()`:
  - [X] Parse nutritionist business_hours
  - [X] Get existing appointments for date range
  - [X] Calculate available slots
  - [X] Return next N available slots
- [X] Implement `createAppointment()`:
  - [X] Validate slot is still available
  - [X] Create appointment record
  - [X] Return confirmation
- [X] Implement `rescheduleAppointment()`:
  - [X] Find existing appointment
  - [X] Update to new time
  - [X] Return confirmation
- [X] Implement `cancelAppointment()`:
  - [X] Find existing appointment
  - [X] Update status to cancelled
  - [X] Return confirmation

### 4.2 Scheduling Flow Handler
- [X] Create `src/services/nina/scheduling.ts`
- [X] Implement `handleScheduling()` function
- [X] Detect sub-intent:
  - [X] `book` - Show available slots, wait for selection
  - [X] `reschedule` - Find appointment, show new slots
  - [X] `cancel` - Find appointment, confirm cancellation
  - [X] `check` - Show next appointment
- [X] Manage conversation state for multi-turn booking
- [X] Generate human-friendly slot display

### 4.3 Appointment API
- [X] Create `src/app/api/appointments/route.ts`
- [X] GET - List appointments (with filters)
- [X] POST - Create appointment
- [X] PATCH - Update appointment
- [X] DELETE - Cancel appointment

---

## Phase 5: Diet Q&A System

### 5.1 PDF Processing
- [X] Create `src/lib/pdf.ts`
- [X] Implement `extractTextFromPDF()`:
  - [X] Use pdf-parse library
  - [X] Extract all text content
  - [X] Preserve page numbers if possible
  - [X] Return structured text

### 5.2 PDF Upload API
- [X] Create `src/app/api/upload/route.ts`
- [X] Handle multipart form data
- [X] Validate file type (PDF only)
- [X] Validate file size (max 10MB)
- [X] Upload to Supabase Storage
- [X] Extract text from PDF
- [X] Update patient record with URL and extracted text
- [X] Return success response

### 5.3 Diet Q&A Handler
- [X] Create `src/services/nina/dietQA.ts`
- [X] Implement `handleDietQuestion()` function
- [X] Load patient's diet_extracted_text
- [X] If no diet found, prompt to upload or handoff
- [X] Send question + diet text to LLM
- [X] Prompt LLM to:
  - [X] Find relevant section in diet
  - [X] Answer conversationally in Portuguese
  - [X] Include page/section reference
  - [X] Say "not in plan" if not found
- [X] Return formatted response

### 5.4 Patient Identification
- [X] Create `src/services/patients.ts`
- [X] Implement `identifyPatient()`:
  - [X] By phone number (for WhatsApp)
  - [X] By email (for web with login)
  - [X] By session link (for anonymous web)
- [X] Implement `getPatientDiet()`:
  - [X] Return diet_extracted_text
  - [X] Return null if not uploaded

---

## Phase 6: Handoff System

### 6.1 Handoff Service
- [X] Create handoff functions in `src/services/conversations.ts`
- [X] Implement `createHandoff()`:
  - [X] Create handoff record
  - [X] Link to chat session
  - [X] Set status to pending
- [X] Implement `getHandoffs()`:
  - [X] Get pending handoffs for nutritionist
  - [X] Include patient and conversation info
- [X] Implement `resolveHandoff()`:
  - [X] Mark as resolved
  - [X] Set resolved_at timestamp

### 6.2 Handoff Trigger Logic
- [X] Update Nina service to detect handoff scenarios:
  - [X] Question not in diet PDF
  - [X] Medical/symptom questions
  - [X] Complaints
  - [X] Explicit request for human
- [X] Create handoff record when triggered
- [X] Send appropriate response to patient

---

## Phase 7: Nutritionist Dashboard

### 7.1 Dashboard Layout
- [X] Create `src/app/dashboard/layout.tsx`
- [X] Create `src/components/dashboard/Sidebar.tsx`
  - [X] Navigation links
  - [X] Logo
  - [X] Nutritionist name
- [X] Protected route (auth later, skip for MVP)

### 7.2 Dashboard Home
- [X] Create `src/app/dashboard/page.tsx`
- [X] Show summary stats:
  - [X] Active conversations
  - [X] Pending handoffs
  - [X] Today's appointments
  - [X] Total patients

### 7.3 Conversations Page
- [X] Create `src/app/dashboard/conversations/page.tsx`
- [X] Create `src/components/dashboard/ConversationList.tsx`
- [X] List active chat sessions
- [X] Highlight sessions with pending handoffs
- [X] Click to view conversation
- [X] Reply as nutritionist (sends as nutritionist, not Nina)

### 7.4 Patients Page
- [X] Create `src/app/dashboard/patients/page.tsx`
- [X] Create `src/components/dashboard/PatientList.tsx`
- [X] List all patients
- [X] Search/filter patients
- [X] Click to view patient details
- [X] Upload diet PDF button
- [X] View/download current diet PDF

### 7.5 Appointments Page
- [X] Create `src/app/dashboard/appointments/page.tsx`
- [X] Create `src/components/dashboard/AppointmentCalendar.tsx`
- [X] Calendar view of appointments
- [X] List view option
- [ ] Create appointment manually
- [X] Edit/cancel appointments

### 7.6 Settings Page
- [X] Create `src/app/dashboard/settings/page.tsx`
- [X] Edit nutritionist profile
- [X] Configure business hours
- [X] Configure appointment duration
- [X] Edit FAQ responses
- [X] Get chat widget embed code

---

## Phase 8: Polish and Testing

### 8.1 UI Components
- [X] Create `src/components/ui/Button.tsx`
- [X] Create `src/components/ui/Input.tsx`
- [X] Create `src/components/ui/Card.tsx`
- [X] Create `src/components/ui/Modal.tsx`
- [X] Create `src/components/ui/Loading.tsx`
- [X] Create `src/components/ui/Avatar.tsx`

### 8.2 Landing Page
- [X] Create `src/app/page.tsx`
- [X] Hero section with value proposition
- [X] Features section
- [X] How it works
- [X] CTA to sign up (link to dashboard for MVP)

### 8.3 Error Handling
- [X] Create error boundary component
- [X] Add error states to all pages
- [X] Add toast notifications for actions
- [X] Log errors to console (Sentry later)

### 8.4 Testing with Real Data
- [X] Seed test nutritionist account (pre-existing)
- [X] Seed test patient with diet PDF (pre-existing)
- [ ] Test all chat flows
- [ ] Test scheduling flows
- [ ] Test diet Q&A accuracy
- [ ] Test handoff scenarios

### 8.5 Performance Optimization
- [X] Add loading states everywhere
- [ ] Optimize database queries
- [ ] Add indexes if needed
- [ ] Test with slow network

---

## Phase 9: Deployment

### 9.1 Vercel Setup
- [X] Connect GitHub repo to Vercel
- [X] Configure environment variables
- [X] Set up production branch
- [X] Create vercel.json configuration

### 9.2 Production Database
- [X] Review Supabase RLS policies
- [X] Create production RLS migration (002_production_rls.sql)
- [ ] Enable email confirmation (if adding auth)
- [ ] Set up database backups

### 9.3 Domain and SSL
- [ ] Configure custom domain (if available)
- [ ] Verify SSL certificate

### 9.4 Monitoring
- [X] Set up Vercel Analytics
- [X] Set up Speed Insights
- [X] Create deployment documentation (DEPLOYMENT.md)
- [ ] Monitor error rates
- [ ] Monitor API response times

---

## Future Tasks (Post-MVP)

### WhatsApp Integration
- [ ] Set up Meta Business API
- [ ] Create webhook endpoint
- [ ] Implement message receiving
- [ ] Implement message sending
- [ ] Test with real WhatsApp number

### Google Calendar Integration
- [ ] Set up Google OAuth
- [ ] Implement calendar API client
- [ ] Sync appointments to calendar
- [ ] Read availability from calendar

### Authentication
- [ ] Add Supabase Auth
- [ ] Nutritionist login/signup
- [ ] Patient login (optional)
- [ ] Protected API routes
- [ ] Protected dashboard

### Multi-tenant
- [ ] Multiple nutritionists support
- [ ] Subscription/billing
- [ ] Usage limits

---

## Recommended Next Steps

### Immediate (This Sprint)
1. **Fix FAQ Intent Bug** - Priority fix for intent classification
2. **Run Integration Tests** - Verify end-to-end flows work
3. **Test Responsive Design** - Mobile/tablet layouts

### Short-term
4. **Complete Accessibility Tests** - Keyboard navigation, screen readers
5. **Performance Testing** - Lighthouse audits
6. **Error Handling Review** - Ensure all edge cases covered

### Before Production
7. **Enable Production RLS** - Run `002_production_rls.sql` migration
8. **Set Up Database Backups** - Configure Supabase backups
9. **Monitor Error Rates** - Set up alerting

---

## Notes for Claude Code

1. **MVP is complete** - Focus on testing and bug fixes
2. **Fix bugs before new features** - The FAQ bug is priority
3. **Use TypeScript strictly** - No `any` types
4. **Follow the file structure in CLAUDE.md** - Keep it organized
5. **Brazilian Portuguese for all user-facing text** - Nina speaks Portuguese
6. **Keep components small** - One responsibility per component
7. **Comment complex logic** - Especially in Nina service
8. **Handle errors gracefully** - Never show raw errors to users