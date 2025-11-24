# Auto-Test Protocol

## NEVER WASTE USER TIME - ALWAYS TEST YOUR OWN CODE

### Core Principle

**You are NOT allowed to ask the user to test your code.** Period.

When implementing features, you MUST:
1. Write the code
2. Test it yourself using Playwright or other automated tests
3. If test fails: Read logs, analyze, fix, repeat
4. **After 2 failed attempts:** Stop trial-and-error and research the correct solution online
5. **Only report to user when:** Feature is verified working OR you're genuinely stuck after research

---

## Workflow for Every Feature Implementation

### Step 1: Research First (Before Writing Code)

- Search for proven patterns (WebSearch/WebFetch)
- Check documentation for libraries being used
- Look for similar implementations in the codebase
- **NEVER start with trial-and-error**

### Step 2: Write Code Based on Research

- Implement using researched best practices
- Add console.log breadcrumbs for debugging if needed
- Follow existing codebase patterns

### Step 3: Write Playwright Test

- Create test that verifies the feature works
- Test should be specific and actionable
- Include multiple test cases (happy path + edge cases)

### Step 4: Run the Test

```bash
npm test
```

### Step 5: If Test Fails

**First attempt:**
1. Read the error message carefully
2. Check browser console logs
3. Verify HTML elements exist with correct selectors
4. Fix the issue
5. Run test again

**Second attempt:**
1. If still failing, read test output thoroughly
2. Add more console.log debugging
3. Check network tab for API errors
4. Fix and test again

**After 2 failures:**
1. **STOP trial-and-error immediately**
2. Use WebSearch to research the specific error/problem
3. Find proven solutions from Stack Overflow, GitHub, official docs
4. Implement the researched solution
5. Test again

**If still stuck after research:**
1. Document what you tried
2. Document the error messages
3. Ask user for guidance with full context

---

## Testing UI Features

For any UI feature (buttons, panels, keyboard shortcuts, etc.):

```typescript
// tests/feature-name.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do X when Y happens', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Perform action
    await page.click('button');
    // or
    await page.keyboard.press('Control+Shift+K');

    // Verify result
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

Run with:
```bash
npm test                  # Headless mode
npm run test:headed       # See browser
npm run test:ui          # Interactive UI mode
```

---

## Testing API Features

For API calls and data operations:

1. Use Playwright to navigate to the page
2. Check browser console for errors
3. Verify API calls in Network tab
4. Check response data format

---

## File-Based Logging

When debugging complex issues:

```typescript
// In your code
import fs from 'fs';

const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n${data ? JSON.stringify(data, null, 2) : ''}\n\n`;
  fs.appendFileSync('debug.log', logEntry);
};
```

This creates a persistent log file you can read to understand what happened.

---

## Common Mistakes to AVOID

❌ **"Can you test if this works?"** - NO. You test it.
❌ **Writing code without researching first** - Recipe for hours of trial-and-error
❌ **Asking user to test after each small change** - Disrespectful of their time
❌ **Trial-and-error for more than 2 attempts** - Research instead
❌ **Not writing tests before claiming it works** - How do you know it works?

✅ **Research → Write → Test → Fix → Test → Report working feature**
✅ **After 2 failures: Stop and research the right way**
✅ **Use Playwright to verify UI features automatically**
✅ **Only involve user when feature is verified working**

---

## When to Involve the User

**User should ONLY be involved when:**
1. ✅ Feature is fully tested and working
2. ✅ You need design/business decisions (not technical troubleshooting)
3. ✅ You're genuinely stuck after research and multiple attempts
4. ✅ Feature requires their domain knowledge

**User should NEVER be involved for:**
1. ❌ Testing if basic functionality works
2. ❌ Debugging technical errors you could debug yourself
3. ❌ Verifying changes after each iteration
4. ❌ Trial-and-error troubleshooting

---

## Success Criteria

You're doing it right when:
- User sees working features, not broken attempts
- Tests pass before you report success
- You catch and fix issues before user sees them
- User's time is respected and protected
- Trial-and-error is replaced with research-driven development

---

## Example: Implementing a Keyboard Shortcut

### ❌ Wrong Approach
1. Write code based on guess
2. "Can you test if Ctrl+K works?"
3. User: "No, doesn't work"
4. Make random change
5. "How about now?"
6. Repeat 10 times...

### ✅ Correct Approach
1. WebSearch: "React keyboard shortcut best practices 2025"
2. WebFetch proven tutorial/docs
3. Write code based on research
4. Write Playwright test
5. Run test - FAIL (typo in key name)
6. Fix typo
7. Run test - PASS
8. Report to user: "Settings panel keyboard shortcut implemented and tested"

---

## Remember

**The user hired you to build working software, not to be your QA tester.**

Test your own work. Respect their time. Research when stuck. Only show them working features.
