# Available Agents

This directory contains specialized agents that follow the Claude Code agent protocol. Each agent can be deployed in any new chat session using simple commands and maintains independent context for extended sessions.

## 🎬 Production & Visual Agents

### 🖼️ Image-Prompt Agent
**File:** `image-prompt.md`

**Purpose:** Creates optimized prompts for Flux1.dev and ComfyUI workflows for video production.

**When to use:**
- Need AI-generated images for video production
- Want professional camera/lighting terminology
- Need prompts optimized for Flux1.dev token limits
- Want cinematic, miniature world, or character prompts

**Deploy command:**
> "launch image-prompt agent to create a prompt for [your image description]"

**Example usage:**
> "launch image-prompt agent to create a prompt for a miniature world film studio with writing room, computer room, and green screen"

### 📋 Storyboard Agent
**File:** `storyboard.md`

**Purpose:** Creates and manages complete video production storyboards with progress tracking and AI image integration.

**When to use:**
- Creating video production storyboards
- Managing scene-by-scene workflows
- Tracking production progress and timelines
- Integrating AI image generation with production planning

**Deploy command:**
> "launch storyboard agent to create a storyboard for [your video concept]"

**Example usage:**
> "launch storyboard agent to create a storyboard for a 3-minute animated film about space exploration"

## ✍️ AI Writing Team Specialists

### 🏗️ Story Architect
**File:** `story-architect.md`

**Purpose:** Former Pixar story editor specializing in story structure, character development, narrative planning, and emotional arcs.

**When to use:**
- Story structure and plot development
- Character arcs and emotional truth
- Three-act structure, hero's journey
- Books, scripts, narrative content

**Deploy command:**
> "launch story-architect agent for [story structure/character development/plot planning]"

### 💼 Business Storyteller
**File:** `business-storyteller.md`

**Purpose:** Former Nike Executive Story Director specializing in brand narratives, corporate stories, and persuasive content.

**When to use:**
- Brand stories and company narratives
- TED talks and keynote presentations
- Case studies and customer success stories
- Leadership communication and thought leadership

**Deploy command:**
> "launch business-storyteller agent for [brand story/case study/presentation content]"

### 🧘 Zen Scribe
**File:** `zen-scribe.md`

**Purpose:** Former monastic writer specializing in mindful content, meditation guides, wisdom teachings, and compassionate communication.

**When to use:**
- Mindful content and meditation guides
- Spiritual teachings and wisdom content
- Mental health writing and compassionate communication
- Parables and contemplative essays

**Deploy command:**
> "launch zen-scribe agent for [mindful content/wisdom teachings/meditation guide]"

### 🎬 Visual Wordsmith
**File:** `visual-wordsmith.md`

**Purpose:** Former Advertising Creative Director specializing in video scripts, visual storytelling, and content that works without dialogue.

**When to use:**
- Video scripts and visual storytelling
- Social media content and commercials
- Content that works without dialogue
- Multi-platform visual narratives

**Deploy command:**
> "launch visual-wordsmith agent for [video script/visual content/social media story]"

### 🎯 Writing Team Manager
**File:** `writing-team-manager.md`

**Purpose:** Orchestrates collaborative discussions between AI Writing Team specialists (Story Architect, Business Storyteller, Zen Scribe, Visual Wordsmith) while maintaining their independent contexts and authentic team dynamics.

**When to use:**
- Collaborative Writing Team brainstorming sessions
- Multiple perspectives needed for story/content development
- Group discussions and team-based decision making
- Projects requiring combination of story, business, mindful, and visual expertise
- Coordinating multiple specialists without managing individual deployments

**Deploy command:**
> "launch writing-team-manager agent to orchestrate full Writing Team session for [project type/description]"

### 🎯 Writing Team Coordinator
**File:** `writing-team-coordinator.md`

**Purpose:** Manages AI Writing Team sessions, coordinates specialist deployment, and handles session documentation and workflow management.

**When to use:**
- Starting Writing Team brainstorming sessions
- Coordinating multiple specialists for projects
- Managing session documentation and continuity
- Structuring complex multi-phase writing projects

**Deploy command:**
> "launch writing-team-coordinator agent to set up [brainstorming session/story development/business content planning]"

## 🔍 Research & Development Agents

### 📚 Research Agent
**File:** `research.md`

**Purpose:** Real-time internet research specialist supporting all agents with accurate information and context.

**When to use:**
- Fact-checking and verification
- Market research and trend analysis
- Competitive analysis and industry data
- Supporting any specialist with information

**Deploy command:**
> "launch research agent for [topic research/fact-checking/market analysis]"

### 🧪 Quality Assurance Agent
**File:** `quality.md`

**Purpose:** Verifies developer agent work independently, runs tests without trusting output, and recommends APPROVED/NEEDS_FIX/ESCALATE.

**When to use:**
- Testing and quality verification
- Independent code review and testing
- Ensuring deliverables meet standards
- Validating implementation quality

**Deploy command:**
> "launch quality agent to verify [implementation/testing/work quality]"

## 🔄 Combined Workflows

### Video Production Workflow:
1. Launch storyboard agent to create project structure
2. Launch image-prompt agent for each scene's visual development
3. Use generated images in storyboard
4. Track progress through production phases

### Complete Writing Team Workflow:
1. Launch writing-team-coordinator agent to set up session
2. Deploy appropriate specialists (story-architect, business-storyteller, zen-scribe, visual-wordsmith)
3. Use research agent for fact-checking and support
4. Review work with quality agent before finalizing

**Example combined usage:**
> "launch writing-team-coordinator agent to set up a brainstorming session for a brand story, then deploy business-storyteller and story-architect agents for development"

## 🚀 Quick Deployment

All agents are ready for immediate deployment in any new chat session. Each agent maintains independent context, allowing for extended sessions without running out of memory. They contain all research, terminology, and workflow optimizations built-in, requiring no additional explanation or setup.

The agents follow the established Claude Code protocol and integrate seamlessly with your existing GLM-4.6, Obsidian, and ComfyUI workflows.