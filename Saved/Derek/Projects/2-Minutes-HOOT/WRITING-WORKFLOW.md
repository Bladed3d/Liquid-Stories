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

**When to Re-index** (use judgment, don't ask every time):
- ✅ User explicitly requests it
- ✅ After user adds NEW writings to the library
- ✅ If search results seem incomplete or outdated
- ❌ NOT before every lesson - that's overkill

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

---

**⚡ CHECKPOINT 1: Lesson Essence (BEFORE searching)**

Before any Qdrant searches, the team must understand what the lesson is REALLY about. Otherwise, searches drive understanding instead of understanding driving searches.

**The team asks three questions:**

1. **What is this lesson about?** (Not the topic word - the actual insight)
2. **What is Derek's REAL breakthrough?** (The thing that changes everything)
3. **What transforms for the reader?** (Not what they learn - who they become)

**Quick process:**
- Read the Table of Contents entry for this lesson
- Role-play Character Weaver + Zen Scribe briefly to surface the real insight
- Write 2-3 sentences capturing the Lesson Essence

**Example - Lesson 004 "Asking":**
- ❌ Surface: "Ask better questions to get better answers"
- ✅ Real insight: "Questions are polluted by ego/anger/greed before you ask them. Clear yourself first, then ask sincerely."

**The Lesson Essence guides your search terms for the three searches below.**

---

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

When Part 1 is complete, activate the team:

---

**⚡ PRE-FLIGHT: Ensure IQ2 is Running**

Before calling IQ2, check if the server is responding:

```bash
curl -s http://127.0.0.1:8080/health
```

**If no response, start the server automatically:**

```bash
start "IQ2 Server" E:/llamacpp/bin/llama-server.exe -m E:/llamacpp/models/minimax-m2.1-PRISM-IQ2_M.gguf -ngl 18 -c 8192 --port 8080 --temp 0.7 --top_p 0.95 --top_k 40 --dry-multiplier 0.5 --dry-base 2.0
```

Wait 30-60 seconds for server initialization, then proceed.

**Do NOT ask the user** — infrastructure issues with documented solutions should be resolved automatically. Only ask when you genuinely cannot proceed.

---

1. **Ask IQ2 FIRST** via llama-server API

   **CRITICAL: Use simple text prompts only** - no special characters, no slashes, no complex escaping. This prevents duplication issues.

   **IQ2 takes 2-3.5 minutes to respond** - launch first, then work on Character Weaver + Zen Scribe while waiting.

   ```bash
   curl -s -X POST http://127.0.0.1:8080/completion \
     -H "Content-Type: application/json" \
     -d '{
       "prompt": "Simple text question about the lesson topic. Include key quotes from research. Ask for structure and audience guidance.",
       "n_predict": 1500,
       "repeat_penalty": 1.1,
       "repeat_last_n": 64
     }'
   ```

2. **While IQ2 processes (~2-3 min), role-play Character Weaver and Zen Scribe**

   These are **role-played** (not subagents) because they contribute to dialogue, not final output:
   - Read Derek Character Profile for voice guidance
   - **Character Weaver**: Derek's psychology - how he'd approach this topic, his wounds, contradictions
   - **Zen Scribe**: Voice execution - how to express insights in Derek's authentic language

3. **Retrieve IQ2 response** and integrate with team insights
   - **NEVER simulate or fake IQ2's input**
   - **ALWAYS use IQ2's actual response**
   - Weave IQ2's structure/audience insights with Character Weaver + Zen Scribe perspectives

**Create Part 2**: "The Writing Team Dialogue" capturing all perspectives

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

**⚡ CHECKPOINT 2: Revisit Lesson Essence (AFTER research & dialogue)**

Before writing Part 3, the team re-asks the three Lesson Essence questions:

1. **What is this lesson REALLY about?** (Has our understanding changed?)
2. **What is Derek's REAL breakthrough?** (Did we discover something deeper?)
3. **What transforms for the reader?** (Is it what we originally thought?)

**Possible outcomes:**

- **Confirmed**: Research validated initial insight → proceed with original Lesson Essence
- **Deepened**: Found nuances/layers → update Lesson Essence with richer understanding
- **Shifted**: Discovered it's about something different → update Lesson Essence before Part 3

**This checkpoint prevents drift.** Without it, the team might write Part 3 based on what the research returned instead of what the lesson is actually about.

**Include in Part 2.5**: State whether Lesson Essence was Confirmed, Deepened, or Shifted.

---

### Step 5: Write the Unified Lesson (Part 3)

**Part 3 is written IN CONVERSATION** (not as deployed subagent)

**Why in-conversation?** The contextual richness from participating in the full discussion (Lesson Essence, searches, team dialogue, integration) produces dramatically better output than a subagent reading a file. The subagent doesn't have the lived understanding - it only reads documents.

**Process:**
1. Read the lesson-editor agent profile for guidance on structure and voice
2. Write Part 3 in conversation, drawing on full context from Steps 1-4
3. Follow the Opening Hook Strategy and structure below

**Lesson Editor Role** (role-played in conversation):
- **Opening Hook**: Start with MOST profound/shocking concept (not "what you were taught")
- **Enhancement**: Elaborate and deepen insights with context (historical figures, universal experiences)
- **Comprehension Bridges**: Explain novel concepts so they land with meaning
- **Derek's Voice**: Direct address ("you"), conversational, powerful but humble

**lesson-editor Creates**:

1. **Hook Opening**: Lead with Derek's most shocking insight + compelling context
2. **Development**: Why this matters, how it works
3. **Deepening**: Psychological truth, character transformation
4. **Application**: Concrete practice ("Not/Instead" examples)
5. **Transformation**: Who they become through this

**Quality Targets**:
- Length: ~700-900 words (3-4 minute read, like v10/v24)
- Voice: Derek speaking directly to reader ("you" throughout)
- Mystical language: Preserved EXACTLY ("vacuum that the Universe fills")
- All insights from Integration Round included
- Post-lesson metadata: Related Concepts, Writing Team, Process

**Create Part 3**: "The Lesson" - one-page, flowing enhancement of Derek's teachings

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
| lesson-editor | Fresh Reader Synthesis (Part 3) | `.claude/agents/lesson-editor.md` |

**Derek Character Profile**: `Saved/Derek/Projects/2-Minutes-HOOT/derek-character-profile.md`

**Lesson Editor Framework**: In-Conversation Synthesis + Opening Hook Strategy
- Dramatic Buildup Opening (historical figures → line break → profound statement)
- Enhancement Role (elaborate and deepen with context)
- Comprehension Bridges (explain novel concepts)
- Length Target: ~700-900 words (3-4 minute read, like v10/v24)

---

## Key Reminder

**After every lesson write/save**: Display in viewer with `--team` parameter showing active collaborators.

This is non-negotiable workflow. Do it automatically without being asked.
