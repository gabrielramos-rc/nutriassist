# Testing Summary

## Current Status

**Test Framework:** Vitest configured ✅

**Stack:**

- **Unit/Integration:** Vitest (configured)
- **E2E:** Playwright MCP (available in Claude Code)
- **API Testing:** Vitest + fetch

**Commands:**

```bash
npm test          # Watch mode
npm run test:run  # Single run
npm run test:coverage  # With coverage
```

## E2E Testing on Vercel Previews

### Workflow

**Rule:** Always commit to the branch and wait for Vercel deploy before testing.

1. **Commit & push** your changes
2. **Wait for Vercel** to deploy (~30-60 seconds)
3. **Fetch preview URL** for current commit
4. **Test with Playwright MCP** using URL + bypass secret

### Fetch Preview URL

```bash
# Get preview URL for current commit
COMMIT=$(git rev-parse HEAD)
DEPLOY_ID=$(gh api repos/gabrielramos-rc/nutriassist/deployments \
  --jq ".[] | select(.ref == \"$COMMIT\") | .id" | head -1)
gh api repos/gabrielramos-rc/nutriassist/deployments/$DEPLOY_ID/statuses \
  --jq '.[0].environment_url'
```

### Vercel Protection Bypass

Append the bypass secret to test protected deployments:

```
{PREVIEW_URL}?x-vercel-protection-bypass=${VERCEL_AUTOMATION_BYPASS_SECRET}
```

**Secret location:** `.env.local` → `VERCEL_AUTOMATION_BYPASS_SECRET`

### Using with Playwright MCP

```bash
# 1. Read bypass secret from .env.local
cat .env.local | grep VERCEL_AUTOMATION_BYPASS_SECRET

# 2. Get the preview URL (commands above)

# 3. Combine: {PREVIEW_URL}?x-vercel-protection-bypass={SECRET}

# 4. Use with Playwright MCP
browser_navigate → full URL with bypass
```

**Important:** Always read `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` before testing.

## Test Types

| Type            | What to Test                                     | When to Run          |
| --------------- | ------------------------------------------------ | -------------------- |
| **Unit**        | Pure functions, utilities, intent classification | Every commit         |
| **Integration** | API routes, service functions with DB            | Every PR             |
| **E2E**         | Full user flows (chat, scheduling, dashboard)    | Before merge to main |

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
