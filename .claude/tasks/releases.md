# Release Plan

## Current Version

**beta-v0.1.0** - MVP Complete (Phases 0-15)
- Core chat functionality with Nina AI
- Appointment scheduling via chat
- Diet Q&A from PDF
- Dashboard for nutritionists
- Basic testing coverage (57%)

---

## Upcoming Releases

### beta-v0.2.0 - Code Quality & Security Foundation

**Goal:** Establish development best practices and security baseline.

**Phases:** 21, 22 (partial)

| Task | Phase | Priority |
|------|-------|----------|
| Fix lint warnings (13) | 21.1 | High |
| Fix Next.js vulnerability | 22.1 | High |
| Add Prettier | 21.2 | Medium |
| Add Husky + lint-staged | 21.3 | Medium |
| Add GitHub Dependabot | 22.2 | Medium |
| Add GitHub Actions security workflow | 22.3 | Medium |
| Add security headers | 22.5 | Medium |
| Stricter ESLint rules | 21.4 | Low |
| Pre-commit secret detection | 22.4 | Low |
| TypeScript strict rules | 21.6 | Low |

**Excludes:** 22.6 (API Security) and 22.7 (Production RLS) - require Auth

---

### beta-v0.3.0 - Testing & Reliability

**Goal:** Complete integration testing and improve error handling.

**Phases:** 16 (complete), 17, 18, 21.5

| Task | Phase | Priority |
|------|-------|----------|
| Complete integration tests (5 remaining) | 16 | High |
| Increase test coverage to 80% | 21.5 | High |
| Page load time testing | 17.1 | Medium |
| Lighthouse audit (score > 80) | 17.2 | Medium |
| Network error handling | 18.1 | Medium |
| Validation error handling | 18.2 | Medium |
| 404 page handling | 18.3 | Low |

---

### beta-v0.4.0 - Accessibility & UX

**Goal:** Ensure app is accessible and responsive across devices.

**Phases:** 19, 20

| Task | Phase | Priority |
|------|-------|----------|
| Keyboard navigation | 19.1 | High |
| Screen reader support | 19.2 | High |
| Visual accessibility | 19.3 | Medium |
| Responsive design (mobile/tablet/desktop) | 20 | High |

---

### beta-v0.5.0 - Authentication & Production Ready

**Goal:** Secure the application with proper authentication.

**Phases:** 22.6, 22.7, Auth from Roadmap

| Task | Source | Priority |
|------|--------|----------|
| Supabase Auth setup | Roadmap | High |
| Nutritionist login/signup | Roadmap | High |
| Protected dashboard routes | Roadmap | High |
| API rate limiting | 22.6 | High |
| Input validation with Zod | 22.6 | Medium |
| Enable production RLS policies | 22.7 | High |
| Test all RLS policies | 22.7 | High |

---

### beta-v0.6.0 - External Integrations

**Goal:** Connect with external services for enhanced functionality.

**Phases:** Roadmap

| Task | Priority |
|------|----------|
| WhatsApp Business API setup | High |
| WhatsApp webhook endpoint | High |
| WhatsApp message receiving/sending | High |
| Google OAuth setup | Medium |
| Google Calendar sync | Medium |
| Read availability from Calendar | Medium |

---

### v1.0.0 - General Availability

**Goal:** Production-ready multi-tenant platform.

**Phases:** Roadmap

| Task | Priority |
|------|----------|
| Multi-nutritionist support | High |
| Subscription/billing integration | High |
| Usage limits per plan | Medium |
| Admin dashboard | Low |
| Production deployment hardening | High |

---

## Release Timeline

```
beta-v0.1.0 (current)
     │
beta-v0.2.0 ── Foundation (Code Quality + Security)
     │
beta-v0.3.0 ── Testing & Reliability
     │
beta-v0.4.0 ── Accessibility & UX
     │
beta-v0.5.0 ── Authentication
     │
beta-v0.6.0 ── Integrations
     │
  v1.0.0 ───── General Availability
```

## Quick Reference

| Release | Focus | Phases |
|---------|-------|--------|
| beta-v0.1.0 | MVP | 0-15 ✅ |
| beta-v0.2.0 | Code Quality & Security | 21, 22 (partial) |
| beta-v0.3.0 | Testing & Reliability | 16, 17, 18, 21.5 |
| beta-v0.4.0 | Accessibility & UX | 19, 20 |
| beta-v0.5.0 | Authentication | 22.6, 22.7, Auth |
| beta-v0.6.0 | Integrations | WhatsApp, Calendar |
| v1.0.0 | GA | Multi-tenant, Billing |
