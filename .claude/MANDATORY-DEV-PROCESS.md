# MANDATORY DEVELOPMENT PROCESS

**This is the ONLY approved process for implementing features. DO NOT deviate.**

---

## The Loop: Research → Code → LED → Test → Fix

Every feature implementation MUST follow this exact loop:

```
1. RESEARCH
   ↓
2. CODE + LED BREADCRUMBS
   ↓
3. TEST (Playwright)
   ↓
4. PASS? → Done ✅
   ↓
5. FAIL? → Review LED logs
   ↓
6. Fix obvious? → CODE (go to step 2)
   ↓
7. Not obvious? → RESEARCH (go to step 1)
   ↓
8. After 2 failures? → MANDATORY RESEARCH
```

---

## Step 1: RESEARCH FIRST

**BEFORE writing ANY code:**

```bash
# Search for proven solutions
WebSearch: "[technology] [feature] best practices 2025"

# Read detailed implementation guides
WebFetch: [top result URL]

# Check existing codebase patterns
Grep/Read: Similar features in the project
```

**Questions to answer:**
- How do professionals solve this?
- What are the common pitfalls?
- What's the recommended library/pattern?
- Are there existing examples in this codebase?

**Rule:** Spend 5-10 minutes researching to save hours of debugging.

---

## Step 2: CODE + LED BREADCRUMBS

### Write the feature code based on research

```typescript
// Follow the researched pattern exactly
// Use existing codebase conventions
// Keep it simple - no over-engineering
```

### Add LED breadcrumbs for debugging

**EVERY feature needs LED breadcrumbs:**

```typescript
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

const trail = new BreadcrumbTrail('ComponentName');

// Start of operation
trail.light(LED_RANGES.FEATURE.START, 'operation_started', { context });

// Success
trail.light(LED_RANGES.FEATURE.SUCCESS, 'operation_completed', { result });

// Failure
trail.fail(LED_RANGES.FEATURE.FAILED, error, 'operation_failed', { context });
```

**LED placement checklist:**
- ✅ Function entry point
- ✅ Before external calls (API, localStorage, etc.)
- ✅ After external calls (success/failure)
- ✅ Before conditional logic
- ✅ Error catch blocks
- ✅ Return statements

**Why:** When tests fail, LED logs in `breadcrumb-debug.log` show EXACTLY what happened.

---

## Step 3: TEST (Playwright)

**IMPORTANT:** For comprehensive test writing guidance, use the test-creation agent:
```
Use test-creation agent to write tests for [feature]
```

### Write the Playwright test

```typescript
// tests/feature-name.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do X when Y happens', async ({ page }) => {
    await page.goto('/');

    // Perform action
    await page.click('button');

    // Verify result (use realistic timeouts: 60s+ for AI operations)
    await expect(page.locator('selector'))
      .toBeVisible({ timeout: 60000 });
  });
});
```

### Run the test

```bash
npm test
```

---

## Step 4: Test Result Analysis

### ✅ Test PASSED

**Congratulations! Move to next task.**

Update todo:
```typescript
TodoWrite: Mark current task as completed
```

---

### ❌ Test FAILED (First Attempt)

**Follow this checklist:**

1. **Read the Playwright error message carefully**
   - What element was it looking for?
   - What timeout occurred?
   - What was the actual vs expected state?

2. **Check the breadcrumb log file**
   ```bash
   # Review the log
   cat ai-friends-app/breadcrumb-debug.log

   # Look for:
   # - Which LEDs lit up?
   # - Which LED failed?
   # - What was the context when it failed?
   ```

3. **Check browser console** (if test ran in headed mode)
   ```bash
   npm run test:headed
   ```

4. **Common quick fixes:**
   - Wrong selector? Update to match actual HTML
   - Timing issue? Add `await page.waitForLoadState('networkidle')`
   - Element not visible? Check z-index, display, opacity
   - API not called? Check network tab

5. **Fix and re-run test**
   ```bash
   npm test
   ```

---

### ❌ Test FAILED (Second Attempt)

**Stop trial-and-error. Time to research.**

1. **Document the failure:**
   - Exact error message
   - What LEDs lit up before failure
   - What you already tried

2. **MANDATORY: Research the specific error**
   ```bash
   WebSearch: "[exact error message] [technology]"
   WebSearch: "[feature] not working [technology] 2025"
   ```

3. **Read proven solutions:**
   ```bash
   WebFetch: [Stack Overflow answer URL]
   WebFetch: [Official docs URL]
   WebFetch: [GitHub issue resolution URL]
   ```

4. **Implement the researched solution**
   - Don't guess anymore
   - Follow the proven pattern exactly
   - Add more LED breadcrumbs if needed

5. **Re-run test**
   ```bash
   npm test
   ```

---

### ❌ Still Failing After Research

**After 3 failures, STOP and ask for help:**

Create a summary with:
- What you tried (all 3 attempts)
- The error that keeps happening
- LED breadcrumb evidence
- What you think should happen next

Then wait for guidance. Don't keep trying the same thing.

---

## LED Breadcrumb System Usage

### How to read the log file

```bash
# View the log
cat ai-friends-app/breadcrumb-debug.log

# Filter for errors only
grep "❌" ai-friends-app/breadcrumb-debug.log

# Filter by LED range (e.g., user input 20100-20199)
grep "LED 201" ai-friends-app/breadcrumb-debug.log
```

### LED log format

```
✅ LED 20100: session_started [App] {"category":"Business","intensity":5}
✅ LED 20300: connection_test [AIClient] {"provider":"ollama"}
❌ LED 20302 FAILED [AIClient]: connection_failed - Network error
```

### Adding new LED ranges

If your feature needs new LED ranges, update `lib/led-ranges.ts`:

```typescript
// Add to LED_RANGES object
NEW_FEATURE: {
  START: 20600,
  OPERATION_1: 20601,
  OPERATION_2: 20602,
  SUCCESS: 20610,
  FAILED: 20620
}
```

---

## Testing Best Practices

### Always test before reporting success

```typescript
// ❌ WRONG
"I've implemented the keyboard shortcut feature. Can you test it?"

// ✅ CORRECT
"I've implemented and tested the keyboard shortcut feature.
All 5 Playwright tests pass. The feature is ready to use."
```

### Write comprehensive tests

```typescript
test.describe('Feature', () => {
  test('happy path - basic functionality');
  test('edge case - empty input');
  test('edge case - special characters');
  test('error handling - network failure');
});
```

### Use meaningful test descriptions

```typescript
// ❌ Vague
test('it works', async ({ page }) => { ... });

// ✅ Clear
test('should open settings panel when Ctrl+Alt+Shift+A is pressed', async ({ page }) => { ... });
```

---

## Process Checklist

Before reporting feature complete, verify:

- [ ] Researched correct approach before coding
- [ ] Added LED breadcrumbs at key points
- [ ] Wrote Playwright test(s)
- [ ] All tests pass
- [ ] Reviewed breadcrumb-debug.log for any failures
- [ ] Code follows existing project patterns
- [ ] No console errors in browser
- [ ] Updated todo list

---

## Anti-Patterns (DO NOT DO THIS)

❌ **Writing code without research**
- Leads to hours of trial-and-error

❌ **Skipping LED breadcrumbs**
- Makes debugging impossible when tests fail

❌ **Not writing tests**
- "Can you test this?" wastes user time

❌ **Trial-and-error after 2 failures**
- Research the right solution instead

❌ **Asking user to debug**
- You have the tools (LED logs, tests) to debug yourself

❌ **Ignoring the breadcrumb log**
- It tells you exactly what failed and when

---

## Success Metrics

You're doing it right when:

- ✅ Features work on first deploy
- ✅ LED logs clearly show execution flow
- ✅ Tests catch bugs before user sees them
- ✅ Research prevents wasted time
- ✅ User only interacts with working features
- ✅ Debugging takes minutes, not hours

---

## Quick Reference

```bash
# Research
WebSearch + WebFetch

# Code with LEDs
trail.light(LED_ID, 'operation', { context })

# Test
npm test

# Debug
cat ai-friends-app/breadcrumb-debug.log

# Fix & repeat
npm test
```

**Remember: Research → Code+LED → Test → Fix → Research if needed**

This loop protects the user's time and ensures quality.
