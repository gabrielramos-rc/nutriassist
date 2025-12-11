# NutriAssist - Development Tasks

## Overview

This document contains all tasks needed to build NutriAssist MVP. Tasks are organized by phase and should be completed in order.

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
- [ ] Create handoff functions in `src/services/conversations.ts`
- [ ] Implement `createHandoff()`:
  - [ ] Create handoff record
  - [ ] Link to chat session
  - [ ] Set status to pending
- [ ] Implement `getHandoffs()`:
  - [ ] Get pending handoffs for nutritionist
  - [ ] Include patient and conversation info
- [ ] Implement `resolveHandoff()`:
  - [ ] Mark as resolved
  - [ ] Set resolved_at timestamp

### 6.2 Handoff Trigger Logic
- [ ] Update Nina service to detect handoff scenarios:
  - [ ] Question not in diet PDF
  - [ ] Medical/symptom questions
  - [ ] Complaints
  - [ ] Explicit request for human
- [ ] Create handoff record when triggered
- [ ] Send appropriate response to patient

---

## Phase 7: Nutritionist Dashboard

### 7.1 Dashboard Layout
- [ ] Create `src/app/dashboard/layout.tsx`
- [ ] Create `src/components/dashboard/Sidebar.tsx`
  - [ ] Navigation links
  - [ ] Logo
  - [ ] Nutritionist name
- [ ] Protected route (auth later, skip for MVP)

### 7.2 Dashboard Home
- [ ] Create `src/app/dashboard/page.tsx`
- [ ] Show summary stats:
  - [ ] Active conversations
  - [ ] Pending handoffs
  - [ ] Today's appointments
  - [ ] Total patients

### 7.3 Conversations Page
- [ ] Create `src/app/dashboard/conversations/page.tsx`
- [ ] Create `src/components/dashboard/ConversationList.tsx`
- [ ] List active chat sessions
- [ ] Highlight sessions with pending handoffs
- [ ] Click to view conversation
- [ ] Reply as nutritionist (sends as nutritionist, not Nina)

### 7.4 Patients Page
- [ ] Create `src/app/dashboard/patients/page.tsx`
- [ ] Create `src/components/dashboard/PatientList.tsx`
- [ ] List all patients
- [ ] Search/filter patients
- [ ] Click to view patient details
- [ ] Upload diet PDF button
- [ ] View/download current diet PDF

### 7.5 Appointments Page
- [ ] Create `src/app/dashboard/appointments/page.tsx`
- [ ] Create `src/components/dashboard/AppointmentCalendar.tsx`
- [ ] Calendar view of appointments
- [ ] List view option
- [ ] Create appointment manually
- [ ] Edit/cancel appointments

### 7.6 Settings Page
- [ ] Create `src/app/dashboard/settings/page.tsx`
- [ ] Edit nutritionist profile
- [ ] Configure business hours
- [ ] Configure appointment duration
- [ ] Edit FAQ responses
- [ ] Get chat widget embed code

---

## Phase 8: Polish and Testing

### 8.1 UI Components
- [ ] Create `src/components/ui/Button.tsx`
- [ ] Create `src/components/ui/Input.tsx`
- [ ] Create `src/components/ui/Card.tsx`
- [ ] Create `src/components/ui/Modal.tsx`
- [ ] Create `src/components/ui/Loading.tsx`
- [ ] Create `src/components/ui/Avatar.tsx`

### 8.2 Landing Page
- [ ] Create `src/app/page.tsx`
- [ ] Hero section with value proposition
- [ ] Features section
- [ ] How it works
- [ ] CTA to sign up (link to dashboard for MVP)

### 8.3 Error Handling
- [ ] Create error boundary component
- [ ] Add error states to all pages
- [ ] Add toast notifications for actions
- [ ] Log errors to console (Sentry later)

### 8.4 Testing with Real Data
- [ ] Seed test nutritionist account
- [ ] Seed test patient with diet PDF
- [ ] Test all chat flows
- [ ] Test scheduling flows
- [ ] Test diet Q&A accuracy
- [ ] Test handoff scenarios

### 8.5 Performance Optimization
- [ ] Add loading states everywhere
- [ ] Optimize database queries
- [ ] Add indexes if needed
- [ ] Test with slow network

---

## Phase 9: Deployment

### 9.1 Vercel Setup
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables
- [ ] Set up production branch

### 9.2 Production Database
- [ ] Review Supabase RLS policies
- [ ] Enable email confirmation (if adding auth)
- [ ] Set up database backups

### 9.3 Domain and SSL
- [ ] Configure custom domain (if available)
- [ ] Verify SSL certificate

### 9.4 Monitoring
- [ ] Set up Vercel Analytics
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

## Notes for Claude Code

1. **Start with Phase 0 and 1** - Get the foundation right
2. **Test each phase before moving on** - Especially Nina service
3. **Use TypeScript strictly** - No `any` types
4. **Follow the file structure in CLAUDE.md** - Keep it organized
5. **Brazilian Portuguese for all user-facing text** - Nina speaks Portuguese
6. **Keep components small** - One responsibility per component
7. **Comment complex logic** - Especially in Nina service
8. **Handle errors gracefully** - Never show raw errors to users