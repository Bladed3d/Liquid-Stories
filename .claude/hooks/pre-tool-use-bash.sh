#!/bin/bash
# Pre-tool hook for Bash commands: Validates commands before execution

# Fix Windows Git Bash PATH issue (Ralph plugin compatibility)
export PATH="/usr/bin:/bin:/mingw64/bin:$PATH"

COMMAND="$1"

# Block taskkill by process name
if echo "$COMMAND" | grep -qE "taskkill.*//IM.*(node\.exe|electron\.exe|npm|python)"; then
    echo "❌ BLOCKED: taskkill by process name"
    echo ""
    echo "This crashes all instances. Use specific PID instead:"
    echo "  1. Get-Process | Where-Object {\\$_.Name -eq \"node\"}"
    echo "  2. taskkill //F //PID <specific_number>"
    echo ""
    echo "Or use the wrapper:"
    echo "  ./tools/kill-port.sh <port_number>"
    echo ""
    exit 1
fi

# Block compound commands with taskkill
if echo "$COMMAND" | grep -qE "(&&|;).*taskkill.*//IM"; then
    echo "❌ BLOCKED: Compound command with process name taskkill"
    echo "Detected in command chain - would crash active work"
    exit 1
fi

# Warn about running npm/pip install without user confirmation
if echo "$COMMAND" | grep -qE "^(npm|pip) install" && [ -z "$CLAUDE_AUTO_INSTALL" ]; then
    echo "⚠️  Installing dependencies - this may take time and modify package files"
    # Don't block - just warn
fi

exit 0
