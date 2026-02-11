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

10. **AT SESSION START: Check and announce the git branch**
    - Run `git branch --show-current` in advisor-team-mvp at start of any coding session
    - Tell user: "You're on [branch]. Should I switch to main?"
    - **WHY THIS MATTERS:** Git branches physically change the files in the folder. If user is on `mobile` branch, they're editing mobile code - not "neutral" files they can later route to any branch. User learned this the hard way on 2026-01-31.
    - If user wants changes to go to `main`, switch to `main` BEFORE making any edits
    - This prevents the mess of trying to separate changes after the fact

11. **ONLY commit and push inside `advisor-team-mvp/` — NEVER the parent Liquid-Stories repo**
    - The MVP app is fully self-contained at `D:\Projects\Ai\Liquid-Stories\advisor-team-mvp`
    - Its git remote is `Bladed3d/AdvisorTeam.git` — this is the ONLY repo that needs pushes
    - `Liquid-Stories` is a wrapper repo holding docs and a submodule pointer — DO NOT push to it
    - DO NOT run `git add advisor-team-mvp` or `git commit` from the Liquid-Stories root
    - DO NOT create "update submodule" commits in the parent repo
    - **All git operations (add, commit, push) happen from INSIDE `advisor-team-mvp/`**
    - **WHY:** 35+ unnecessary "Update advisor-team-mvp submodule" commits were pushed to Liquid-Stories. The submodule pointer updates are noise — the real commits are already in AdvisorTeam.

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

11. **ALWAYS run FULL build verification before pushing (Next.js projects)**
    - **REQUIRED COMMAND:** `rm -rf .next node_modules/.cache && npx tsc --noEmit && npm run build`
    - `npm run build` ALONE is NOT enough - local cache masks TypeScript errors
    - `npx tsc --noEmit` must run SEPARATELY before `npm run build`
    - Cache clearing (`rm -rf .next node_modules/.cache`) is MANDATORY
    - Build failures = DO NOT PUSH until fixed
    - **WHY:** Vercel builds from clean state. Local cache hides errors Vercel catches.
    - **Discovered 2026-02-03:** 8+ commits failed on Vercel after passing local `npm run build`
    - **The Developer Agent and Quality Agent MUST both run the FULL command**

12. **TWO-TIER deployment verification (Tests enforce this - cannot be skipped)**
    - **Tier 1 (Smoke Test):** After EACH phase push - verify deployment succeeded (not 404)
    - **Tier 2 (Deployment Test):** After ALL phases - verify feature works on production
    - Quality Agent runs both tiers as part of test suite
    - Tests cannot be ignored - Quality cannot return APPROVED without them passing
    - **If 404:** Vercel build failed - run `rm -rf .next node_modules/.cache && npx tsc --noEmit && npm run build`
    - **If 500:** Runtime error - fix and re-push
    - Full workflow: `.claude/workflows/pm-workflow.md` → Phases 4c and 5
    - Test Agent instructions: `.claude/agents/test-agent.md` → "Mandatory Tests"
    - **Discovered 2026-02-03:** API returned 404 after "successful" push - caught and fixed automatically

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

## Database Migrations

21. **ALL migrations go in ONE place: `Docs/migrations/`**
    - Format: `YYYYMMDD_description.sql`
    - DO NOT create migration folders anywhere else
    - DO NOT put migrations inside `advisor-team-mvp/`
    - Before creating a migration, LIST existing migrations to see the pattern
    - **WHY:** 3 different Claudes created 3 different migration folders. This is the one place.

---

## Code Migration & Refactoring

22. **Migration ≠ Recreation**
    - When moving code to a new location, COPY the actual working code
    - Do NOT write new "clean" versions that omit functionality
    - Do NOT create "placeholder" or "shell" code that will be "filled in later"
    - If original is 2900 lines and new is 450 lines, STOP - you're deleting 2450 lines of features
    - **WHY:** 2026-02-04 refactoring created placeholder pages, deleted working code, broke production

23. **Working-First Migration Pattern**
    - **Step 1:** Copy ENTIRE file to new location (all 2900 lines, not a summary)
    - **Step 2:** Verify it WORKS at new location (not just compiles - actually test the feature)
    - **Step 3:** Only THEN start modifying/slimming the original
    - **Step 4:** NEVER delete from original until new location is functionally verified in production
    - "Build passes" is NOT verification. "Feature works" is verification.

24. **Line Count Sanity Check**
    - Before declaring any migration/refactoring complete, compare line counts:
      ```
      Original file: X lines
      New file(s): Y lines total
      ```
    - If Y < X/2, something is wrong - you're losing functionality
    - ASK USER before proceeding: "Original was X lines, new is Y lines. That's Z lines unaccounted for. Should I continue?"
    - This applies to: file moves, component extraction, route restructuring, any refactoring

25. **Refactoring Task Descriptions Must Reference Source**
    - WRONG: "Create chat/page.tsx with scroll infrastructure"
    - RIGHT: "Copy lines 150-400 from page.tsx to chat/page.tsx (scroll infrastructure)"
    - Tasks must specify WHAT CODE is being moved, not what concept is being implemented
    - If a task doesn't reference specific source code, it's creating new code, not migrating

**Reference:** See MISTAKES-LOG entry 2026-02-04 - Refactoring deleted 2450 lines of working code

---

## When In Doubt

- ASK before destructive operations
- VERIFY before deleting
- RESEARCH before guessing
- STOP before wasting user time
- CHECK CAPABILITY PARITY before switching components

---

*Last updated: 2026-02-04 - Added Code Migration & Refactoring rules (22-25) after refactoring deleted 2450 lines of working code*


