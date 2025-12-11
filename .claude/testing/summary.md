# Testing Summary

## Current Status

**Test Framework:** Not yet configured (TODO)

**Recommended Stack:**
- **Unit/Integration:** Vitest (fast, ESM native)
- **E2E:** Playwright MCP (available in Claude Code)
- **API Testing:** Vitest + fetch/supertest

## Vercel Protection Bypass

To test Vercel preview deployments, append the bypass secret to URLs:

```
https://nutriassist-xxx.vercel.app?x-vercel-protection-bypass=SECRET
```

**Secret location:** `VERCEL_AUTOMATION_BYPASS_SECRET` in Vercel project settings

**Using with Playwright MCP:**
```
browser_navigate → url with ?x-vercel-protection-bypass=SECRET
```

## Test Types

| Type | What to Test | When to Run |
|------|--------------|-------------|
| **Unit** | Pure functions, utilities, intent classification | Every commit |
| **Integration** | API routes, service functions with DB | Every PR |
| **E2E** | Full user flows (chat, scheduling, dashboard) | Before merge to main |

## Claude's Testing Workflow

After completing a coding task:

1. **Write tests** for the code you changed
2. **Run tests** to verify they pass
3. **Include test results** in PR description

```bash
# When configured:
npm run test        # Unit + Integration
npm run test:e2e    # E2E tests
npm run test:all    # Everything
```

## Priority Test Areas

### High Priority (Write tests first)
- `src/services/nina/intents.ts` - Intent classification
- `src/services/nina/scheduling.ts` - Slot selection, booking flow
- `src/services/appointments.ts` - Slot calculation, booking logic
- `src/lib/openrouter.ts` - Fallback chain behavior

### Medium Priority
- `src/services/conversations.ts` - Message ordering, session management
- `src/services/nina/faq.ts` - FAQ matching
- `src/services/nina/guardrails.ts` - Dangerous content blocking

### Lower Priority (E2E covers these)
- UI components
- Dashboard pages
- API routes (test via integration)

## Deep Dive

- `guide.md` - Test setup, patterns, examples
