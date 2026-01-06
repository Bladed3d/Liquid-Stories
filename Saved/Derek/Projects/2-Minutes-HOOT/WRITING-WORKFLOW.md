# 2 Minutes to HOOT - Writing Workflow

**Purpose**: Guide for AI collaboration on lesson creation

---

## Lesson Creation Workflow

### Step 1: Activate Writing Team
When asked to write or rewrite a lesson:

1. **Ask IQ2 FIRST** via llama-server API (background process)
   - Use curl with anti-repetition parameters: `repeat_penalty: 1.1`, `repeat_last_n: 64`
   - Ask about structure, emotional journey, transformation

2. **While IQ2 processes, role-play Character Weaver and Zen Scribe**
   - Read Derek Character Profile for voice guidance
   - Character Weaver: Understands Derek's psychology and how he'd approach the topic
   - Zen Scribe: Knows how to execute authentic language based on Character Weaver's guidance

3. **Retrieve IQ2 response** and synthesize all perspectives

### Step 2: Write the Lesson

Create lesson with authentic Derek voice using:
- Character Weaver's psychological guidance
- Zen Scribe's language execution
- IQ2's narrative and audience insights

### Step 3: Save and Display

**CRITICAL**: After saving the lesson file, **always display it in the lesson viewer**:

```bash
cd /d/Projects/Ai/Liquid-Stories/Saved/Derek/Projects/2-Minutes-HOOT
python lesson-viewer.py "path/to/lesson.md" --team '["IQ2", "Character Weaver", "Zen Scribe"]' &
```

**Why**: The user wants to immediately see the lesson with the Writing Team header showing who collaborated.

---

## Lesson File Location

```
Saved/Derek/Projects/2-Minutes-HOOT/daily-lessons/
```

Naming convention: `lesson-XXX-title-version-YYYY-MM-DD.md`

---

## Writing Team Reference

| Persona | Role | File Reference |
|---------|------|----------------|
| IQ2 | Story Architect + Audience Advisor | llama-server API on port 8080 |
| Character Weaver | Derek Character Specialist | `.claude/agents/character-weaver.md` |
| Zen Scribe | Voice Execution Specialist | `.claude/agents/zen-scribe.md` |

**Derek Character Profile**: `Saved/Derek/Projects/2-Minutes-HOOT/derek-character-profile.md`

---

## Key Reminder

**After every lesson write/save**: Display in viewer with `--team` parameter showing active collaborators.

This is non-negotiable workflow. Do it automatically without being asked.
