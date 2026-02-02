---
description: Initialize session - read required files and acknowledge context rules
---

# Session Start Command

**Run this at the beginning of every session.**

## Instructions

1. **Read these files directly using the Read tool:**
   - `CRITICAL-RULES.md`
   - `MISTAKES-LOG.md`
   - `SUCCESS-PATTERNS.md`

2. **After reading, confirm:**
   > "Session initialized. I've read X critical rules, Y mistake patterns, and Z success patterns."

3. **Commit to context conservation:**
   > "I will use agents (Task tool) for substantial work to preserve context tokens."

## Context Conservation Rule

**This is critical.** Main context fills up fast. Use agents to extend session productivity.

**USE AGENTS FOR:**
- Writing PRDs, documentation, specs, summaries
- Exploring/searching codebase (`subagent_type="Explore"`)
- Research tasks
- Any substantial file reading/writing
- Tasks that produce a file as output

**KEEP IN MAIN CONTEXT:**
- Direct user conversation
- Quick edits (few lines)
- Decisions needing user input
- Code changes to verify immediately

## Why Read Directly

The token cost (~2-3k) is worth it because:
- Main Claude actually has the rules internalized
- Rules govern ALL subsequent behavior in the session
- Agent summaries are secondhand - main Claude never truly "knows" the content
