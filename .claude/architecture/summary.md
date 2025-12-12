# Architecture Summary

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL + Realtime + Storage)
- **LLM**: OpenRouter (fallback chain)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## System Overview

```
Patient Chat ──┐
               ├──▶ Next.js API ──▶ Nina Service ──▶ Supabase
Dashboard ─────┘                         │
                                         ▼
                                    OpenRouter (LLM)
```

## Core Components

| Layer            | Location             | Purpose                               |
| ---------------- | -------------------- | ------------------------------------- |
| **API Routes**   | `src/app/api/`       | REST endpoints                        |
| **Nina Service** | `src/services/nina/` | AI orchestration, intents, flows      |
| **Services**     | `src/services/`      | Business logic                        |
| **Components**   | `src/components/`    | React UI (chat/, dashboard/, ui/)     |
| **Lib**          | `src/lib/`           | Utilities (supabase, openrouter, pdf) |

## API Routes

| Endpoint             | Purpose                              |
| -------------------- | ------------------------------------ |
| `/api/chat`          | Patient chat with Nina               |
| `/api/appointments`  | Appointment CRUD                     |
| `/api/patients`      | Patient CRUD                         |
| `/api/conversations` | Chat sessions + nutritionist replies |
| `/api/handoffs`      | Escalated conversations              |
| `/api/nutritionists` | Nutritionist profile                 |
| `/api/upload`        | Diet PDF upload                      |

## Deep Dive

- `nina-service.md` - Nina AI processing, intents, conversation state
- `database.md` - Schema, tables, Realtime, migrations
- `tech-stack.md` - Package versions, LLM config, Supabase details
