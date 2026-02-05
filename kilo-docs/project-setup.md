# Project Setup & Environment

*Environment configuration, Git hooks, and preflight checks for Kilo development*

## Development Environment

### Required Tools
- **Node.js:** v18+ (matches Vercel runtime)
- **npm:** Latest stable version
- **Git:** Latest version with hooks support
- **Playwright:** For E2E testing

### Environment Variables
**Required for local development:**
```bash
# .env.local (create this file)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
```

**Optional but recommended:**
```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Installation
```bash
cd advisor-team-mvp
npm install
npm run db:push  # Set up database schema
npm run dev      # Start development server
```

## Git Configuration

### Pre-push Hook Setup
**Location:** `.git/hooks/pre-push`
**Purpose:** Prevent broken code from reaching remote repository

**Hook Content:**
```bash
#!/bin/sh

echo "========================================"
echo "PRE-PUSH: Running Vercel build verification"
echo "========================================"

# Clear Next.js and dependency caches
echo "Clearing .next cache..."
rm -rf .next node_modules/.cache

# Run TypeScript compilation
echo "Running npm run build..."
if npm run build; then
    echo "========================================"
    echo "PRE-PUSH: Build passed - push allowed"
    echo "========================================"
    exit 0
else
    echo "========================================"
    echo "PRE-PUSH: Build failed - push blocked"
    echo "========================================"
    exit 1
fi
```

**Installation:**
```bash
chmod +x .git/hooks/pre-push
```

### Commit Message Standards
```
[Phase]: Brief description of changes

- Bullet point details
- Implementation notes
- Test coverage info

🤖 Generated with Kilo
```

## Preflight Checks

### Automated Checks (Kilo runs these)

#### 1. Directory Structure
```bash
# Verify we're in the right place
ls -la advisor-team-mvp/
# Should see: app/, lib/, e2e/, package.json, etc.
```

#### 2. Package Integrity
```bash
# Check package.json exists and is valid
cat advisor-team-mvp/package.json | jq .name
# Should output: "advisor-team-mvp"
```

#### 3. Environment Setup
```bash
# Verify environment variables
node -e "console.log(process.env.DATABASE_URL ? 'DB: OK' : 'DB: MISSING')"
node -e "console.log(process.env.OPENAI_API_KEY ? 'OpenAI: OK' : 'OpenAI: MISSING')"
node -e "console.log(process.env.TAVILY_API_KEY ? 'Tavily: OK' : 'Tavily: MISSING')"
```

#### 4. Git Status
```bash
# Check for uncommitted changes
git status --porcelain
# Should be clean for new sessions
```

### Manual Verification Steps

#### Development Server Startup
```bash
cd advisor-team-mvp
npm run dev
# Should start on http://localhost:3000
```

#### Database Connection
```bash
# Test database connectivity
npm run db:studio
# Should open Prisma Studio
```

#### API Endpoints
```bash
# Test basic API functionality
curl http://localhost:3000/api/debug/led-status
# Should return LED status JSON
```

## File Organization

### Source Code Structure
```
advisor-team-mvp/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Main application
│   └── admin/             # Admin interface
├── lib/                   # Shared utilities
│   ├── advisors.ts        # Advisor configurations
│   ├── supabase.ts        # Database client
│   └── tavily-client.ts   # Search integration
├── e2e/                   # End-to-end tests
├── handlers/              # API route handlers
└── components/            # React components
```

### Key Directories
- **handlers/:** Extracted API logic (context.ts, search-handler.ts)
- **e2e/:** Playwright test files
- **lib/:** Shared utilities and integrations
- **app/:** Next.js application routes

## Development Workflow

### Daily Setup
1. **Pull latest changes:** `git pull origin main`
2. **Install dependencies:** `npm install` (if package-lock changed)
3. **Start dev server:** `npm run dev`
4. **Verify setup:** Check localhost:3000 loads

### Before Starting Work
1. **Run preflight checks:** Ensure environment is ready
2. **Check for conflicts:** `git status` should be clean
3. **Verify builds:** `npm run build` should pass
4. **Test locally:** Critical flows work as expected

### Session Cleanup
1. **Commit work:** Use descriptive commit messages
2. **Push changes:** Triggers deployment verification
3. **Verify deployment:** Check production after 90 seconds
4. **Document changes:** Update any relevant docs

## Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear all caches
rm -rf .next node_modules/.cache .swc
npm install
npm run build
```

#### Database Issues
```bash
# Reset database
npm run db:push -- --force-reset
# Or check connection
npm run db:studio
```

#### Environment Problems
```bash
# Check environment variables
node -e "console.log(Object.keys(process.env).filter(k => k.includes('CLERK') || k.includes('DATABASE') || k.includes('API')))"
```

#### Git Hook Issues
```bash
# Reinstall hooks
chmod +x .git/hooks/pre-push
# Test manually
./.git/hooks/pre-push
```

## Performance Optimization

### Development Speed
- **Hot reload:** Next.js fast refresh enabled
- **TypeScript checking:** Incremental compilation
- **Database:** Local PostgreSQL or Supabase connection

### Build Optimization
- **Caching:** .next cache for faster rebuilds
- **Dependencies:** node_modules optimization
- **Static generation:** Automatic for performance

### Testing Performance
- **Parallel execution:** Playwright runs tests in parallel
- **Selective testing:** Run only relevant test suites
- **Headless mode:** Faster test execution

This setup ensures consistent, reliable development sessions with Kilo, maintaining the quality standards established in your Claude Code workflow.</content>
<parameter name="filePath">D:\Projects\Ai\Liquid-Stories\kilo-docs\project-setup.md