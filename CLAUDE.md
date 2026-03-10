# CLAUDE.md — Liquid-Stories Project Rules

**Session start:** Read `0-SURVIVAL.md` (project root) before taking any action.

**These rules are non-negotiable.**

---

## Before You Code

1. **DISCUSS BEFORE CODING** — Diagnose → explain → propose → wait for approval → code.
2. **TRACE BEFORE WRITING** — Find and read existing code doing the same thing. Match its pattern. Verify it works BEFORE presenting.
3. **ASK before destructive operations** — Delete, overwrite, rename, kill process, push to git.

## Technology Currency

Before using any technology, library, or pattern 2+ years old not already in the project stack: verify it works on Windows 11 and modern Node.js, check for a better current alternative, and document your choice briefly.

## Git Rules

- **NEVER amend pushed commits without explicit permission**
- **Run `git branch --show-current` at start of each session** — announce the branch
- **All git ops for the app run inside `advisor-team-mvp/`** — NEVER from Liquid-Stories root
- **NEVER create "update submodule" commits in the parent repo**
- Force push, `.env` commits, push-without-permission: **hook-enforced** (pre-tool-use-bash.sh)
- **NEVER push code that has not been browser-tested this session.** A passing build is not proof the feature works. Before any push, a Chrome MCP screenshot showing the feature working on localhost:3000 must exist in this session — OR Derek must explicitly say "skip test gate." No exceptions. This rule exists because Claude has repeatedly pushed untested code and broken production.

## File Operations

- **NEVER delete without confirmation**
- **NEVER overwrite a file** — create `filename-v2.md` instead (exception: trivial typo)
- **Save all planning docs/PRDs in `D:/Projects/Ai/Liquid-Stories/Docs/`** — NOT in `advisor-team-mvp/Docs/`
- `mv` and backslash paths: **hook-enforced** (pre-tool-use-bash.sh blocks mv, warns on backslash)

## Process Management

- **NEVER kill by process name** — hook-enforced. Always kill by PID: `netstat -ano | findstr :PORT`

## Build Verification (Next.js)

Run before every push — `npm run build` alone is NOT sufficient:
```bash
rm -rf .next node_modules/.cache && npx tsc --noEmit && npm run build
```
Build failures = DO NOT PUSH until fixed.

## Code Migration & Refactoring

- **Migration ≠ Recreation** — copy the actual working code, not a new "clean" version
- **Line Count Check** — if new code is less than half the lines of the original, STOP and ask
- **Working-First Pattern** — copy entire file → verify it works → only then modify the original
- **"Build passes" is NOT verification. "Feature works" is verification.**

## Architecture Changes

Before switching any major component (model, API, service): list ALL current capabilities, verify replacement supports ALL of them, create a ✓/✗ comparison table. If ANY capability is missing, FLAG IT and wait for user approval.

## Credentials & Secrets

- **NEVER display credentials, API keys, passwords, or connection strings in chat**
- When working with .env: read silently, confirm only "value exists" or "value missing"

## Agent Rules

- **Main Claude is the ONLY orchestrator** — subagents cannot spawn subagents (heap crash)
- **ALWAYS use persona-creator when creating new agents**
- **STOP after 3 failures** — mandatory research after 2, full stop + escalate after 3

## Model Selection · Testing · Migrations

- **Haiku** — simple/repetitive. **Sonnet** — default. **Opus** — only after Sonnet fails twice or high-stakes decision.
- **Test env-var-dependent features on Vercel, NOT localhost** — Playwright sandbox has no .env access. Never ask user to test manually — use Playwright MCP.
- **ALL migrations go in `Docs/migrations/`** (format: `YYYYMMDD_description.sql`) — nowhere else.
- **LED ranges**: Before claiming LED codes in any PRD or feature, check `Docs/LED-REGISTRY.md`. After claiming a range, update the registry. Ground truth is `advisor-team-mvp/lib/led-ranges.ts`.

## Config Governance

**Config files are governed.** Before modifying CLAUDE.md, MEMORY.md, or any rules file: present a Config Change Proposal citing `CLAUDE-CONFIG-RULES.md`. Apply nothing until Derek responds "Approved." Deleting any config file is prohibited.
