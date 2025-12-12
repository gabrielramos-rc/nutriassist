# Release Plan

## Current Version

**beta-v0.2.0** - Quality, Security & UX (Phases 16-22)

- Code quality improvements (Prettier, Husky, lint-staged)
- Security hardening (headers, rate limiting, input validation)
- Error handling with user-friendly messages
- Full accessibility support (keyboard, screen readers)
- Responsive design (mobile/tablet/desktop)
- 209 automated tests

---

## Completed Releases

### beta-v0.2.0 - Quality, Security & UX ✅

**Released:** 2025-12-12

**Phases completed:** 16-22

| Task                                 | Phase | Status |
| ------------------------------------ | ----- | ------ |
| Integration testing                  | 16    | ✅     |
| Performance testing                  | 17    | ✅     |
| Error handling                       | 18    | ✅     |
| Accessibility                        | 19    | ✅     |
| Responsive design                    | 20    | ✅     |
| Code quality (Prettier, Husky, etc.) | 21    | ✅     |
| Security (headers, rate limit, Zod)  | 22    | ✅     |

---

### beta-v0.1.0 - MVP ✅

**Released:** 2025-12-11

**Phases completed:** 0-15

- Core chat functionality with Nina AI
- Appointment scheduling via chat
- Diet Q&A from PDF
- Dashboard for nutritionists
- Basic testing coverage

---

## Upcoming Releases

### beta-v0.5.0 - Authentication & Production Ready

**Goal:** Secure the application with proper authentication.

**Phases:** 22.6, 22.7, Auth from Roadmap

| Task                           | Source  | Priority |
| ------------------------------ | ------- | -------- |
| Supabase Auth setup            | Roadmap | High     |
| Nutritionist login/signup      | Roadmap | High     |
| Protected dashboard routes     | Roadmap | High     |
| API rate limiting              | 22.6    | High     |
| Input validation with Zod      | 22.6    | Medium   |
| Enable production RLS policies | 22.7    | High     |
| Test all RLS policies          | 22.7    | High     |

---

### beta-v0.6.0 - External Integrations

**Goal:** Connect with external services for enhanced functionality.

**Phases:** Roadmap

| Task                               | Priority |
| ---------------------------------- | -------- |
| WhatsApp Business API setup        | High     |
| WhatsApp webhook endpoint          | High     |
| WhatsApp message receiving/sending | High     |
| Google OAuth setup                 | Medium   |
| Google Calendar sync               | Medium   |
| Read availability from Calendar    | Medium   |

---

### v1.0.0 - General Availability

**Goal:** Production-ready multi-tenant platform.

**Phases:** Roadmap

| Task                             | Priority |
| -------------------------------- | -------- |
| Multi-nutritionist support       | High     |
| Subscription/billing integration | High     |
| Usage limits per plan            | Medium   |
| Admin dashboard                  | Low      |
| Production deployment hardening  | High     |

---

## Release Timeline

```
beta-v0.1.0 ── MVP ✅
     │
beta-v0.2.0 ── Quality, Security & UX ✅ (current)
     │
beta-v0.5.0 ── Authentication (next)
     │
beta-v0.6.0 ── Integrations
     │
  v1.0.0 ───── General Availability
```

## Quick Reference

| Release     | Focus                  | Phases             | Status |
| ----------- | ---------------------- | ------------------ | ------ |
| beta-v0.1.0 | MVP                    | 0-15               | ✅     |
| beta-v0.2.0 | Quality, Security & UX | 16-22              | ✅     |
| beta-v0.5.0 | Authentication         | Auth, RLS          | Next   |
| beta-v0.6.0 | Integrations           | WhatsApp, Calendar |        |
| v1.0.0      | GA                     | Multi-tenant       |        |
