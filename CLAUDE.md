# CLAUDE.md — Liquid-Stories Project Rules

**This file loads every session. These rules are non-negotiable.**
**Cross-reference: CRITICAL-RULES.md (full detail), MEMORY.md (architecture context)**

---

## STOP BEFORE YOU START

1. **DISCUSS BEFORE CODING** — Diagnose → explain → propose → wait for approval → code. Never start writing code before the user agrees to the approach.
2. **TRACE BEFORE WRITING** — Before any new code path, find and read the existing code doing the same thing. Match its pattern exactly. Verify it will work BEFORE presenting it.
3. **ASK before destructive operations** — Delete, overwrite, rename, kill process, push to git. Every time.

---

## Technology Currency Check ⚠️ NEW

**Before using any technology, library, or pattern that is 2+ years old and NOT already in the project stack:**

1. Search for "current best practices [technology] 2026" (or current year)
2. Verify it still works on the target OS/platform (e.g., Windows 11, modern Node.js)
3. If a better modern alternative exists, USE THAT instead — do not default to what you already know
4. **Document your choice**: briefly note why you chose this tech

**WHY:** Claude chose HTA (1999 Windows scripting) for a popup window without checking that the IE engine it requires is deprecated on Windows 11. The file didn't work at all. Derek had to discover this himself.

**Applies to:** Shell scripting approaches, Windows APIs, deprecated web APIs, any third-party library not imported by `package.json`.

---

## Git Rules

- **NEVER force push to main/master**
- **NEVER commit .env or credential files**
- **NEVER amend pushed commits without explicit permission**
- **NEVER push without explicit user permission** — ask before every push
- **Always run `git branch --show-current` at start of coding sessions** — announce the branch
- **All git ops for the app happen INSIDE `advisor-team-mvp/`** — NEVER from the Liquid-Stories root
  - The app remote is `Bladed3d/AdvisorTeam.git`
  - DO NOT create "update submodule" commits in the parent repo

---

## File Operations

- **NEVER use `mv` directly** — copy → verify content exists → then delete original
- **NEVER use backslash paths** — use `D:/Projects/file.md` not `D:\Projects\file.md`
- **NEVER delete without confirmation and backup**
- **NEVER overwrite a file** — create `filename-v2.md` instead (exception: trivial typo)
- **File path shorthand:** `\Docs\` = `D:/Projects/Ai/Liquid-Stories/Docs/` (root project, NOT advisor-team-mvp/Docs/)
- **One CLAUDE.md per project** — only at root level where `.claude/` exists

---

## Process Management

- **NEVER kill by process name** (`taskkill /IM node.exe` kills ALL instances including Claude itself)
- **Always kill by PID** — get PID first with `netstat -ano | findstr :PORT`

---

## Build Verification (Next.js)

**REQUIRED before any push:**
```bash
rm -rf .next node_modules/.cache && npx tsc --noEmit && npm run build
```
- `npm run build` alone is NOT enough — local cache masks TypeScript errors
- Build failures = DO NOT PUSH until fixed
- Discovered 2026-02-03: 8+ commits failed on Vercel after passing local build

---

## Code Migration & Refactoring

- **Migration ≠ Recreation** — copy the actual working code, not a new "clean" version
- **Line Count Sanity Check** — if new code is less than half the lines of the original, STOP and ask
- **Working-First Pattern:** Copy entire file → verify it works → only then modify the original
- **"Build passes" is NOT verification. "Feature works" is verification.**

---

## Architecture Changes

**CAPABILITY PARITY CHECK before switching any major component (model, API, service):**
1. List ALL capabilities of the current system
2. Verify replacement supports ALL of them
3. Create comparison table with ✓/✗ per capability
4. If ANY capability missing, FLAG IT and wait for user approval

---

## Credentials & Secrets

- **NEVER display credentials, API keys, passwords, or connection strings in chat**
- When working with .env: read silently, confirm only "value exists" or "value missing"
- NO EXCEPTIONS

---

## Agent Rules

- **Main Claude is the ONLY orchestrator** — subagents CANNOT spawn other subagents (heap crash)
- **ALWAYS use persona-creator when creating new agents** — validates structure before writing
- **STOP after 3 failures** — mandatory research after 2, full stop + escalate after 3

---

## Playwright / Testing

- Playwright browser = sandbox (downloads, file ops, clipboard, some auth = BLOCKED)
- **For apps with env vars: test on Vercel, NOT localhost** — sandbox has no .env access
- **Never ask user to test manually** — Claude uses Playwright MCP

---

## Database Migrations

- **ALL migrations go in ONE place: `Docs/migrations/`** (format: `YYYYMMDD_description.sql`)
- DO NOT create migration folders anywhere else, including inside advisor-team-mvp/

---

## Safe File Move (reference)

```bash
cp "D:/source/file.md" "D:/dest/file.md"   # Copy
head -5 "D:/dest/file.md"                  # Verify content
rm "D:/source/file.md"                     # Only THEN delete
```

---

*CLAUDE.md recreated 2026-03-01. Previously deleted 2026-02-11 in commit 7678254d ("consolidated into CRITICAL-RULES.md") — that consolidation broke the guaranteed-load behavior. Restored from CRITICAL-RULES.md + added Technology Currency Check rule.*
