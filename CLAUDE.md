# NutriAssist - Claude Code Guidelines

## Project Overview

NutriAssist is a SaaS platform for nutritionists to automate appointment scheduling and patient diet Q&A. The AI assistant is named **Nina**.

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL + Realtime + Storage)
- **LLM**: OpenRouter (fallback chain)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

> Version details: `.claude/architecture/tech-stack.md`

## Key URLs

- **App**: https://nutriassist-one.vercel.app
- **Test Chat**: https://nutriassist-one.vercel.app/chat/11111111-1111-1111-1111-111111111111
- **Test Nutritionist ID**: `11111111-1111-1111-1111-111111111111`
- **Test Patient ID**: `22222222-2222-2222-2222-222222222222`

## Project Structure

```
src/
├── app/
│   ├── api/          # REST endpoints (chat, appointments, patients, etc.)
│   ├── chat/         # Patient-facing chat widget
│   └── dashboard/    # Nutritionist dashboard
├── components/       # React components (chat/, dashboard/, ui/)
├── services/
│   ├── nina/         # AI orchestration (intents, scheduling, dietQA, guardrails)
│   └── *.ts          # Business logic (appointments, patients, conversations)
├── lib/              # Utilities (supabase clients, openrouter, pdf)
├── types/            # TypeScript types
└── constants/        # Nina prompts and templates

supabase/migrations/  # Database schema

.claude/              # Documentation (see .claude/summary.md)
```

## Nina AI Behavior Rules

Nina is the AI assistant. She must follow these rules strictly.

### Response Style

- Friendly, warm, professional Brazilian Portuguese
- Conversational answers, not robotic
- Include source references when answering from diet PDF
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
3. Discuss dangerous/illegal topics → firm boundary
4. Go off-topic for extended conversations → redirect

### Intent Classification

- `greeting` - Hello, hi, oi, bom dia
- `scheduling` - Agendar, marcar, horário, consulta, remarcar, cancelar
- `diet_question` - Questions about food, meals, substitutions, portions
- `faq` - Preço, valor, endereço, localização, preparo
- `handoff` - Complex questions, complaints, medical symptoms
- `off_topic` - Unrelated topics (sports, news, etc.)
- `dangerous` - Weapons, drugs, illegal content → block immediately

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Override default LLM model
OPENROUTER_MODEL=
OPENROUTER_FALLBACK_MODELS=
```

## Commands

```bash
npm run dev            # Development
npm run build          # Build
npm run lint           # Lint
npm run test           # Run tests
npm run secrets:check  # Scan entire repo for secrets
```

## Important Notes

1. **Server-side Supabase for mutations** - Never expose service role key to client
2. **PDF text extracted on upload** - Stored in `patients.diet_extracted_text`
3. **Intent classification runs first** - Before generating response
4. **OpenRouter fallback chain** - Auto-switches models on failure
5. **Realtime enabled** - Messages table has live updates

## Git Workflow

### Branch Structure

```
main        # Production-ready
└── dev     # Integration branch
     └── feature/* | fix/* | hotfix/*
```

### Commit Format

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Rules

- Never commit directly to `main` or `dev`
- One feature per branch
- Squash commits on merge
- Delete branch after merge

### Pre-commit Hooks

The following checks run automatically on every commit:

1. **lint-staged** - ESLint + Prettier on staged files
2. **secretlint** - Secret detection on all files

If secretlint detects a potential secret, the commit will be blocked. To fix:

- Remove the secret from your code
- If it's a false positive, add pattern to `.secretlintrc.json` allowlist

```bash
# Scan entire repo for secrets
npm run secrets:check
```

## Documentation

Detailed docs in `.claude/` folder:

- `.claude/summary.md` - Documentation index
- `.claude/architecture/` - System design, Nina service, database
- `.claude/deployment/` - Vercel, environment setup
- `.claude/tasks/` - Current work, changelog, roadmap
- `.claude/archived/` - Historical reference

---

## Claude Workflow

### 1. Session Start (Always)

```
CLAUDE.md (auto-loaded)
    ↓
.claude/tasks/summary.md → Know current status, limitations, pending work
```

### 2. Before Coding (Load if relevant to task)

```
Nina/intents work    → .claude/architecture/nina-service.md
Database/queries     → .claude/architecture/database.md
Bug fix/debugging    → .claude/tasks/changelog.md (check Gotchas)
Deploy/env issues    → .claude/deployment/guide.md
Writing tests        → .claude/testing/guide.md
```

### 3. Do the Work

- Follow existing patterns in codebase
- Apply Nina AI rules from this file
- Check changelog gotchas before touching known problem areas

### 4. Write & Run Tests

After coding, always:

1. **Write tests** for the code changed (unit, integration, or E2E)
2. **Run tests** to verify they pass
3. **Include test results** in PR description

```bash
npm run test        # Unit + Integration (when configured)
npm run test:e2e    # E2E tests (when configured)
npm run build       # Always verify build passes
```

> See `.claude/testing/` for test patterns and examples.

### 5. Code Review Checklist

Before committing, verify:

**Functionality**

- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Error states handled

**Security**

- [ ] No secrets in code
- [ ] Server-side validation for user input
- [ ] Supabase service role only used server-side

**Code Quality**

- [ ] No `any` types
- [ ] No console.log left in code
- [ ] Functions have single responsibility

> Full checklist in `.claude/testing/guide.md`

### 6. Update Docs (if applicable)

| What happened          | Update                                     |
| ---------------------- | ------------------------------------------ |
| Bug fix (significant)  | `changelog.md` → Add Problem/Solution/File |
| Architectural decision | `changelog.md` → Add to Decisions section  |
| Found a gotcha         | `changelog.md` → Add to Gotchas section    |
| Task completed         | `tasks/full.md` → Check off item           |
| System changed         | Relevant architecture doc                  |

> Only update changelog for changes that impact future coding sessions.

### 7. Git Commit & PR

- Create feature/fix branch from `dev`
- Follow commit format (see Git Workflow above)
- Include test plan in PR description
- Reference issue number if applicable
