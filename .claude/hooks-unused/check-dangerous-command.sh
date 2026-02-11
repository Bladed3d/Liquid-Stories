#!/bin/bash
# Pre-command hook to block dangerous operations
# This script receives the command via stdin as JSON

# Read the hook input
INPUT=$(cat)

# Extract the command from JSON (simplified parsing)
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | sed 's/"command":"//;s/"$//')

# If no command found in that format, try alternate parsing
if [ -z "$COMMAND" ]; then
    COMMAND=$(echo "$INPUT" | grep -oP '(?<="command":")[^"]*')
fi

# === DANGEROUS PATTERNS ===

# Block: mv with backslash paths (Windows path escaping issues)
if echo "$COMMAND" | grep -qE 'mv.*\\'; then
    echo "BLOCKED: mv with backslash paths causes escaping issues on Windows"
    echo "USE: Forward slashes (D:/path/file) and copy→verify→delete pattern"
    echo ""
    echo "Safe pattern:"
    echo "  cp \"D:/source/file\" \"D:/dest/file\""
    echo "  ls -la \"D:/dest/file\"  # verify"
    echo "  rm \"D:/source/file\"    # only after verify"
    exit 1
fi

# Block: Direct mv commands (should use copy→verify→delete)
if echo "$COMMAND" | grep -qE '^mv\s' || echo "$COMMAND" | grep -qE '&&\s*mv\s'; then
    echo "WARNING: Direct 'mv' detected. Consider copy→verify→delete pattern."
    echo "If moving critical files, use:"
    echo "  cp source dest && ls -la dest && rm source"
    # Don't block, just warn (exit 0)
fi

# Block: rm -rf with wildcards at root-like paths
if echo "$COMMAND" | grep -qE 'rm\s+-rf?\s+[/\\]'; then
    echo "BLOCKED: Dangerous rm -rf pattern detected"
    exit 1
fi

# Block: git push --force to main/master
if echo "$COMMAND" | grep -qE 'git\s+push.*--force.*(main|master)' || \
   echo "$COMMAND" | grep -qE 'git\s+push.*-f.*(main|master)'; then
    echo "BLOCKED: Force push to main/master is not allowed"
    echo "If you really need this, get explicit user permission first"
    exit 1
fi

# Block: Committing .env files
if echo "$COMMAND" | grep -qE 'git\s+(add|commit).*\.env'; then
    echo "BLOCKED: Attempting to commit .env file"
    echo "Never commit credentials or environment files"
    exit 1
fi

# All checks passed
exit 0
