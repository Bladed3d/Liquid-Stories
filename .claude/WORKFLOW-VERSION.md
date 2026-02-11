# Workflow System: v2 (LED-Aware)
**Activated:** 2026-02-11
**Active workflow:** .claude/workflows/pm-workflow.md
**Key requirement:** All multi-step operations use ProcessTrail (lib/led-processes.ts)
**Quality gate:** Forward + backward LED trace verification

## What Changed from v1
- Developer agent now requires LED breadcrumbs on all API/DB/external calls
- Quality agent now verifies LED coverage (forward + backward trace)
- Task breakdown includes ProcessTrail step definitions
- ProcessTrail class wraps BreadcrumbTrail with process-level tracking

## Quick Reference
- ProcessTrail: lib/process-trail.ts
- Process Registry: lib/led-processes.ts
- LED Ranges: lib/led-ranges.ts
- BreadcrumbTrail: lib/breadcrumb-system.ts
- Full PRD: Docs/BetterLED-PRD.md
