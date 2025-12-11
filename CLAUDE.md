# NutriAssist - Claude Code Guidelines

## Project Overview

NutriAssist is a SaaS platform for nutritionists to automate appointment scheduling and patient diet Q&A. The AI assistant is named **Nina**.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for PDF files)
- **LLM**: OpenRouter (free tier models for MVP)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Key URLs

- Supabase Project: https://xeckvimqbosmmzjivxjp.supabase.co
- GitHub Repo: https://github.com/gabrielramos-rc/nutriassist.git

## Project Structure
```
nutriassist/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts              # Chat message endpoint
│   │   │   ├── appointments/
│   │   │   │   └── route.ts              # Appointment CRUD
│   │   │   ├── patients/
│   │   │   │   └── route.ts              # Patient CRUD
│   │   │   ├── nutritionists/
│   │   │   │   └── route.ts              # Nutritionist CRUD
│   │   │   └── upload/
│   │   │       └── route.ts              # PDF upload endpoint
│   │   ├── chat/
│   │   │   └── [nutritionistId]/
│   │   │       └── page.tsx              # Patient-facing chat widget
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # Main dashboard
│   │   │   ├── conversations/
│   │   │   │   └── page.tsx              # Conversation list
│   │   │   ├── patients/
│   │   │   │   └── page.tsx              # Patient management
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx              # Appointment calendar
│   │   │   └── settings/
│   │   │       └── page.tsx              # Nutritionist settings
│   │   ├── layout.tsx
│   │   └── page.tsx                      # Landing page
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWidget.tsx            # Main chat component
│   │   │   ├── MessageBubble.tsx         # Individual message
│   │   │   ├── MessageInput.tsx          # Input field
│   │   │   └── QuickReplies.tsx          # Suggested responses
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   ├── PatientList.tsx
│   │   │   └── AppointmentCalendar.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       └── Modal.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser client
│   │   │   ├── server.ts                 # Server client
│   │   │   └── admin.ts                  # Admin client (service role)
│   │   ├── openrouter.ts                 # LLM integration
│   │   ├── pdf.ts                        # PDF extraction utilities
│   │   └── utils.ts                      # General utilities
│   ├── services/
│   │   ├── nina/
│   │   │   ├── index.ts                  # Main Nina orchestrator
│   │   │   ├── intents.ts                # Intent classification
│   │   │   ├── scheduling.ts             # Scheduling conversation flow
│   │   │   ├── dietQA.ts                 # Diet Q&A from PDF
│   │   │   ├── faq.ts                    # FAQ responses
│   │   │   └── guardrails.ts             # Safety filters
│   │   ├── appointments.ts               # Appointment business logic
│   │   ├── patients.ts                   # Patient business logic
│   │   └── conversations.ts              # Conversation management
│   ├── types/
│   │   ├── database.ts                   # Supabase generated types
│   │   └── index.ts                      # App-wide types
│   └── constants/
│       └── nina.ts                       # Nina's prompts and personality
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
├── .env.local
├── CLAUDE.md
├── ARCHITECTURE.md
├── TASKS.md
├── package.json
└── tsconfig.json
```

## Nina AI Behavior Rules

Nina is the AI assistant. She must follow these rules strictly:

### Response Style
- Friendly, warm, professional Brazilian Portuguese
- Conversational answers, not robotic
- Include source references at end when answering from diet PDF
- Use emojis sparingly (1-2 per message max)

### What Nina CAN Do
1. Answer questions from patient's diet PDF (with page/section reference)
2. Show available appointment slots
3. Book, reschedule, cancel appointments
4. Answer FAQ (price, location, preparation)
5. Light small talk redirected to nutrition topics

### What Nina CANNOT Do
1. Give nutrition advice not in the patient's PDF
2. Answer medical/health symptom questions → handoff
3. Discuss dangerous/illegal topics → firm boundary, no engagement
4. Go off-topic for extended conversations → redirect to nutrition

### Intent Classification
- `greeting` - Hello, hi, oi, bom dia
- `scheduling` - Agendar, marcar, horário, consulta, remarcar, cancelar
- `diet_question` - Questions about food, meals, substitutions, portions
- `faq` - Preço, valor, endereço, localização, preparo
- `handoff` - Complex questions, complaints, medical symptoms
- `off_topic` - Unrelated topics (sports, news, etc.)
- `dangerous` - Weapons, drugs, illegal content → block immediately

### Response Templates

**Greeting:**
```
Oi! Sou a Nina, assistente virtual da [Nutritionist Name]. 
Posso te ajudar com agendamentos e dúvidas sobre seu plano alimentar 😊

Como posso te ajudar hoje?
```

**Diet Answer:**
```
[Conversational answer with specific information]

*Ref: Plano alimentar, pág. X*
```

**Handoff:**
```
Essa é uma ótima pergunta para a [Nutritionist Name]! 
Vou encaminhar sua dúvida e ela te responde em breve.

Enquanto isso, posso te ajudar com algo sobre seu plano alimentar ou agendamento?
```

**Off-topic (harmless):**
```
Haha, [brief acknowledgment]! Mas voltando ao que importa, já [nutrition-related redirect]? 😄
```

**Off-topic (dangerous):**
```
Não posso ajudar com isso. Estou aqui apenas para dúvidas sobre seu plano alimentar e agendamentos.

Posso te ajudar com algo nesse sentido?
```

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xeckvimqbosmmzjivxjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Tables

- `nutritionists` - Nutritionist accounts and settings
- `patients` - Patient profiles with diet PDF reference
- `chat_sessions` - Conversation sessions (web or whatsapp)
- `messages` - Individual messages with intent classification
- `appointments` - Scheduled appointments
- `handoffs` - Escalated conversations needing human response

## Commands
```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Important Notes

1. **Always use server-side Supabase client for mutations** - Never expose service role key to client
2. **PDF text extraction happens on upload** - Store extracted text in `patients.diet_extracted_text` for fast Q&A
3. **Intent classification runs first** - Before generating response, classify the message intent
4. **All LLM calls go through OpenRouter** - Use `meta-llama/llama-3.1-8b-instruct:free` for MVP
5. **Messages are stored for context** - Load last 10 messages for conversation continuity
6. **Handoffs create notifications** - Nutritionist dashboard shows pending handoffs

---

## Git Workflow & Conventions

### Branch Structure
```
main          # Production-ready code only
  └── dev     # Integration branch for features
       └── feature/*   # Feature branches
       └── fix/*       # Bug fix branches
       └── hotfix/*    # Urgent production fixes
```

### Branch Naming
- `feature/phase-X-description` - New features (e.g., `feature/phase-2-chat-system`)
- `fix/issue-description` - Bug fixes (e.g., `fix/chat-message-ordering`)
- `hotfix/critical-issue` - Urgent production fixes

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, missing semi-colons, etc.)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding or updating tests
- `chore` - Maintenance tasks (deps, build, etc.)

**Examples:**
```
feat(nina): add intent classification service
fix(chat): resolve message ordering issue
docs: update API documentation
chore: upgrade Next.js to v16
```

### Workflow Rules

1. **Never commit directly to `main`** - Always use PRs
2. **Never commit directly to `dev`** - Use feature branches
3. **One feature per branch** - Keep branches focused
4. **Commit at end of each phase** - Create PR to merge to `dev`
5. **Squash commits on merge** - Keep history clean
6. **Delete branch after merge** - Keep repo tidy

### PR Process
1. Create feature branch from `dev`
2. Implement feature with atomic commits
3. Ensure build passes (`npm run build`)
4. Create PR to `dev` with description
5. Review and merge (squash)
6. Delete feature branch

### Protected Branches
- `main` - Requires PR, no force push
- `dev` - Requires PR from feature branches

### Phase Commit Workflow
```bash
# After completing a phase:
git checkout dev
git pull origin dev
git checkout -b feature/phase-X-description
# ... make changes ...
git add .
git commit -m "feat(scope): description"
git push -u origin feature/phase-X-description
gh pr create --base dev --title "Phase X: Description"
```

### Release Strategy (dev → main)

Merge `dev` to `main` at **milestones** when features are production-ready:

| Milestone | Phases | Version | Description |
|-----------|--------|---------|-------------|
| Chat MVP | 0, 1, 2 | v0.1.0 | Basic chat with Nina works |
| Scheduling | 3, 4 | v0.2.0 | Appointment booking works |
| Diet Q&A | 5, 6 | v0.3.0 | Diet questions + handoffs work |
| Full MVP | 7, 8, 9 | v1.0.0 | Dashboard + polish complete |

```bash
# When milestone is complete:
git checkout main
git pull origin main
git merge dev
git tag -a v0.1.0 -m "Chat MVP release"
git push origin main --tags
```

**Current Status:** Phase 1 complete → merge to main after Phase 2