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

If preflight fails, tell user what's missing. Don't proceed.

---

## Phase 2: Task Breakdown

Spawn Task Breakdown agent:

```
Task({
  description: "Task Breakdown: [feature name]",
  prompt: `
    PRD Content:
    [paste PRD here]

    Break this into atomic, testable tasks.
    Each task should have:
    - Clear acceptance criteria
    - Files likely affected
    - Estimated complexity (S/M/L)
  `,
  subagent_type: "task-breakdown",
  model: "haiku"
})
```

Wait for result. Parse the task list.

---

## Phase 3: Human Approval

**Do NOT proceed without explicit approval.**

Present to user:
```
Based on the PRD, here are the tasks:

1. [Task name] - [acceptance criteria]
2. [Task name] - [acceptance criteria]
...

Approve / Adjust / Cancel?
```

- **Approve**: Continue to Phase 4
- **Adjust**: Incorporate feedback, re-present
- **Cancel**: Stop workflow

---

## Phase 4: Test-First Development Loop

For EACH task (one at a time):

### 4a. Create Test Spec

```
Task({
  description: "Test spec: [task name]",
  prompt: `
    Task: [task description]
    Acceptance Criteria: [criteria]

    Create a Playwright test specification.
    Include: selectors, assertions, setup/teardown.
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
      prompt: `Find proven solutions for: ${previous_failure}`,
      subagent_type: "research",
      model: "sonnet"
    })

  # Developer implements
  developer_result = Task({
    description: "Implement: [task name]",
    prompt: `
      Task: [description]
      Test Spec: [spec from 4a]
      ${previous_failure ? "Previous failure: " + previous_failure : ""}
      ${research_findings ? "Research findings: " + research_findings : ""}

      Implement code to pass the test.

      MANDATORY: Run build and show output:
      "C:/Program Files/nodejs/npm.cmd" run build 2>&1 | tail -20

      If build fails, fix errors before returning.
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
      prompt: developer_result.research_query,
      subagent_type: "research",
      model: "sonnet"
    })
    # Don't count this as a retry - developer hasn't tried with research yet
    retry_count--
    continue  # Loop back, developer will get research_findings on next iteration

  # Quality verifies
  Task({
    description: "Verify: [task name]",
    prompt: `
      Test Spec: [spec]
      Developer Output: [code changes]

      Run the Playwright test.
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

### 4c. Move to Next Task

After task is APPROVED, move to next task in the list.
Repeat 4a-4b until all tasks complete.

---

## Phase 5: Summary

All tasks complete. Report to user:

```
All [N] tasks implemented and verified.

Tasks Completed:
1. [Task name] - APPROVED
2. [Task name] - APPROVED
...

Files Changed:
- path/to/file1.ts
- path/to/file2.tsx

Test Results: All passing
Build Status: Success
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
| test-agent | Create Playwright test specs | sonnet |
| developer | Implement code to pass tests | sonnet |
| quality | Run tests, verify implementation | haiku |
| research | Find proven solutions when stuck | sonnet |

All agents are in `.claude/agents/`.

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

After Developer agent returns, Main Claude MUST run Vercel's EXACT build command (not just `npm run build`):

```bash
# Main Claude runs this - matches Vercel's build exactly
cd advisor-team-mvp && rm -rf .next && npm run build && echo "BUILD SUCCESS" || echo "BUILD FAILED"
```

**Why `rm -rf .next` first:**
- Vercel builds from scratch (no cache)
- Local cache can hide TypeScript errors
- This was discovered 2026-02-03 after multiple "local passes, Vercel fails" incidents

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
