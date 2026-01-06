# AI Agents Reference Library

**Purpose:** These files define persona reference documents for role-play collaboration, NOT invocable subagents.

---

## How This System Works

### These Files ARE:
- **Persona definitions** — Detailed descriptions of how different experts think
- **Role-play references** — Instructions for how Claude should embody different perspectives
- **Character profiles** — Psychology, expertise, voice, and approach for each team member

### These Files ARE NOT:
- ❌ Invocable subagents (do NOT use with Task tool's `subagent_type` parameter)
- ❌ Separate AI processes
- ❌ External API calls

---

## Collaboration Process

### Step 1: Ask IQ2 FIRST (Parallel Processing)

**CRITICAL:** Always invoke IQ2 via llama-server API FIRST.

**Why:** IQ2 runs on a separate process (llama-server). While IQ2 is processing its response, you can role-play the other team members. This saves significant time.

**How:**
```bash
curl -s -X POST http://127.0.0.1:8080/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "[your question]",
    "n_predict": 1500,
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "repeat_penalty": 1.1,
    "repeat_last_n": 64,
    "dry_multiplier": 0.5,
    "dry_base": 2.0
  }'
```

**CRITICAL PARAMETERS** (prevents repetition loops):
- `repeat_penalty: 1.1` - MUST include to prevent infinite repetition
- `repeat_last_n: 64` - MUST include to prevent infinite repetition
- `dry_multiplier: 0.5` + `dry_base: 2.0` - DRY sampling for sequence-level variety

**Run this in background** and proceed to Step 2 while IQ2 processes.

---

### Step 2: Role-Play Other Team Members

While IQ2 processes, embody the other team members by reading their persona files and responding from each perspective.

---

### Step 3: Retrieve IQ2's Response

After role-playing the other team members, retrieve IQ2's response from the background task.

---

### Step 4: Synthesize and Create

Combine all perspectives into the final deliverable.

---

### Step 5: Display After Writing (CRITICAL WORKFLOW)

**ALWAYS display written content in the appropriate viewer immediately after saving.**

**When content is written and saved:**

1. **If a viewer exists for the content type**, launch it automatically:
   ```bash
   # Example for lessons:
   python lesson-viewer.py "path/to/lesson.md" --team '["IQ2", "Character Weaver", "Zen Scribe"]' &
   ```

2. **Team headers**: When viewers support `--team` parameter, show active collaborators

3. **Do not wait to be asked** — this is automatic workflow

**Why**: The user needs to immediately see what was written, with context of who collaborated.

**NEVER save content without displaying it for review.**

---

## Why This System?

**Role-playing is superior because:**
- No async waiting
- No technical limitations
- Natural dialogue flow
- All perspectives in context
- Can iterate and refine

---

## Exception: IQ2

**IQ2 (MiniMax-M2.1-PRISM-IQ2_M)** is the ONLY team member that is NOT role-played because it runs on llama-server and provides genuine diversity of perspective.

**All other team members ARE role-played by Claude.**

---

## Quick Reference

When asked to "consult the writing team":

1. ✅ Ask IQ2 FIRST via llama-server (background)
2. ✅ Read relevant agent files
3. ✅ Role-play each perspective
4. ✅ Retrieve IQ2 response
5. ✅ Synthesize all input
6. ✅ **Display in viewer after writing** (automatic - do not wait to be asked)
7. ❌ DO NOT use Task tool subagent_type for these agents
