# Ralph Loop Development Workflow

## Overview

Ralph is a Claude Code plugin that implements iterative, self-referential development loops. It keeps Claude working on a task until a **completion promise** is output, preventing premature "done" declarations.

**Key benefit:** Catches disconnected code, incomplete integrations, and UI issues that standard workflows miss.

---

## Problem This Solves

1. Developer creates code infrastructure but doesn't connect it properly
2. Quality Agent doesn't always catch disconnected code
3. TDD tests can be too complicated or miss actual code
4. Developer can claim "PASSED" when feature doesn't actually work end-to-end

---

## How Ralph Works

```
1. User runs: /ralph-loop "task" --completion-promise "VERIFIED_COMPLETE"
2. Claude works on task
3. Claude tries to stop → Ralph hook intercepts
4. Prompt re-fed to Claude (file changes persist)
5. Claude continues working
6. Repeat until Claude outputs "VERIFIED_COMPLETE"
7. Loop exits, Quality Agent can verify
```

---

## Installation

### Prerequisites
- Claude Code v1.0.20+
- `jq` installed (for JSON parsing in stop hook)

### Install Community Fix (Required)

The official Anthropic plugin is broken due to security patch CVE-2025-54795. Use the community fix:

**Option 1: Dev mode (testing)**
```bash
git clone https://github.com/dial481/ralph ~/ralph-plugin
claude --plugin-dir ~/ralph-plugin
```

**Option 2: Local marketplace (permanent)**
```bash
mkdir -p ~/claude-plugins/.claude-plugin
echo '{"name":"local","owner":{"name":"You"},"plugins":[{"name":"ralph","description":"Autonomous iteration loops","version":"1.0.0","source":"./ralph","category":"development"}]}' > ~/claude-plugins/.claude-plugin/marketplace.json
git clone https://github.com/dial481/ralph ~/claude-plugins/ralph

# Then in Claude Code:
/plugin marketplace add ~/claude-plugins
/plugin install ralph@local
```

### Verify Installation
```bash
/ralph-loop --help
/ralph:cancel-ralph
```

---

## Integration with Developer Workflow

### Standard Workflow (Simple Tasks)
```
Developer Agent → Quality Agent → Main Claude → User
     BUILD           VERIFY         APPROVE
```

### Ralph Workflow (Complex Features)
```
┌─────────────────────────────────────────────────────┐
│  RALPH LOOP (wraps Developer for complex features)  │
│                                                     │
│  1. Developer implements feature                    │
│  2. Takes Playwright screenshot                     │
│  3. Verifies UI renders correctly                   │
│  4. If broken → loop continues automatically        │
│  5. If working → outputs VERIFIED_COMPLETE          │
└─────────────────────────────────────────────────────┘
                         ↓
              Quality Agent (final check)
                         ↓
                   Main Claude
                         ↓
                      User
```

---

## When to Use Ralph

| Task Type | Use Ralph? | Why |
|-----------|------------|-----|
| Complex new feature | ✅ YES | Ensures end-to-end integration |
| Multi-file changes | ✅ YES | Catches disconnected code |
| UI components | ✅ YES | Visual verification catches rendering issues |
| Simple bug fix | ❌ NO | Overkill, use standard Developer Agent |
| Config change | ❌ NO | No iteration needed |
| Documentation | ❌ NO | No verification needed |

---

## Ralph Prompt Template

```bash
/ralph-loop "
## Task
[Feature description from user]

## Acceptance Criteria
1. [Specific requirement 1]
2. [Specific requirement 2]
3. [Specific requirement 3]

## Process (Follow This Order)
1. Implement the feature code
2. Add LED breadcrumbs at key points (ranges 1000-9099)
3. Run: npm run build
4. If build fails → fix and retry (do NOT output promise)
5. Start dev server: npm run dev
6. Use Playwright MCP to navigate to feature
7. Take screenshot of the feature in action
8. Review screenshot - is the feature VISIBLE and WORKING?
9. If UI broken or feature not visible → fix and retry (do NOT output promise)
10. Click/interact with the feature to verify functionality
11. Check browser console for errors related to feature
12. If console errors → fix and retry (do NOT output promise)

## Integration Verification (CRITICAL)
Before outputting promise, verify the COMPLETE chain:
- [ ] Entry point exists (button, link, page)
- [ ] Entry point calls your new code
- [ ] New code executes without errors
- [ ] Result displays in UI
- [ ] You can SEE the feature working in screenshot

## Completion
Only output <promise>VERIFIED_COMPLETE</promise> when:
- Build passes
- Screenshot shows feature working
- No console errors
- You traced the full integration path

If stuck after 10 iterations, output <promise>STUCK_NEED_HELP</promise> instead.
" --completion-promise "VERIFIED_COMPLETE" --max-iterations 20
```

---

## Handling Ralph Output

### Success Case (VERIFIED_COMPLETE)
1. Launch Quality Agent to independently verify
2. Quality re-runs build and checks screenshot
3. If Quality approves → report to user
4. If Quality finds issues → standard NEEDS_FIX loop

### Stuck Case (STUCK_NEED_HELP)
1. Ralph loop exits
2. Review what Developer attempted
3. Launch Research Agent for alternative approaches
4. User may need to provide guidance

### Max Iterations Reached
1. Ralph loop exits automatically
2. Review partial progress
3. Consider: simpler scope, different approach, or user guidance

---

## Best Practices

### DO
- Always set `--max-iterations` (recommend 15-25 for features)
- Include visual verification in completion criteria
- Use Playwright MCP for screenshots
- Require "trace the integration path" before promise
- Have escape hatch (STUCK_NEED_HELP) for impossible tasks

### DON'T
- Use Ralph for simple fixes (overkill)
- Set unlimited iterations (infinite loop risk)
- Trust "build passes" alone as completion
- Skip screenshot verification for UI features
- Forget to run Quality Agent after Ralph completes

---

## Example: Adding Orientation Detection

```bash
/ralph-loop "
## Task
Add orientation detection to useDeviceDetect hook.

## Acceptance Criteria
1. useDeviceDetect returns isPortrait (height > width)
2. useDeviceDetect returns isMobilePortrait (mobile AND portrait)
3. Values update on orientation change
4. No TypeScript errors

## Process
1. Modify hooks/useDeviceDetect.ts
2. Add isPortrait and isMobilePortrait to DeviceInfo interface
3. Add resize/orientationchange listeners
4. Run: npm run build
5. Use Playwright MCP to open dashboard on mobile viewport (375x667)
6. Rotate viewport to landscape (667x375)
7. Verify hook values change (add console.log temporarily)
8. Screenshot in both orientations

## Completion
Output <promise>VERIFIED_COMPLETE</promise> when:
- Build passes
- Hook returns correct values in both orientations
- Screenshots show dashboard in portrait and landscape
" --completion-promise "VERIFIED_COMPLETE" --max-iterations 15
```

---

## Developer Agent: Ralph-Aware Behavior

When running inside a Ralph loop (prompt contains completion promise):

1. Do NOT output the promise until feature ACTUALLY WORKS
2. Take Playwright screenshot to verify UI
3. Trace the complete integration path
4. If anything is broken, fix it and continue (no promise)
5. Only output promise when you can prove the feature works visually

---

## Sources

- [Official Ralph Loop Plugin](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop)
- [Community Fix (dial481/ralph)](https://github.com/dial481/ralph)
- [Original Ralph Technique (ghuntley)](https://ghuntley.com/ralph/)
