# Quick Reference Card

## For Every Claude Session

### The Golden Rule
**RESEARCH → CODE+LED → TEST → PASS ✅ or DEBUG → FIX**

Never ask user to test. Period.

---

## Commands You'll Use Every Session

```bash
# Research
WebSearch: "[technology] [feature] best practices 2025"
WebFetch: [documentation URL]

# Test
npm test                  # Run all tests
npm run test:headed       # Debug mode (see browser)

# Debug
cat ai-friends-app/breadcrumb-debug.log
grep "❌" ai-friends-app/breadcrumb-debug.log
```

---

## LED Breadcrumb Template

```typescript
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

const trail = new BreadcrumbTrail('ComponentName');

trail.light(LED_RANGES.FEATURE.START, 'operation', { data });
trail.light(LED_RANGES.FEATURE.SUCCESS, 'done', { result });
trail.fail(LED_RANGES.FEATURE.FAILED, error, 'failed', { context });
```

---

## Test Template

```typescript
// tests/feature-name.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should X when Y', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Action
    await page.click('button');

    // Verify
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

---

## When Test Fails

1. Read test error message
2. Check `breadcrumb-debug.log`
3. Find last successful LED before failure
4. Fix issue at that point
5. Re-run `npm test`
6. After 2 failures: Research the correct solution

---

## Checklist Before Reporting Complete

- [ ] Researched correct approach
- [ ] Added LED breadcrumbs
- [ ] Wrote Playwright test
- [ ] All tests pass (`npm test`)
- [ ] Reviewed breadcrumb-debug.log
- [ ] No console errors

---

## Available LED Ranges

- 20000-20099: App lifecycle
- 20100-20199: User input
- 20200-20299: Persona coordination
- 20300-20399: AI API calls
- 20400-20499: Conversation flow
- 20500-20599: Response aggregation
- 20600-20699: UI interactions ← Most common for new features
- 20800-20899: Errors

See `ai-friends-app/lib/led-ranges.ts` for full list.

---

## Remember

✅ User sees: "Feature complete, all tests pass"
❌ User hears: "Can you test this?"
