#!/bin/bash
# Pre-submit hook: Blocks dangerous operations before Claude executes them
# This runs BEFORE Claude processes your request

# Extract the user's prompt from stdin
PROMPT=$(cat)

# Block dangerous taskkill commands
if echo "$PROMPT" | grep -qE "taskkill.*(node\.exe|electron\.exe|npm|python)"; then
    echo "❌ BLOCKED: Dangerous taskkill command detected"
    echo ""
    echo "This would crash active processes. Use instead:"
    echo "  ./tools/kill-port.sh <port_number>"
    echo ""
    exit 1
fi

# Block API key exposure in prompts asking to log/print keys
if echo "$PROMPT" | grep -qiE "(log|print|console|trail\.light).*(api.?key|token|secret|password)"; then
    echo "⚠️  WARNING: Prompt mentions logging API keys"
    echo "Reminder: breadcrumb_system auto-sanitizes, but avoid intentional logging"
    echo ""
    # Don't block - just warn
fi

# Pass through the original prompt
echo "$PROMPT"
exit 0
