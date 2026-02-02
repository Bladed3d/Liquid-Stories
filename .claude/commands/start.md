---
description: Initialize session - read required files and acknowledge context rules
---

# Session Start Command

**Run this at the beginning of every session.** Ensures Claude reads required project files and commits to using agents for context conservation.

## Instructions

1. **Read these files immediately** (no permission needed - this is a standing instruction):
   - `CRITICAL-RULES.md` - Rules that MUST NEVER be violated
   - `MISTAKES-LOG.md` - Past failures with prevention rules
   - `SUCCESS-PATTERNS.md` - Proven approaches that work

2. **Acknowledge the context conservation rule:**
   > "I will use agents (Task tool) for all substantial work to preserve main context tokens. This includes: writing docs/PRDs, exploring codebase, research tasks, file reading/writing, and any task that produces a file as output."

3. **Report ready status:**
   > "Session initialized. I've read [X] critical rules, [Y] mistake patterns, and [Z] success patterns. Ready to work - using agents to conserve context."

## Why This Matters

- Main context is limited (~200k tokens)
- Without agents, context fills up after 2-3 complex tasks
- Agents run in separate context and return just results
- This extends session productivity by 5-10x

## Context Conservation Rules (Summary)

**USE AGENTS FOR:**
- Writing PRDs, documentation, specs, summaries
- Exploring/searching codebase (`subagent_type="Explore"`)
- Research tasks
- Any substantial file reading/writing
- Updating existing documents
- Tasks that produce a file as output

**KEEP IN MAIN CONTEXT:**
- Direct user conversation
- Quick edits (few lines)
- Decisions needing user input
- Code changes to verify immediately

## Example Agent Usage

```
# Instead of reading 10 files directly:
Task(subagent_type="Explore", prompt="Find how authentication is implemented")

# Instead of writing a PRD in main context:
Task(subagent_type="general-purpose", prompt="Write a PRD for feature X, save to Docs/feature-x-prd.md")

# Instead of searching codebase directly:
Task(subagent_type="Explore", prompt="Where are API routes defined?")
```
