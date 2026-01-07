# 2 Minutes to HOOT - Writing Workflow

**Purpose**: Guide for AI collaboration on lesson creation

---

## ⚠️ MANDATORY WORKFLOW ENFORCEMENT ⚠️

**CRITICAL: ALL steps MUST be completed in order. NO shortcuts. NO skipping.**

**Before proceeding to each step, you MUST:**
1. Read the current step's instructions COMPLETELY
2. Execute EXACTLY as written
3. Verify completion before moving to next step

**FORBIDDEN:**
- ❌ Skipping IQ2 consultation (Step 3)
- ❌ Combining steps to "save time"
- ❌ Jumping directly to lesson-editor without Parts 1-3

**REQUIRED VERIFICATION:**
After completing each step, mark it as done: `✅ Step N complete`

**If you cannot verify a step is complete, DO NOT PROCEED.**

This workflow is the result of extensive refinement. Follow it exactly.

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

### Step 2: Multi-Source Research (Part 1)

**MANDATORY: Use three-search Qdrant approach for validated enhancement**

Run THREE sequential searches to gather:
1. Core teachings
2. Enhancement material (historical proof, metaphors, examples)
3. Cross-reference detection (connections to previous lessons)

```bash
cd Saved/Derek/Reference-Library/scripts

# Search 1: Core Lesson Content
python search.py "lesson topic keywords" --limit 15

# Search 2: Enhancement Material
python search.py "enhancement terms" --limit 10
# Enhancement terms: "invention", "discovery", "contemplation", "historical figures", "metaphors"

# Search 3: Cross-Reference Detection
python search.py "related concepts from previous lessons" --limit 10
# Related concepts: "truth flows through", "empty cup", "teachable", "sacred practice"
```

**What Each Search Provides:**

**Search 1: Core Lesson Content**
- Derek's foundational teachings on the topic
- Primary source material for the lesson
- His exact voice, phrasing, and key insights

**Search 2: Enhancement Material**
- Metaphors and analogies Derek uses
- Historical examples (inventors, contemplation practices)
- Real-world applications Derek has described
- **Critical for**: Opening hooks (Newton/Einstein proof), practical examples, validation

**Search 3: Cross-Reference Detection**
- Related lesson concepts with strong overlap (>0.75 similarity)
- Opportunities for embedded references (max 1-2 per lesson)
- Validation that enhancements align with previous teachings

**Why Three Searches?**
- Single search was too limiting — missed metaphor connections and cross-lesson themes
- Multi-search enables validated enhancement without message drift
- Search 2 validates historical proof (e.g., Derek mentions "inventor and creator" category → Newton/Einstein enhancement is valid)
- Search 3 ensures lessons interconnect and build on each other

**Example: Lesson 004 "Asking"**

Search 1: "asking better questions sincere insincere vacuum"
→ Returns: "universe hates a vacuum", "sincerity test questions", "better questions reveal truth"

Search 2: "Newton Einstein contemplation question vacuum invention discovery"
→ Returns: Derek mentions "inventor and creator" category, Stephen King contemplation practice
→ **Validates**: Newton/Einstein enhancement (Derek writes about this category)

Search 3: "truth flows through you vessel conduit not from you"
→ Returns: Strong overlap with Lesson 002 "Truth Flows Through You"
→ **Enables**: Embedded cross-reference when discussing "answer flows through you"

**Create Part 1**: "The Original Insight" organized into three labeled sections:
- Core Teachings (from Search 1)
- Validation & Enhancement (from Search 2)
- Cross-References (from Search 3)

---

### Step 3: Activate Writing Team Collaboration (Part 2)

**⚠️ VERIFICATION CHECKPOINT: Did you complete Step 2 (three searches)? If NO, DO NOT PROCEED.**

When Part 1 is complete, activate the team:

1. **Ask IQ2 FIRST** via llama-server API (background process) ⚠️ **MANDATORY - DO NOT SKIP**
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

   **⚠️ CRITICAL: You MUST run this command BEFORE role-playing Character Weaver and Zen Scribe.**
   **⚠️ CRITICAL: Wait for IQ2 response BEFORE proceeding to Step 4.**

2. **While IQ2 processes, role-play Character Weaver and Zen Scribe**
   - Read Derek Character Profile for voice guidance
   - Character Weaver: Understands Derek's psychology and how he'd approach the topic
   - Zen Scribe: Knows how to execute authentic language based on Character Weaver's guidance

3. **Retrieve IQ2 response** and conduct GENUINE back-and-forth dialogue
   - **NEVER simulate or fake IQ2's input**
   - **NEVER shortcut by writing dialogue yourself**
   - **ALWAYS use IQ2's actual response**

**Create Part 2**: "The Writing Team Dialogue" with genuine collaboration

**⚠️ VERIFICATION: Part 2 includes IQ2 section? Part 2 includes Character Weaver? Part 2 includes Zen Scribe? If ANY missing, DO NOT PROCEED.**

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

**⚠️ VERIFICATION CHECKPOINT: Did you complete Steps 1-4? If ANY missing, DO NOT PROCEED.**
**⚠️ Specifically: Did you consult IQ2 in Step 3? If NO, you MUST go back and complete Step 3 first.**

**lesson-editor agent crafts the final lesson** using Validation-Enhancement Framework

Invoke lesson-editor agent:
```bash
Task tool with subagent_type="lesson-editor"
Prompt: "Read the lesson file at [path] and craft Part 3 following Validation-Enhancement Framework"
```

**⚠️ CRITICAL: ONLY invoke lesson-editor AFTER Parts 1, 2, and 2.5 are complete.**
**⚠️ CRITICAL: Part 2 MUST include IQ2 contribution. If it doesn't, STOP and complete Step 3 properly.**

**lesson-editor's Role** (not Zen Scribe):

Synthesizes Parts 1-2.5 into flowing lesson with:
- **Three-Source Validation**: Every enhancement validated by Derek's writings
- **Historical Proof**: Newton/Einstein, etc. (only if validated by Search 2)
- **Practical Examples**: "Not/Instead" format (created from Derek's principles)
- **Cross-References**: Embedded connections to previous lessons (if validated by Search 3)
- **Dramatic Buildup Opening**: v10's compelling narrative structure
- **Drift Detection**: Safeguards against psychologizing mystical teachings

**lesson-editor Creates**:

1. **Dramatic Buildup Opening**:
   - Buildup: "Great inventors... understood something profound:"
   - Line break (dramatic pause)
   - Payoff: "[Most profound concept]"
   - Deepening: Historical proof, context from Derek's writings

2. **Development**:
   - Derek's core teachings (from Search 1)
   - Validated enhancements (from Search 2)
   - Sincerity distinctions (Derek's exact questions)

3. **Character Transformation**:
   - Ego dissolution, courage, sacred reverence (from team insights)
   - "Flows from vs through you" mechanism (Stephen King example from Search 2)

4. **Practical Application**:
   - "Not/Instead" examples (created from Derek's principles)
   - "So how do you practice this?" bridge

5. **Empowering Conclusion**:
   - "This is what empowerment actually looks like"
   - Cross-reference to Lesson 002 if discussing "flows through you" (validated by Search 3)

**Quality Targets**:
- Length: ~2,500-3,500 characters (v10 was 3,832, v19 was 2,102)
- Voice: Derek speaking directly to reader ("you" throughout)
- Mystical language: Preserved EXACTLY ("vacuum that the Universe fills")
- No psychologizing: Drift detection passed (all green flags)
- Post-lesson metadata: Related Concepts, Writing Team, Process

**Create Part 3**: "The Lesson" - one-page, flowing, validated enhancement of Derek's teachings

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
| lesson-editor | Validation-Enhancement Synthesis | `.claude/agents/lesson-editor.md` |

**Derek Character Profile**: `Saved/Derek/Projects/2-Minutes-HOOT/derek-character-profile.md`

**lesson-editor Framework**: Validation-Enhancement Framework
- Three-Source Validation Rule
- Dramatic Buildup Opening (v10's narrative structure)
- Drift Detection Warnings
- Length Target: 2,500-3,500 characters

---

## Key Reminder

**After every lesson write/save**: Display in viewer with `--team` parameter showing active collaborators.

This is non-negotiable workflow. Do it automatically without being asked.
