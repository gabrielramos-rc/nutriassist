# Development Tasks

## Phase Status

| Phase | Description               | Status                       |
| ----- | ------------------------- | ---------------------------- |
| 0-9   | MVP Build                 | ✅ Complete                  |
| 10    | Bug Fixes (FAQ intent)    | ✅ Complete                  |
| 11    | Chat Widget Testing       | ✅ Complete                  |
| 12    | Dashboard Conversations   | ✅ Complete                  |
| 13    | Patients CRUD Testing     | ✅ Complete                  |
| 14    | Appointments CRUD Testing | ✅ Complete                  |
| 15    | Settings CRUD Testing     | ✅ Complete                  |
| 16    | Integration Testing       | ⚠️ Partial (2/7)             |
| 17    | Performance Testing       | Pending                      |
| 18    | Error Handling Testing    | Pending                      |
| 19    | Accessibility Testing     | Pending                      |
| 20    | Responsive Design Testing | Pending                      |
| 21    | Code Quality              | ✅ Complete                  |
| 22    | Security                  | ⚠️ Partial (22.7 needs Auth) |

---

## Phase 16: Integration Testing (Partial)

### 16.1 Chat ↔ Dashboard

- [x] Chat message appears in Dashboard Conversations
- [x] Handoff in chat appears as pending in dashboard
- [x] Nutritionist reply reaches chat widget (fixed with Realtime)

### 16.2 Scheduling End-to-End

- [x] Patient books via chat → appears in calendar (fixed with state management)
- [ ] Nutritionist cancels → patient notified

### 16.3 Diet Q&A End-to-End

- [ ] Upload PDF in dashboard → patient can ask diet questions
- [ ] Diet question answered correctly from uploaded PDF

**Blockers:** OpenRouter model availability (fallback chain implemented)

---

## Phase 17: Performance Testing

### 17.1 Page Load Times

- [ ] Landing page loads < 3s
- [ ] Chat widget loads < 2s
- [ ] Dashboard loads < 3s
- [ ] Nina response < 5s

### 17.2 Lighthouse Audit

- [ ] Mobile Lighthouse score > 80

---

## Phase 18: Error Handling Testing

### 18.1 Network Errors

- [ ] Chat shows error if API fails
- [ ] Dashboard shows error if data doesn't load
- [ ] Retry available on errors

### 18.2 Validation Errors

- [ ] Form validation errors clear on fix
- [ ] Invalid fields highlighted
- [ ] Error messages in Portuguese

### 18.3 404 Handling

- [ ] Invalid URL shows 404 page
- [ ] Invalid nutritionist ID shows error

---

## Phase 19: Accessibility Testing

### 19.1 Keyboard Navigation

- [ ] Tab navigates between elements
- [ ] Enter activates buttons/links
- [ ] Escape closes modals
- [ ] Focus visible on all elements

### 19.2 Screen Reader Support

- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Buttons have descriptive text
- [ ] Heading structure correct (h1 → h2 → h3)

### 19.3 Visual Accessibility

- [ ] Text readable on all backgrounds
- [ ] Links distinguishable from text

---

## Phase 20: Responsive Design Testing

- [ ] Layout responsive on mobile/tablet/desktop
- [ ] Footer links work on all screen sizes

---

## Phase 21: Code Quality ✅

### 21.1 Fix Lint Warnings

- [x] Remove unused imports/variables (13 warnings)
- [x] Replace `<img>` with `next/image` in Avatar component
- [x] Add coverage folder to ESLint ignore

### 21.2 Add Prettier

- [x] Install prettier + eslint-config-prettier
- [x] Create .prettierrc config
- [x] Add format script to package.json
- [x] Format existing codebase

### 21.3 Add Pre-commit Hooks

- [x] Install husky + lint-staged
- [x] Configure lint-staged for .ts/.tsx files
- [x] Add pre-commit hook: lint + type-check
- [x] Add pre-push hook: run tests

### 21.4 Stricter ESLint Rules

- [x] Add `no-console` rule (warn in dev, error in prod)
- [x] Add `complexity` rule (max 10)
- [x] Add `max-lines-per-function` rule (max 50)
- [x] Add explicit-function-return-type for services

### 21.5 Increase Test Coverage

- [x] appointments.ts service (currently 12%)
- [x] API route tests (chat, appointments, patients)
- [x] React component tests (ChatWidget, Dashboard)
- [x] Target: 80% overall coverage (now 209 tests)

### 21.6 TypeScript Strict Rules

- [x] Enable `noUncheckedIndexedAccess`
- [x] Enable `noImplicitReturns`
- [x] Fix any resulting type errors

---

## Phase 22: Security (22.1-22.6 ✅, 22.7 Blocked)

### 22.1 Fix Vulnerabilities (Quick Win) ✅

- [x] Run `npm audit fix --force` to fix Next.js vulnerability (16.0.10)
- [x] Verify build still works after update
- [x] Remove console.log statements from production code (46 occurrences removed)

### 22.2 GitHub Dependabot ✅

- [x] Create `.github/dependabot.yml` config
- [x] Enable npm ecosystem scanning
- [x] Set weekly update schedule (Monday 9am BRT)

### 22.3 GitHub Actions Security Workflow ✅

- [x] Create `.github/workflows/security.yml`
- [x] Add `npm audit` check on PRs
- [x] Add CodeQL static analysis
- [x] Runs on push/PR to main/dev + weekly schedule

### 22.4 Pre-commit Secret Detection ✅

- [x] Install secretlint (pure Node.js solution)
- [x] Add to Husky pre-commit hook
- [x] Document in CLAUDE.md
- [x] Add `npm run secrets:check` script

### 22.5 Security Headers ✅

- [x] Add Content-Security-Policy (CSP) header
- [x] Add Strict-Transport-Security (HSTS) header
- [x] Add X-Frame-Options header (DENY)
- [x] Add X-Content-Type-Options header (nosniff)
- [x] Add Referrer-Policy and Permissions-Policy headers
- [x] Configure in next.config.ts

### 22.6 API Security ✅

- [x] Add rate limiting to API routes (20/min chat, 60/min APIs, 10/min upload)
- [x] Add input validation with Zod schemas
- [x] Sanitize user inputs (trim, max length, UUID validation)

### 22.7 Enable Production RLS ⏳ (Blocked)

- [ ] Implement Supabase Auth (prerequisite)
- [ ] Apply 002_production_rls.sql migration
- [ ] Test all RLS policies

---

## Future Roadmap (Post-MVP)

### WhatsApp Integration

- Set up Meta Business API
- Create webhook endpoint
- Message receiving/sending

### Google Calendar Integration

- Google OAuth setup
- Sync appointments
- Read availability

### Authentication

- Supabase Auth
- Nutritionist login/signup
- Protected routes

### Multi-tenant

- Multiple nutritionists
- Subscription/billing
- Usage limits

---

## Historical

- `../archived/phases-0-9.md` - Completed MVP build tasks
