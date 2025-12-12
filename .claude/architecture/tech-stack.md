# Tech Stack

Version records and technical decisions.

## Current Versions

| Package      | Version | Notes                |
| ------------ | ------- | -------------------- |
| Next.js      | 16.0.10 | App Router           |
| React        | 19.2.1  |                      |
| TypeScript   | 5.x     |                      |
| Tailwind CSS | 4.x     |                      |
| Supabase JS  | 2.x     | SSR package          |
| Zod          | 3.x     | API input validation |
| date-fns     | 4.1.0   | Date formatting      |

## Dev Tools

| Tool        | Purpose                              |
| ----------- | ------------------------------------ |
| Vitest      | Unit/integration testing (209 tests) |
| Prettier    | Code formatting                      |
| ESLint      | Linting with strict rules            |
| Husky       | Git hooks (pre-commit, pre-push)     |
| lint-staged | Run linters on staged files          |
| secretlint  | Pre-commit secret detection          |

## Security

| Feature          | Implementation                   |
| ---------------- | -------------------------------- |
| Input validation | Zod schemas on all API routes    |
| Rate limiting    | In-memory sliding window         |
| Security headers | CSP, HSTS, X-Frame-Options, etc. |
| Secret detection | secretlint pre-commit hook       |
| Dependency audit | GitHub Dependabot + npm audit    |
| Static analysis  | CodeQL via GitHub Actions        |

## LLM Configuration

**Provider**: OpenRouter

**Default Fallback Chain** (in order):

1. `deepseek/deepseek-chat-v3-0324:free`
2. `mistralai/mistral-small-3.1-24b-instruct:free`
3. `google/gemini-2.5-pro-exp-03-25:free`
4. `nousresearch/deephermes-3-llama-3-8b-preview:free`

**Override via env**:

- `OPENROUTER_MODEL` - Single model override
- `OPENROUTER_FALLBACK_MODELS` - Custom chain (comma-separated)

## Supabase

- **Project**: xeckvimqbosmmzjivxjp
- **Region**: AWS | sa-east-1
- **Features used**: PostgreSQL, Realtime, Storage

## Vercel

- **Framework Preset**: Next.js
- **Node Version**: 20.x
- **Build Command**: `next build`

## Migrations

| File                      | Purpose                           |
| ------------------------- | --------------------------------- |
| `001_initial_schema.sql`  | Tables, enums, indexes            |
| `002_production_rls.sql`  | Row Level Security policies       |
| `003_enable_realtime.sql` | Enable Realtime on messages table |

## Upgrade Notes

<!-- Add notes when upgrading major versions -->

_Last updated: 2025-12-12_
