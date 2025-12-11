# NutriAssist - Architecture Documentation

## Overview

NutriAssist is a SaaS platform that provides nutritionists with an AI-powered assistant (Nina) to handle appointment scheduling and patient diet questions automatically.

## System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────┐              ┌─────────────────┐          │
│   │   Patient Chat  │              │   Nutritionist  │          │
│   │   Widget (Web)  │              │   Dashboard     │          │
│   └────────┬────────┘              └────────┬────────┘          │
│            │                                │                    │
│            └───────────────┬────────────────┘                    │
│                            ▼                                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    NEXT.JS APP                           │   │
│   │                    (Vercel)                              │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │                                                          │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│   │   │ /api/chat   │  │/api/appoint │  │/api/patients│     │   │
│   │   │             │  │   ments     │  │             │     │   │
│   │   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │   │
│   │          │                │                │             │   │
│   │          └────────────────┼────────────────┘             │   │
│   │                           ▼                              │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │              NINA SERVICE                        │   │   │
│   │   │                                                  │   │   │
│   │   │  ┌───────────┐ ┌───────────┐ ┌───────────┐      │   │   │
│   │   │  │  Intent   │ │ Scheduling│ │  Diet QA  │      │   │   │
│   │   │  │ Classifier│ │   Flow    │ │   Flow    │      │   │   │
│   │   │  └───────────┘ └───────────┘ └───────────┘      │   │   │
│   │   │  ┌───────────┐ ┌───────────┐                    │   │   │
│   │   │  │   FAQ     │ │ Guardrails│                    │   │   │
│   │   │  │  Handler  │ │  Filter   │                    │   │   │
│   │   │  └───────────┘ └───────────┘                    │   │   │
│   │   └─────────────────────┬───────────────────────────┘   │   │
│   │                         │                                │   │
│   └─────────────────────────┼────────────────────────────────┘   │
│                             │                                     │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   SUPABASE    │    │  OPENROUTER   │    │    GOOGLE     │
│   (Database   │    │    (LLM)      │    │   CALENDAR    │
│   + Storage)  │    │               │    │   (Future)    │
└───────────────┘    └───────────────┘    └───────────────┘
```

## Core Modules

### 1. Nina Service (`/src/services/nina/`)

The brain of the application. Orchestrates all AI interactions.
```
┌─────────────────────────────────────────────────────────────┐
│                      NINA SERVICE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  INPUT: User message + Chat session + Patient context        │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              1. GUARDRAILS CHECK                     │    │
│  │         (Block dangerous content)                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              2. INTENT CLASSIFICATION                │    │
│  │   greeting | scheduling | diet_question | faq |      │    │
│  │   handoff | off_topic | dangerous                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│           ┌───────────────┼───────────────┐                  │
│           ▼               ▼               ▼                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ SCHEDULING  │ │  DIET Q&A   │ │    FAQ      │            │
│  │    FLOW     │ │    FLOW     │ │  HANDLER    │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│           │               │               │                  │
│           └───────────────┼───────────────┘                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              3. RESPONSE GENERATION                  │    │
│  │         (OpenRouter LLM + Context)                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  OUTPUT: Nina's response + Intent + Metadata                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Chat Flow
```
Patient sends message
        │
        ▼
┌───────────────────┐
│ POST /api/chat    │
│                   │
│ - Validate input  │
│ - Get/create      │
│   chat session    │
│ - Load context    │
│   (last 10 msgs)  │
│ - Load patient    │
│   diet PDF text   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Nina Service      │
│                   │
│ - Guardrails      │
│ - Classify intent │
│ - Route to handler│
│ - Generate reply  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Save to database  │
│                   │
│ - User message    │
│ - Nina response   │
│ - Intent          │
│ - Create handoff  │
│   if needed       │
└────────┬──────────┘
         │
         ▼
Return response to client
```

### 3. Scheduling Flow
```
User: "Quero agendar uma consulta"
                │
                ▼
┌─────────────────────────────────┐
│ Intent: scheduling              │
│                                 │
│ Sub-intents:                    │
│ - book_new                      │
│ - reschedule                    │
│ - cancel                        │
│ - check_availability            │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Get nutritionist availability   │
│                                 │
│ - Check business_hours          │
│ - Check existing appointments   │
│ - Generate available slots      │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Present options to patient      │
│                                 │
│ "Tenho esses horários:          │
│  1. Seg 10/02 às 14:00          │
│  2. Ter 11/02 às 10:00          │
│  3. Qua 12/02 às 16:00          │
│                                 │
│ Qual prefere?"                  │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Patient selects slot            │
│                                 │
│ - Create appointment record     │
│ - Update chat session           │
│ - Confirm to patient            │
└─────────────────────────────────┘
```

### 4. Diet Q&A Flow
```
User: "Posso trocar frango por atum?"
                │
                ▼
┌─────────────────────────────────┐
│ Intent: diet_question           │
│                                 │
│ Load patient.diet_extracted_text│
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ RAG-style lookup                │
│                                 │
│ - Send question + diet text     │
│   to LLM                        │
│ - LLM finds relevant section    │
│ - LLM generates answer          │
│ - LLM provides page reference   │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ Return formatted response       │
│                                 │
│ "Pode sim! No lugar do frango,  │
│  você pode usar atum sólido ao  │
│  natural - 0.6 lata (97g).      │
│                                 │
│  *Ref: Plano alimentar, pág. 1* │
└─────────────────────────────────┘
```

## Data Flow

### Message Processing
```
1. Patient message arrives
2. Lookup/create chat_session
3. Lookup patient (by session or phone)
4. Load conversation history (last 10 messages)
5. Load patient diet PDF text (if exists)
6. Load nutritionist FAQ settings
7. Process through Nina service
8. Save user message to messages table
9. Save Nina response to messages table
10. If handoff needed, create handoff record
11. Return response
```

### PDF Upload Flow
```
1. Nutritionist uploads PDF in dashboard
2. POST /api/upload with PDF file
3. Store PDF in Supabase Storage
4. Extract text using pdf-parse
5. Update patient.diet_pdf_url
6. Update patient.diet_extracted_text
7. Return success
```

## Database Schema

### Entity Relationship
```
┌─────────────────┐       ┌─────────────────┐
│  nutritionists  │       │    patients     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──┐   │ id (PK)         │
│ name            │   │   │ nutritionist_id │──┐
│ email           │   │   │ name            │  │
│ phone           │   │   │ email           │  │
│ business_hours  │   │   │ phone           │  │
│ faq_responses   │   │   │ diet_pdf_url    │  │
└─────────────────┘   │   │ diet_extracted  │  │
                      │   └─────────────────┘  │
                      │            │           │
                      │            ▼           │
                      │   ┌─────────────────┐  │
                      │   │  chat_sessions  │  │
                      │   ├─────────────────┤  │
                      │   │ id (PK)         │  │
                      ├───│ nutritionist_id │◄─┘
                      │   │ patient_id      │───┐
                      │   │ channel         │   │
                      │   │ status          │   │
                      │   └─────────────────┘   │
                      │            │            │
                      │            ▼            │
                      │   ┌─────────────────┐   │
                      │   │    messages     │   │
                      │   ├─────────────────┤   │
                      │   │ id (PK)         │   │
                      │   │ chat_session_id │   │
                      │   │ sender          │   │
                      │   │ content         │   │
                      │   │ intent          │   │
                      │   └─────────────────┘   │
                      │                         │
                      │   ┌─────────────────┐   │
                      │   │  appointments   │   │
                      │   ├─────────────────┤   │
                      └───│ nutritionist_id │   │
                          │ patient_id      │◄──┘
                          │ starts_at       │
                          │ status          │
                          └─────────────────┘
```

## Security Considerations

### API Security
- All mutations use server-side Supabase client with service role
- Client-side only has read access via anon key
- Chat API validates session ownership

### Data Privacy
- Patient diet PDFs stored securely in Supabase Storage
- Extracted text never exposed to client directly
- Conversation history scoped to session

### AI Safety
- Guardrails check runs before any processing
- Dangerous content blocked immediately
- Off-topic content redirected, not engaged
- No medical advice - always handoff

## Future Enhancements

### Phase 3: WhatsApp Integration
```
┌─────────────────┐
│   Web Chat      │──────┐
└─────────────────┘      │     
                         │     ┌──────────────────┐
                         ├────▶│   Nina Service   │
┌─────────────────┐      │     └──────────────────┘
│   WhatsApp      │──────┘
│   (Meta API)    │
└─────────────────┘
```

### Phase 4: Google Calendar Integration
- Two-way sync with nutritionist's calendar
- Automatic slot detection
- Calendar event creation on booking

### Phase 5: Multi-channel Expansion
- Instagram DM integration
- Telegram bot
- SMS notifications