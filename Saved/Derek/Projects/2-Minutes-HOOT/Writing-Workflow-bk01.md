# 2 Minutes to HOOT - Writing Workflow

**Purpose**: Guide for AI collaboration on lesson creation

---

## Lesson Creation Workflow

### Step 1: Ensure Qdrant Index is Current

**ASK USER FIRST: "Should I re-index the Reference Library?"**

Only run if user approves:
```bash
cd Saved/Derek/Reference-Library/scripts
python index.py
```

**When to Ask**:
- ✅ At the START of a lesson creation day (ask once)
- ✅ After user adds NEW writings to the library
- ✅ If search results seem incomplete or outdated
- ❌ NOT before every lesson (user will say when)

**Example Dialogue**:
```
AI: "I'm ready to create the lesson. Should I re-index the Reference Library first?"
User: "No, I already did that this morning."
AI: "Great! Let's proceed with research."
```

**Time**: ~1-2 minutes for full re-index

**Why Ask**:
- User is active participant in writing
- May have already indexed today
- Avoids wasteful re-indexing

---

### Step 2: Research Derek's Reference Library (Part 1)

**MANDATORY: Use Qdrant semantic search**

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

### Step 3: Activate Writing Team Collaboration (Part 2)

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

### Step 4: Integration Round (Part 2.5) - CRITICAL NEW STEP

**Before writing Part 3, the team must explicitly map insights to the lesson structure.**

The Integration Round ensures ALL brilliant insights from Part 2 actually make it into the final lesson.

**Process:**

1. **Review Round**: Each team member identifies their key insights from Part 2 dialogue
2. **Mapping Round**: Explicitly state where each insight belongs in the final lesson
3. **Synthesis Check**: Verify nothing important is left behind
4. **Flow Check**: Ensure the lesson will read as one cohesive piece, not disjointed snippets

**What the Integration Round Produces:**

A structured outline where:
- Every insight from Part 2 has a designated place
- The narrative arc flows naturally
- Multiple insights are woven together (not left as separate quotes)
- Derek's voice carries through the entire lesson

**Example of Integration:**

Instead of leaving insights as separate quotes:
> **Character Weaver**: Asking transforms character. It requires ego dissolution...
> **Zen Scribe**: The question is the door...

The Integration Round weaves them into unified prose:
> "Asking transforms character. It requires ego dissolution, courage, and sacred reverence for truth. It's not a technique — it's a way of BEING. The question is the door. The sincere question is the open door. The insincere question is the closed door pretending to be open."

**Create Part 2.5**: "The Integration Outline" with explicit mapping of insights to lesson sections

---

### Step 5: Write the Unified Lesson (Part 3)

**Zen Scribe writes the final lesson** based on:
- Qdrant research (Part 1) - authentic source material
- All team insights (Part 2) - the rich dialogue
- Integration outline (Part 2.5) - where everything goes

**Zen Scribe's Responsibility:**

Write as Derek speaking directly to the reader. Not a compilation of quotes, but a cohesive, flowing lesson that:

1. **Integrates ALL insights** from the Integration Round
2. **Flows naturally** from beginning to end
3. **Speaks in Derek's authentic voice** - conversational, direct, powerful
4. **Transforms the reader** through emotional journey
5. **Avoids inappropriate content** (e.g., "You teach best what you need to learn" is Derek's motivation, not the reader's lesson)

**Create Part 3**: "The Perfected Lesson" - one-page, 2-minute read, written as if Derek is speaking directly to the reader

---

### Step 6: Save and Display

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
