# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- GitHub Actions release workflow
- CHANGELOG.md following Keep a Changelog format
- GitHub Dependabot for automated dependency updates
- GitHub Actions security workflow (npm audit, CodeQL)
- Pre-commit secret detection with secretlint
- HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)
- API rate limiting (20/min chat, 60/min APIs, 10/min upload)
- Zod input validation on all API routes
- Prettier for code formatting
- Husky + lint-staged for pre-commit hooks
- Stricter ESLint rules (no-console, complexity, max-lines)

### Changed

- Renamed `.claude/tasks/changelog.md` to `devlog.md`
- Updated Next.js 16.0.8 → 16.0.10 (security fix)
- Increased test coverage to 209 tests

### Removed

- 46 console.log statements from production code

---

## [beta-v0.1.0] - 2025-12-11

### Added

- **Nina AI Chat** - Conversational assistant for patients in Brazilian Portuguese
- **Appointment Scheduling** - Book, reschedule, cancel appointments via chat
- **Diet Q&A** - Answer questions from patient's uploaded diet PDF
- **FAQ Responses** - Configurable answers for price, location, preparation, duration, online
- **Guardrails** - Block dangerous content and prompt injection attempts
- **Dashboard** - Nutritionist panel with conversations, patients, appointments, settings
- **Realtime Updates** - Live message sync using Supabase Realtime
- **OpenRouter Integration** - LLM with fallback chain for reliability
- **Vitest Test Suite** - 137 tests with 57% coverage

### Technical

- Next.js 16 with App Router and TypeScript
- Supabase for PostgreSQL database and Realtime
- Tailwind CSS for styling
- Vercel deployment with São Paulo region (gru1)

### Known Limitations

- No authentication (dashboard is publicly accessible)
- Anonymous chat sessions only (no cross-device persistence)
- Manual appointment creation not available in dashboard

---

## Release Links

[Unreleased]: https://github.com/gabrielramos-rc/nutriassist/compare/beta-v0.1.0...HEAD
[beta-v0.1.0]: https://github.com/gabrielramos-rc/nutriassist/releases/tag/beta-v0.1.0
