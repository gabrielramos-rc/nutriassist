# NutriAssist - Test Execution Prompt

Copy and paste this prompt in a new Claude Code chat to run the tests.

---

## Prompt

```
You have access to the Playwright MCP for browser automation. Your task is to test the NutriAssist application in production.

## Test Configuration

- **Production URL**: https://nutriassist-one.vercel.app
- **Chat Test URL**: https://nutriassist-one.vercel.app/chat/11111111-1111-1111-1111-111111111111
- **Dashboard URL**: https://nutriassist-one.vercel.app/dashboard
- **Test Plan**: See /Users/gabrielramos/rcconsultech/nutriassist/test-plan.md

## Test Execution Steps

### 1. Landing Page Tests
Navigate to https://nutriassist-one.vercel.app and verify:
- Page loads without errors
- Hero section displays correctly
- Navigation links work
- "Começar Agora" and "Ver Demo" buttons exist
- Content is in Portuguese
- Take a screenshot

### 2. Chat Widget Tests
Navigate to https://nutriassist-one.vercel.app/chat/11111111-1111-1111-1111-111111111111 and test:

**Greeting Flow:**
- Wait for Nina's welcome message
- Send "Oi" and verify Nina responds with a greeting
- Take a screenshot

**FAQ Flow:**
- Send "Quanto custa a consulta?" and verify Nina responds with price info
- Send "Onde fica o consultório?" and verify Nina responds with location

**Scheduling Flow:**
- Send "Quero agendar uma consulta" and verify Nina shows available slots
- Take a screenshot of the scheduling options

**Guardrails:**
- Send an off-topic message like "Qual o placar do jogo?" and verify Nina redirects to nutrition topics

### 3. Dashboard Tests
Navigate to https://nutriassist-one.vercel.app/dashboard and verify:
- Stats cards load with numbers
- Sidebar navigation works
- Take a screenshot

Test each dashboard section:
- /dashboard/conversations - List loads
- /dashboard/patients - Patient list loads
- /dashboard/appointments - Calendar loads
- /dashboard/settings - Settings form loads

### 4. Report Results
After testing, update the test-plan.md file with results:
- Mark passing tests with [x]
- Note any failures with details
- Update the results table at the bottom

## Tools to Use

- `browser_navigate` - Go to URLs
- `browser_snapshot` - Get page structure (use this to find element refs)
- `browser_click` - Click elements
- `browser_type` - Type in input fields
- `browser_take_screenshot` - Capture screenshots
- `browser_wait_for` - Wait for text to appear
- `browser_console_messages` - Check for errors

## Important Notes

1. Always use `browser_snapshot` before interacting with elements to get the correct refs
2. Wait for Nina's responses (use `browser_wait_for` with expected text patterns)
3. Take screenshots at key points for documentation
4. Check `browser_console_messages` for JavaScript errors
5. Test in order: Landing → Chat → Dashboard

Start by navigating to the landing page and taking an initial screenshot.
```

---

## Quick Start Commands

After pasting the prompt, you can also give these specific commands:

### Test only Landing Page:
```
Test only the landing page at https://nutriassist-one.vercel.app. Check that it loads, take a screenshot, and verify there are no console errors.
```

### Test only Chat:
```
Test the chat widget at https://nutriassist-one.vercel.app/chat/11111111-1111-1111-1111-111111111111. Send "Oi" and verify Nina responds. Then test "Quanto custa a consulta?" for FAQ.
```

### Test only Dashboard:
```
Test the dashboard at https://nutriassist-one.vercel.app/dashboard. Navigate through all sections (conversations, patients, appointments, settings) and take screenshots.
```

### Full Test Run:
```
Execute the full test plan from test-plan.md. Test landing page, chat widget, and all dashboard sections. Report results and update the test-plan.md file.
```
