# Ambient Development Guide

**LED Breadcrumbs System for AI Developers**

---

## ⚠️ FIRST TIME HERE? READ THIS FIRST!

**👉 Start with `.claude/START-HERE.md` - Contains mandatory instructions for EVERY Claude session**

This document provides Ambient-specific context. START-HERE.md provides the universal development process.

---

## What is Ambient?

**Ambient** creates ambient music videos with motion graphics and storytelling.

### Project Purpose

Produce one-hour ambient music videos every 2 days, featuring:
- AI-generated motion graphics and imagery
- Story-driven narratives with screenplay writing
- Professional video editing and composition

### Project Context

**Name:** Ambient
**Tech Stack:**
- **Website:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Framer Motion (same as DebugLayer)
- **AI Services:** Google Gemini (text), Grok Imagine (images), ComfyUI (video generation on 4090)
- **Video Production:** Adobe After Effects, Kdenlive
- **Testing:** Playwright (for website)

**Status:** Production phase
**Production Goal:** One 60-minute video every 2 days

---

## Project Structure

```
D:\Projects\Ai\Ambient\
├── .claude/                        # Development workflow & agents
│   ├── agents/                     # Multi-agent development team
│   │   ├── developer.md            # Code implementation with LED breadcrumbs
│   │   ├── quality.md              # Independent verification
│   │   ├── test-creation.md        # Testing specialist
│   │   ├── story-architect.md      # Story arch and user experience design
│   │   ├── screenplay-writer.md    # Screenplay and narrative writing
│   │   ├── research.md             # Problem-solving research
│   │   ├── debugger.md             # Root cause analysis
│   │   └── environment.md          # Configuration troubleshooting
│   ├── START-HERE.md               # READ THIS FIRST!
│   ├── MANDATORY-DEV-PROCESS.md    # The ONLY approved workflow
│   ├── AUTO-TEST-PROTOCOL.md       # Testing requirements
│   └── QUICK-REFERENCE.md          # Command cheat sheet
├── Docs/                           # System documentation
│   ├── SYSTEM-BREAKTHROUGHS.md     # The two critical discoveries
│   └── BUILDING-AI-AGENT-TEAMS.md  # How to build agent systems
├── website/                        # Next.js website (showcase videos, manage projects)
├── projects/                       # Video project directories
├── scripts/                        # Production pipeline automation
├── assets/                         # Shared resources (music, fonts, templates)
└── CLAUDE.md                       # This file
```

---

## The LED Breadcrumbs System

### What Are LED Breadcrumbs?

Execution trail markers that create a log showing exactly what your code did:

```
✅ LED 10000: user_clicked_button [ComponentName]
✅ LED 10010: api_call_started [ComponentName] {"endpoint":"/api/endpoint"}
❌ LED 10012 FAILED [ComponentName]: api_timeout - Request took 5000ms
```

**Why they matter:**
- AI agents can read structured logs and debug precisely
- 3-hour debugging sessions reduced to 5 minutes
- "Where did it fail?" answered instantly

### The Two Breakthroughs

**See `Docs/SYSTEM-BREAKTHROUGHS.md` for the full story**

**Breakthrough #1: Agent Task Confirmation**
- Agent confirms understanding before starting
- Creates memory checkpoint that persists
- Saves 90% of tokens (no re-explaining)
- Prevents Claude from forgetting the process

**Breakthrough #2: Test Validation**
- 3 hours wasted debugging perfect code with wrong tests
- Test-creation agent verifies selectors exist before writing tests
- Tests can never succeed → Tests that actually work

---

## Development Workflow

### For Code Development

**Use the agent-based workflow:**

```
Use developer agent for task-XXX
  ↓
Developer: "I understand. I will: [confirmation]"
  ↓
Developer: [Implements with LED breadcrumbs + tests]
  ↓
Developer: "Done. RAW proof: [test output]"
  ↓
Use quality agent to verify task-XXX
  ↓
Quality: [Verifies independently] → APPROVED / NEEDS_FIX
  ↓
Main Claude: [Spot-checks both reports]
  ↓
Approve to user if verified ✅
```

### For Documentation

**Standard development process:**

1. **Research** - WebSearch/WebFetch for similar docs
2. **Write** - Create/edit documentation
3. **Review** - Check for clarity and completeness
4. **Commit** - Save with clear message

**No tests needed** for documentation (unless writing code examples).

---

## Key Documents to Know

### Development Process

- **`.claude/START-HERE.md`** - MANDATORY reading for every session
- **`.claude/MANDATORY-DEV-PROCESS.md`** - The RESEARCH → CODE+LED → TEST loop
- **`.claude/AUTO-TEST-PROTOCOL.md`** - Never ask user to test
- **`.claude/QUICK-REFERENCE.md`** - Commands cheat sheet

### System Innovation

- **`Docs/SYSTEM-BREAKTHROUGHS.md`** - The story of our discoveries
- **`Docs/BUILDING-AI-AGENT-TEAMS.md`** - How to replicate the system

---

## LED Ranges for Ambient

### Production Pipeline (10000-14999)

**10000-10999: Story Generation**
- 10000-10099: Story architect agent operations (arch creation, theme development)
- 10100-10199: Screenplay writer agent operations (script writing, dialogue)
- 10200-10299: Story validation (coherence checks, narrative flow)
- 10300-10399: Story revision workflow
- 10400-10499: Story approval and finalization

**11000-11999: AI Services**
- 11000-11099: Google Gemini operations (text generation, story enhancement)
- 11100-11199: Grok Imagine operations (image generation requests, results)
- 11200-11299: ComfyUI operations (video generation on 4090, workflow execution)
- 11300-11399: AI service errors and retries
- 11400-11499: AI output validation and quality checks

**12000-12999: Video Production**
- 12000-12099: After Effects operations (composition creation, rendering)
- 12100-12199: Kdenlive operations (editing, timeline management)
- 12200-12299: Asset management (music, fonts, templates)
- 12300-12399: Rendering and export
- 12400-12499: Video quality validation

**13000-13999: Project Management**
- 13000-13099: Project creation and initialization
- 13100-13199: Production pipeline scheduling
- 13200-13299: Task tracking and progress monitoring
- 13300-13399: Resource allocation (GPU time, storage)
- 13400-13499: Project completion and archival

**14000-14999: Integration & Automation**
- 14000-14099: Pipeline orchestration (story → AI → video workflow)
- 14100-14199: File system operations (project directories, asset organization)
- 14200-14299: Batch processing and queue management
- 14300-14399: Error recovery and retry logic
- 14400-14499: Performance monitoring and optimization

### Website (30000-39999)

**Same LED ranges as DebugLayer website:**

- **30000-30099**: Page lifecycle (mount, hydration, unmount)
- **30100-30199**: User interactions (clicks, inputs, navigation)
- **30200-30299**: API calls (requests, responses, caching)
- **30300-30399**: Component rendering (state, props, effects)
- **30400-30499**: Form submissions (validation, errors)
- **30500-30599**: Data processing (parse, transform, aggregate)
- **30600-30699**: UI interactions (modals, dropdowns, tooltips)
- **30700-30799**: Authentication & Authorization
- **30800-30899**: Error handling & recovery

### Why These Ranges?

**Production workflow:** Story → AI Generation → Video Production → Project Management
- Each major phase has its own 1000-number range
- Debugging is easier: "11200 failed" = ComfyUI video generation issue
- Pipeline orchestration at 14000 ties everything together

**Website separate:** Uses proven DebugLayer ranges (30000-39999)
- Familiar to developers who worked on DebugLayer
- Well-documented and battle-tested
- Keeps website debugging distinct from production pipeline

### LED Range Best Practices

✅ **DO:**
- Define ranges based on actual operations in your code
- Use ranges that make debugging easier
- Group related operations together
- Look at other projects for organizational ideas

❌ **DON'T:**
- Copy ranges from other projects without thinking
- Use generic categories that don't match your operations
- Assign ranges before understanding your workflows

---

## Production Workflow

### Video Production Pipeline (Every 2 Days)

**Day 1: Story & AI Generation**
1. **Story Creation** (2-3 hours)
   - Use story-architect agent for narrative arch and theme
   - Use screenplay-writer agent for script and dialogue
   - Review and approve story

2. **AI Asset Generation** (4-6 hours)
   - Google Gemini: Enhance text and generate scene descriptions
   - Grok Imagine: Generate key images and visual assets
   - ComfyUI on 4090: Generate video segments and motion graphics
   - Quality checks on all AI outputs

**Day 2: Video Production & Publishing**
3. **Video Composition** (6-8 hours)
   - After Effects: Create motion graphics and compositions
   - Kdenlive: Edit timeline, add music, final assembly
   - Render final 60-minute video

4. **Publishing & Archival** (1-2 hours)
   - Upload to platforms
   - Update website with new video
   - Archive project files

### Website Development Workflow

**Use standard agent-based workflow:**
1. Developer agent implements with LED breadcrumbs
2. Quality agent verifies independently
3. Main Claude spot-checks proof

---

## The Agent Team

### Content Creation Agents (Story Production)

**Story-Architect Agent** (Sonnet)
- Designs narrative archs and story themes
- Focuses on emotional journey and user experience
- Creates cohesive 60-minute story structures
- Ensures thematic consistency across video
- **Critical feature:** Task confirmation before starting

**Screenplay-Writer Agent** (Sonnet)
- Writes screenplay and dialogue based on story arch
- Converts abstract themes into concrete narratives
- Creates scene-by-scene descriptions for AI generation
- Ensures pacing and flow for ambient format
- **Critical feature:** Task confirmation before starting

### Core Development Agents (Website)

**Developer Agent** (Sonnet)
- Implements website features with LED breadcrumbs
- Writes Playwright tests for UI components
- **Critical feature:** Task confirmation before starting
- Provides RAW test output as proof

**Quality Agent** (Haiku)
- Independent verification (doesn't trust developer)
- Re-runs tests independently
- Compares results
- Reports: APPROVED / NEEDS_FIX / ESCALATE

**Test-Creation Agent** (Sonnet)
- Playwright testing specialist
- **Never invents selectors** - always verifies they exist
- Prevents the 3-hour test crisis
- Writes tests that can actually succeed

### Support Agents

**Research Agent** (Sonnet)
- Finds proven solutions when stuck
- Researches video production techniques
- Provides 3-5 approaches with pros/cons
- Time limit: 15 minutes

**Debugger Agent** (Sonnet)
- Root cause analysis from LED logs
- Diagnoses production pipeline issues
- Diagnoses but doesn't fix
- Time limit: 15 minutes

**Environment Agent** (Haiku)
- Configuration troubleshooting
- ComfyUI, After Effects, Kdenlive setup
- Dependencies, .env issues, GPU configuration
- Time limit: 15 minutes

**See:** `.claude/agents/*.md` for complete specifications

---

## Common Tasks

### Video Production

```bash
# Story creation workflow
Use story-architect agent for project-[NAME]
Use screenplay-writer agent for project-[NAME]

# Review story outputs
cat projects/[NAME]/story-arch.md
cat projects/[NAME]/screenplay.md
```

**Story Agent Workflow:**
1. Story-architect creates narrative arch and themes
2. Screenplay-writer converts to detailed screenplay
3. Review and approve before AI generation phase
4. Both agents confirm understanding first (memory lock!)

### AI Asset Generation

```bash
# Generate with AI services
node scripts/generate-images.js project-[NAME]
node scripts/generate-video.js project-[NAME]

# Monitor LED logs for AI operations
grep "LED 11" breadcrumb-debug.log    # All AI services
grep "LED 111" breadcrumb-debug.log   # Grok Imagine only
grep "LED 112" breadcrumb-debug.log   # ComfyUI only
```

### Website Development

```bash
# Use developer agent for website features
Use developer agent for task-123

# Follow with quality verification
Use quality agent to verify task-123
```

**Remember:**
- Developer confirms understanding first (memory lock!)
- Developer provides RAW test proof
- Quality verifies independently
- Main Claude spot-checks before approving

### Testing

**MANDATORY: All website code must have Playwright tests**

```bash
# Run website tests
cd website && npm test

# Debug failed tests
cat breadcrumb-debug.log

# Filter for errors
grep "❌" breadcrumb-debug.log
grep "LED 30" breadcrumb-debug.log   # Website operations only
```

**Never report feature complete without passing tests.**

---

## Security & Best Practices

### API Key Protection

```typescript
// ✅ Safe
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY not found in .env");
}

// ❌ Never
const apiKey = "hardcoded-key-here";  // DON'T DO THIS!
```

### LED Logging Safety

```typescript
// ✅ Safe
trail.light(LED_RANGES.AUTH.LOGIN, 'login_attempt', {
  email: user.email
});

// ❌ Never log sensitive data
trail.light(LED_RANGES.AUTH.LOGIN, 'login_attempt', {
  email: user.email,
  password: user.password  // NEVER LOG PASSWORDS!
});
```

### File Naming

**Always use hyphens:**

```bash
# ✅ Correct
my-component.tsx
user-profile.ts

# ❌ Wrong
my_component.tsx
userProfile.ts
```

---

## Git Workflow

### Commit Messages

```bash
git commit -m "$(cat <<'EOF'
Brief title describing the change

- Bullet point of what changed
- Another detail if needed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### What to Commit

**Always commit:**
- Source code
- Documentation
- Configuration files
- Examples

**Never commit:**
- `.env` files
- API keys
- `node_modules/` or similar dependency directories
- Log files (`breadcrumb-debug.log`)
- Session files

---

## Quick Reference

```bash
# Story Creation
Use story-architect agent for project-[NAME]      # Create narrative arch
Use screenplay-writer agent for project-[NAME]    # Write screenplay

# AI Generation
node scripts/generate-images.js project-[NAME]    # Grok Imagine images
node scripts/generate-video.js project-[NAME]     # ComfyUI video segments

# Video Production
# After Effects: Manual composition creation
# Kdenlive: Manual editing and final assembly

# Website Development
cd website
npm run dev                           # Start dev server (port 3000)
npm test                              # Run Playwright tests
npm run build                         # Production build

# Debugging (Production Pipeline)
cat breadcrumb-debug.log              # View all LEDs
grep "❌" breadcrumb-debug.log        # Errors only
grep "LED 10" breadcrumb-debug.log    # Story generation
grep "LED 11" breadcrumb-debug.log    # AI services
grep "LED 12" breadcrumb-debug.log    # Video production
grep "LED 13" breadcrumb-debug.log    # Project management
grep "LED 14" breadcrumb-debug.log    # Pipeline orchestration

# Debugging (Website)
grep "LED 30" breadcrumb-debug.log    # All website operations
grep "LED 302" breadcrumb-debug.log   # API calls only

# Agent workflow (Website)
Use developer agent for task-XXX      # Implement
Use quality agent to verify task-XXX  # Verify
Use test-creation agent for tests     # When tests needed

# Project Management
ls projects/                          # List all video projects
cat projects/[NAME]/status.md         # Check project status
```

---

## Success Criteria

### You're doing it right when:

- ✅ Agents confirm understanding before starting
- ✅ All code has LED breadcrumbs at key points
- ✅ Tests verify tests (no invented selectors!)
- ✅ Quality agent catches developer mistakes
- ✅ User only sees working features
- ✅ Documentation is clear and helpful

### You're doing it wrong when:

- ❌ Skipping agent confirmation
- ❌ Trusting test reports without verification
- ❌ Writing tests without verifying selectors
- ❌ Asking user to test your code
- ❌ Debugging working code with wrong tests
- ❌ Over-complicating simple tasks

---

## Remember

> **"LED Breadcrumbs + AI Agent Teams = Self-healing development that never wastes your time"**

**Two innovations make this work:**
1. Agent task confirmation (prevents memory loss)
2. Test validation (prevents impossible tests)

**Three verification layers ensure quality:**
1. Developer tests with LEDs
2. Quality verifies independently
3. Main Claude spot-checks proof

**Result:** Development that actually works.

---

**Now go read `.claude/START-HERE.md` and start building!** 🚀
