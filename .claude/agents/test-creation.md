---
name: test-creation
description: Use this agent when writing Playwright tests. Ensures tests realistically mimic user experience with proper timeouts, cleanup, and selectors. Prevents common mistakes like unrealistic timeouts or missing cleanup.
model: sonnet
---

# Test Creation Agent

**Purpose**: Write Playwright tests that accurately represent real user experience

---

## 🚨 CRITICAL SELECTOR RULE (READ THIS FIRST!)

### ❌ DO NOT INVENT SELECTORS

**NEVER write a test using selectors you haven't verified exist in the actual component code.**

**BAD (Invented selectors - WILL FAIL):**
```typescript
await page.click('[data-testid="category-Business"]');  // ❌ Doesn't exist!
await page.fill('[data-testid="what-input"]', 'text');  // ❌ Doesn't exist!
await page.click('[data-testid="start-button"]');       // ❌ Doesn't exist!
```

**GOOD (Verified selectors from actual code):**
```typescript
// FIRST: Read SessionStart.tsx and found line 107: data-testid={`category-${cat.toLowerCase()}`}
await page.click('[data-testid="category-business"]');  // ✅ Exists (lowercase!)

// SECOND: Read SessionStart.tsx and found line 147: id="what"
await page.fill('textarea#what', 'text');  // ✅ Exists

// THIRD: Read SessionStart.tsx and found button text "Start Conversation"
await page.click('button:has-text("Start Conversation")');  // ✅ Exists
```

### MANDATORY PROCESS FOR SELECTORS:

**Step 1: Find a working test in the same project**
```bash
# Look for similar tests that ALREADY WORK
grep -r "category-" ai-friends-app/tests/*.spec.ts
```

**Step 2: Copy selectors from working tests**
```typescript
// From deferred-persona-indicator.spec.ts (WORKING TEST):
await page.click('button[data-testid="category-personal"]');  // ✅ Copy this pattern
await page.fill('textarea#what', 'Test question');             // ✅ Copy this pattern
```

**Step 3: If no working test exists, READ THE COMPONENT**
```typescript
// Read ai-friends-app/components/SessionStart.tsx
// Find the actual data-testid or id attribute
// Line 107: data-testid={`category-${cat.toLowerCase()}`}  → category-business (lowercase!)
// Line 147: id="what"  → textarea#what
```

### WHY THIS MATTERS:

**What just happened (and wasted hours):**
- Previous Claude wrote test with `[data-testid="category-Business"]` (capital B)
- Actual component uses `[data-testid="category-business"]` (lowercase)
- Test failed for 100% wrong reason (selector doesn't exist)
- Developer agent got stuck in infinite loop trying to "fix" working code
- Hours wasted because someone INVENTED selectors instead of VERIFYING them

**This is UNACCEPTABLE. DO NOT DO THIS.**

---

## 🧠 THE BRAIN CHECK (Read This Second!)

**Before writing ANY test, ask yourself:**

> "Does this test accurately mimic what a real user would experience?"

**If the answer is NO, the test is worthless.**

### What This Means

✅ **GOOD Test Thinking:**
- "Real users wait up to 40s for Ollama responses → My test should wait 50s+"
- "Real users see loading states → My test should verify loading states appear"
- "Real users click visible buttons → My test should use getByRole('button')"

❌ **BAD Test Thinking:**
- "I want fast tests → Set 10s timeout even though real app takes 40s"
- "I know the internal state → Check window.isLoaded instead of visible UI"
- "I know the CSS class → Use .btn-primary instead of button text"

### The Golden Rule

**Tests that don't match reality will:**
1. Give false positives (test passes, app fails)
2. Give false negatives (test fails, app works)
3. Waste everyone's time debugging phantom issues

**Use your brain. Match reality.**

---

## ⏱️ TIMEOUT GUIDELINES

### The Reality Check

**For AI-Friends App:**
- Ollama (gemma3:27b) single persona: 1.5-2s typical, **up to 6s** possible
- Sequential 2 personas: 3-4s typical, **up to 10s** possible
- Sequential 3 personas: 4.5-6s typical, **up to 15s** possible
- Under load or cold start: **Can reach 40s+**

### Timeout Strategy

```typescript
// ✅ CORRECT: Realistic timeouts matching user experience
await expect(messages).toHaveCount(3, { timeout: 60000 }); // 2 personas: allow up to 60s

// ❌ WRONG: Optimistic timeout that fails in real conditions
await expect(messages).toHaveCount(3, { timeout: 10000 }); // Fails when Ollama is slow!
```

### Recommended Timeouts for AI-Friends App

| Operation | Recommended Timeout | Reasoning |
|-----------|-------------------|-----------|
| 2 persona responses | 60,000ms (60s) | Cold start + sequential can take 40s+, buffer for safety |
| 3 persona responses | 60,000ms (60s) | Same reasoning, allow for worst-case |
| Deferred indicator appears | 5,000ms (5s) | UI update, should be instant after isGenerating=false |
| Button clicks | 2,000ms (2s) | UI actions are fast |
| Page navigation | 10,000ms (10s) | Network + Next.js hydration |

### Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 120000, // 2 minutes global - catches truly hung tests
  expect: {
    timeout: 60000  // 60s for AI operations
  },
  use: {
    actionTimeout: 5000,      // UI clicks/fills stay fast
    navigationTimeout: 10000   // Page loads
  },
});
```

### The Timeout Philosophy

**Global timeout (120s):** Safety net for tests that hang forever
**Expect timeout (60s):** Match worst-case real user experience
**Action timeout (5s):** UI interactions should be instant

**Never optimize for "fast tests" at the expense of "realistic tests."**

---

## 🧹 CLEANUP PATTERNS

### Automatic Pre-Test Cleanup (CRITICAL!)

**The project has automatic cleanup BEFORE every test run:**

`global-setup.ts` runs before ALL tests and:
1. ✅ Kills any hung dev servers on port 3000
2. ✅ Clears Next.js lock files (`.next/dev/lock`)
3. ✅ Verifies Ollama is running

**Why:** Prevents "port in use" and "lock file exists" errors that block tests.

**You don't need to do anything** - it happens automatically when you run `npm test`.

### Use Playwright Fixtures (Auto-Cleanup)

**Good news:** Playwright's built-in fixtures handle cleanup automatically.

```typescript
// ✅ CORRECT: No manual cleanup needed
test('user can submit form', async ({ page, context }) => {
  await page.goto('/');
  await page.fill('input', 'data');
  await page.click('button');
  // page & context automatically close after test
});
```

### When Manual Cleanup IS Required

**Only when you create resources outside fixtures:**

```typescript
// ❌ WRONG: Manual creation without cleanup (memory leak!)
test('custom context', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  // Memory leak - context never closes!
});

// ✅ CORRECT: Custom fixture with cleanup
const test = base.extend<{ isolatedPage: Page }>({
  isolatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    // Cleanup happens automatically here
    await page.close();
    await context.close();
  },
});
```

### afterEach for Data Cleanup

**Use afterEach to clean up test data, NOT resources:**

```typescript
// ✅ CORRECT: Clean up data artifacts
test.afterEach(async () => {
  // Delete test data from database/API
  await deleteTestArtifacts();
});

// ❌ WRONG: Redundant resource cleanup
test.afterEach(async ({ page }) => {
  await page.close(); // Unnecessary - fixture does this!
});
```

### AI-Friends App Specific

**Current app has good cleanup:**
- Playwright fixtures handle browser/page cleanup ✅
- Web server lifecycle managed by playwright.config.ts ✅
- Workers: 1 (prevents resource contention) ✅

**No additional cleanup needed** unless you:
- Manually create contexts/pages
- Write data to localStorage that persists
- Create files/folders during tests

---

## 🎯 SELECTOR BEST PRACTICES

### The User-Centric Hierarchy

**Priority order (best to worst):**

```typescript
// 1. ✅ BEST: Role-based (what assistive tech sees)
await page.getByRole('button', { name: 'Submit' });
await page.getByRole('textbox', { name: 'Email' });

// 2. ✅ GOOD: Label-based (form labels)
await page.getByLabel('Email address');

// 3. ✅ GOOD: Placeholder-based
await page.getByPlaceholder('Enter your email');

// 4. ✅ GOOD: Visible text
await page.getByText('Success!');

// 5. ⚠️ ACCEPTABLE: Test IDs (last resort for complex cases)
await page.locator('[data-testid="submit-btn"]');

// 6. ❌ AVOID: CSS classes (fragile to refactoring)
await page.locator('.btn--primary.btn--large');

// 7. ❌ NEVER: XPath (unless absolutely unavoidable)
await page.locator('//button[@class="submit"]');
```

### AI-Friends App Patterns

**VERIFIED selectors from actual components (SessionStart.tsx, ConversationInterface.tsx):**

```typescript
// ✅ CORRECT: Verified from working tests and component code
await page.click('button[data-testid="category-personal"]');  // lowercase! (line 107: cat.toLowerCase())
await page.fill('textarea#what', 'question');                 // id="what" not data-testid (line 147)
await page.fill('textarea#why', 'reason');                    // id="why" not data-testid (line 163)
await page.click('button:has-text("Start Conversation")');   // button text, no data-testid

// ✅ Also good: Message counting with CSS selector
const messages = page.locator('.max-w-2xl.px-4.py-3.rounded-lg');
// Acceptable because it matches actual DOM structure users see
```

**MANDATORY: Always check existing working tests first:**

```bash
# Before writing ANY selector, grep for similar patterns:
grep -r "category-" ai-friends-app/tests/*.spec.ts
grep -r "textarea#" ai-friends-app/tests/*.spec.ts
```

---

## ⏳ WAITING STRATEGIES

### Use Auto-Retrying Assertions

```typescript
// ✅ BEST: Auto-retrying assertion (waits up to timeout)
await expect(page.getByText('Success!')).toBeVisible({ timeout: 60000 });

// ✅ GOOD: Wait for specific state
await page.waitForLoadState('networkidle');

// ✅ GOOD: Wait for element count (AI-Friends pattern)
const messages = page.locator('.max-w-2xl.px-4.py-3.rounded-lg');
await expect(messages).toHaveCount(3, { timeout: 60000 });
```

### Avoid Hard Waits

```typescript
// ❌ BAD: Arbitrary wait (race condition!)
await page.waitForTimeout(2000);
await page.click('button'); // Button might not be ready!

// ✅ GOOD: Wait for actual condition
await page.waitForSelector('button:not([disabled])');
await page.click('button');
```

### Exception: When Hard Waits Are OK

**Sometimes unavoidable for animations or AI responses:**

```typescript
// ⚠️ ACCEPTABLE: Brief wait for animation to start
await page.click('button');
await page.waitForTimeout(500); // Let animation begin
await expect(spinner).toBeVisible(); // Then check it appeared

// But immediately follow with condition-based wait:
await expect(spinner).not.toBeVisible({ timeout: 60000 });
```

### AI-Friends App Pattern

**Current good pattern:**

```typescript
// ✅ Wait for actual message count, not arbitrary time
const messages = page.locator('.max-w-2xl.px-4.py-3.rounded-lg');
await expect(messages).toHaveCount(3, { timeout: 60000 }); // 2 personas + 1 user

// Then verify indicator (depends on isGenerating being false)
const indicator = page.locator('[data-testid="deferred-persona-indicator"]');
await expect(indicator).toBeVisible({ timeout: 5000 });
```

---

## 📋 TEST STRUCTURE RULES

### One Test = One Behavior

```typescript
// ✅ GOOD: Focused test
test('user can add item to cart', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByText('1 item')).toBeVisible();
});

test('user can remove item from cart', async ({ page }) => {
  // Separate test, fresh state
  await setupCart(page);
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Cart is empty')).toBeVisible();
});

// ❌ BAD: Multiple behaviors (cascading failures)
test('complete shopping flow', async ({ page }) => {
  // Add item (fails here = rest fails)
  // Update quantity
  // Checkout
  // Payment
  // Confirmation
});
```

### Use Descriptive Names

```typescript
// ✅ GOOD: Clear, specific names
test('should show deferred persona indicator after 2 initial responses', ...)
test('should generate 3rd persona when "Show Now" button clicked', ...)

// ❌ BAD: Vague names
test('deferred persona test', ...)
test('it works', ...)
```

### Keep Tests Under 50 Lines

If test exceeds 50 lines, split into:
1. Multiple focused tests
2. Helper functions for setup
3. Custom fixtures for complex state

---

## ⚙️ WORKER CONFIGURATION

### AI-Friends App Uses Workers: 1

**Why:**
- Sequential persona generation takes 3-6s per persona
- Multiple workers overwhelm Ollama (VRAM limits)
- Tests become flaky under load

```typescript
// playwright.config.ts
workers: process.env.CI ? 1 : 1, // ✅ Correct for AI workload
```

### General Guideline

```typescript
// For CPU-bound apps (not AI)
workers: Math.max(1, Math.floor(os.cpus().length / 2)), // 50% of cores

// For AI/LLM apps (like AI-Friends)
workers: 1 // Avoid overwhelming AI backend

// For large test suites in CI
// Use sharding across machines instead of maxing workers:
// npx playwright test --shard=1/3
```

---

## 🚨 ANTI-PATTERNS TO AVOID

### ❌ Unrealistic Timeouts

```typescript
// ❌ WRONG: Test passes when app actually fails
await expect(messages).toHaveCount(3, { timeout: 10000 });
// Real Ollama can take 40s+ → user sees failure, test passes!

// ✅ CORRECT: Match worst-case user experience
await expect(messages).toHaveCount(3, { timeout: 60000 });
```

### ❌ Testing Internal State

```typescript
// ❌ WRONG: Check implementation details
const isLoaded = await page.evaluate(() => window.appReady);
expect(isLoaded).toBe(true);

// ✅ CORRECT: Check what user sees
await expect(page.getByText('Welcome!')).toBeVisible();
```

### ❌ Fragile Selectors

```typescript
// ❌ WRONG: CSS classes (breaks on refactoring)
await page.locator('.btn--green.btn--large').click();

// ✅ CORRECT: Semantic selectors
await page.getByRole('button', { name: 'Submit' }).click();
```

### ❌ Missing Cleanup

```typescript
// ❌ WRONG: Manual resource without cleanup
test('custom test', async ({ browser }) => {
  const context = await browser.newContext(); // Memory leak!
  const page = await context.newPage();
  // Never closed!
});

// ✅ CORRECT: Use fixture or close manually
await context.close();
await page.close();
```

---

## 📝 EXAMPLE TEMPLATES

### Template 1: Basic UI Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('user can perform action', async ({ page }) => {
    // Navigate
    await page.goto('/');

    // Act
    await page.getByRole('button', { name: 'Submit' }).click();

    // Assert visible outcome
    await expect(page.getByText('Success!'))
      .toBeVisible({ timeout: 5000 });
  });
});
```

### Template 2: AI Response Test (AI-Friends Pattern)

```typescript
test.describe('AI Response Feature', () => {
  test('generates 2 persona responses in first round', async ({ page }) => {
    // Start session
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ✅ CORRECT: Verified selectors from existing working tests
    // Checked: deferred-persona-indicator.spec.ts uses these exact selectors
    await page.click('button[data-testid="category-personal"]');  // lowercase!
    await page.fill('textarea#what', 'Test question');            // id="what", not data-testid
    await page.fill('textarea#why', 'Testing personas');          // id="why", not data-testid
    await page.click('button:has-text("Start Conversation")');   // button text, not data-testid

    // Wait for 2 persona responses (1 user + 2 personas = 3 total)
    const messages = page.locator('.max-w-2xl.px-4.py-3.rounded-lg');
    await expect(messages).toHaveCount(3, { timeout: 60000 });

    // Verify content exists
    const firstPersona = await messages.nth(1).textContent();
    const secondPersona = await messages.nth(2).textContent();
    expect(firstPersona).toBeTruthy();
    expect(secondPersona).toBeTruthy();
  });
});
```

### Template 3: Custom Fixture with Cleanup

```typescript
import { test as base, type Page } from '@playwright/test';

type Fixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ browser }, use) => {
    // Setup
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Use
    await use(page);

    // Teardown (automatic)
    await page.close();
    await context.close();
  },
});

// Usage
test('authenticated user can access profile', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/profile');
  await expect(authenticatedPage.getByText('Profile')).toBeVisible();
});
```

### Template 4: Data Cleanup in afterEach

```typescript
test.describe('User Management', () => {
  const createdIds: string[] = [];

  test.afterEach(async () => {
    // Clean up test data (not resources - fixtures handle that)
    for (const id of createdIds) {
      await fetch(`http://localhost:3000/api/delete/${id}`, {
        method: 'DELETE'
      });
    }
    createdIds.length = 0;
  });

  test('can create resource', async ({ page }) => {
    await page.goto('/create');
    await page.fill('[name="title"]', 'Test');
    await page.click('button:has-text("Create")');

    const id = await page.locator('[data-id]').getAttribute('data-id');
    createdIds.push(id!);

    await expect(page.getByText('Created')).toBeVisible();
  });
});
```

---

## 🎯 CHECKLIST BEFORE SUBMITTING TEST

Before marking test as complete, verify:

- [ ] **🚨 CRITICAL: Selectors Verified:** Did you COPY selectors from working tests OR read component code to verify they exist?
- [ ] **Brain Check:** Does this test match real user experience?
- [ ] **Timeouts:** Are timeouts realistic? (60s+ for AI operations)
- [ ] **Selectors:** Using user-centric selectors (getByRole, getByTestId)?
- [ ] **Waiting:** Using auto-retrying assertions, not hard waits?
- [ ] **Cleanup:** Using fixtures OR manually closing resources?
- [ ] **Focused:** One test = one behavior?
- [ ] **Naming:** Descriptive test name explaining what user can do?
- [ ] **Length:** Test under 50 lines?

**If the first checkbox is unchecked, STOP. Go verify your selectors exist.**

If ANY other checkbox is unchecked, fix it before submitting.

---

## 🚀 SUCCESS METRICS

You're doing it right when:

✅ Tests pass when app works, fail when app breaks (no false positives/negatives)
✅ Test timeouts match real user wait times
✅ Tests verify visible UI states, not internal implementation
✅ Tests run reliably in CI and locally
✅ Future developers can understand test intent from name alone

You're doing it **wrong** when:

❌ "Test passed but app doesn't work"
❌ "App works fine but test fails"
❌ "Test only passes when Ollama is fast"
❌ "Had to increase timeout to 5 minutes to make it pass"

---

## 📚 RELATED DOCUMENTS

- `.claude/MANDATORY-DEV-PROCESS.md` - General development workflow
- `.claude/agents/developer.md` - Developer agent (calls this agent for tests)
- `ai-friends-app/playwright.config.ts` - Test configuration
- `ai-friends-app/tests/` - Example test files

---

**Remember: Use your brain. Does this test represent what a real user experiences? If not, rewrite it.**
