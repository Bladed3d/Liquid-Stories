# Ralph Loop Plugin Installation Report

## Date
2026-01-30

## Status
✅ INSTALLED AND READY FOR USE

---

## Installation Summary

### 1. jq (JSON Processor)
**Status:** ✅ Installed via winget
**Version:** jq-1.8.1
**Location:** System PATH (requires new terminal to use)
**Purpose:** Required by Ralph's stop hook for JSON parsing

**Installation command:**
```bash
winget install --id jqlang.jq --accept-source-agreements --accept-package-agreements
```

**Note:** You must restart your terminal or open a new one for jq to be available in PATH.

### 2. Ralph Plugin (Community Fix)
**Status:** ✅ Cloned and verified
**Location:** `C:/Users/Administrator/ralph-plugin`
**Source:** https://github.com/dial481/ralph
**Version:** Community fix (official plugin is broken due to CVE-2025-54795)

**Plugin structure verified:**
```
C:/Users/Administrator/ralph-plugin/
  .claude-plugin/
    plugin.json           ✅ Plugin metadata
  commands/
    ralph-loop.md         ✅ Main command file
    cancel-ralph.md       ✅ Cancel command
  hooks/
    hooks.json           ✅ Hook configuration
  scripts/
    stop-hook.sh         ✅ Stop hook script (uses jq)
  README.md              ✅ Documentation
```

### 3. Documentation Updates

**CLAUDE.md** - Added Ralph Loop section (line 286):
- Quick start instructions
- Integration with Developer Agent workflow
- Reference to full documentation

**developer.md** - Added Ralph-aware behavior (line 462):
- Do not output promise until feature works
- Visual verification requirements
- Escape hatch for stuck iterations

**Existing workflow guide** - Already present:
- `.claude/workflows/ralph-development.md` (comprehensive guide)

---

## How to Use

### Step 1: Launch Claude Code with Ralph Plugin

**CRITICAL:** You must restart Claude Code with the plugin directory.

```bash
# From any project directory
claude --plugin-dir ~/ralph-plugin
```

Or with full Windows path:
```bash
claude --plugin-dir C:/Users/Administrator/ralph-plugin
```

### Step 2: Verify Plugin Loaded

In Claude Code, run:
```
/plugin list
```

You should see `ralph` in the list.

### Step 3: Start a Ralph Loop

```
/ralph-loop "Build [feature]. Output <promise>VERIFIED_COMPLETE</promise> when working." --completion-promise "VERIFIED_COMPLETE" --max-iterations 20
```

**What happens:**
1. Ralph creates `.claude/ralph-loop.local.md` with task state
2. Developer Agent builds the feature
3. When Claude tries to finish, stop hook checks for promise
4. If no promise → task is fed back to Claude (automatic retry)
5. If promise found → loop exits
6. Quality Agent then verifies independently

### Step 4: Monitor Progress

Claude will show iteration count:
```
🔄 Ralph loop iteration 3 of 20
Continue working on your task...
```

### Step 5: Cancel (If Needed)

```
/ralph:cancel-ralph
```

---

## Testing Guide

### Test 1: Verify jq Works (New Terminal Required)

Open a **NEW** terminal (after jq installation) and run:
```bash
jq --version
```

Expected output: `jq-1.8.1`

If you get "command not found", restart your terminal.

### Test 2: Verify Stop Hook Script

```bash
cat ~/ralph-plugin/scripts/stop-hook.sh
```

Expected: Bash script that uses `jq` for JSON generation

### Test 3: Simple Ralph Loop (Recommended)

In a new Claude Code session with plugin:
```
/ralph-loop "Create a test file named test-ralph.txt with content 'Ralph works!'. Output <promise>DONE</promise> when file exists." --completion-promise "DONE" --max-iterations 5
```

Expected behavior:
1. Claude creates the file
2. Claude outputs `<promise>DONE</promise>`
3. Loop exits
4. File `test-ralph.txt` exists in project root

### Test 4: Complex Feature (Real Usage)

```
/ralph-loop "Add a button to the advisor-team-mvp dashboard that displays 'Hello Ralph' when clicked. Output <promise>BUTTON_VERIFIED</promise> when you can see it working in a Playwright screenshot." --completion-promise "BUTTON_VERIFIED" --max-iterations 15
```

Expected behavior:
1. Developer Agent implements button
2. Developer Agent runs build
3. Developer Agent uses Playwright to click button
4. Developer Agent takes screenshot
5. If button works → outputs promise
6. If broken → continues iterating

---

## Troubleshooting

### "jq: command not found"
**Cause:** Terminal hasn't picked up PATH changes
**Fix:** Restart terminal or open new terminal window

### "/ralph-loop: command not found"
**Cause:** Claude Code not launched with plugin directory
**Fix:** Exit Claude Code, restart with:
```bash
claude --plugin-dir ~/ralph-plugin
```

### Loop never exits
**Cause:** Promise text doesn't match exactly
**Fix:** Ensure exact match:
```
# If --completion-promise "VERIFIED_COMPLETE"
<promise>VERIFIED_COMPLETE</promise>

# NOT "verified_complete" or "VERIFIED COMPLETE"
```

### Infinite loop concerns
**Solution:** Always set reasonable `--max-iterations` (15-30)
After max iterations, loop exits automatically

---

## When to Use Ralph

| Scenario | Use Ralph? | Why |
|----------|------------|-----|
| Complex UI feature | ✅ YES | Visual verification needed |
| Multi-file integration | ✅ YES | Catches disconnected code |
| API integration | ✅ YES | End-to-end verification |
| Simple config change | ❌ NO | Overkill |
| Bug fix in existing code | ❌ NO | Standard workflow sufficient |
| Documentation update | ❌ NO | No iteration needed |

---

## References

- **Full workflow guide:** `.claude/workflows/ralph-development.md`
- **Developer agent:** `.claude/agents/developer.md`
- **Plugin README:** `~/ralph-plugin/README.md`
- **Community fix repo:** https://github.com/dial481/ralph
- **Original technique:** https://ghuntley.com/ralph/

---

## Notes

- Ralph wraps the Developer Agent, not replaces it
- Quality Agent still does independent verification after Ralph completes
- Main Claude still does final approval
- Ralph just ensures Developer doesn't quit before feature actually works
- Use escape hatch `<promise>STUCK_NEED_HELP</promise>` if truly stuck

---

## Next Steps for User

1. **Open a new terminal** (for jq PATH update)
2. **Test jq:** Run `jq --version`
3. **Restart Claude Code with plugin:**
   ```bash
   claude --plugin-dir ~/ralph-plugin
   ```
4. **Try Test 3 above** (simple file creation) to verify Ralph works
5. **Use Ralph for next complex feature** (UI component, multi-file integration, etc.)

If any issues arise, check Troubleshooting section above or review:
- `.claude/workflows/ralph-development.md` (comprehensive guide)
- `~/ralph-plugin/README.md` (plugin documentation)
