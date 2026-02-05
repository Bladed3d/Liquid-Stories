# Kilo Development Workflow

*Adapted from Claude Code PM workflow for Kilo's single-agent orchestration model*

## Overview

This workflow adapts your proven test-first development process for seamless use with Kilo. Instead of spawning separate agents, Kilo handles all agent roles (Task Breakdown, Test, Developer, Quality, Research) within a single orchestrated session.

## Core Philosophy

- **Test-First Development**: Design tests before implementation
- **Copy-Verification Pattern**: Extract working code without rewriting
- **Build Verification**: Cache clearing + TypeScript + Next.js build
- **Deployment Safety**: Pre-push hooks + post-deployment verification
- **Escalation Protocol**: Max 3 retries, then user guidance

## Workflow Phases

### Phase 1: Preflight Checks ✅
**Kilo executes automatically:**
- Verify target directory exists
- Check package.json presence
- Confirm Git hooks configured
- Validate dev environment ready

### Phase 2: Task Breakdown
**Kilo analyzes and creates atomic tasks following these criteria:**

#### 5 Criteria Validation for Each Task
1. **One Trigger**: Clear user action that starts this task
2. **One Outcome**: Observable result that proves completion
3. **One Test**: Verifiable with 1-3 Playwright assertions
4. **Limited Scope**: ≤4 files affected
5. **Holdable**: Developer can keep entire task in working memory

#### Task Creation Process
- Break PRDs into user-observable behaviors
- Estimate complexity (Simple: <50 lines, Medium: 50-150 lines, Complex: >150 lines)
- Identify dependencies and execution order
- Present tasks to user for approval

### Phase 3: Human Approval
**Present breakdown for user confirmation:**
- List all atomic tasks with acceptance criteria
- Show estimated complexity and file counts
- Allow user to approve, adjust, or cancel
- Get explicit go-ahead before implementation

### Phase 4: Test-First Development Loop

For each approved task, Kilo executes this complete cycle:

#### 4a. Test Specification
**Kilo designs Playwright test specs:**
- Create `.spec.ts` files in `e2e/` directory
- Define success criteria with concrete assertions
- Include edge cases and error conditions
- Verify test structure is sound

#### 4b. Implementation (with Retry Logic)
**Copy-verification pattern with research fallback:**

**Attempt 1: Direct Extraction**
- Copy code verbatim from source to new handler
- Update imports and function calls
- Run build verification immediately

**Attempt 2: Research Enhanced (if Attempt 1 fails)**
- Use WebFetch to research similar patterns
- Analyze error messages for root cause
- Apply targeted fixes without full rewrite

**Attempt 3: Escalate (if Attempt 2 fails)**
- Provide detailed error analysis
- Suggest user intervention or alternative approach

#### 4c. Build, Commit, Push, Smoke Test

**Build Verification:**
```bash
rm -rf .next node_modules/.cache
npx tsc --noEmit
npm run build
```

**Commit Protocol:**
- Use descriptive commit messages
- Include LED breadcrumbs: `🤖 Generated with Kilo`
- Reference the specific task completed

**Push & Deployment:**
- Pre-push hook runs build verification
- Push triggers Vercel deployment
- Wait 90 seconds for deployment completion

**Tier 1 Smoke Test:**
- Verify production endpoint returns 200 (not 404/500)
- Check basic page loads without crashes

#### 4d. Move to Next Task
- Mark current task complete
- Begin next task in sequence
- Maintain dependency order

### Phase 5: Final Deployment Verification

**Tier 2 Production Testing:**
- Verify actual functionality works in production
- Test user flows end-to-end
- Confirm no regressions from modularization

### Phase 6: Summary
**Report completion with:**
- All tasks completed successfully
- Build and deployment verification proofs
- Code quality metrics (lines extracted, etc.)
- Next recommended actions

## Kilo-Specific Adaptations

### Single-Agent Orchestration
- **No agent spawning**: Kilo handles all roles internally
- **Sequential execution**: Task Breakdown → Test → Implementation → Quality
- **Context preservation**: All phases in single conversation thread

### Research Integration
- **WebFetch tool**: For external research when stuck
- **Delegated exploration**: Complex codebase analysis
- **Fallback escalation**: Clear path to user when research insufficient

### Quality Assurance
- **Independent verification**: Kilo runs own quality checks
- **Build replication**: Matches Vercel environment exactly
- **Post-deployment validation**: Real production testing

### Error Handling
- **TypeScript first**: All code must compile cleanly
- **Build verification**: Cache clearing prevents false positives
- **Deployment confirmation**: Wait for actual Vercel success

## Success Criteria

- **Code Quality**: All TypeScript compilation passes
- **Build Reliability**: `npm run build` succeeds consistently
- **Deployment Success**: Vercel deployment completes without errors
- **Functionality Preservation**: All features work identically
- **Test Coverage**: Playwright tests verify critical paths

## Escalation Protocol

### When to Escalate to User
- Build fails after 3 implementation attempts
- TypeScript errors cannot be resolved
- Deployment consistently fails
- Functionality breaks unexpectedly
- Task scope exceeds original estimates significantly

### Escalation Format
```
🚨 ESCALATION: [Task Name]
❌ Issue: [Clear description]
🔍 Analysis: [What was tried]
💡 Recommendation: [Suggested next steps]
```

This workflow preserves all the rigor and quality of your Claude Code process while optimizing for Kilo's efficient single-agent model.</content>
<parameter name="filePath">D:\Projects\Ai\Liquid-Stories\kilo-docs\workflow.md