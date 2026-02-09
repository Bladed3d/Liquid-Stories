# AGENTS.md - Advisor Team MVP Guidelines

**Primary Repo:** `advisor-team-mvp/` (Next.js 16 App Router, React 19, TypeScript 5, Prisma 5, Supabase, Vercel Blob, Clerk Auth)

**Root Dir:** `D:\Projects\Ai\Liquid-Stories\advisor-team-mvp`

## ⚠️ **IMPORTANT: LED Breadcrumbs System**

**🚫 LED BREADCRUMBS ARE FOR KILO INTERNAL USE ONLY - NOT FOR USERS! 🚫**

The LED breadcrumb system is an **internal debugging and monitoring tool** used by Kilo to track system events, errors, and performance metrics. It is **NOT intended for user consumption** and should never be exposed to end users.

### **What LED Breadcrumbs Are:**
- Internal event logging system for debugging and monitoring
- Used by Kilo to track code execution, API calls, and system health
- Provides breadcrumb trails for debugging complex issues
- Contains technical implementation details, not user-facing information

### **What LED Breadcrumbs Are NOT:**
- User interface elements or notifications
- Customer-facing error messages or status updates
- Marketing or user engagement features
- Public API responses or documentation

### **Guidelines for LED Usage:**
- **NEVER** expose LED codes, messages, or breadcrumbs to users
- **ALWAYS** use appropriate user-facing messages for customer communication
- **ONLY** use LED breadcrumbs for internal debugging and monitoring
- **REMEMBER** to implement proper user-facing error handling alongside LED logging

### **Questions About LED Breadcrumbs?**
📖 **Read the complete guide:** `D:\Projects\Ai\Liquid-Stories\LEDbreadcrumbs\LED-BREADCRUMBS-GUIDE.md`

---

## 🔧 Debugging Workflow

**For existing code issues, bugs, or production failures:** Use the debugging workflow instead of the development workflow.

### When to Use Debugging Workflow
- Existing bugs or regressions
- Performance issues or timeouts
- Production failures
- Quality score degradation
- LED breadcrumb error patterns

### How to Start Debugging
1. **Report the issue** with symptoms and reproduction steps
2. **Kilo will spawn LED debugger** for autonomous analysis
3. **Review the analysis** and approve debugging approach
4. **Follow evidence-based fixes** with breadcrumb verification

### Key Differences from Development
- **Starts with LED analysis** instead of task breakdown
- **Focuses on reproduction** before implementation
- **Uses breadcrumb evidence** for diagnosis and verification
- **Shorter cycles** optimized for bug fixes

**Reference:** `.kilo/docs/Debug-workflow.md` - Complete debugging workflow guide

**Agents Available:**
- `led-debugger`: Autonomous debugging with LED breadcrumbs
- `image-view`: Screen capture analysis for visual bugs
- Plus standard development agents (task-breakdown, developer, quality, research)

### Workflow Selection
- **New Features:** Use development workflow (`pm-workflow.md`)
- **Bug Fixes:** Use debugging workflow (`Debug-workflow.md`)
- **Unsure:** Ask Kilo to analyze and recommend

## 🚀 Build / Lint / Test Commands

**Dev Server:**
```
cd advisor-team-mvp
npm run dev  # Starts on http://localhost:3000
```
*Check port 3000 free first: `netstat -ano | findstr :3000` then `taskkill /F /PID <pid>`*

**Build:**
```
npm run build  # prisma generate && next build
```

**Lint:**
```
npm run lint  # eslint . (eslint-config-next + core-web-vitals + typescript)
eslint.config.mjs: Overrides ignores for .next/**, out/**, etc.
```

**Unit Tests (Vitest):**
```
npm run test:unit  # vitest (globals: true, env: node)
npm run test:unit:ui  # vitest --ui
npm run test:unit:run  # vitest run

Single file: vitest __tests__/context-book/chat-route.test.ts
Single test: vitest __tests__/context-book/chat-route.test.ts#test_name
```
*Config: vitest.config.ts (alias @ -> ./, setup: vitest.setup.ts mocks env)*

**E2E Tests (Playwright):**
```
npm run test  # playwright test (e2e/)
npm run test:ui  # --ui
npm run test:headed  # --headed
npm run test:debug  # --debug
npm run test:report  # show-report

Single file: playwright test e2e/admin-pages.spec.ts
Single test: playwright test e2e/admin-pages.spec.ts -g "test name"
```
*Config: playwright.config.ts*
- testDir: ./e2e
- workers: 1 (avoid overload Qdrant/AI APIs)
- timeout: 300s (file uploads/embeds)
- expect.timeout: 90s
- retries: 1 (CI:2)
- baseURL: http://localhost:3000
- webServer: npm run dev (reuseExistingServer !CI)
- trace/screenshot/video on failure

**Verify Changes:**
```
npm run lint && npm run build && npm run test:unit:run && npx playwright test
```

**Scripts (tsx):**
```
npm run export-errors  # scripts/export-errors.ts
npm run export-session -- --latest  # Export session data
```

## 💻 Code Style & Conventions

**TypeScript (tsconfig.json):**
- strict: true, target: ES2017, module: esnext, jsx: react-jsx
- paths: {"@/*": ["./*"]}  // Absolute imports: import { Foo } from '@/lib/foo'
- noEmit, isolatedModules

**Imports/Exports:**
```
import { useState, useEffect } from 'react'  // React first
import { useUser } from '@clerk/nextjs'     // Next/3rd-party
import { LED } from '@/lib/led-ranges'       // Local @/ (sorted alpha)

export default function AdminStatsPage() { ... }  // Default for pages/components
export interface ImageGenerationResult { ... }    // Named for types/utils
export * from './types'                           // Re-exports
```
- Group: React hooks > Next/Router > UI libs > Local @/lib > @/hooks > @/components
- No relative paths outside app/; use @/

**Naming:**
- Variables/Functions: camelCase (currentSessionId, fetchStats, handleResetCostTracking)
- Components/Types/Interfaces: PascalCase (AdminNav, StatsData, BreadcrumbTrail)
- Constants: UPPER_SNAKE_CASE (LED.APP.INIT_START, SPONTANEOUS_IMAGE_CONFIG)
- Hooks: usePascal (useAdminData, useSessions, useToast)

**Components/Hooks Structure:**
```
import ...  // Sorted groups

export default function ComponentName() {
  const [state, setState] = useState<T>(initial);
  const { data } = useHook(arg);

  useEffect(() => { ... }, [deps]);

  if (loading) return <Loader />;
  return <div>...</div>;
}
```
- Top-level const hooks before useEffect/useCallback
- Destructure: const { stats, loading } = useAdminData(range, trailRef);

**Error Handling (MANDATORY - LED Breadcrumbs):**
```
import { LED } from '@/lib/led-ranges';
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';

const trail = new BreadcrumbTrail('MyFunction');

try {
  await apiCall();
} catch (error) {
  console.error(`[LED ${LED.UI.FETCH_ERROR}]`, { error, trail });
  trail.error(LED.UI.FETCH_ERROR, error);
  throw new Error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
}
```
- ALWAYS use LED.${DOMAIN}.${EVENT} (see lib/led-ranges.ts for 1000+ codes)
- BreadcrumbTrail for tracing: new BreadcrumbTrail('label'), trail.breadcrumb('step')
- Fail loudly: throw new Error(msg), no silent fallbacks
- Classify: import { classifyError } from '@/lib/error-classifier'

**Async Patterns:**
- async/await over .then()
```
async function fetchData() {
  const res = await fetch('/api/...');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}
```

**Files/Dirs:**
```
app/          # App Router pages/routes
lib/          # Shared utils (led-ranges.ts, supabase.ts, image-generation.ts)
hooks/        # Custom hooks (useAdminData.ts)
components/   # UI (AdminNav.tsx, Toast.tsx)
__tests__/    # Vitest units
e2e/          # Playwright specs
prisma/       # Schema/migrations
```

**Security:**
- Env vars: process.env.KEY (no hardcode)
- Clerk: useUser(), auth()
- Admin: isAdmin() from '@/lib/admin'
- RLS: Supabase row-level security
- NEVER use `taskkill //F //IM node.exe` or similar commands that kill all node processes, as this terminates the current chat session. Use specific PIDs or port-based killing only when necessary and confirmed safe.

**Testing:**
- Units: Vitest, mock env in vitest.setup.ts
- E2E: Playwright, global-setup.ts, test-helpers.ts
- Mock AI/DB with env overrides

**Authentication in E2E Tests:**
- For app functionality testing: Bypass Clerk login by removing `localStorage.clear()` from test setup and using existing authenticated browser sessions
- Only test login flows when specifically testing authentication code changes
- Use `loginAsTestUser()` helper from `e2e/utils/test-helpers.ts` for programmatic auth when needed

**Commits (ALWAYS before risky changes):**
```
git add .
git commit -m "feat: add X (LED.Y.Z)

- Bullet details
🤖 opencode"
```

**Pro Tips:**
- NEVER commit .env/secrets
- Version docs: plan-v2.md (NEVER overwrite)
- LED Debug: curl https://advisor-team.vercel.app/api/debug/led-status?key=...
- Research: :online model auto-routes to Tavily + advanced models

*(148 lines)*