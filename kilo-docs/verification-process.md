# Verification Process

*Build verification, deployment testing, and quality assurance protocols*

## Build Verification Protocol

### Cache Clearing (Critical)
**Why:** Prevents false positive builds due to cached artifacts
```bash
rm -rf .next node_modules/.cache
```

### TypeScript Compilation
**Command:** `npx tsc --noEmit`
**Purpose:** Catch type errors before runtime
**Success Criteria:** Zero TypeScript errors

### Next.js Build
**Command:** `npm run build`
**Includes:** Prisma generation, static page compilation, optimization
**Success Criteria:** Build completes without errors

### Full Verification Sequence
```bash
# Always run this exact sequence
rm -rf .next node_modules/.cache
npx tsc --noEmit
npm run build
```

## Deployment Verification

### Pre-Push Hook
**Automatic execution** on `git push`
- Runs full build verification
- Blocks push if build fails
- Ensures only working code reaches remote

### Vercel Deployment
**Trigger:** Successful push to main branch
**Wait Time:** 90 seconds for completion
**Verification:** Check production endpoint returns 200

### Tier 1: Smoke Test
**Purpose:** Basic functionality confirmation
```bash
curl -s -o /dev/null -w "%{http_code}" https://advisor-team.vercel.app/dashboard
```
**Success:** Returns 200 (not 404/500)
**Failure:** Investigate deployment logs

### Tier 2: Production Testing
**Purpose:** End-to-end functionality verification
- Test critical user flows
- Verify API endpoints work
- Confirm UI interactions function
- Check for regressions

## LED Breadcrumb System

### Purpose
Track execution flow and error conditions for debugging and monitoring.

### Implementation
```typescript
import { LED } from '@/lib/led-ranges'
import { BreadcrumbTrail } from '@/lib/breadcrumb-system'

const trail = new BreadcrumbTrail('OperationName')

// Light success breadcrumbs
trail.light(LED.OPERATION.START, { param: 'value' })
trail.light(LED.OPERATION.SUCCESS, { resultCount: 5 })

// Fail error breadcrumbs
trail.fail(LED.OPERATION.ERROR, error, {
  userId: 'user123',
  operationType: 'search',
  errorType: 'network'
})
```

### Key LED Ranges
- **APP (1000-1099):** Application lifecycle
- **AUTH (1100-1199):** Authentication flows
- **MODEL_SELECTION (4000-4099):** AI model decisions
- **AI_API (5000-5099):** API interactions
- **SANDBOX (6000-6099):** Sandbox operations
- **ERROR (8000-8099):** Error handling

### Monitoring Integration
- **Supabase logging:** Automatic breadcrumb storage
- **Error notifications:** Critical failures trigger alerts
- **Usage analytics:** Track feature adoption and issues

## Test Execution

### Playwright Configuration
**Location:** `e2e/` directory
**Pattern:** `*.spec.ts` files
**Execution:** `npx playwright test e2e/[test-file].spec.ts --reporter=list`

### Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
  });

  test('should [behavior]', async ({ page }) => {
    // Test implementation
    // Assertions
  });
});
```

### Test Categories
- **Smoke tests:** Basic functionality (post-deployment)
- **Regression tests:** Prevent breaking changes
- **Integration tests:** End-to-end user flows
- **Error handling:** Failure mode verification

## Error Classification

### Error Types
- **network:** Connection/API failures
- **validation:** Input/data validation errors
- **permission:** Authorization failures
- **timeout:** Operation took too long
- **unknown:** Unclassified errors

### Escalation Triggers
- **Build failures:** Block deployment
- **TypeScript errors:** Require immediate resolution
- **Runtime crashes:** Critical user impact
- **Data corruption:** System integrity threats

### Recovery Protocols
1. **Log error details** with full context
2. **Attempt automatic recovery** where possible
3. **Escalate to user** with clear problem statement
4. **Provide rollback options** if needed

## Quality Gates

### Code Quality
- [ ] TypeScript compilation passes
- [ ] ESLint rules satisfied
- [ ] Import organization correct
- [ ] No console.log statements in production

### Build Quality
- [ ] Next.js build succeeds
- [ ] Bundle size within limits
- [ ] No runtime warnings
- [ ] Static analysis passes

### Deployment Quality
- [ ] Vercel deployment succeeds
- [ ] Production endpoints respond
- [ ] Error monitoring active
- [ ] Performance metrics collected

### Functional Quality
- [ ] Critical user flows work
- [ ] API endpoints functional
- [ ] Database operations succeed
- [ ] External integrations working

This verification process ensures that every code change meets production standards before deployment, maintaining the reliability of your advisor-team-mvp application.</content>
<parameter name="filePath">D:\Projects\Ai\Liquid-Stories\kilo-docs\verification-process.md