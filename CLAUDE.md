# Liquid-Stories Project - Claude Instructions

## FIRST ACTION: Read Required Files (No Permission Needed)

**IMMEDIATELY upon starting any session, read these files WITHOUT asking:**

1. `CRITICAL-RULES.md` - Rules that MUST NEVER be violated
2. `MISTAKES-LOG.md` - Past failures with prevention rules
3. `SUCCESS-PATTERNS.md` - Proven approaches that work

**Do this silently.** Do not ask "Would you like me to read these?" or "Should I review the mandatory files?" Just read them. This is a standing instruction - permission is already granted.

After reading, acknowledge briefly: "I've read the required files" - then proceed with the user's request.

---

## Context Conservation

**Use agents (Task tool) whenever possible to conserve context tokens.**

Agents run in separate context - their work doesn't consume your main budget.

---

## Handling Large PDFs

The Read tool has a hard size limit on PDFs (~500KB). **This limit cannot be bypassed with offset/limit parameters** - those only work for text files.

**When you encounter "PDF too large" error:**

1. **Convert PDF to text first:**
   ```powershell
   pdftotext "filename.pdf" "filename.txt"
   ```

2. **Then read the text file in chunks:**
   ```
   Read tool with offset=0, limit=800
   Read tool with offset=800, limit=800
   # etc.
   ```

3. **Use ~800 line chunks** - screenplay pages are wide, so smaller chunks prevent truncation

**Do NOT:**
- Try to read the PDF directly with offset/limit (won't work)
- Launch background agents to read large documents (freezes terminal, no visibility)
- Attempt multiple retries hoping the PDF will work

**Location of pdftotext:** Available system-wide on this machine.

---

## Communication Protocol

**NEVER use the AskUserQuestion tool with multiple choice options.**

Why:
- Planning sessions need to be a **dialogue**, not a survey
- There are always nuances and things to discuss
- Multiple choice prevents natural conversation about tradeoffs
- It's cold and transactional, not collaborative

**Instead:**
- Ask open-ended questions in regular conversation text
- Let the discussion flow naturally
- Discuss nuances, tradeoffs, and considerations together
- Trust that better solutions emerge from unrestricted dialogue

**Example:**
- ❌ Wrong: `AskUserQuestion` with options A, B, C
- ✅ Correct: "What are you thinking for the tier thresholds? I see a few approaches we could take..."

---

## File Versioning

**CRITICAL: NEVER destroy existing information**

**When updating plans, documents, or any important file:**

1. **NEVER overwrite existing content** - Use Write tool only on new file paths
2. **Create versioned files** - Use suffix pattern: `filename-v2.md`, `filename-v3.md`, etc.
3. **Preserve all versions** - Keep previous versions for reference and rollback
4. **Exception: Trivial fixes** - Typos, formatting-only changes (but when in doubt, version it)

**Examples:**
```python
# ❌ Wrong: Destroys original
Write tool on "plan.md"  # Overwrites v1 with v2

# ✅ Correct: Preserves original
Write tool on "plan-v2.md"  # Creates new file, v1 remains intact
```

**Why:**
- Previous thinking may have value you didn't recognize
- User may want to compare versions
- Enables rollback if v2 has issues
- Respects the principle of not destroying information

---

## Project-Specific Systems

### Advisory Team

**Primary Reference:** `AdvisorTeam/1ADVISORY-TEAM-COMPLETE.md`

This project uses a 5-advisor team system for strategic thinking sessions:
- **5 Advisors** - Zen Master, Business Advisor, Research, Organizer, What If Explorer (IQ2)
- **IQ2 integration** - MiniMax model via llama-server for genuine alternative perspective
- **Derek-specific** - Loads profile, projects, and session context
- **One advisor at a time** - Prevents information overload
- **No coding in sessions** - Advisory sessions are for thinking, not implementation

### Writing Team Workflow

**Reference:** `.claude/workflows/writing-team-lesson-creation.md`

5-step lesson creation process:
1. Research (semantic search for authentic source material)
2. Activate Team (IQ2 first, then role-play)
3. Integration Round (map insights to structure)
4. Write (Zen Scribe creates unified content)
5. Display (show results with team attribution)

### LED Debug Workflow (Production Error Resolution)

**When user reports production errors or asks about system health:**

1. **Pull errors automatically** - Don't ask user to describe them
2. **Use the LED Debugger Agent** - `Task tool, subagent_type="led-debugger"`
3. **Agent will**: Pull errors → Trace LED codes → Diagnose → Fix → Verify

**API Access (if DEBUG_SERVICE_KEY is set):**
```bash
curl "https://advisor-team.vercel.app/api/debug/led-status?key=$DEBUG_SERVICE_KEY"
```

**Fallback (Playwright):**
```
Navigate to /admin → System Errors section → Parse errors
```

**LED Code Quick Reference:**
| LED | Meaning | First Check |
|-----|---------|-------------|
| 2091 | Session create failed | Supabase RLS policies |
| 4090 | AI API error | API key, rate limits |
| 7390 | UI/session operation failed | hooks/useSessions.ts |
| 7391 | Fetch error | Network, endpoint status |

**Full LED ranges:** `advisor-team-mvp/lib/led-ranges.ts`
**Agent reference:** `.claude/agents/led-debugger.md`

**DO NOT ask user to paste errors or describe them.** The whole point of the LED system is that Claude can see and diagnose errors autonomously.

---

### Developer Agent Workflow (App Development)

**For any coding/implementation tasks, use this 3-phase verification chain:**

```
Developer Agent → Quality Agent → Main Claude → User
     BUILD           VERIFY         APPROVE
```

**Agent References:**
- `.claude/agents/developer.md` - Implementation specialist
- `.claude/agents/quality.md` - Independent verification
- `.claude/agents/research.md` - Breaks failure loops

#### Phase 1: Developer Agent (Task tool, subagent_type="developer")

**Process:** Research → Code → LED Breadcrumbs → Test → Report

1. **Memory Lock** - Confirm understanding before starting:
   ```
   TASK RECEIVED: [task]
   MY UNDERSTANDING: [what I'll build]
   ACCEPTANCE CRITERIA: [how I'll verify]
   ```

2. **3-Failure Rule:**
   - Failure #1: Fix obvious issue, retry
   - Failure #2: **MANDATORY research** (WebSearch), then retry
   - Failure #3: **STOP AND ESCALATE** - no attempts #4, #5, #6

3. **LED Breadcrumbs Required:**
   | Range | Domain |
   |-------|--------|
   | 1000-1099 | Auth, session |
   | 4000-4099 | API calls |
   | 8000-8099 | Error handling |
   | 9000-9099 | Testing |

4. **RAW Output Required** - Never summarize test results, paste complete terminal output

#### Phase 2: Quality Agent (Task tool, subagent_type="quality")

**Purpose:** Independent verification - does NOT trust Developer

1. Re-run exact same tests Developer ran
2. Compare results (exit code, pass/fail counts)
3. Check breadcrumb log for LED errors
4. Verify `.next/BUILD_ID` exists (confirms build ran)
5. Issue verdict: **APPROVED** / **NEEDS_FIX** / **ESCALATE**

#### Phase 3: Main Claude - Automatic Feedback Loop

**Based on Quality Agent verdict, Main Claude acts AUTOMATICALLY:**

| Verdict | Action | Human Involved? |
|---------|--------|-----------------|
| **APPROVED** | Report success to user | No (inform only) |
| **NEEDS_FIX** | Re-invoke Developer with Quality's feedback | **No** |
| **ESCALATE** | Stop and ask user for guidance | **Yes** |

**NEEDS_FIX Loop (automatic, no human needed):**
```
Quality: NEEDS_FIX → Main Claude re-invokes Developer
                            ↓
                     Developer fixes issue
                            ↓
                     Quality re-verifies
                            ↓
                     APPROVED? → Done
                     NEEDS_FIX? → Loop again
                     ESCALATE? → Ask user
```

**Loop continues until APPROVED or ESCALATE.** User only gets involved when:
- Task is complete (APPROVED)
- 3 failures reached or team is stuck (ESCALATE)

#### Research Agent (Task tool, subagent_type="research")

**Trigger when:**
- Developer failed 2+ times on same issue
- Complex/unfamiliar task
- User explicitly requests research

**Time Limit:** 15 minutes max
**Output:** 3-5 real-world approaches ranked by usage, with actual code examples

---

## See Also

**Global Instructions:** `C:\Users\Administrator\.claude\CLAUDE.md`
- Security patterns
- File naming conventions
- Anti-over-engineering protocol
- Git workflow
- And more
