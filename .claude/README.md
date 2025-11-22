# Claude Code Configuration

This directory contains hooks, development process documentation, and configuration for Claude Code to ensure safe, efficient collaboration.

---

## 🚨 NEW CLAUDE SESSION? START HERE!

**👉 Read `.claude/START-HERE.md` FIRST** - Contains mandatory instructions for EVERY development task.

**Development Process Documents:**
- **START-HERE.md** - Complete onboarding (READ FIRST!)
- **MANDATORY-DEV-PROCESS.md** - The ONLY approved development loop
- **AUTO-TEST-PROTOCOL.md** - Self-testing requirements
- **QUICK-REFERENCE.md** - Command cheat sheet

**These documents explain:**
- Why you MUST test your own code
- How to use LED breadcrumb debugging
- The Research → Code+LED → Test → Debug loop
- Why trial-and-error wastes user time

**Reading time: 15 minutes. Saves hours of wasted work.**

---

## Agent-Based Development System

This project uses a specialized agent team for efficient development:

**Core Agents:**
- **developer.md** - Implements features with LED breadcrumbs and testing
- **quality.md** - Independent verification of developer's work
- **research.md** - Deep research for complex problems
- **debugger.md** - Root cause analysis specialist
- **test-creation.md** - Playwright testing expert
- **environment.md** - Configuration troubleshooting

**How to use:**
```bash
# Example: Implement a task
Use developer agent for task-XXX

# Quality agent verifies automatically after developer completes
# Main Claude spot-checks both reports before user approval
```

---

## Hooks

Located in `.claude/hooks/`:

### user-prompt-submit.sh
Runs **before** Claude processes your request. Blocks dangerous operations before they start.

**Blocks:**
- `taskkill` commands targeting process names (node.exe, electron.exe, etc.)
- Prevents crashing active development processes

**Warns:**
- Prompts that mention logging API keys

### pre-tool-use-bash.sh
Runs **before** Claude executes any Bash command.

**Blocks:**
- `taskkill //IM <process_name>` commands
- Compound commands containing dangerous taskkill operations
- Prevents process crashes and data loss

**Warns:**
- npm/pip install commands (informational)

## How Hooks Work

1. User types request or Claude prepares to execute command
2. Hook runs and validates the operation
3. If blocked: Error message shown with correct alternative
4. If passed: Operation continues normally

**Example Block:**
```
❌ BLOCKED: Dangerous taskkill command detected

This would crash active processes. Use instead:
  ./tools/kill-port.sh <port_number>
```

## Tools

Located in `tools/`:

### kill-port.sh
Safe process killer using specific PIDs instead of process names.

**Usage:**
```bash
./tools/kill-port.sh 3000
```

**What it does:**
1. Finds process using port 3000
2. Gets specific PID
3. Kills only that PID
4. Never crashes other processes

### api-test.sh
Validates API keys without exposing them in logs.

**Usage:**
```bash
./tools/api-test.sh all          # Test all APIs
./tools/api-test.sh youtube      # Test YouTube API
./tools/api-test.sh reddit       # Test Reddit API
./tools/api-test.sh trends       # Test Google Trends
```

**What it does:**
1. Loads .env file safely
2. Makes minimal API calls to validate keys
3. Reports status without logging credentials
4. Provides actionable error messages

## Documentation Structure

- **CLAUDE.md** (~240 lines): Core development patterns, workflows, security
- **AGENTS.md** (~150 lines): Agent specifications, LED ranges, quota budgets
- **Docs/*.md**: Detailed PRDs and analysis documents

**Token budget:**
- CLAUDE.md: ~2k tokens
- AGENTS.md: ~1k tokens
- Total: ~3k tokens (1.5% of 200k budget)

## Benefits

1. **Security Enforcement**: Hooks block dangerous operations automatically
2. **Clear Alternatives**: Error messages provide correct solutions
3. **Positive Patterns**: Instructions show what TO do, not just what to avoid
4. **Tool Wrappers**: Simplify complex operations safely
5. **Reduced Context**: Lightweight documentation saves tokens
6. **Agent-Based Development**: Triple verification (developer → quality → main Claude)

## Updating Hooks

After modifying hooks, make them executable:

```bash
chmod +x .claude/hooks/*.sh
chmod +x tools/*.sh
```

## Testing Hooks

To test if hooks are working:

```bash
# This should be blocked by pre-tool-use-bash hook:
# taskkill //IM node.exe

# This should work:
./tools/kill-port.sh 3000
```

## More Information

See the blog post that inspired this setup:
https://blog.sshh.io/p/how-i-use-every-claude-code-feature
