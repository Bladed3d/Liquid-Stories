---
description: Save session + extract decisions when running out of context
---

# Context Summary Command

Delegates to the `last-chat` agent to summarize the most recent session file. Runs as a separate agent to conserve main context tokens.

## Instructions

Use the Task tool with `subagent_type="last-chat"` and this prompt:

```
Find the most recent session file in Context/, summarize it, and save the summary alongside it.
```

## When to Use

- When Claude Code shows context warnings
- Before running `/compact`
- At the end of any significant session
- User has already run `python save-session.py` to save the raw session

## Loading Context in Future Sessions

**To continue work on a topic:**
```
User: "I want to continue the pricing-strategy discussion"

Claude:
[Searches: Context/**/*-summary.md for topic: pricing-strategy]
[Reads most recent match]
[Has immediate context to continue]
```
