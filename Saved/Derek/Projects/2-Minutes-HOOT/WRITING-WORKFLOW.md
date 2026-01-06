# 2 Minutes to HOOT - Writing Workflow

**Purpose**: Guide for AI collaboration on lesson creation

---

## Lesson Creation Workflow

### Step 1: Research Derek's Reference Library (Part 1)

**MANDATORY: Use Qdrant semantic search FIRST**

```bash
cd Saved/Derek/Reference-Library/scripts
python search.py "lesson topic keywords" --limit 15
```

**What This Provides**:
- Authentic Derek quotes and writings
- His actual voice, phrasing, and examples
- Semantic similarity (not brute-force search)
- Source file paths for reference

**Why This Matters**:
- Part 1 of lesson needs Derek's ORIGINAL INSIGHT from his actual writings
- Not approximations or character profile summaries
- Authentic source material is foundation for everything

**Create Part 1**: "The Original Insight" with Qdrant research findings

---

### Step 2: Activate Writing Team Collaboration (Part 2)

When Part 1 is complete, activate the team:

1. **Ask IQ2 FIRST** via llama-server API (background process)
   ```bash
   curl -s -X POST http://127.0.0.1:8080/completion \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "Share key quotes from research and ask for structure/audience guidance...",
       "n_predict": 1500,
       "repeat_penalty": 1.1,
       "repeat_last_n": 64
     }' &
   ```

2. **While IQ2 processes, role-play Character Weaver and Zen Scribe**
   - Read Derek Character Profile for voice guidance
   - Character Weaver: Understands Derek's psychology and how he'd approach the topic
   - Zen Scribe: Knows how to execute authentic language based on Character Weaver's guidance

3. **Retrieve IQ2 response** and conduct GENUINE back-and-forth dialogue
   - **NEVER simulate or fake IQ2's input**
   - **NEVER shortcut by writing dialogue yourself**
   - **ALWAYS use IQ2's actual response**

**Create Part 2**: "The Writing Team Dialogue" with genuine collaboration

---

### Step 3: Synthesize One-Page Lesson (Part 3)

Combine all perspectives into concise final lesson:
- Qdrant research (Part 1) - authentic source material
- IQ2's actual response (Part 2) - structure and audience insights
- Character Weaver's guidance (Part 2) - psychological depth and voice
- Zen Scribe's execution (Part 2) - authentic language

**Create Part 3**: "The Perfected Lesson" - one-page, 2-minute read

---

### Step 4: Save and Display

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
