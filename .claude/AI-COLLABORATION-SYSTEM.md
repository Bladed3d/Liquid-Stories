# AI Collaboration System Guide

**For AI Sessions:** This document explains how the team system, agents, and IQ2 integration work.

---

## Quick Start

When a user asks about teams, advisors, or collaboration:
1. Read this document first
2. Read relevant team configs in `.claude/teams/`
3. Read agent profiles in `.claude/agents/` as needed

---

## System Architecture

```
.claude/
  agents/              # All agent definitions (Task tool uses these)
    [agent-name].md   # Individual agent profiles
  teams/              # Team configurations
    [team-name].md    # Who is on each team, when to use them
  advisors/           # Legacy advisory team docs (being phased out)
```

---

## Core Principles

### 1. Team Size: 3 Collaborators + Research Utility

**Research Finding:** 3 experts is optimal for truthfulness. More than 3 causes information confusion.

**Structure:**
- **3 Core Collaborators** = The actual team members who discuss and debate
- **Research Utility** = Worker agent, NOT a collaborator. Provides facts when needed.

### 2. Agent vs. Team vs. Utility

| Type | Purpose | Example |
|------|---------|---------|
| **Agent** | Individual AI persona with specific expertise | Story Architect, Zen Scribe |
| **Team** | 3 agents working together on a domain | Writing Team, Business Growth Team |
| **Utility** | Support function, not a collaborator | Research (fetches facts) |

### 3. Shared Agents

Some agents work across multiple teams:
- **IQ2** (MiniMax model) - Used by Writing, Business Growth, Executive Brainstorm, Social Media
- **Research** - Available to all teams on-demand
- **Character Weaver** - Available to any team needing character/psychology depth

---

## IQ2 Integration

### What is IQ2?

**IQ2** = MiniMax-M2.1-PRISM-IQ2_M model running locally via llama-server

**Purpose:** Different model with multi-step reasoning and scenario exploration capabilities. Provides diverse perspective beyond Claude-based agents.

### Starting IQ2 Server

**Windows Command (use forward slashes):**
```bash
start "IQ2 Server" E:/llamacpp/bin/llama-server.exe -m E:/llamacpp/models/minimax-m2.1-PRISM-IQ2_M.gguf -ngl 18 -c 8192 --port 8080 --temp 0.7 --top_p 0.95 --top_k 40 --dry-multiplier 0.5 --dry-base 2.0
```

**Verify Running:**
```bash
curl -s http://127.0.0.1:8080/health
# Should return: {"status":"ok"}
```

### Communicating with IQ2

**CRITICAL: Use Simple Text Prompts**

Based on user's successful workflow with llama-cli, prompts to IQ2 should be **simple text paragraphs** without complex escaping or special formatting.

**API Call Pattern:**
```bash
curl -s -X POST http://127.0.0.1:8080/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Your simple text question goes here. Elaborate as needed but keep it as a solid text paragraph.",
    "n_predict": 1000,
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "repeat_penalty": 1.1,
    "repeat_last_n": 64
  }'
```

**Key Points:**
- **Simple text only** - no newlines, no special characters that need escaping
- **Single paragraph format** - keep prompts as continuous text
- **Include repeat_penalty** - prevents IQ2 from getting stuck in loops (1.1, 64)
- **Dry sampling parameters** - `dry_multiplier: 0.5`, `dry_base: 2.0` for variety

**Example:**
```bash
curl -s -X POST http://127.0.0.1:8080/completion -H "Content-Type: application/json" -d '{"prompt": "As Story Architect for lesson on Asking, what is the narrative arc from not-knowing to truth-receiving? How does asking transform character through ego dissolution? What hooks the reader immediately?", "n_predict": 1500, "temperature": 0.7, "top_p": 0.95, "top_k": 40, "repeat_penalty": 1.1, "repeat_last_n": 64, "dry_multiplier": 0.5, "dry_base": 2.0}'
```

**Chain-of-Thought Suppression:**
IQ2 tends to show its reasoning. To suppress, prefix prompts with:
```
**Constraint:** Output ONLY your final answer directly. Skip all reasoning, step-by-step breakdown, and intermediate thinking.
```

**Note:** This reduces but doesn't fully eliminate verbosity. IQ2 tends to give the answer first, then add reasoning. If responses get cut off, the key info is usually at the beginning.

### When to Use IQ2

**In Team Collaboration:**
- Writing Team: Story Architect + Audience Advisor (combined role)
- Business Growth Team: Scenario exploration, consequence analysis
- Executive Brainstorm Team: "What if" scenarios
- Social Media Team: Trend analysis, viral mechanics

**For Direct Questions:**
- User says "Ask IQ2..." or "What does IQ2 think..."
- Scenario analysis and consequence exploration
- Multi-step reasoning tasks

---

## Current Teams

### Writing Team

**File:** `.claude/teams/writing-team.md`

**Purpose:** Content creation with strong narrative structure, deep character psychology, and meaningful voice.

**Configuration A (IQ2-Heavy):**
| Agent | Role |
|-------|------|
| IQ2 | Story Architect + Audience Advisor (structure + reader psychology) |
| Character Weaver | Psychological depth, internal life, contradictions, growth |
| Zen Scribe | Voice, wisdom, compassionate communication |

**Configuration B (Full Specialist):**
| Agent | Role |
|-------|------|
| Story Architect | Narrative structure, arc, pacing |
| Audience Advisor | Reader psychology, emotional journey |
| Character Weaver | Character depth, psychology |
| Zen Scribe | Voice, wisdom, meaning |

**Use When:**
- Story and narrative development
- Character development and psychological depth
- Content requiring authentic voice and deeper meaning

### Other Teams (To Be Created)

- Business Growth Team
- Executive Brainstorm Team
- Social Media Team
- Personal Growth Team
- Studio/Production Team

---

## Team Workflows

**Complete Workflow Guide:** `.claude/agents/README-v2.md`

The 5-step process for content creation using the Writing Team:
1. **Research** - Gather authentic source material (semantic search)
2. **Activate Team** - IQ2 first (llama-server), then role-play other agents
3. **Integration Round** - Map ALL insights to structure (critical step)
4. **Write** - Create unified content integrating all insights
5. **Display** - Show results with team attribution

**Why README-v2?** Any workflow requires agents, so AI sessions will already be reading the agents README. This keeps workflow instructions where they're naturally discovered.

---

## Invoking Teams

When user says:
- "Consult the writing team about..."
- "Get the writing team's input on..."
- "Writing team: [your question]"

**Process:**
1. Read the relevant team config in `.claude/teams/`
2. Read agent profiles for team members
3. Simulate collaboration (or actually invoke agents via Task tool)
4. Synthesize responses

---

## Creating New Agents

Use the **Persona-Creator** agent:

```
Task tool → subagent_type="persona-creator" → prompt="[describe the agent needed]"
```

The Persona-Creator will:
- Follow research-validated framework (Harvard ExpertPrompting)
- Generate persona with proper structure
- Run validation checks
- Return complete, ready-to-use persona

**Persona-Creator Framework:**
- Credentials (specific, truthful)
- Domain (clear scope with boundaries)
- Methodology (explicit frameworks, not vague "advanced techniques")
- Transparency (AI disclosure, limitations)
- Validation checklist before output

---

## Agent File Structure

All agents follow this format:

```markdown
---
name: agent-name
description: [Brief description for Task tool discovery]
model: sonnet | haiku | opus
---

# Agent Name - Role Title

**Purpose**: [What this agent does]

**When you're launched:**
- [When this agent is activated]

**Your Job:**
1. [Primary responsibility]
2. [Secondary responsibility]
...

[Process, frameworks, response format, quality guidelines, etc.]
```

---

## Legacy Migration Notes

**Previous Structure (being phased out):**
- `.claude/advisors/` - Old advisory team docs
- `AdvisorTeam/` folder - Even older location

**New Structure (current):**
- `.claude/agents/` - All agent definitions
- `.claude/teams/` - Team configurations

**Archived Agents:**
- Original versions of agents are in `.claude/agents/archive/`
- New versions regenerated with Persona-Creator follow validated framework

---

## Troubleshooting

### IQ2 Not Responding

**Symptom:** curl calls timeout or return errors

**Solutions:**
1. Check if server is running: `curl -s http://127.0.0.1:8080/health`
2. If not running, start server with correct command (forward slashes!)
3. Check VRAM usage - if near 24GB limit, restart server
4. Verify model path is correct

### Agent Not Found

**Symptom:** Task tool fails to find agent

**Solutions:**
1. Check agent file exists in `.claude/agents/`
2. Verify filename matches agent name (kebab-case)
3. Check agent has proper YAML frontmatter (`---name:...---`)

### Team Confusion

**Symptom:** Unclear which agents are on which team

**Solutions:**
1. Read relevant team config in `.claude/teams/`
2. Check "Shared Agents" section for cross-team agents
3. Verify team has exactly 3 core collaborators + research utility

---

## Key Contacts

**System Documentation:**
- This file: `.claude/AI-COLLABORATION-SYSTEM.md`
- Team configs: `.claude/teams/*.md`
- Agent profiles: `.claude/agents/*.md`
- Persona-Creator: `.claude/agents/persona-creator.md`

**User's Global Instructions:**
- `C:\Users\Administrator\.claude\CLAUDE.md`

---

## Remember

**Golden Rules:**
1. 3 collaborators maximum per team (research-validated optimal)
2. Research is a utility, not a collaborator
3. IQ2 uses llama-server with specific startup command
4. Use forward slashes in Windows paths
5. All agents must follow Persona-Creator framework
6. Always validate personas before use
