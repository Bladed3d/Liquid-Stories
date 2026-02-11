# Library Search Protocol - Agent Deployment

**CRITICAL:** Always use an agent for library research. Never run searches directly in main conversation.

---

## When to Use Library Search

Use Derek's Reference Library when:
- User asks "What has Derek written about X?"
- Need context about Derek's past work/ideas on a topic
- Researching leadership, business, psychology, consciousness, AI, etc.
- Building content based on Derek's existing writings

---

## How to Deploy Agent for Library Research

### Step 1: Launch the Agent

**Use the general-purpose agent for library research:**

```
I need to research Derek's writings about [TOPIC].
Please search the library and compile relevant findings.
```

### Step 2: Agent Task Specification

The agent should:
1. Use the library search scripts at `Saved/Derek/Reference-Library/scripts/`
2. Run multiple searches across related themes
3. Extract key insights with source citations
4. Return synthesized findings (not raw search results)

### Step 3: Integrate Results

Once the agent returns, integrate the findings into your response with proper citations.

---

## Library Search Scripts

Location: `Saved/Derek/Reference-Library/scripts/`

### Basic Search
```bash
cd Saved/Derek/Reference-Library/scripts
python search.py "your query here" --limit 10 --format json
```

### Advanced Options
```bash
# More results
python search.py "query" --limit 20

# Filter by topic
python search.py "leadership" --topic "Topics/Leadership"

# JSON output for AI processing
python search.py "truth" --format json
```

### Search Themes

When researching, search across multiple related terms:

**Core HOOT Themes:**
- truth, asking questions, gratitude, imagination, focus
- ego, judgment, forgiveness, manifestation
- time illusion, consciousness, awareness

**Business Themes:**
- leadership, sales, coaching, team dynamics
- entrepreneurship, marketing, strategy

**Personal Growth:**
- happiness, choice, consequences, learning
- relationships, communication, conflict

---

## Agent Output Format

The agent should return:
1. **Key insights** - Main points from Derek's writings
2. **Source citations** - File paths for each insight
3. **Relevance score** - How well it matches the query
4. **Synthesis** - How findings relate to each other

---

## Example Agent Deployment

**User asks:** "What has Derek written about leadership principles?"

**Your response:**
```
Let me search Derek's library for information about leadership principles.
```

**Then launch agent:**
```
Task: general-purpose
Prompt: Search Derek's Reference Library for content about "leadership principles"
and related leadership topics. Use the search scripts at
Saved/Derek/Reference-Library/scripts/search.py

Search for:
- "leadership principles"
- "coaching"
- "team dynamics"
- "leading people"

Compile the key insights with source citations and return a summary of
Derek's views on leadership.
```

**After agent completes:**
Synthesize the agent's findings into your response to the user.

---

## Why This Matters

**Context Usage:**
- Direct library searches: ~5-10k tokens per search
- Agent research: Separated context, preserves main conversation
- You get ~200k tokens - use them wisely!

**Workflow:**
1. Main conversation stays focused on user interaction
2. Agent handles research-heavy tasks
3. Agent results integrate cleanly into main response

---

## Quick Reference

**DO:**
- Deploy general-purpose agent for library research
- Specify clear search themes and queries
- Request synthesized results with citations
- Use JSON format for AI processing

**DON'T:**
- Run library searches directly in main conversation
- Burn context on raw search results
- Search without a clear purpose
- Forget to cite sources

---

## Library Status

- **Indexed:** 263 files, 17,604 chunks
- **Database:** Qdrant Cloud (shared with AdvisorTeam)
- **Topics:** Leadership, Sales, Writing, Psychology, Consciousness, AI-Tech, Higher-Order-Of-Thought, Business-Wisdom

---

## Troubleshooting

If agent fails:
1. Check that scripts exist at `Saved/Derek/Reference-Library/scripts/`
2. Verify Qdrant credentials in `.env` file
3. Ensure Python packages installed: `pip install qdrant-client sentence-transformers python-dotenv`
4. Try simpler search query

---

Created: 2026-01-03
Purpose: Preserve context by delegating library research to agents
