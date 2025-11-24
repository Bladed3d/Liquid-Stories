# START HERE - Instructions for Every Claude Session

**READ THIS FIRST before doing ANY development work.**

---

## 🚨 CRITICAL: You Are NOT Allowed to Waste User Time

The user has experienced **countless hours wasted** by previous Claude sessions doing trial-and-error development and asking them to be a test dummy.

**This ends now.**

---

## The ONLY Approved Development Process

You MUST follow this process for EVERY feature, bug fix, or code change:

### **The Loop: RESEARCH → CODE+LED → TEST → DEBUG**

```
1. RESEARCH (WebSearch + WebFetch)
   ↓
2. CODE with LED breadcrumbs
   ↓
3. WRITE Playwright test
   ↓
4. RUN test: npm test (synchronous, WAIT for completion)
   ↓
5. VERIFY: Read actual test output (DO NOT trust agent reports)
   ↓
6. PASS? ✅ ALL tests green? Report success to user
   ↓
7. FAIL? Count failures and read breadcrumb-debug.log
   ↓
8. Obvious fix? → Go to step 2
   ↓
9. Not obvious? → Go to step 1
   ↓
10. After 2 failures? → MANDATORY RESEARCH (step 1)
```

**CRITICAL RULES:**
- ❌ NEVER run tests in background - ALWAYS wait for completion
- ❌ NEVER trust agent test reports - ALWAYS verify yourself
- ❌ NEVER rationalize failures as "expected" - ALL tests must pass
- ❌ NEVER skip steps. NEVER ask user to test.
- ✅ ALWAYS wait for "X passed, Y failed" summary before proceeding
- ✅ ALWAYS check breadcrumb-debug.log when tests fail
- ✅ If you see ANY red X marks, that's a FAILURE - fix it

---

## 📚 Read These Documents

Before implementing ANY feature:

1. **`.claude/MANDATORY-DEV-PROCESS.md`** - The complete development loop (READ THIS!)
2. **`.claude/AUTO-TEST-PROTOCOL.md`** - Testing requirements and anti-patterns
3. **`CLAUDE.md`** - Project-specific guidelines

---

## 🔍 LED Breadcrumb System

**Every code change MUST include LED breadcrumbs.**

### Why?
When tests fail, the breadcrumb log shows EXACTLY what happened:
- Which functions were called
- What data was passed
- Where it failed
- What the state was at failure

### How to use:

```typescript
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

const trail = new BreadcrumbTrail('YourComponent');

// At start of operation
trail.light(LED_RANGES.FEATURE.START, 'operation_name', {
  relevantData: value
});

// On success
trail.light(LED_RANGES.FEATURE.SUCCESS, 'operation_complete', {
  result
});

// On failure
trail.fail(LED_RANGES.FEATURE.FAILED, error, 'operation_failed', {
  context
});
```

### Debug with LED logs:

```bash
# View all breadcrumbs
cat ai-friends-app/breadcrumb-debug.log

# Filter for errors
grep "❌" ai-friends-app/breadcrumb-debug.log

# Filter by LED range
grep "LED 206" ai-friends-app/breadcrumb-debug.log
```

**The log file tells you what failed and why. Use it!**

---

## 🧪 Playwright Testing

**You MUST test your own code. The user is NOT your QA.**

### Write tests for every feature:

```typescript
// tests/feature-name.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do X when Y happens', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Perform action
    await page.click('button');

    // Verify result
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Run tests:

```bash
npm test                  # Headless (fast)
npm run test:headed       # See browser (debug)
npm run test:ui          # Interactive mode
```

### Check test results immediately:

```bash
# Run with completion marker
npm test 2>&1 | tee test-output.log && echo "DONE"

# Use BashOutput tool to check status without waiting
```

**All tests MUST pass before you report feature complete.**

---

## ⛔ What NOT to Do

### NEVER:
- ❌ Ask user "Can you test this?"
- ❌ Say "Try this and let me know if it works"
- ❌ Write code without researching first
- ❌ Skip LED breadcrumbs
- ❌ Skip writing tests
- ❌ Do trial-and-error for more than 2 attempts
- ❌ Ignore the breadcrumb-debug.log when tests fail
- ❌ Use hard-coded timeouts (tests finish in ~2-7 seconds)

### Example of WRONG approach:
```
Claude: "I've implemented the feature. Can you test it?"
User: "It doesn't work"
Claude: "Try this change..."
User: "Still doesn't work"
Claude: "How about this..."
[2 hours wasted]
```

### Example of CORRECT approach:
```
Claude:
1. Researched React keyboard shortcuts best practices
2. Implemented with LED breadcrumbs
3. Wrote 5 Playwright tests
4. All tests passed
5. Feature is ready to use: Ctrl+Alt+Shift+A opens settings

[User sees working feature, never tests manually]
```

---

## 📋 Development Checklist

Before reporting ANY feature complete:

- [ ] Researched correct approach (WebSearch/WebFetch)
- [ ] Added LED breadcrumbs at key points
- [ ] Wrote Playwright test(s)
- [ ] Ran `npm test` - all tests pass
- [ ] Reviewed breadcrumb-debug.log (no unexpected failures)
- [ ] Code follows existing project patterns
- [ ] Updated todo list with TodoWrite

**If ANY checkbox is unchecked, feature is NOT complete.**

---

## 🎯 Success Criteria

You're doing it RIGHT when:
- ✅ User only sees working features
- ✅ Tests catch bugs before user does
- ✅ LED logs make debugging quick
- ✅ Research prevents wasted time
- ✅ User feels respected, not used

You're doing it WRONG when:
- ❌ User has to manually test your code
- ❌ Multiple "try this" iterations happen
- ❌ You're guessing instead of researching
- ❌ Tests are skipped or incomplete

---

## 🚀 Quick Start for Common Tasks

### Implementing a UI Feature

```bash
# 1. Research
WebSearch: "React [feature] best practices 2025"
WebFetch: [most relevant result]

# 2. Code with LEDs
# Add LED breadcrumbs to your implementation

# 3. Write test
# Create tests/feature-name.spec.ts

# 4. Run test
npm test

# 5. Debug if needed
cat ai-friends-app/breadcrumb-debug.log

# 6. Fix and re-test
npm test
```

### Debugging a Failed Test

```bash
# 1. Check test output for error
# 2. Read breadcrumb log
cat ai-friends-app/breadcrumb-debug.log | tail -20

# 3. Look for the last successful LED and first failure
grep "❌" ai-friends-app/breadcrumb-debug.log

# 4. Fix the issue at that point
# 5. Re-run test
npm test
```

---

## ⚠️ AGENT USAGE WARNING

**Agents are NOT testers. YOU are the tester.**

### Agent Pitfalls (Real failures from this project):

**❌ WRONG: Trust agent reports**
```
Agent: "All 37 tests passing ✅"
Reality: 8 failed, 29 passed (agent lied)
```

**✅ CORRECT: Verify yourself**
```bash
# Run test yourself
npm test -- my-feature.spec.ts 2>&1 | tail -50

# Look for actual pass/fail summary
# "37 passed" ✅ or "8 failed, 29 passed" ❌
```

### Never Trust Agents For:
1. **Test results** - Always run tests yourself and read output
2. **"Expected failures"** - ALL tests must pass, no exceptions
3. **Background processes** - Tests MUST run synchronously
4. **File operations** - Always verify with Read tool after agent edits

### Agents Are Useful For:
1. **Research** - Finding Stack Overflow answers, documentation
2. **Code exploration** - Finding patterns in large codebases
3. **Parallel work** - Multiple independent searches

**Golden Rule:** Agents report TO you. You verify EVERYTHING before reporting to user.

---

## 💡 Example: Real Success Story

**Task:** Implement keyboard shortcut to show hidden settings panel

**What I did:**
1. ✅ Researched React keyboard shortcuts and Playwright syntax
2. ✅ Added LED breadcrumbs to keyboard handler
3. ✅ Wrote 5 Playwright tests
4. ✅ Test failed - checked breadcrumb log
5. ✅ LED log showed: shortcut triggered but panel not in DOM
6. ✅ Fixed: moved SettingsPanel outside conditional rendering
7. ✅ Re-ran tests - all 5 passed (2.1s)
8. ✅ Reported success to user

**Result:** Feature works perfectly. User never had to test manually. Zero time wasted.

---

## 🚨 Example: Real Failure (Learn from this mistake)

**Task:** Implement CharacterThinking UI component

**What I did WRONG:**
1. ❌ Used Task agent to implement code
2. ❌ Agent reported "All tests passing ✅"
3. ❌ I trusted the report WITHOUT verifying
4. ❌ Committed code and reported success to user
5. ❌ User ran tests and saw 14 red X failures
6. ❌ Root cause: Used wrong API client (`getOllamaClient` vs `getAIClient`)

**What I SHOULD have done:**
1. ✅ Run tests myself: `npm test 2>&1 | tail -100`
2. ✅ Wait for summary: "14 failed, 97 passed"
3. ✅ Read error: "TypeError: Failed to parse URL from /api/ollama"
4. ✅ Check breadcrumb-debug.log for LED errors
5. ✅ Research correct API client pattern
6. ✅ Fix: Change to `getAIClient()`
7. ✅ Re-test until ALL tests pass
8. ✅ THEN report success

**Lesson:** Agent reports are NEVER sufficient. You MUST verify every test run yourself.

**That's what happens when you skip verification.**

---

## 🔧 Project-Specific Info

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Playwright
**Test Framework:** Playwright
**LED System:** Custom breadcrumb debugging (20000-29999 range)
**Log File:** `ai-friends-app/breadcrumb-debug.log`

**Available LED Ranges:**
- 20000-20099: App lifecycle
- 20100-20199: User input
- 20200-20299: Persona coordination
- 20300-20399: AI API calls
- 20400-20499: Conversation flow
- 20500-20599: Response aggregation
- 20600-20699: UI interactions
- 20800-20899: Errors

See `ai-friends-app/lib/led-ranges.ts` for complete list.

---

## ⚡ Speed Tips

**Research efficiently:**
- Use WebSearch first to find best approach
- Use WebFetch to read full documentation
- Check existing code patterns with Grep/Read

**Test efficiently:**
- Run tests in background with completion markers
- Use BashOutput to check results immediately
- Don't wait for arbitrary timeouts

**Debug efficiently:**
- LED logs tell you exactly where it failed
- No need to add console.logs - LEDs are already there
- Pattern match in breadcrumb-debug.log to find issues

---

## 🎓 Remember

**You are a professional developer, not a trial-and-error script.**

The user hired Claude to:
- ✅ Build working software
- ✅ Test it thoroughly
- ✅ Deliver quality
- ✅ Respect their time

NOT to:
- ❌ Be a QA tester for your experiments
- ❌ Waste hours on broken code
- ❌ Debug your mistakes
- ❌ Test every iteration

**Research. Build. Test. Deliver.**

That's the job. Do it well.

---

**Now go read `.claude/MANDATORY-DEV-PROCESS.md` and start building.**
