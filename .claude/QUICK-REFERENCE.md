# Quick Reference

**Fast lookup for common commands and workflows**

---

## Development Commands

### Story Creation

```bash
# Create story using AI agents
Use story-architect agent for project-[NAME]
Use screenplay-writer agent for project-[NAME]

# Review story outputs
cat projects/[NAME]/story-arch.md
cat projects/[NAME]/screenplay.md
```

### AI Generation

```bash
# Generate images and video
node scripts/generate-images.js project-[NAME]    # Grok Imagine
node scripts/generate-video.js project-[NAME]     # ComfyUI on 4090

# Monitor generation progress
tail -f breadcrumb-debug.log
```

### Video Production

```bash
# After Effects: Manual composition creation
# Kdenlive: Manual editing and final assembly
```

### Website Development

```bash
# Start website dev server
cd website
npm run dev              # Port 3000

# Build website
npm run build

# Test website
npm test                 # Playwright tests

# Test in debug mode
npm test -- --headed     # Visual browser mode
```

---

## LED Breadcrumb Debugging

```bash
# View all LEDs
cat breadcrumb-debug.log

# View only errors
grep "❌" breadcrumb-debug.log

# Production Pipeline LEDs
grep "LED 10" breadcrumb-debug.log    # Story generation (all)
grep "LED 100" breadcrumb-debug.log   # Story architect operations
grep "LED 101" breadcrumb-debug.log   # Screenplay writer operations

grep "LED 11" breadcrumb-debug.log    # AI services (all)
grep "LED 110" breadcrumb-debug.log   # Google Gemini
grep "LED 111" breadcrumb-debug.log   # Grok Imagine
grep "LED 112" breadcrumb-debug.log   # ComfyUI video generation

grep "LED 12" breadcrumb-debug.log    # Video production (all)
grep "LED 120" breadcrumb-debug.log   # After Effects
grep "LED 121" breadcrumb-debug.log   # Kdenlive

grep "LED 13" breadcrumb-debug.log    # Project management
grep "LED 14" breadcrumb-debug.log    # Pipeline orchestration

# Website LEDs
grep "LED 30" breadcrumb-debug.log    # All website operations
grep "LED 301" breadcrumb-debug.log   # User interactions
grep "LED 302" breadcrumb-debug.log   # API calls

# View LEDs from specific component
grep "[ComponentName]" breadcrumb-debug.log

# Clear old logs
rm breadcrumb-debug.log
```

---

## Agent Workflows

### Standard Development Flow

```
1. Use developer agent for task-XXX
   ↓
2. Developer confirms understanding
   ↓
3. Developer implements + tests
   ↓
4. Developer provides RAW proof
   ↓
5. Use quality agent to verify task-XXX
   ↓
6. Quality verifies independently
   ↓
7. Main Claude approves if verified
```

### Quick Agent Commands

```bash
# Story creation agents
Use story-architect agent for project-[NAME]
Use screenplay-writer agent for project-[NAME]

# Website development agents
Use developer agent for task-123
Use quality agent to verify task-123
Use test-creation agent for tests

# Support agents (15 min time limit)
Use research agent to find solutions for [problem]
Use debugger agent to analyze [issue]
Use environment agent to fix [config issue]
```

---

## Git Workflows

### Quick Commit

```bash
git add .
git status
git commit -m "$(cat <<'EOF'
Brief description

- Change 1
- Change 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### View Recent Changes

```bash
git status              # Current changes
git diff                # Unstaged changes
git diff --staged       # Staged changes
git log --oneline -5    # Recent commits
```

---

## LED Ranges - Ambient Project

### Production Pipeline (10000-14999)

**10000-10999: Story Generation**
- 10000-10099: Story architect operations
- 10100-10199: Screenplay writer operations
- 10200-10299: Story validation
- 10300-10399: Story revision
- 10400-10499: Story approval

**11000-11999: AI Services**
- 11000-11099: Google Gemini (text generation)
- 11100-11199: Grok Imagine (image generation)
- 11200-11299: ComfyUI (video on 4090)
- 11300-11399: AI service errors/retries
- 11400-11499: AI output validation

**12000-12999: Video Production**
- 12000-12099: After Effects operations
- 12100-12199: Kdenlive operations
- 12200-12299: Asset management
- 12300-12399: Rendering and export
- 12400-12499: Video quality validation

**13000-13999: Project Management**
- 13000-13099: Project creation
- 13100-13199: Production scheduling
- 13200-13299: Task tracking
- 13300-13399: Resource allocation
- 13400-13499: Project archival

**14000-14999: Integration & Automation**
- 14000-14099: Pipeline orchestration
- 14100-14199: File system operations
- 14200-14299: Batch processing
- 14300-14399: Error recovery
- 14400-14499: Performance monitoring

### Website (30000-39999)

Same ranges as DebugLayer:
- **30000-30099**: Page lifecycle
- **30100-30199**: User interactions
- **30200-30299**: API calls
- **30300-30399**: Component rendering
- **30400-30499**: Form submissions
- **30500-30599**: Data processing
- **30600-30699**: UI interactions
- **30700-30799**: Authentication
- **30800-30899**: Error handling

See `CLAUDE.md` for complete LED range documentation.

---

## Common Issues

### Tests Failing

```bash
# 1. Check LED logs for errors
grep "❌" breadcrumb-debug.log

# 2. Run tests in headed mode
npm test -- --headed     # Playwright/browser tests
# or: pytest -v          # Python with verbose output

# 3. Clear cache and retry
rm -rf .next             # Next.js
rm -rf __pycache__       # Python
cargo clean              # Rust
```

### Development Server Issues

```bash
# 1. Check what's running on port
netstat -ano | findstr :3000     # Windows
lsof -i :3000                    # Mac/Linux

# 2. Kill specific process
taskkill /F /PID 12345           # Windows
kill -9 12345                    # Mac/Linux

# 3. Clear and restart
rm -rf .next && npm run dev      # Next.js example
```

### Environment Issues

```bash
# Check environment
node --version
npm --version
python --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
# or: pip install -r requirements.txt
```

---

## File Conventions

**Always use hyphens for multi-word files:**

```bash
# ✅ Correct
my-component.tsx
user-service.ts
api-client.js

# ❌ Wrong
my_component.tsx
userService.ts
```

---

## Testing Checklist

Before marking feature complete:

- [ ] All tests passing
- [ ] LED breadcrumbs at key points
- [ ] No errors in breadcrumb-debug.log
- [ ] Quality agent verified
- [ ] Git commit created

---

## Emergency Commands

```bash
# Save work immediately
git add . && git commit -m "WIP: Emergency save"

# See what's uncommitted
git status

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all changes (DANGEROUS!)
git reset --hard HEAD
```

---

## Key Documents

- `.claude/START-HERE.md` - Development process
- `.claude/MANDATORY-DEV-PROCESS.md` - Workflow
- `.claude/AUTO-TEST-PROTOCOL.md` - Testing
- `.claude/AGENTS-GUIDE.md` - Agent workflow guide
- `CLAUDE.md` - Project context

---

**Remember:** Agent confirmation → Implementation → Verification → Approval

That's the process. Every time. No exceptions.
