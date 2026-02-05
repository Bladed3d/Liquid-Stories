# Kilo Agent Capabilities

*How Kilo's single-agent model handles the roles from your Claude Code workflow*

## Overview

In Claude Code, you used specialized agents (Task Breakdown, Test, Developer, Quality, Research) that spawned separately. Kilo consolidates all these capabilities into a single orchestrated agent, powered by Grok models, with access to specialized tools for different functions.

## Agent Role Mapping

### 1. Task Breakdown Agent → Kilo Analysis & Planning
**Claude Code:** Separate agent that broke down PRDs into atomic tasks
**Kilo Implementation:** Built-in analysis using Task tool with `subagent_type="explore"`

**Capabilities:**
- Deep codebase analysis with file pattern matching
- Code search and grep operations
- Task decomposition following your 5 criteria
- Dependency analysis and execution planning

**Tool Access:** Glob, Grep, Read, Task (explore mode)

### 2. Test Agent → Kilo Test Design
**Claude Code:** Separate agent that designed Playwright test specifications
**Kilo Implementation:** Direct test creation with Playwright knowledge

**Capabilities:**
- Playwright test structure and best practices
- E2E test design for UI interactions
- API endpoint testing strategies
- Assertion design and edge case coverage

**Tool Access:** Write, Read, Bash (for test execution)

### 3. Developer Agent → Kilo Implementation
**Claude Code:** Separate agent that implemented code to pass tests
**Kilo Implementation:** Code writing and editing with full context

**Capabilities:**
- Precise code editing with search-replace operations
- TypeScript and Next.js expertise
- Copy-verification pattern execution
- Import management and dependency handling

**Tool Access:** Edit, Write, Read, Bash (build verification)

### 4. Quality Agent → Kilo Independent Verification
**Claude Code:** Separate agent that ran browser tests and verified quality
**Kilo Implementation:** Integrated quality checks with real browser automation

**Capabilities:**
- Playwright test execution and result analysis
- Build verification with cache clearing
- Deployment status monitoring
- Error pattern recognition and reporting

**Tool Access:** Bash (Playwright execution), WebFetch (status checks)

### 5. Research Agent → Kilo Research Integration
**Claude Code:** Separate agent for external research when stuck
**Kilo Implementation:** WebFetch tool for targeted research queries

**Capabilities:**
- Web content fetching and analysis
- Documentation research and API exploration
- Pattern research for implementation decisions
- Error analysis and solution finding

**Tool Access:** WebFetch, Task (delegated research)

## Kilo-Specific Advantages

### Single Context Preservation
- **No context switching**: All phases in one conversation thread
- **Memory continuity**: Full project history maintained
- **Faster iteration**: No agent spawning overhead

### Tool Integration
- **Direct tool access**: No intermediary agent communication
- **Immediate execution**: Commands run directly in your environment
- **Real-time feedback**: Build and test results instantly available

### Grok Model Benefits
- **Broad knowledge**: Extensive programming and architecture knowledge
- **Reasoning depth**: Strong problem-solving and pattern recognition
- **Code quality**: High-quality implementation with best practices
- **Adaptability**: Learns from your workflow preferences

## Workflow Integration

### Sequential Execution
```
User Request → Task Breakdown → Test Design → Implementation → Quality Check → Next Task
```

### Parallel Tool Usage
- **Multiple tools simultaneously**: Can run grep, read, and build commands in parallel
- **Batch operations**: Efficiently gather information from multiple sources
- **Optimized performance**: Minimize round-trip delays

### Error Recovery
- **Built-in retry logic**: Automatic fallback strategies
- **Research integration**: WebFetch for stuck scenarios
- **Clear escalation**: When to involve user guidance

## Quality Assurance

### Code Quality Standards
- **TypeScript strict**: All code must compile cleanly
- **Build verification**: Replicates Vercel environment exactly
- **Test coverage**: Critical paths verified with Playwright
- **Deployment confirmation**: Production testing required

### Safety Mechanisms
- **Pre-push hooks**: Automatic build verification
- **Cache clearing**: Prevents false positive builds
- **Environment matching**: Local builds match Vercel exactly
- **Rollback capability**: Git history preserves working states

## Performance Characteristics

### Speed Advantages
- **No agent spawning**: Instant role transitions
- **Direct tool access**: Immediate command execution
- **Context preservation**: No history loss between phases
- **Optimized prompting**: Grok models respond quickly

### Reliability Improvements
- **Single point of failure elimination**: No inter-agent communication issues
- **Consistent execution**: Same agent handles all phases
- **Error traceability**: Clear error paths without agent boundaries
- **State management**: Reliable context throughout workflow

This architecture preserves all the specialization benefits of your multi-agent Claude Code setup while providing the efficiency and reliability of a unified orchestration model.</content>
<parameter name="filePath">D:\Projects\Ai\Liquid-Stories\kilo-docs\agent-capabilities.md