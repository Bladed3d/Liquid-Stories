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
4. **Dev server environment ready:**
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

while retry_count < 3:
  retry_count++

  # At retry 2, get research help
  if retry_count == 2:
    Task({
      description: "Research: [task name]",
      prompt: "Find proven solutions for [problem]",
      subagent_type: "research",
      model: "sonnet"
    })

  # Developer implements
  Task({
    description: "Implement: [task name]",
    prompt: `
      Task: [description]
      Test Spec: [spec from 4a]
      ${retry_count > 1 ? "Previous failure: [error]" : ""}
      ${retry_count >= 2 ? "Research findings: [research]" : ""}

      Implement code to pass the test.

      MANDATORY: Run build and show output:
      "C:/Program Files/nodejs/npm.cmd" run build 2>&1 | tail -20

      If build fails, fix errors before returning.
      Do NOT claim "build passes" without showing actual output.
    `,
    subagent_type: "developer",
    model: "sonnet"
  })

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

## Mandatory Build Verification

**NEVER commit or push code without verifying the build passes.**

After Developer agent returns, Main Claude MUST:

```bash
# Run build and capture output
"C:/Program Files/nodejs/npm.cmd" run build 2>&1 | tail -30

# Check exit code
echo $?
```

**If build fails:**
- DO NOT commit
- DO NOT push
- Send error back to Developer agent for fix
- This counts as a retry

**If build passes:**
- Commit the changes
- Push to feature branch
- Continue to Quality verification

**Why this matters:**
- Developer agents may claim "build passes" without actually verifying
- Vercel will reject broken code anyway - catch it locally first
- Saves time and avoids broken preview deployments

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
