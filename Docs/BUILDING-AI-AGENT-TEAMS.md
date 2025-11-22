# Building AI Agent Teams with LED Breadcrumbs

**A practical guide to creating self-healing development workflows**

---

## Overview

This guide shows you how to build an AI agent team that:
- Tests its own code
- Verifies its own tests
- Debugs using evidence trails
- Never wastes user time

**Core components:**
1. LED breadcrumb debugging system
2. Specialized agent team
3. Triple verification workflow
4. Task confirmation protocol

---

## Phase 1: LED Breadcrumb Foundation

### Why LED Breadcrumbs First?

**Agents need evidence to debug.**

Without LEDs:
```
Test failed → Agent guesses → Agent tries random fixes → Repeat
```

With LEDs:
```
Test failed → Agent reads LED log → Sees exact failure point → Fixes precisely
```

### Implementing LED System

**1. Create the breadcrumb system:**

```typescript
// lib/breadcrumb-system.ts
export class BreadcrumbTrail {
  constructor(private componentName: string) {}

  light(ledId: number, event: string, context?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `✅ LED ${ledId}: ${event} [${this.componentName}] ${
      context ? JSON.stringify(context) : ''
    }\n`;

    // Append to log file
    fs.appendFileSync('breadcrumb-debug.log', logEntry);
  }

  fail(ledId: number, error: Error, event: string, context?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `❌ LED ${ledId} FAILED [${this.componentName}]: ${event} - ${error.message}\n${
      context ? JSON.stringify(context, null, 2) : ''
    }\n`;

    fs.appendFileSync('breadcrumb-debug.log', logEntry);
  }
}
```

**2. Define LED ranges:**

```typescript
// lib/led-ranges.ts
export const LED_RANGES = {
  PAGE_LIFECYCLE: {
    MOUNT: 30000,
    LOAD: 30001,
    READY: 30002,
    UNMOUNT: 30099
  },
  USER_INTERACTION: {
    CLICK: 30100,
    INPUT: 30101,
    SUBMIT: 30102,
    NAVIGATION: 30103
  },
  API_CALLS: {
    START: 30200,
    SUCCESS: 30201,
    FAILED: 30202,
    TIMEOUT: 30203
  },
  // ... more ranges
  ERRORS: {
    VALIDATION: 30800,
    NETWORK: 30801,
    UNKNOWN: 30899
  }
};
```

**3. Use in your code:**

```typescript
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

function MyComponent() {
  const trail = new BreadcrumbTrail('MyComponent');

  const handleSubmit = async (data: FormData) => {
    trail.light(LED_RANGES.USER_INTERACTION.SUBMIT, 'form_submitted', { data });

    try {
      trail.light(LED_RANGES.API_CALLS.START, 'api_call_started');
      const result = await api.post('/endpoint', data);
      trail.light(LED_RANGES.API_CALLS.SUCCESS, 'api_call_complete', { result });
    } catch (error) {
      trail.fail(LED_RANGES.API_CALLS.FAILED, error, 'api_call_failed', { data });
    }
  };
}
```

**Result:** Every execution path leaves evidence trail

---

## Phase 2: Agent Team Structure

### The Six Essential Agents

**1. Developer Agent (Sonnet)**
- **Role:** Implements features with LED breadcrumbs
- **Critical feature:** Task confirmation summary
- **Output:** Code + tests + RAW proof

**Agent specification excerpt:**
```markdown
# Developer Agent

**Before starting, confirm understanding:**

"I will:
1. Research [solution] using WebSearch/WebFetch
2. Implement [feature] with LED breadcrumbs at:
   - [Key point 1]
   - [Key point 2]
3. Write Playwright tests for [behaviors]
4. Run tests synchronously, provide RAW output"
```

**Why confirmation matters:**
- Agent reminds itself of the process
- Main Claude knows what's happening
- Creates memory checkpoint
- Saves tokens (no re-explaining)

**2. Quality Agent (Haiku - cheap verification)**
- **Role:** Independent test verification
- **Critical feature:** Doesn't trust developer
- **Output:** APPROVED / NEEDS_FIX / ESCALATE

**Agent specification excerpt:**
```markdown
# Quality Agent

**Your job: Don't trust developer agent**

1. Read developer's claimed results
2. Run SAME test yourself independently
3. Compare results
4. If mismatch → ESCALATE
5. If both fail → NEEDS_FIX
6. If both pass → APPROVED
```

**3. Test-Creation Agent (Sonnet)**
- **Role:** Write verified Playwright tests
- **Critical feature:** Never invents selectors
- **Output:** Tests that can actually succeed

**Agent specification excerpt:**
```markdown
# Test-Creation Agent

## 🚨 CRITICAL SELECTOR RULE

NEVER write test using selectors you haven't verified.

**Process:**
1. Read component file
2. Find actual data-testid attribute
3. Verify it exists
4. THEN write test

**Or:**
1. Find working test
2. Copy selector pattern
3. Verify it still exists
```

**4. Research Agent (Sonnet)**
- **Role:** Find proven solutions
- **Output:** 3-5 approaches with pros/cons
- **Time limit:** 15 minutes

**5. Debugger Agent (Sonnet)**
- **Role:** Root cause analysis from LED logs
- **Output:** Diagnosis + recommended fix
- **Does NOT:** Implement fixes

**6. Environment Agent (Haiku)**
- **Role:** Configuration troubleshooting
- **Output:** Environment mismatches + fixes
- **Common fixes:** Node version, dependencies, .env

### Agent Team Workflow

```
User: "Implement feature X"
    ↓
Main Claude: "Use developer agent for feature X"
    ↓
Developer: "I understand. I will: [confirmation summary]"
    ↓
Developer: [Works autonomously]
    ↓
Developer: "Done. RAW proof: [test output]"
    ↓
Main Claude: "Use quality agent to verify"
    ↓
Quality: [Re-runs tests independently]
    ↓
Quality: "APPROVED - both match, 0 failures"
    ↓
Main Claude: [Spot-checks LED log]
    ↓
Main Claude: "Verified ✅ Feature complete"
```

---

## Phase 3: The Task Confirmation Protocol

### Why Confirmation Prevents Memory Loss

**The problem:**
```
Main Claude: "Build feature X with LED breadcrumbs"
Developer Agent: [starts work]
[20 messages later]
Developer Agent: [forgot about LED breadcrumbs]
Main Claude: [also forgot]
Result: No LEDs, can't debug
```

**The solution:**
```
Main Claude: "Build feature X with LED breadcrumbs"
Developer Agent: "Understood. I will:
  1. Research X
  2. Code X with LEDs at entry/api/errors
  3. Test X with Playwright
  4. Provide proof"
[Confirmation persists in context]
Developer Agent: [follows its own summary]
Main Claude: [references confirmation to verify]
Result: LEDs present, debugging works
```

### Implementing Confirmation Protocol

**In developer agent specification:**

```markdown
## Phase 1: CONFIRM UNDERSTANDING (MANDATORY)

Before writing ANY code, confirm what you'll do:

```markdown
# Developer Agent Report: Task [ID]

## What I Will Do

### Research (5-10 min)
- WebSearch: "[technology] [feature] best practices"
- WebFetch: [documentation URL]
- Check existing codebase for patterns

### Implementation
- Create/modify: [file paths]
- LED breadcrumbs at:
  - LED XXXX: [operation entry]
  - LED XXXX: [external call]
  - LED XXXX: [error handler]

### Testing
- Write tests/[name].spec.ts
- Test cases:
  1. [Happy path]
  2. [Edge case 1]
  3. [Edge case 2]

### Proof
- Run: npm test -- [test file]
- Capture: Complete RAW output
- Verify: Exit code + summary line
```
```

**In main Claude instructions:**

```markdown
When launching developer agent:

1. ✅ Wait for confirmation summary
2. ✅ Verify summary matches task
3. ✅ Reference confirmation when agent reports back
4. ❌ Never let agent start without confirming
```

### Token Savings

**Without confirmation (per task):**
- Main Claude explains process: 500 tokens
- Agent asks clarifying questions: 300 tokens
- Main Claude re-explains: 500 tokens
- **Total: 1,300 tokens per task**

**With confirmation (per task):**
- Agent confirms once: 200 tokens
- Main Claude references confirmation: 50 tokens
- **Total: 250 tokens per task**

**Savings: 80% reduction**

---

## Phase 4: Test Validation Strategy

### The 3-Hour Test Crisis

**What happened:**
- Developer agent wrote test with `[data-testid="category-Business"]`
- Actual component had `[data-testid="category-business"]` (lowercase)
- 3 hours debugging WORKING CODE because test was impossible

**Root cause:**
- Agent **invented** selector instead of verifying it
- Test could never succeed, regardless of code quality

### Prevention: Test-Creation Agent

**Rule 1: Never Invent Selectors**

```markdown
## MANDATORY SELECTOR VERIFICATION

**Before writing ANY selector in a test:**

Step 1: Find working test
```bash
grep -r "data-testid" tests/*.spec.ts
```

Step 2: Copy pattern from working test
```typescript
// From working-test.spec.ts:
await page.click('[data-testid="category-personal"]'); // ✅ Verified
```

Step 3: If no working test, READ COMPONENT
```typescript
// Read component file
// Find line: data-testid={`category-${cat.toLowerCase()}`}
// Know to use: category-personal (lowercase!)
```

**Never write:** `[data-testid="category-Personal"]` ❌ (guessed)
**Always write:** `[data-testid="category-personal"]` ✅ (verified)
```

**Rule 2: Match Real User Experience**

```markdown
## TIMEOUT REALITY CHECK

**Ask: How long would a real user wait?**

❌ Wrong:
```typescript
// Optimistic timeout
await expect(result).toBeVisible({ timeout: 5000 });
// Real API takes 8s → Test fails even when app works
```

✅ Right:
```typescript
// Realistic timeout
await expect(result).toBeVisible({ timeout: 15000 });
// Matches worst-case user experience
```
```

**Rule 3: Verify Test Infrastructure**

```markdown
## TEST THE TEST

Before using test to validate code:

1. **Does selector exist?** Read component, verify attribute
2. **Can test pass?** Run against known-good code
3. **Does test fail correctly?** Break code, verify test catches it
4. **Is timeout realistic?** Match actual operation time + buffer
```

### When to Use Test-Creation Agent

**Always use for:**
- First test in a new component
- Complex selectors or user flows
- Tests that keep failing mysteriously
- When agent debugging working code

**Process:**
```
Main Claude: "Use test-creation agent to write tests for [feature]"
    ↓
Test-Creation Agent:
  1. Reads component files
  2. Finds actual selectors
  3. Copies from working tests
  4. Writes realistic tests
    ↓
Test-Creation Agent: "Tests ready. Selectors verified from [component.tsx:line]"
    ↓
Developer Agent: Uses verified tests
```

---

## Phase 5: Triple Verification Flow

### Why Three Layers?

**Real failure that triple verification caught:**

```
Developer Agent: "All 37 tests passing ✅"
    ↓
Quality Agent: "I ran same tests: 8 failed, 29 passed ❌"
    ↓
Main Claude: "Quality is right. Developer was wrong. Sending back for fixes."
```

Without quality agent: Broken code would ship

### Layer 1: Developer Agent Tests

```markdown
## Developer's Job

1. Write code
2. Write tests
3. Run tests: npm test -- feature.spec.ts
4. Capture RAW output (all lines, no summary)
5. Report with COMPLETE proof
```

**Critical:** Developer provides RAW terminal output, not summary

### Layer 2: Quality Agent Verification

```markdown
## Quality's Job

1. DON'T trust developer's report
2. Run SAME test independently
3. Capture YOUR OWN output
4. Compare line by line:
   - Exit codes match?
   - Pass/fail counts match?
   - Summary lines match?
5. Check LED log for errors
6. Recommend: APPROVED / NEEDS_FIX / ESCALATE
```

**Critical:** Quality doesn't trust anyone, verifies everything

### Layer 3: Main Claude Spot-Check

```markdown
## Main Claude's Job

1. Read both reports (developer + quality)
2. Spot-check evidence:
   ```bash
   cat breadcrumb-debug.log | tail -20 | grep "❌"
   ```
3. If both agree PASS + no LED errors → Approve
4. If mismatch → Investigate (run test yourself)
5. If both agree FAIL → Send back with details
```

**Critical:** Even with two agents agreeing, main Claude verifies

### The Verification Contract

```markdown
**Developer promises:**
"Tests pass (here's proof: [RAW output])"

**Quality verifies:**
"I ran tests independently: [MY output] → APPROVED"

**Main Claude confirms:**
"Both proofs match + LED log clean → ✅"
```

Three independent verifications = High confidence

---

## Complete Implementation Checklist

### Setup (One-time, ~2 hours)

- [ ] Implement LED breadcrumb system (`lib/breadcrumb-system.ts`)
- [ ] Define LED ranges for your project (`lib/led-ranges.ts`)
- [ ] Create `.claude/agents/` directory
- [ ] Copy all 6 agent specifications
- [ ] Create `.claude/MANDATORY-DEV-PROCESS.md`
- [ ] Create `.claude/START-HERE.md`
- [ ] Configure task confirmation protocol
- [ ] Set up Playwright testing

### Per-Task Workflow

- [ ] Launch developer agent with task
- [ ] Wait for confirmation summary
- [ ] Verify confirmation matches task
- [ ] Let developer work autonomously
- [ ] Developer reports with RAW proof
- [ ] Launch quality agent for verification
- [ ] Quality reports comparison
- [ ] Spot-check LED log yourself
- [ ] Approve only if all three verify

### Success Metrics

**You know it's working when:**
- ✅ Agents confirm before starting (memory lock)
- ✅ Tests have verified selectors (no 3-hour debugging)
- ✅ LED logs show exact failure points
- ✅ Quality agent catches developer mistakes
- ✅ User only sees working features
- ✅ Token usage down (less re-explaining)
- ✅ Development time down (less debugging)

---

## Common Pitfalls

### Pitfall 1: Skipping Confirmation

**Wrong:**
```
Claude: "Build feature X"
Agent: [starts coding immediately]
```

**Right:**
```
Claude: "Build feature X"
Agent: "Understood. I will: [summary]"
Claude: "Confirmed. Proceed."
Agent: [starts coding]
```

### Pitfall 2: Trusting Agent Test Reports

**Wrong:**
```
Agent: "Tests passing ✅"
Claude: "Great! Feature complete"
```

**Right:**
```
Agent: "Tests passing. RAW proof: [complete output]"
Claude: "Launching quality agent to verify independently"
Quality: "Confirmed: [my output matches]"
Claude: "Both verified. Feature complete"
```

### Pitfall 3: Invented Test Selectors

**Wrong:**
```
test('should work', async ({ page }) => {
  await page.click('[data-testid="submit-button"]'); // ❌ Guessed!
});
```

**Right:**
```
// Step 1: Read component file
// Found: data-testid="form-submit-btn"
test('should work', async ({ page }) => {
  await page.click('[data-testid="form-submit-btn"]'); // ✅ Verified!
});
```

### Pitfall 4: Skipping LED Breadcrumbs

**Wrong:**
```
function submitForm(data) {
  api.post('/submit', data);
}
// Test fails → No idea where
```

**Right:**
```
function submitForm(data) {
  trail.light(LED_RANGES.FORM.SUBMIT_START, 'submit_started', { data });

  try {
    const result = api.post('/submit', data);
    trail.light(LED_RANGES.FORM.SUBMIT_SUCCESS, 'submit_done', { result });
  } catch (error) {
    trail.fail(LED_RANGES.FORM.SUBMIT_FAILED, error, 'submit_error', { data });
  }
}
// Test fails → LED log shows exact failure point
```

---

## ROI Analysis

### Time Investment

**Setup:** 2-3 hours (one-time)
**Per-task overhead:** 2-3 minutes (confirmation + verification)

### Time Savings

**Per week (compared to no system):**
- Debugging reduced: 10 hours → 1 hour = **9 hours saved**
- False positive fixes: 3 hours → 0 hours = **3 hours saved**
- Re-explaining process: 2 hours → 0.5 hours = **1.5 hours saved**
- User testing time: 5 hours → 0 hours = **5 hours saved**

**Total: 18.5 hours saved per week**

### Quality Improvements

- Bugs caught before user sees: 90%+ improvement
- Test reliability: From 60% → 95%
- Feature completion accuracy: From 70% → 98%

---

## Next Steps

1. **Start small:** Implement LED breadcrumbs in one component
2. **Add developer agent:** See task confirmation in action
3. **Add quality agent:** Experience verification catching issues
4. **Add test-creation agent:** Stop wasting time on bad tests
5. **Iterate:** Refine based on your project's needs

---

## Resources

- **System Breakthroughs:** `SYSTEM-BREAKTHROUGHS.md`
- **Agent Specifications:** `.claude/agents/*.md`
- **LED Implementation:** `docs/guides/led-implementation.md`
- **Example Projects:** `docs/examples/`

---

**Remember:** This isn't just automation. It's a development methodology that makes AI agents accountable, verifiable, and reliable.
