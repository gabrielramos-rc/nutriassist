# Testing Guide

## Setup (TODO)

### Install Dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
```

### Configure Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Add Scripts to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:all": "vitest run && playwright test"
  }
}
```

---

## Test Patterns

### Unit Test: Intent Classification
```typescript
// src/services/nina/__tests__/intents.test.ts
import { describe, it, expect } from 'vitest'
import { classifyIntent } from '../intents'

describe('classifyIntent', () => {
  it('classifies price questions as FAQ', () => {
    expect(classifyIntent('Quanto custa a consulta?')).toBe('faq')
    expect(classifyIntent('Qual o valor?')).toBe('faq')
  })

  it('classifies scheduling requests correctly', () => {
    expect(classifyIntent('Quero agendar uma consulta')).toBe('scheduling')
    expect(classifyIntent('Quero marcar horário')).toBe('scheduling')
  })

  it('checks FAQ before scheduling for "consulta"', () => {
    // "quanto custa a consulta" should be FAQ, not scheduling
    expect(classifyIntent('quanto custa a consulta')).toBe('faq')
  })
})
```

### Integration Test: API Route
```typescript
// src/app/api/chat/__tests__/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'

describe('POST /api/chat', () => {
  it('returns greeting for "oi"', async () => {
    const request = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'oi',
        nutritionistId: '11111111-1111-1111-1111-111111111111',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.intent).toBe('greeting')
    expect(data.response).toContain('Nina')
  })
})
```

### E2E Test: Chat Flow
```typescript
// e2e/chat.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat/11111111-1111-1111-1111-111111111111')
  })

  test('sends message and receives response', async ({ page }) => {
    const input = page.locator('input[placeholder*="mensagem"]')
    await input.fill('Olá')
    await input.press('Enter')

    // Wait for Nina's response
    await expect(page.locator('text=Nina')).toBeVisible({ timeout: 10000 })
  })

  test('shows available slots when scheduling', async ({ page }) => {
    const input = page.locator('input[placeholder*="mensagem"]')
    await input.fill('Quero agendar uma consulta')
    await input.press('Enter')

    // Wait for quick reply buttons
    await expect(page.locator('button:has-text("às")')).toBeVisible({ timeout: 10000 })
  })
})
```

---

## Code Review Checklist

Before submitting PR, verify:

### Functionality
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] Error states handled

### Code Quality
- [ ] No `any` types (TypeScript strict)
- [ ] No console.log left in code
- [ ] Functions have single responsibility
- [ ] No hardcoded values (use constants)

### Security
- [ ] No secrets in code
- [ ] Server-side validation for user input
- [ ] Supabase service role only used server-side
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities (React escapes by default, but check dangerouslySetInnerHTML)

### Performance
- [ ] No unnecessary re-renders
- [ ] Database queries optimized (use indexes)
- [ ] Large lists paginated

### Nina-Specific
- [ ] Intent classification order correct (check `INTENT_CHECK_ORDER`)
- [ ] Portuguese responses are natural
- [ ] Guardrails block dangerous content
- [ ] Handoff triggers for medical/complex questions

---

## Security Review Focus Areas

### High Risk
- `src/app/api/*` - All API routes (validate inputs)
- `src/lib/supabase/admin.ts` - Service role usage
- `src/lib/openrouter.ts` - API key handling
- `src/app/api/upload/route.ts` - File upload validation

### Medium Risk
- `src/services/nina/guardrails.ts` - Content filtering
- `src/services/patients.ts` - Patient data access
- Form inputs in dashboard pages

### Check for OWASP Top 10
1. Injection - Parameterized queries (Supabase handles this)
2. Broken Auth - TODO: Implement Supabase Auth
3. Sensitive Data - Don't log PII
4. XXE - Not applicable (no XML)
5. Broken Access Control - RLS policies
6. Misconfig - Check env vars not exposed
7. XSS - React escapes, but verify
8. Insecure Deserialization - Validate JSON inputs
9. Vulnerable Components - Keep deps updated
10. Logging - Don't log sensitive data
