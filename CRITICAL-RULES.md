# CRITICAL RULES - Liquid-Stories Project

**READ EVERY SESSION. These rules MUST NEVER be violated.**
**Enforced by hooks in `.claude/settings.json`**

---

## Assumptions

1. **NEVER assume file/folder locations**
   - If unsure where something should go, ASK
   - Check for existing `.claude/` folders to understand project structure
   - Don't create new locations without confirming with user

2. **ONE CLAUDE.md per project**
   - Only at root level (where `.claude/` folder exists)
   - Subfolders do NOT get their own CLAUDE.md
   - App-specific details go in README.md or docs/, not CLAUDE.md

---

## File Operations

1. **NEVER use `mv` directly**
   - ALWAYS: copy → verify → delete
   - Verify = confirm file exists AND has content in new location

2. **NEVER use backslash paths**
   - WRONG: `D:\Projects\file.md`
   - RIGHT: `D:/Projects/file.md`

3. **NEVER delete without verification**
   - Before `rm`: confirm the copy/backup exists and is valid

4. **NEVER overwrite files without versioning**
   - Create `filename-v2.md`, not overwrite `filename.md`
   - Exception: trivial typo fixes only

---

## Process Management

5. **NEVER kill by process name**
   - WRONG: `taskkill /F /IM node.exe` (kills ALL instances including this chat)
   - RIGHT: `taskkill /F /PID [specific-number]`
   - ALWAYS: Check PIDs first with `netstat -ano | findstr :PORT`

---

## Git Operations

6. **NEVER force push to main/master**
7. **NEVER commit .env or credential files**
8. **NEVER amend pushed commits without explicit permission**
9. **ALWAYS check branch before committing production fixes**
   - Run `git branch --show-current` BEFORE committing
   - Bug fixes go to `main` unless user says otherwise
   - If on a feature branch and fixing a production bug, ASK: "main or feature branch?"
   - `advisor-team-mvp` is a submodule - commits there need explicit branch awareness

---

## Agent Creation

11. **ALWAYS use persona-creator when creating agents**
    - Location: `.claude/agents/persona-creator.md`
    - NEVER write directly to `.claude/agents/` without using persona-creator first
    - Persona-creator ensures research-validated structure (reduces hallucination 40% → 13%)
    - All agents MUST have: Credentials, Domain, Methodology, Boundaries, Transparency

12. **Agent files require validation**
    - Hook validates structure before agent file is accepted
    - Missing required sections = rejected
    - See `.claude/hooks/validate-agent.sh`

---

## Development Loop - Agent Architecture

**THE WHOLE POINT OF AGENTS IS CONTEXT CONSERVATION**

9. **Main Claude MUST call agents for implementation work**
   - Main Claude's context is precious - calling agents offloads work to separate contexts
   - Agents return summaries, not full transcripts
   - This IS the correct architecture

10. **SUBAGENTS CANNOT SPAWN OTHER SUBAGENTS**
    - This is a Claude Code architectural limitation
    - If Main Claude spawns Agent A, Agent A CANNOT spawn Agent B
    - Attempting nested spawning causes heap crashes (24GB exhausted)
    - **CORRECT:** Main Claude is the ONLY orchestrator
    - **WRONG:** PM agent spawning Developer agent spawning anything
    - Workflow documents (like `.claude/workflows/pm-workflow.md`) tell Main Claude what to do
    - Main Claude reads workflow, spawns agents directly, one level only
    - Discovered 2026-01-30 via Ralph plugin analysis and official Claude Code docs

11. **NEVER ask user to test manually**
   - AI runs tests via Playwright MCP
   - AI reads console output
   - AI diagnoses issues

10. **STOP after 3 failures**
    - After 2 failures: MANDATORY research before retry
    - After 3 failures: STOP and escalate with full context
    - Do NOT keep guessing

11. **ALWAYS run `npm run build` before pushing (Next.js projects)**
    - `tsc --noEmit` is NOT enough - Next.js build is stricter
    - Vercel runs `npm run build` - match what production uses
    - Build failures = DO NOT PUSH until fixed
    - This catches: invalid context properties, wrong enum values, type mismatches
    - **The Developer Agent and Quality Agent MUST both run this**

---

## Playwright Sandbox Awareness

13. **Playwright browser = SANDBOX**
    - When Playwright launches a browser, it runs in a sandboxed environment
    - Downloads, file operations, clipboard, and some web APIs are BLOCKED or behave differently
    - This is KNOWN. Not an edge case. Not obscure. BASIC KNOWLEDGE.

14. **If something doesn't work in Playwright browser: CHECK SANDBOX FIRST**
    - Before debugging code, before trying 5 different libraries, before wasting 30 minutes
    - Ask: "Is this a sandbox limitation?"
    - Common sandbox-blocked features: downloads, file uploads, clipboard, popups, some auth flows
    - If sandbox is the issue → test in regular browser immediately

15. **For apps with env vars - DEPLOY TO VERCEL FIRST**
    - Playwright sandbox has NO ACCESS to local .env files
    - Testing localhost = guaranteed failure for apps needing env vars
    - **CORRECT workflow:** Push to Git -> Vercel deploys -> Test Vercel URL with Playwright
    - This avoids making user the test dummy
    - **advisor-team-mvp:** https://advisor-team.vercel.app/dashboard

16. **DO NOT:**
    - Debug download code for 30 minutes before mentioning sandbox
    - Try multiple technical solutions when the environment is the problem
    - Make user test repeatedly when YOU should know sandbox limitations
    - Treat sandbox issues as mysterious bugs - they are KNOWN CONSTRAINTS

---

## Safe File Move Pattern

```bash
# Step 1: Copy
cp "D:/source/file.md" "D:/dest/file.md"

# Step 2: Verify (MUST check content, not just existence)
ls -la "D:/dest/file.md"
head -5 "D:/dest/file.md"

# Step 3: Only then delete original
rm "D:/source/file.md"
```

---

## Credentials & Secrets

17. **NEVER display credentials, API keys, passwords, or connection strings in chat output**
    - When reading .env files, NEVER show the contents
    - When editing .env files, use tools silently - do NOT echo values
    - If you need to verify a value exists, say "Found" or "Not found" - nothing more
    - This includes: DATABASE_URL, API keys, passwords, tokens, secrets
    - NO EXCEPTIONS. User will not warn you twice.

18. **When working with .env files:**
    - Read silently, confirm only "value exists" or "value missing"
    - Edit silently, confirm only "updated" or "failed"
    - NEVER use cat, grep, or any command that would output contents to chat
    - NEVER include file contents in tool output summaries

---

---

## Architecture Changes (Models, APIs, Services)

19. **CAPABILITY PARITY CHECK before switching components**
    - Before recommending a replacement for ANY major component (AI model, API, service):
    - **Step 1:** List ALL capabilities of the current system
    - **Step 2:** Verify the replacement supports ALL of them
    - **Step 3:** Create a comparison table showing ✓ or ✗ for each capability
    - **Step 4:** If ANY capability is missing, FLAG IT IMMEDIATELY to user
    - Do NOT proceed until user explicitly approves the tradeoff

20. **For AI model switches specifically:**
    - Ask: "Does the new model support web search?"
    - Ask: "Does the new model support tool/function calling?"
    - Ask: "Does the new model support [any feature the current model uses]?"
    - Test prompts that REQUIRE these capabilities, not just conversation quality
    - A model that scores 10/10 on conversation but lacks a critical feature = FAIL

**Reference:** See MISTAKES-LOG entry 2026-01-25 - Model switch disabled 20% of app capabilities

---

## When In Doubt

- ASK before destructive operations
- VERIFY before deleting
- RESEARCH before guessing
- STOP before wasting user time
- CHECK CAPABILITY PARITY before switching components

---

*Last updated: 2026-01-25 - Added CAPABILITY PARITY CHECK rules for architecture changes*


