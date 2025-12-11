# Development Tasks

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 0-9 | MVP Build | ✅ Complete |
| 10 | Bug Fixes (FAQ intent) | ✅ Complete |
| 11 | Chat Widget Testing | ✅ Complete |
| 12 | Dashboard Conversations | ✅ Complete |
| 13 | Patients CRUD Testing | ✅ Complete |
| 14 | Appointments CRUD Testing | ✅ Complete |
| 15 | Settings CRUD Testing | ✅ Complete |
| 16 | Integration Testing | ⚠️ Partial (2/7) |
| 17 | Performance Testing | Pending |
| 18 | Error Handling Testing | Pending |
| 19 | Accessibility Testing | Pending |
| 20 | Responsive Design Testing | Pending |

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
