# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [beta-v0.2.0] - 2025-12-12

### Added

#### Security (Phase 22)

- GitHub Dependabot for automated dependency updates (#29)
- GitHub Actions security workflow with npm audit and CodeQL (#30)
- Pre-commit secret detection with secretlint (#31)
- HTTP security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (#32)
- API rate limiting: 20/min chat, 60/min APIs, 10/min upload (#34)
- Zod input validation on all API routes with sanitization (#34)

#### Code Quality (Phase 21)

- Prettier for consistent code formatting (#27)
- Husky + lint-staged for pre-commit hooks (#27)
- Stricter ESLint rules: no-console, complexity limits, max-lines (#27)
- Stricter TypeScript compiler options (#27)
- GitHub Actions release workflow (#26)

#### Error Handling (Phase 18)

- Comprehensive error boundary components (#36)
- Network error handling with retry logic (#36)
- User-friendly error messages in Portuguese (#36)
- Graceful degradation for API failures (#36)

#### Accessibility (Phase 19)

- Full keyboard navigation support (#37)
- ARIA labels and roles for screen readers (#37)
- Focus management and visible focus indicators (#37)
- Skip links for main content (#37)
- Semantic HTML structure (#37)

#### Responsive Design (Phase 20)

- Mobile-first responsive layout (#38)
- Touch-friendly UI elements (#38)
- Adaptive navigation for mobile/tablet/desktop (#38)
- Responsive chat widget (#38)
- Responsive dashboard components (#38)

#### Testing

- Vitest test framework configuration (#24)
- Comprehensive test suite: 209 tests across 8 files (#25)
- Tests for intents, guardrails, FAQ, scheduling, appointments, patients (#25)
- OpenRouter fallback chain tests (#25)
- Utility function tests (#25)

### Fixed

- **OpenRouter fallback chain** - Auto-switch models on 404 errors (#17)
- **Multi-turn scheduling** - State management for slot selection flow (#18)
- **Dashboard real-time** - Live message updates in conversation view (#19)
- **Quick reply format** - Send slot numbers instead of formatted text (#20)
- **Profile validation** - Required field validation in settings (#21)
- **Appointment notes** - Editable notes field in modal (#22)
- **Chat real-time** - Patient sees nutritionist replies instantly (#23)
- **UUID validation** - Regex pattern instead of strict z.uuid() for test IDs (#35)
- **FAQ intent** - Price questions no longer misrouted to scheduling (#10)
- **Off-topic detection** - Added sports, jokes, politics, weather keywords (#11)

### Changed

- Updated Next.js 16.0.8 → 16.0.10 (security vulnerabilities GHSA-w37m-7fhw-fmv9, GHSA-mwv6-3258-q52c) (#28)
- Increased test coverage from 137 to 209 tests
- Reorganized documentation structure with `.claude/` folder
- Renamed `.claude/tasks/changelog.md` to `devlog.md`

### Removed

- 46 console.log statements from production code (#28)

### Security

- Fixed 2 Next.js vulnerabilities (GHSA-w37m-7fhw-fmv9, GHSA-mwv6-3258-q52c)
- Added defense-in-depth with security headers
- Input validation prevents injection attacks
- Rate limiting protects against abuse

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

[Unreleased]: https://github.com/gabrielramos-rc/nutriassist/compare/beta-v0.2.0...HEAD
[beta-v0.2.0]: https://github.com/gabrielramos-rc/nutriassist/releases/tag/beta-v0.2.0
[beta-v0.1.0]: https://github.com/gabrielramos-rc/nutriassist/releases/tag/beta-v0.1.0
