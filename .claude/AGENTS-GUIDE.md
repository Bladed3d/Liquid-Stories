# Agent-Based Development Workflow

**Purpose**: Context-efficient development using specialized agents with built-in verification

---

## 🚀 Quick Start

To implement a task from taskmanager:

```
Use developer agent for task-XXX
```

**That's it.** The agents will guide you through the rest.

---

## 📋 The Agents

### Core Development Agents

### 1. Developer Agent (`.claude/agents/developer.md`)
**What it does**:
- Researches solution
- Writes code with LED breadcrumbs
- Writes Playwright tests
- Runs tests and provides RAW proof
- Returns structured report

**When to use**: Implementing any feature, bug fix, or code change from taskmanager

**Guard rails**:
- Max 30 minutes per task
- Max 5 test attempts
- After 3 E2E test failures → Auto-escalate to Test Strategy Agent

### 2. Quality Agent (`.claude/agents/quality.md`)
**What it does**:
- Verifies developer agent's work independently
- Re-runs tests without trusting developer's output
- Compares results and checks for mismatches
- Checks breadcrumb logs for LED errors
- Recommends: APPROVED | NEEDS_FIX | ESCALATE

**When to use**: After developer agent completes (usually automatic)

**Enhanced behavior**:
- If both developer + quality see same failures → Recommend strategy change (not just NEEDS_FIX)

---

### Specialized Problem-Solving Agents

### 3. Research Agent (`.claude/agents/research.md`)
**What it does**:
- Deep research into proven solutions (NOT implementation)
- Finds 3-5 viable approaches with pros/cons
- Recommends best approach with reasoning
- Checks existing codebase patterns

**When to use**:
- Before complex/unfamiliar tasks (proactive)
- After developer fails 2 times (reactive)
- User explicitly requests research

**Time limit**: 15 minutes

### 4. Debugger Agent (`.claude/agents/debugger.md`)
**What it does**:
- Analyzes LED breadcrumb logs
- Diagnoses root cause (NOT fixes)
- Distinguishes: Code bug vs Environment vs Test infrastructure
- Explains why previous fixes didn't work

**When to use**:
- Same error repeating 3+ times
- Developer tried multiple approaches but error persists
- Need diagnosis before next fix attempt

**Time limit**: 15 minutes

### 5. Test Strategy Agent (`.claude/agents/test-strategy.md`)
**What it does**:
- Analyzes why tests are failing
- Determines: Test problem vs Code problem
- Recommends alternative verification (unit tests, manual, code review)
- Provides concrete examples of recommended approach

**When to use**:
- E2E tests failing 3+ times
- Tests timing out repeatedly
- Test infrastructure blocking progress

**Time limit**: 10 minutes

### 6. Environment Agent (`.claude/agents/environment.md`)
**What it does**:
- Checks environment configuration
- Identifies mismatches between environments
- Verifies dependencies and versions
- Fixes .env, package.json, config issues

**When to use**:
- Tests pass locally but fail in CI (or vice versa)
- "Works on my machine" situations
- Missing dependencies or wrong versions
- API keys/environment variables issues

**Time limit**: 15 minutes

---

## 🔄 How It Works

### The Three-Phase Process

```
Phase 1: DEVELOPER AGENT
├─ Research → Code + LED → Test → Provide Proof
└─ Report to main Claude

Phase 2: QUALITY AGENT
├─ Re-run test independently
├─ Compare with developer's claim
└─ Report verification result

Phase 3: MAIN CLAUDE (You)
├─ Read both reports
├─ Spot-check evidence
└─ Approve to user (only after verification)
```

### User Experience

**User gives ONE command**:
```
Use developer agent for task-96
```

**Developer agent**:
- Does the work
- Tests it
- Reports with proof
- **Reminds you**: "Now launch quality agent"

**Quality agent**:
- Verifies independently
- Compares results
- Reports findings
- **Reminds you**: "Now spot-check and approve"

**You (main Claude)**:
- Read both reports
- Spot-check evidence
- Approve to user

**User sees**: "Task 96 completed, all tests pass, verified by quality agent"

---

## ✅ Why This Works

### Context Token Efficiency
- **Agents get their own 200k token budget**
- Your main session only reads final reports
- Massive context savings on research and test execution

### Built-In Verification
- Developer tests → Quality verifies → You spot-check
- Triple verification prevents false positives
- Catches the "tests passing ✅" lies from before

### Self-Documenting
- Each agent's report reminds you what to do next
- No need to remember the process
- No CLAUDE.md bloat

### Single User Command
- User gives ONE instruction
- Workflow handles the rest
- No 3-step process to remember

---

## 📖 What Each Agent Reminds You

### Developer Agent Report Includes:
- ✅ Code changes and test proof
- 📋 "NEXT STEP: Launch quality agent for verification"
- 📋 "AFTER QUALITY: Spot-check both proofs and approve"

### Quality Agent Report Includes:
- ✅ Independent verification results
- 📋 "NEXT STEP: YOU (Claude) spot-check and approve"
- 📋 Checklist of what to verify

### Main Claude (You) Does:
1. Read both reports
2. Compare: Do exit codes match? Both show "0 failed"?
3. Quick check: `cat breadcrumb-debug.log | grep "❌"`
4. Approve to user if verified

---

## ⚠️ Critical: Your Role as Main Claude

**Even though both agents report**, you must still verify:

### Spot-Check Checklist
```bash
# 1. Compare both reports
# - Do exit codes match?
# - Do "X passed, Y failed" summaries match?

# 2. Quick LED check
cat ai-friends-app/breadcrumb-debug.log | tail -20 | grep "❌"

# 3. If suspicious, re-run test yourself
npm test -- tests/feature-name.spec.ts
```

**Why**: Agents can both be wrong (rare). Your spot-check is the final safety net.

**When to approve**:
- ✅ Both agents agree "0 failed, exit 0"
- ✅ Your spot-check confirms
- ✅ No LED errors in breadcrumb log

**When to investigate**:
- ⚠️ Agents disagree on results
- ⚠️ Quality agent recommends ESCALATE
- ⚠️ Something feels suspicious

---

## 🔍 Common Scenarios

### Scenario 1: Everything Passes
```
Developer: "Tests pass, 0 failed, exit 0"
Quality: "Verified, tests pass, 0 failed, exit 0, APPROVED"
You: Spot-check confirms → Approve to user ✅
```

### Scenario 2: Both See Failures
```
Developer: "Tests fail, 3 failed"
Quality: "Verified, tests fail, 3 failed, NEEDS_FIX"
You: Send back to developer with error details 🔄
```

### Scenario 3: Mismatch Detected
```
Developer: "Tests pass, 0 failed"
Quality: "Tests fail, 5 failed, ESCALATE"
You: Re-run test yourself to investigate ⚠️
```

### Scenario 4: Developer Blocked
```
Developer: "BLOCKED - need guidance after 3 attempts"
You: Read failure details, provide guidance or take over
```

---

## 📁 File Locations

```
.claude/
├── AGENTS-GUIDE.md     ← You are here
└── agents/
    ├── developer.md    ← Developer agent instructions
    └── quality.md      ← Quality agent instructions
```

---

## 🆘 Troubleshooting

### "How do I start the workflow?"
```
Use developer agent for task-XXX
```

### "What if developer agent reports BLOCKED?"
Read the block details in their report, provide guidance, or take over implementation yourself.

### "What if quality agent says ESCALATE?"
Re-run the test yourself to see what's actually happening, then decide: approve, send back for fixes, or investigate further.

### "Do I always need to launch quality agent manually?"
Developer agent's report tells you to launch it. Follow their instruction:
```
Use quality agent to verify task-XXX
```

### "Can I skip the spot-check if both agents agree?"
No. A 30-second spot-check prevents shipping bugs. Always verify before approving to user.

---

## 🎯 Success Metrics

You know it's working when:

- ✅ User gives ONE command and workflow completes
- ✅ Both agents provide RAW proof (not summaries)
- ✅ Quality catches false positives from developer
- ✅ You spot-check and approve confidently
- ✅ User only sees working, tested features
- ✅ Context tokens saved (agents do heavy lifting)

---

## 📚 For New Claude Sessions

If you're a fresh Claude session reading this:

1. You're in a project that uses agent-based development
2. When user mentions taskmanager tasks, use this workflow
3. Each agent will remind you what to do - trust their reports
4. Your job: read reports, verify, approve
5. Don't skip the spot-check even if both agents agree

**First time?** Try it with a simple task to see how it works.

---

## 🔗 Related Documents

- `.claude/START-HERE.md` - Critical instructions for every session
- `.claude/MANDATORY-DEV-PROCESS.md` - The development loop agents follow
- `CLAUDE.md` - Project-specific patterns and conventions
- `Context/2025-11-08/HANDOFF-*.md` - Session progress and decisions

---

**Remember**: The agents work FOR you. They do the heavy lifting (research, coding, testing, verification). You do the final verification and approval. This division of labor saves context and ensures quality.
