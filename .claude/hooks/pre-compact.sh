#!/bin/bash
# Pre-Compact Hook — Liquid-Stories Project
# Fires before Claude context compaction. Injects survival rules into compacted context.
# These are the rules most likely to cause catastrophic failures if forgotten mid-session.

cat <<'EOF'
{
  "additionalContext": "CRITICAL RULES — MUST SURVIVE COMPACTION:\n\n1. NEVER push to git without explicit user permission. Ask every time. 'Push?' → wait for yes.\n\n2. NEVER kill processes by name (taskkill /IM node.exe kills Claude itself). Always kill by PID: netstat -ano | findstr :PORT → then taskkill /F /PID [number].\n\n3. NEVER delete or overwrite files without user confirmation and backup. Create filename-v2.md instead of overwriting.\n\n4. DISCUSS BEFORE CODING — diagnose → explain → propose → wait for approval → code. Never start writing without user agreement.\n\n5. FULL BUILD VERIFICATION before push: rm -rf .next node_modules/.cache && npx tsc --noEmit && npm run build. npm run build alone is NOT enough.\n\n6. TECHNOLOGY CURRENCY CHECK — before using any tech 2+ years old not in the project stack, search for current best practices. Do NOT default to what you know if something better and modern exists. (Claude chose HTA/1999 Windows scripting — deprecated. That file didn't work at all.)\n\n7. NEVER display credentials, API keys, or .env contents in chat. Say 'value exists' or 'value missing' only.\n\n8. File path shorthand: \\Docs\\ = D:/Projects/Ai/Liquid-Stories/Docs/ (root, NOT advisor-team-mvp/Docs/)\n\n9. All git operations for the app happen INSIDE advisor-team-mvp/ — NEVER from Liquid-Stories root.\n\n10. STOP after 3 failures — mandatory research after 2, full escalation after 3. Do not keep guessing.\n\n11. Migration ≠ Recreation. Copy the actual working code. If new file is < half the lines of original, STOP and ask.\n\n12. Subagents CANNOT spawn other subagents. Main Claude is the ONLY orchestrator.\n\nFull rules: CLAUDE.md (root) and CRITICAL-RULES.md (root)"
}
EOF
