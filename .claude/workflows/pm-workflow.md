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

## Phase 0: Intent Capture

Read the PRD or Derek's description. Proceed immediately to Phase 0.5.

No questions. No interview. The PRD defines the intent. If there is no PRD, Derek's description is sufficient — proceed with what you have.

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

**Check 6 — UI Layout Specificity (UI tasks only)**
If the step renders a new or modified UI element — is its spatial position unambiguous?

- Fail signal: "show a card on the home screen", "add a button to settings" — no spatial context
- Pass signal: specifies (a) which named section/component it appears inside or adjacent to, (b) what it replaces or coexists with, (c) both conditional states if rendering is conditional (what shows when true, what shows when false)
- If no → flag as MISSING LAYOUT SPEC

> Why this check exists: "build passes" cannot detect a misplaced component. A card rendered above the hero image vs. below the tagline produces zero TypeScript errors and a clean build. Only a screenshot catches it — and screenshots happen at the end. Catching layout ambiguity in the PRD prevents rework after all code is written.

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

## Phase 0.6: Qwen3 Feature Gap Analysis

**Runs after Phase 0.5 passes. Before Phase 1. Always — no skip condition.**

This is a separate AI model (Qwen3-Coder-30B-A3B-Thinking) running locally that validates feature completeness — not document quality. It catches missing test scenarios, edge cases, user flows, and technical dependencies that the dev team and Claude both missed.

### Step 1 — Check Qwen3 is running

```bash
curl -s http://127.0.0.1:8080/health
```

- `{"status":"ok"}` → proceed
- Not running → **STOP. Tell Derek:** "Qwen3 PRD Validator is not running. Start it with `1Qwen3-PRD.bat`, then continue." Do NOT proceed to Phase 1 without it.

### Step 2 — Run the validator

```bash
python D:/Projects/Ai/Liquid-Stories/qwen3-prd-api.py "[path to PRD file]"
```

This takes 60-120 seconds. Tell Derek: "Running Qwen3 feature gap analysis..." and wait.

If no PRD file exists (PRD was pasted inline), write the PRD to a temp file first:
```bash
# Write inline PRD to temp file
echo "[PRD content]" > /tmp/prd-validate-temp.md
python D:/Projects/Ai/Liquid-Stories/qwen3-prd-api.py /tmp/prd-validate-temp.md
```

### Step 3 — Present gap checklist to Derek

Show the full output. Then ask:

```
Qwen3 Gap Analysis — [PRD name]

[output from validator]

HIGH priority gaps are blockers. How would you like to proceed?
- Address gaps now (update the PRD, then re-run)
- Accept and proceed (you own that decision)
- Skip specific items (tell me which)
```

### Step 4 — Do NOT proceed to Phase 1 until Derek responds

Derek decides which gaps to address. Main Claude updates the PRD accordingly, then proceeds.

If Derek says "proceed as-is" — that is valid. Note it and continue.

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

## Phase 2.6: Qwen3 Task List Validation

**Runs after Phase 2 (Task Breakdown). Before Phase 2.5 (Impact Assessment). Always — no skip condition.**

Qwen3 validates that the task list actually delivers the full feature — not just that the code compiles. It catches missing files and missing user journey steps before a single line of code is written.

### Step 1 — Check Qwen3 is running

```bash
curl -s http://127.0.0.1:8080/health
```

- `{"status":"ok"}` → proceed
- Not running → **STOP. Tell Derek:** "Qwen3 is not running. Start it with `1Qwen3-PRD.bat`, then continue."

### Step 2 — Write validation input to temp file

```bash
python -c "
content = '''
PRD (User Experience):
[Full PRD content including Intent Statement]

Task Breakdown Agent Answers:
Files touched: [from Question 1]
User journey steps: [from Question 2]
Step-to-task mapping: [from Question 3]

Task List:
[Full task list from Phase 2]

---
Your job: Cross-reference the task list against the PRD user journey.
For every step the user experiences, verify a task delivers it.
For every file named as required, verify a task creates or modifies it.
Name any gap explicitly: what step or file has no corresponding task?
---
'''
with open('D:/Projects/Ai/Liquid-Stories/.temp-tasklist-validate.md', 'w') as f:
    f.write(content)
print('Written')
"
```

### Step 3 — Run validation

Tell Derek: "Running Qwen3 task list validation..." and wait.

```bash
python D:/Projects/Ai/Liquid-Stories/qwen3-prd-api.py "D:/Projects/Ai/Liquid-Stories/.temp-tasklist-validate.md" > "D:/Projects/Ai/Liquid-Stories/.temp-tasklist-round1.txt" 2>&1
```

Read the output:
```
Read: D:/Projects/Ai/Liquid-Stories/.temp-tasklist-round1.txt
```

### Step 4 — Present findings to Derek

```
Qwen3 Task List Validation — [Feature name]

[Qwen3 output]

Any named gap is a missing task. How would you like to proceed?
- Add missing tasks (update task list, then continue to Phase 2.5)
- Accept and proceed (you own that decision)
- Skip specific items (tell me which)
```

**Do NOT proceed to Phase 2.5 until Derek responds.**

If gaps are addressed: update task list, note changes, proceed.
If Derek accepts as-is: note it and proceed.

### Step 5 — Cleanup

```bash
python -c "
import os
for f in ['.temp-tasklist-validate.md', '.temp-tasklist-round1.txt']:
    path = 'D:/Projects/Ai/Liquid-Stories/' + f
    if os.path.exists(path): os.remove(path)
"
```

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

    VISUAL LAYOUT VERIFICATION (mandatory for any task that renders new or changed UI):
    For UI tasks, the test spec MUST include these steps:
    1. Take a screenshot of the page BEFORE the feature is active
    2. Trigger the feature (navigate, set state, complete action)
    3. Take a screenshot AFTER
    4. Quality must write a layout description: "The [component] appears at [location], adjacent to [what], replacing [what if applicable]"
    5. That description must match what the PRD specified

    APPROVED is not valid for UI tasks based on DOM checks alone.
    A screenshot showing the actual rendered layout is required evidence.
    If the screenshot does not match the PRD's spatial description → NEEDS_FIX.
  `,
  subagent_type: "test-agent",
  model: "sonnet"
})
```

### 4b. Design Review (Qwen3)

**Before any code is written.** Developer proposes the implementation approach. Qwen3 reviews it for anti-patterns and wrong turns.

#### Step 1 — Developer proposes design (no code)

```
Task({
  description: "Design proposal: [task name]",
  prompt: `
    Task: [task description]
    Test Spec: [spec from 4a]
    PRD context: [relevant PRD section]

    DO NOT write any code.

    Write a design proposal (1-3 paragraphs):
    - What approach you plan to use and why
    - Which files you will create or modify
    - Any patterns or conventions you are following
    - Any alternatives you considered and why you rejected them

    Return ONLY the design proposal. No code.
  `,
  subagent_type: "developer",
  model: "sonnet"
})
```

#### Step 2 — Qwen3 reviews the design

Write a temp file and run:

```bash
python D:/Projects/Ai/Liquid-Stories/qwen3-prd-api.py ".temp-design-review.md"
```

Temp file contents:
```
PRD (intended feature):
[Relevant PRD section]

Proposed implementation design:
[Design proposal from Step 1]

Your job: Review this design.
- Is this the right approach for what the PRD describes?
- Are there anti-patterns, shortcuts, or architectural mistakes?
- Does this approach have side effects or introduce technical debt?
- Is there a cleaner or more correct way to implement this?

Name any problems explicitly. If the design is sound, say so in one line.
```

#### Step 3 — Gate

If Qwen3 finds no issues: note it in one line and proceed immediately to 4c.

If Qwen3 flags a problem, present to Derek:
```
Design Review — [task name]

Proposed approach: [one-line summary]
Qwen3 flagged: [exact finding]

How would you like to proceed?
- Revise the approach (describe preferred direction)
- Accept and proceed (you own that decision)
```

Do NOT proceed to 4c until Derek responds.

---

### 4c. Development (with retry logic)

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

      Check dev server logs for errors: tail -50 advisor-team-mvp/logs/current.log | grep -i "error\|fail"

      Return: APPROVED / NEEDS_FIX / ESCALATE
    `,
    subagent_type: "quality",
    model: "haiku"
  })

  if verdict == "APPROVED":
    # Quality approved — now Qwen3 must validate the log before commit is allowed
    # See Phase 4d below
    break

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

### 4d. Qwen3 Log Validation (MANDATORY — replaces push gate)

**Quality APPROVED is not enough. Qwen3 must independently confirm the log proves the feature ran.**

This is the step that cannot be skipped, faked, or shortcut. Qwen3 is a separate process — it reads the actual server log and either confirms the feature ran or it doesn't.

#### Step 1 — Check Qwen3 is running

```bash
curl -s http://127.0.0.1:8080/health
```

- `{"status":"ok"}` → proceed
- Not running → **STOP. Tell Derek:** "Qwen3 is not running. Start it with `1Qwen3-PRD.bat`, then continue." Do NOT commit without it.

#### Step 2 — Write validation input

Write a temp file at `D:/Projects/Ai/Liquid-Stories/.temp-log-validate.md`:

```
Feature being validated: [task name]
PRD acceptance criteria:
[paste the acceptance criteria from Phase 4a]

Expected LED codes that must appear in log:
[list the specific LED codes defined for this feature — check lib/led-ranges.ts]

Expected HTTP endpoints and status codes:
[list API routes that should show 200 in the log]

Your job: Read the dev server log below and answer:
1. Did the feature's LED codes appear in sequence?
2. Did the expected endpoints return 200?
3. Are there any ERROR or FAIL lines in the relevant code path?
4. Does the log prove the feature ran end-to-end, or only that the page loaded?

Answer PASS or FAIL. If FAIL, state exactly what is missing or wrong.

--- LOG START ---
[paste last 200 lines of advisor-team-mvp/logs/current.log]
--- LOG END ---
```

To get the last 200 lines of the log:
```bash
tail -200 D:/Projects/Ai/Liquid-Stories/advisor-team-mvp/logs/current.log
```

#### Step 3 — Run Qwen3 validation

```bash
python D:/Projects/Ai/Liquid-Stories/qwen3-prd-api.py "D:/Projects/Ai/Liquid-Stories/.temp-log-validate.md"
```

Wait for result (60-120 seconds).

#### Step 4 — Gate on result

**If Qwen3 returns PASS:**
- Note it: "Qwen3 log validation: PASS — [task name]"
- Delete temp file: `D:/Projects/Ai/Liquid-Stories/.temp-log-validate.md`
- Proceed to Step 5 (commit)

**If Qwen3 returns FAIL:**
- Report to Derek exactly what Qwen3 said is missing
- Do NOT commit
- Send back to developer (counts as a retry in Phase 4c loop)
- Developer fixes, retests, Quality re-verifies, Qwen3 re-validates

**There is no override for a Qwen3 FAIL. Only Derek can say "skip this" and that decision is his to make explicitly.**

#### Step 5 — Commit only (NO push)

```bash
cd D:/Projects/Ai/Liquid-Stories/advisor-team-mvp
git add [changed files]
git commit -m "[task description]"
```

**DO NOT push.** Push is Derek's decision, made via `/git-push` when he is ready to deploy one or more commits to Vercel. The PM workflow ends at commit.

#### Step 6 — Cleanup

```bash
python -c "
import os
path = 'D:/Projects/Ai/Liquid-Stories/.temp-log-validate.md'
if os.path.exists(path): os.remove(path)
"
```

### 4e. Move to Next Task

After smoke test passes, move to next task in the list.
Repeat 4a-4e until all tasks complete.

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
