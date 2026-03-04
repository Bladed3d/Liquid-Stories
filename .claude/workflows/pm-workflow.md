# Project Manager Workflow

**This is a WORKFLOW for Main Claude to follow, NOT an agent to spawn.**

Main Claude reads this document and executes the steps directly. Main Claude spawns worker agents. Worker agents cannot spawn other agents (Claude Code architectural limitation).

---

## Why This Is Not An Agent

**Claude Code Rule:** Subagents cannot spawn other subagents.

If PM were an agent:
```
Main Claude → spawns PM (subagent)
                PM tries to spawn Task Breakdown → FAILS
```

Correct architecture:
```
Main Claude reads PM workflow
Main Claude spawns Task Breakdown → returns result
Main Claude spawns Test Agent → returns result
Main Claude spawns Developer → returns result
Main Claude spawns Quality → returns result
```

**Main Claude is the orchestrator.** This document tells Main Claude what to do.

---

## When To Use This Workflow

User says something like:
- "Build this feature" (with PRD)
- "Implement the QR upload POC"
- "Use the dev workflow for this"

Main Claude then follows the phases below.

---

## Phase 0: Intent Interview

Before any development begins, capture what Derek specifically wants from this build — beyond the Universal Intent Profile defaults.

### Step 0a — Self-Assessment (Claude judges, not Derek)

Review the PRD and ask yourself:

> "Is this complex enough to warrant the intent interview — or is it a simple, well-defined task that the Universal Intent Profile already covers completely?"

**If simple:** Skip Phase 0. Note briefly why (e.g., "This is a straightforward CSS change — Universal Intent Profile applies, no exceptions needed"). Proceed to Phase 1.

**If complex or ambiguous:** Proceed to Step 0b. When in doubt, run the interview — it takes 2 minutes and prevents hours of rework.

### Step 0b — The Interview (one question at a time, wait for response)

Ask Derek these questions in order. One at a time. Wait for his answer before asking the next.

**Question 1:**
> "What's the simplest version of this feature that would satisfy you for the first release?"

**Question 2:**
> "What should the user be able to do or experience after this is built that they couldn't before?"

**Question 3:**
> "Is there anything about this feature where you'd trade simplicity for something else — speed, a specific appearance, a particular interaction?"

**Question 4:**
> "What would make this a failure in your eyes, even if it technically passes all tests?"

**Question 5 (profile-aware):**
Read `.claude/workflows/universal-intent-profile.md` first, then ask about any defaults that might have exceptions for this build:
> "The standard profile says [specific rule]. Does that apply here, or is this feature an exception?"

Do NOT ask vague questions like "are there any constraints the profile doesn't cover?" — Derek cannot be expected to remember what the profile contains. You hold the profile and ask the specific question.

### Step 0c — Produce the Intent Statement

After all answers are collected, write a single paragraph — the Intent Statement:

```
INTENT STATEMENT — [Feature Name]
[One paragraph, 3-6 sentences. Plain language. Specific to this build.
Contains: MVP definition, user outcome, any exceptions to Universal Intent Profile, anti-goal.]
```

### Step 0d — Prepend to PRD

Prepend the Intent Statement to the top of the PRD, above all other content, before passing it to Phase 2 Task Breakdown. Every agent that receives the PRD will see the Intent Statement first.

---

## Phase 0.5: PRD Validation

After Phase 0 (Intent Interview) completes and the Intent Statement is prepended to the PRD. Before Phase 1 (Preflight). **Always — there is no skip condition.**

### What Main Claude Does

Read the entire PRD step by step. For each step, run all 5 checks below. Every check that applies must pass. If any check fails, flag it.

---

### Validation Checklist

**Check 1 — Specificity**
Is the step specific enough that two different Claude instances would do the same thing?

- Fail signal: "research this area", "look into X", "gather examples", "explore options"
- Pass signal: "run `grep -rn 'pattern' ./src`", "search YouTube for 'Next.js streaming SSE' and paste the top 3 video titles here"
- If no → flag as VAGUE

**Check 2 — Confirmation Gate (tool-dependent steps)**
If the step requires a tool call (web search, shell command, file read, API call) — does it specify the exact action AND require Claude to paste verifiable output before proceeding?

- Fail signal: step ends after describing what to do, no output requirement
- Pass signal: step ends with "Confirm before proceeding: Run: [exact command]. Expected output: [what to paste]."
- If no → flag as MISSING GATE

**Check 3 — Output Format (steps that feed the next step)**
If this step produces output that the next step depends on — is the expected output format specified?

- Fail signal: "research X and use the findings in step 3" with no format for the findings
- Pass signal: "produce a bullet list of 3-5 video titles with URLs; step 3 will select one"
- If no → flag as MISSING FORMAT

**Check 4 — Research Completeness**
If the step involves research — does it specify WHERE to search, WHAT to search for, and WHAT OUTPUT proves it ran?

- Fail signal: "research best practices for X"
- Pass signal: "search YouTube for 'X tutorial 2025', paste the titles of the top 3 results, identify which technique each uses"
- If no → flag as UNDERSPECIFIED RESEARCH

**Check 5 — Gameable**
Can this step be satisfied by Claude writing a sentence about what it would do, rather than actually doing it?

- Fail signal: any research, check, or verification step without a required paste/output
- Pass signal: step requires Claude to include actual output (command result, URL list, file content excerpt) in the response before continuing
- If yes (can be gamed) → flag as GAMEABLE

---

### Confirmation Gate Format

Add this block to any step that fails Check 2. Place it at the end of the step, indented under the step description:

```
Confirm before proceeding to next step:
Run: [exact command or action — no paraphrase allowed]
Expected output: [what Claude must paste here before continuing]
Do not proceed without this output.
```

For web searches, "Run" is the exact search query. "Expected output" is the list of titles, URLs, or facts that prove the search ran.

For shell commands, "Run" is the full command including path. "Expected output" is the terminal result (line numbers, file paths, or specific text).

---

### What Happens If Validation Fails

1. Main Claude lists every flagged step with: step number, check that failed, and the specific failure reason
2. For each flag, Main Claude proposes the minimum revision to fix it (usually: add the confirmation gate block, or rewrite the step with exact tool syntax)
3. Main Claude presents the full list to Derek as:

```
PRD Validation — [PRD name]

FLAGGED STEPS:
Step [N]: [failure reason]
  Proposed fix: [minimum revision]

Step [N]: [failure reason]
  Proposed fix: [minimum revision]

Approve revised PRD / Modify proposals / Proceed with original as-is?
```

4. Main Claude does NOT spawn Task Breakdown until Derek responds with explicit approval
5. If Derek says "proceed with original as-is" — that is valid. Main Claude proceeds. Derek owns that decision.

---

### What Happens If Validation Passes

If all checks pass for every step — note it in one line: "PRD Validation: PASSED — all steps are specific, gated, and unambiguous." Then immediately proceed to Phase 1 (Preflight). Do not belabor it.

---

## Phase 1: Preflight

Before spawning any agents, verify:

1. **Target directory exists** (or create it)
2. **package.json exists** (for npm projects)
3. **PRD is available** (user provides path or content)
4. **Git pre-push hook configured** (prevents "local passes, Vercel fails"):
   ```bash
   cd advisor-team-mvp
   git config core.hooksPath scripts
   ```
   This ensures every push runs Vercel's exact build command first.

5. **Dev server environment ready:**
   ```bash
   # Check if something is on port 3000
   netstat -ano | findstr :3000

   # If wrong process, kill it
   taskkill //F //PID [pid]

   # Start dev server (use full path on Windows)
   "C:/Program Files/nodejs/npm.cmd" run dev

   # Verify server responds
   curl http://localhost:3000
   ```

6. **Dev server logs are your PRIMARY debug resource:**
   - Start server: `cd advisor-team-mvp && 1dev.bat` (logs to `logs/` directory)
   - Terminal output shows EVERY LED breadcrumb fired in real-time
   - Format: `[component] LED_NAME { data }` or `FAIL LED_NAME Error: message`
   - When debugging: READ THE TERMINAL FIRST before exploring code
   - Log files in `logs/` directory persist across server restarts
   - Use `tail -f logs/dev.log` to watch live output
   - Console shows request/response flow, image generation, sandbox creation,
     streaming events, and all error chains with full context

If preflight fails, tell user what's missing. Don't proceed.

---

## Phase 2: Task Breakdown

Spawn Task Breakdown agent:

```
Task({
  description: "Task Breakdown: [feature name]",
  prompt: `
    UNIVERSAL INTENT PROFILE:
    [Read and inject contents of .claude/workflows/universal-intent-profile.md]

    INTENT STATEMENT:
    [The Intent Statement from Phase 0, or "Phase 0 skipped — Universal Intent Profile applies"]

    PRD Content:
    [paste PRD here — with Intent Statement prepended if Phase 0 ran]

    Break this into atomic, testable tasks.
    Each task should have:
    - Clear acceptance criteria
    - Files likely affected
    - Estimated complexity (S/M/L)
    - ProcessTrail definition for multi-step operations (expected steps and outputs)
  `,
  subagent_type: "task-breakdown",
  model: "haiku"
})
```

Wait for result. Parse the task list.

---

## Phase 2.5: Impact Assessment

Before presenting tasks for approval, run an impact assessment on the FULL set of proposed changes.

Spawn an Explore agent:

```
Task({
  description: "Impact Assessment: [feature name]",
  prompt: `
    We are about to implement these changes:
    [paste task breakdown here]

    Perform a FULL IMPACT ASSESSMENT. For each task, trace:

    1. DIRECT DEPENDENCIES
       - What files import/use the code being changed?
       - What components render the affected components?
       - What API routes call the affected functions?

    2. DATA FLOW
       - If DB schema changes: what queries, API routes, and frontend code read/write these columns?
       - If API response changes: what frontend code consumes this response?
       - If props change: what parent components pass these props?

    3. SYSTEM PROMPT IMPACT
       - If advisor behavior changes: which prompt files reference this behavior?
       - Does context.ts inject anything related?
       - Do spontaneous image or sandbox systems depend on this?

    4. STATE & PERSISTENCE
       - What state management (React state, localStorage, Clerk metadata, Supabase) is affected?
       - Are there caching layers that need invalidation?

    5. CROSS-CUTTING CONCERNS
       - LED breadcrumbs that reference affected code paths
       - Error handling that may need updating
       - TypeScript types/interfaces that need changes

    Return a COMPLETE list of every file that may need changes,
    grouped by task. Flag any risks or conflicts between tasks.
  `,
  subagent_type: "Explore"
})
```

Present the impact assessment alongside the task list in Phase 3 (Human Approval).
If impact assessment reveals tasks are missing, add them before seeking approval.

---

## Phase 3: Human Approval

**Do NOT proceed without explicit approval.**

Present to user:
```
Based on the PRD, here are the tasks:

1. [Task name] - [acceptance criteria]
2. [Task name] - [acceptance criteria]
...

Impact Assessment Summary:
- Files affected: [list from Phase 2.5]
- Risks/conflicts identified: [any from Phase 2.5]
- Additional tasks needed: [any discovered by impact assessment]

Approve / Adjust / Cancel?
```

- **Approve**: Continue to Phase 4
- **Adjust**: Incorporate feedback, re-present
- **Cancel**: Stop workflow

---

## Phase 4: Test-First Development Loop

For EACH task (one at a time):

### 4a. Define Acceptance Criteria + Chrome MCP Test Steps

**MANDATORY — DO NOT SKIP.** Development does not begin until the test spec exists.

```
Task({
  description: "Test spec: [task name]",
  prompt: `
    UNIVERSAL INTENT PROFILE:
    [Read and inject contents of .claude/workflows/universal-intent-profile.md]

    INTENT STATEMENT:
    [The Intent Statement from Phase 0, or "Phase 0 skipped — Universal Intent Profile applies"]

    Task: [task description]
    Acceptance Criteria: [criteria]

    PRD Features being implemented:
    [List every feature described in the PRD that this task delivers]

    Define acceptance criteria as Chrome MCP browser automation test steps.
    The Quality agent will execute these steps via Chrome MCP (NOT Playwright).

    CRITICAL RULE: Every feature described in the PRD must map to at least one
    end-to-end test that walks the complete user journey — from the user action
    that triggers the feature to the visible outcome the user sees.

    Surface-level DOM checks (button exists, modal opens) are NOT sufficient on
    their own. If the PRD says a user can DO something, the test must verify
    that thing actually works, not just that the UI element for it is present.

    For each feature, specify:
    - The user action that triggers it (click, type, navigate)
    - The Chrome MCP tool calls to perform it
    - The visible outcome that proves it worked (not just "element exists")
    - Screenshots to capture as evidence

    Example — WRONG (surface check only):
    1. find({ query: "My Images button" }) → PASS if button exists

    Example — RIGHT (end-to-end):
    1. Click "My Images" button
    2. Click a painting thumbnail in the modal
    3. Verify modal closes
    4. Verify pending image thumbnail appears near chat input
    5. Send a message — verify image is included in the request
  `,
  subagent_type: "test-agent",
  model: "sonnet"
})
```

### 4b. Development (with retry logic)

```
retry_count = 0
research_findings = null
previous_failure = null

while retry_count < 3:
  retry_count++

  # At retry 2, proactively get research help (if not already done via RESEARCH_NEEDED)
  if retry_count == 2 && !research_findings:
    research_findings = Task({
      description: "Research: [task name]",
      prompt: `
        UNIVERSAL INTENT PROFILE:
        [Read and inject contents of .claude/workflows/universal-intent-profile.md]

        INTENT STATEMENT:
        [The Intent Statement from Phase 0, or "Phase 0 skipped — Universal Intent Profile applies"]

        Find proven solutions for: ${previous_failure}
      `,
      subagent_type: "research",
      model: "sonnet"
    })

  # Developer implements
  developer_result = Task({
    description: "Implement: [task name]",
    prompt: `
      UNIVERSAL INTENT PROFILE:
      [Read and inject contents of .claude/workflows/universal-intent-profile.md]

      INTENT STATEMENT:
      [The Intent Statement from Phase 0, or "Phase 0 skipped — Universal Intent Profile applies"]

      Task: [description]
      Test Spec: [spec from 4a]
      ${previous_failure ? "Previous failure: " + previous_failure : ""}
      ${research_findings ? "Research findings: " + research_findings : ""}

      DEBUGGING: Before investigating code, ALWAYS check the dev server terminal output.
      The server logs every LED breadcrumb with full context data.
      Run: tail -100 logs/dev.log | grep -i "error\|fail\|warn"
      This will show you exactly what happened, in what order, with what data.

      Implement code to pass the test.
      All multi-step operations MUST use ProcessTrail (import from lib/led-processes.ts).
      All API/DB/external service calls MUST include trail.light()/trail.fail() LEDs.

      MANDATORY: Run FULL build with cache clearing:
      rm -rf .next node_modules/.cache && npx tsc --noEmit && "C:/Program Files/nodejs/npm.cmd" run build 2>&1 | tail -50

      If build fails (especially tsc errors), fix before returning.
      Do NOT claim "build passes" without showing actual output.
    `,
    subagent_type: "developer",
    model: "sonnet"
  })

  # Check Developer result first
  if developer_result.status == "RESEARCH_NEEDED":
    # Developer needs more specific research
    research_findings = Task({
      description: "Research: [developer's research query]",
      prompt: `
        UNIVERSAL INTENT PROFILE:
        [Read and inject contents of .claude/workflows/universal-intent-profile.md]

        INTENT STATEMENT:
        [The Intent Statement from Phase 0, or "Phase 0 skipped — Universal Intent Profile applies"]

        ${developer_result.research_query}
      `,
      subagent_type: "research",
      model: "sonnet"
    })
    # Don't count this as a retry - developer hasn't tried with research yet
    retry_count--
    continue  # Loop back, developer will get research_findings on next iteration

  # Quality verifies using Chrome MCP browser automation
  Task({
    description: "Verify: [task name]",
    prompt: `
      UNIVERSAL INTENT PROFILE:
      [Read and inject contents of .claude/workflows/universal-intent-profile.md]

      INTENT STATEMENT:
      [The Intent Statement from Phase 0, or "Phase 0 skipped — Universal Intent Profile applies"]

      Test Spec: [spec — Chrome MCP test steps from 4a]
      Developer Output: [code changes]

      Execute the Chrome MCP test steps against http://localhost:3000.
      Use browser automation tools (navigate, read_page, find, javascript_tool,
      read_console_messages, screenshots) to verify each acceptance criterion.

      Also verify LED coverage: forward trace (every ProcessTrail step has a corresponding LED)
      and backward trace (every DB write/API response traces to a named process).

      Check dev server logs for errors: tail -50 logs/dev.log | grep -i "error\|fail"

      Return: APPROVED / NEEDS_FIX / ESCALATE
    `,
    subagent_type: "quality",
    model: "haiku"
  })

  if verdict == "APPROVED":
    break  # Move to next task

  if verdict == "ESCALATE":
    # Stop and tell user
    return ESCALATE with full context

  # NEEDS_FIX - capture failure details for next iteration
  previous_failure = quality_result.failure_details
  # Loop continues to next retry

# If 3 retries exhausted
if retry_count >= 3:
  return ESCALATE
```

### 4c. Commit, Push, and Smoke Test

After task is APPROVED:

```
# 1. Commit the changes
git add [changed files]
git commit -m "Phase [N]: [task description]"

# 2. Push to trigger Vercel deployment
git push origin main

# 3. MANDATORY: Run Smoke Test (Tier 1) using Chrome MCP
Task({
  description: "Smoke test: deployment check",
  prompt: `
    UNIVERSAL INTENT PROFILE:
    [Read and inject contents of .claude/workflows/universal-intent-profile.md]

    A push just happened. Run the smoke test to verify Vercel deployment succeeded.

    Using Chrome MCP browser automation:
    1. Wait 45-60 seconds for deployment
    2. Get tab context: mcp__claude-in-chrome__tabs_context_mcp
    3. Create new tab: mcp__claude-in-chrome__tabs_create_mcp
    4. Navigate to https://hivemindai.org/dashboard
    5. Read page and take screenshot to verify it loads (not 404 or 500)
    6. Check console for errors: read_console_messages with pattern "error|Error|500|404"

    Return: DEPLOYED / DEPLOY_FAILED

    If DEPLOY_FAILED:
    - Run full local build: rm -rf .next node_modules/.cache && npx tsc --noEmit && npm run build
    - Report the error
  `,
  subagent_type: "quality",
  model: "haiku"
})

if smoke_test == "DEPLOY_FAILED":
  # Fix the build error before continuing
  # This counts as a failure - loop back to developer
  previous_failure = "Vercel deployment failed: " + smoke_test.error
  continue  # Back to retry loop
```

### 4d. Move to Next Task

After smoke test passes, move to next task in the list.
Repeat 4a-4c until all tasks complete.

---

## Phase 5: Final Deployment Verification (Tier 2)

**All tasks are APPROVED. Now verify the COMPLETE feature works on production.**

```
# Run the Deployment Verification Test
Task({
  description: "Final deployment verification",
  prompt: `
    UNIVERSAL INTENT PROFILE:
    [Read and inject contents of .claude/workflows/universal-intent-profile.md]

    ALL PHASES COMPLETE. Run the Deployment Verification Test (Tier 2).

    Using Chrome MCP browser automation:
    1. Get tab context: mcp__claude-in-chrome__tabs_context_mcp
    2. Create new tab: mcp__claude-in-chrome__tabs_create_mcp
    3. Navigate to https://hivemindai.org/dashboard
    4. Verify page loads (read_page, take screenshot)
    5. Test the NEW endpoint: /api/[feature-endpoint] via javascript_tool
    6. Verify it returns 200 with valid JSON (not HTML error)
    7. Check console for errors: read_console_messages with pattern "error|Error"

    This is the FINAL gate. Do not return APPROVED unless production works.

    Return: APPROVED / DEPLOY_FAILED
  `,
  subagent_type: "quality",
  model: "sonnet"
})

if verdict == "DEPLOY_FAILED":
  # Something works locally but not on production
  # Debug and fix
  return ESCALATE with "Production verification failed"
```

---

## Phase 6: Summary

All tasks complete AND production verified. Report to user:

```
All [N] tasks implemented and verified.

Tasks Completed:
1. [Task name] - APPROVED
2. [Task name] - APPROVED
...

Files Changed:
- path/to/file1.ts
- path/to/file2.tsx

Smoke Tests: All passed (after each push)
Final Deployment Test: PASSED
Production Status: VERIFIED WORKING

LED Coverage Delta:
- New ProcessTrail processes added: [count]
- New LED breadcrumbs added: [count]
- Forward trace: [PASS/gaps found]
- Backward trace: [PASS/gaps found]

Feature is LIVE at: https://hivemindai.org/[feature-url]
```

---

## Developer Status Handling

Developer agent can return these statuses:

| Status | Main Claude Action |
|--------|-------------------|
| **PASSED** | Proceed to Quality verification |
| **FAILED** | Increment retry, loop back with error context |
| **RESEARCH_NEEDED** | Spawn Research Agent with provided query, re-invoke Developer with findings (don't increment retry) |
| **ESCALATING** | Stop and report to user |

---

## ESCALATE Protocol

When something can't be resolved after 3 retries:

1. **Stop immediately** - Don't keep trying
2. **Report full context**:
   - What task failed
   - What was tried (all 3 attempts)
   - What errors occurred
   - What research found (if any)
3. **Ask user** how to proceed
4. **Include dev server log excerpt** - The last 50 lines of terminal output
   around the time of failure. This contains LED breadcrumb data showing
   the exact code path that failed.

User may:
- Provide guidance to continue
- Modify the approach
- Skip the task
- Cancel the workflow

---

## Worker Agents Reference

| Agent | Purpose | Model |
|-------|---------|-------|
| task-breakdown | Split PRD into atomic tasks | haiku |
| test-agent | Define acceptance criteria + Chrome MCP test steps | sonnet |
| developer | Implement code to pass tests | sonnet |
| quality | Execute Chrome MCP tests, verify implementation | haiku |
| research | Find proven solutions when stuck | sonnet |

All agents are in `.claude/agents/`.

---

## Testing with Chrome MCP (Browser Automation)

All browser testing uses Claude's Chrome MCP extension tools, NOT Playwright.
The Chrome extension gives Claude direct browser control including:
- Navigation, clicking, typing, screenshots
- Reading page accessibility trees and finding elements
- Executing JavaScript in page context
- Reading console logs and network requests

### Dev Testing (localhost:3000)
1. Ensure dev server is running (see Preflight)
2. Get tab context: `mcp__claude-in-chrome__tabs_context_mcp`
3. Create new tab: `mcp__claude-in-chrome__tabs_create_mcp`
4. Navigate: `mcp__claude-in-chrome__navigate({ url: "http://localhost:3000/dashboard", tabId })`
5. Verify page: `mcp__claude-in-chrome__read_page({ tabId })`
6. Take screenshot: `mcp__claude-in-chrome__computer({ action: "screenshot", tabId })`
7. Check console for errors: `mcp__claude-in-chrome__read_console_messages({ tabId, pattern: "error|Error" })`

### Production Verification (after push)
Same flow but navigate to `https://hivemindai.org/dashboard`.
Wait 45-60 seconds after push before testing.

### API Endpoint Testing
Use JavaScript execution to test API routes:
```
mcp__claude-in-chrome__javascript_tool({
  action: "javascript_exec",
  tabId,
  text: `
    const r = await fetch('/api/[endpoint]');
    JSON.stringify({ status: r.status, data: await r.json() })
  `
})
```

---

## Key Constraints

1. **One task at a time** - Don't parallelize the dev loop
2. **Human approval required** - Before development starts
3. **Max 3 retries** - Then escalate
4. **Research at retry 2** - Not retry 1, not retry 3
5. **Main Claude orchestrates** - Agents do the work
6. **BUILD MUST PASS BEFORE COMMIT** - See below

---

## Mandatory Git Verification Before User Testing

**NEVER tell user "ready to test" without verifying code is deployed.**

Before declaring work complete or asking user to test:

```bash
# Check for uncommitted changes
git status --short

# If changes exist, they are NOT deployed
# Commit and push before telling user to test
```

**If `git status` shows modified files:**
- DO NOT tell user to test
- Commit the changes first
- Push to trigger deployment
- Wait for deployment to complete
- THEN tell user to test

**Why this matters:**
- Developer agents may claim "pushed" without actually pushing
- User testing against old code wastes their time
- Discovered 2026-02-02: Told user to test when code wasn't pushed

---

## Mandatory Build Verification

**NEVER commit or push code without verifying the build passes.**

After Developer agent returns, Main Claude MUST run the FULL build verification command:

```bash
# Main Claude runs this - replicates Vercel's clean build
cd advisor-team-mvp && rm -rf .next node_modules/.cache && npx tsc --noEmit && npm run build && echo "BUILD SUCCESS" || echo "BUILD FAILED"
```

**Why this exact command:**
- `rm -rf .next node_modules/.cache` - Clears ALL local caches that mask TypeScript errors
- `npx tsc --noEmit` - Runs TypeScript compiler SEPARATELY (catches errors local build misses)
- `npm run build` - Final Next.js build verification

**Why ALL THREE steps are required:**
- `npm run build` alone uses cached TypeScript compilation
- Local cache hides type errors that Vercel catches on clean builds
- Discovered 2026-02-03: 8+ commits failed on Vercel after passing local `npm run build`
- Root cause: TypeScript caching in `.next/` and `node_modules/.cache/`

**If build fails:**
- DO NOT commit
- DO NOT push
- Fix the error or send back to Developer agent
- This counts as a retry

**If build passes:**
- Commit the changes
- Push to trigger deployment
- Continue to Quality verification

**Safety Net: Pre-push Git Hook**

Even if Main Claude forgets to run the build, the pre-push hook will catch it:
- Hook location: `advisor-team-mvp/scripts/pre-push`
- Configured via: `git config core.hooksPath scripts`
- Runs Vercel's exact build before allowing push
- BLOCKS push if build fails

**Why this matters:**
- Developer agents may claim "build passes" without actually verifying
- Agent output may be truncated or misleading
- Local cache can mask TypeScript errors that Vercel catches
- Pre-push hook is the last line of defense
- Discovered 2026-02-02: Pushed code with syntax error because Main Claude didn't run build directly

---

## Post-Deployment Verification (MANDATORY)

**After EVERY push, Main Claude MUST verify the deployment works.**

Local build passing is NOT enough. Vercel can still fail. This workflow catches deployment failures automatically.

### Step 1: Wait for Deployment
```bash
# Wait ~45-60 seconds for Vercel to deploy
```

### Step 2: Test the Affected Endpoint
Use Chrome MCP browser automation to hit the production endpoint:

```
1. Get tab context: mcp__claude-in-chrome__tabs_context_mcp
2. Create new tab: mcp__claude-in-chrome__tabs_create_mcp
3. Navigate: mcp__claude-in-chrome__navigate({ url: "https://hivemindai.org/dashboard", tabId })
4. Wait for load: mcp__claude-in-chrome__computer({ action: "wait", duration: 5, tabId })
5. Verify page: mcp__claude-in-chrome__read_page({ tabId })
6. Test API endpoint:
   mcp__claude-in-chrome__javascript_tool({
     action: "javascript_exec",
     tabId,
     text: `
       const r = await fetch('/api/[endpoint]');
       JSON.stringify({ status: r.status, data: await r.json() })
     `
   })
7. Check for errors: mcp__claude-in-chrome__read_console_messages({ tabId, pattern: "error|Error" })
```

### Step 3: Interpret Results

| Result | Meaning | Action |
|--------|---------|--------|
| **200 + valid JSON** | Deployment succeeded | Done |
| **404** | Deployment failed (old version served) | Go to Step 4 |
| **500 + error message** | Code deployed but runtime error | Fix the error |

### Step 4: If Deployment Failed (404)

**The push succeeded but Vercel build failed.** Debug:

```bash
# Run FULL build locally with cache clearing
cd advisor-team-mvp
rm -rf .next node_modules/.cache
npx tsc --noEmit
npm run build
```

**If build fails locally:**
1. Read the TypeScript error message
2. Fix the error
3. Re-run build to verify
4. Commit and push the fix
5. Return to Step 1

**Common causes of "local passes, Vercel fails":**
- TypeScript caching (why we clear `.next` and `node_modules/.cache`)
- Missing `npx tsc --noEmit` before `npm run build`
- Invalid type properties (like FailContext errors)

### Step 5: Verify Fix Deployed

After pushing a fix:
1. Wait for deployment (~45 seconds)
2. Re-test the endpoint
3. Confirm 200 status
4. Only THEN report "deployment complete" to user

### Example: What This Catches

On 2026-02-03, `/api/user-topics` returned 404 after push:
- Code was committed and pushed ✓
- Local `npm run build` had passed ✓
- But Vercel build failed due to TypeScript error
- Error: `'reason' does not exist in type 'FailContext'`
- Fix: Changed to valid FailContext properties
- Re-pushed, re-verified, endpoint returned 200

**Without this workflow:** User discovers broken feature days later.
**With this workflow:** Fixed automatically within minutes.

---

## Memory Conservation

This workflow conserves Main Claude's context because:
- Agent work happens in separate contexts
- Agents return summaries, not full transcripts
- Main Claude only holds the workflow state

If context gets tight, Main Claude can:
- Summarize completed tasks
- Clear intermediate details
- Keep only current task + overall status

---

*This workflow replaces the old project-manager agent (which crashed due to nested spawning).*
*Documented 2026-01-30 after discovering subagents cannot spawn subagents.*
