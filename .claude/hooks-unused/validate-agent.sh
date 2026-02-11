#!/bin/bash
# Validation hook for agent files in .claude/agents/
# Checks that agent files follow persona-creator structure
# Required sections: Credentials, Domain, Methodology, Boundaries/Limitations, Transparency

# Read the hook input (JSON with file path and content info)
INPUT=$(cat)

# Extract file path from the input
FILE_PATH=$(echo "$INPUT" | grep -oP '(?<="file_path":")[^"]*' | head -1)

# Only validate files in .claude/agents/
if [[ ! "$FILE_PATH" =~ \.claude/agents/ ]] && [[ ! "$FILE_PATH" =~ \.claude\\agents\\ ]]; then
    exit 0  # Not an agent file, skip validation
fi

# Skip persona-creator.md itself (it's the meta-agent)
if [[ "$FILE_PATH" =~ persona-creator\.md ]]; then
    exit 0
fi

# Extract the content that will be written
CONTENT=$(echo "$INPUT" | grep -oP '(?<="content":")[^"]*' | head -1)

# If we can't extract content from JSON, try to read the file directly
if [ -z "$CONTENT" ] && [ -f "$FILE_PATH" ]; then
    CONTENT=$(cat "$FILE_PATH")
fi

# Required sections (from persona-creator structure)
REQUIRED_SECTIONS=(
    "Credentials"
    "Domain"
    "Methodology"
    "Transparency"
)

# Check for required sections
MISSING_SECTIONS=()

for section in "${REQUIRED_SECTIONS[@]}"; do
    # Case-insensitive search for section headers
    if ! echo "$CONTENT" | grep -qi "##.*$section\|^\*\*$section\*\*\|^$section:"; then
        # Also check for variations
        if ! echo "$CONTENT" | grep -qi "$section"; then
            MISSING_SECTIONS+=("$section")
        fi
    fi
done

# Check for Boundaries OR Limitations (either is acceptable)
if ! echo "$CONTENT" | grep -qi "Boundaries\|Limitations\|NOT in scope\|Cannot do"; then
    MISSING_SECTIONS+=("Boundaries/Limitations")
fi

# If missing sections, warn but don't block
if [ ${#MISSING_SECTIONS[@]} -gt 0 ]; then
    echo "⚠️  AGENT VALIDATION WARNING"
    echo ""
    echo "File: $FILE_PATH"
    echo ""
    echo "Missing recommended sections (per persona-creator structure):"
    for section in "${MISSING_SECTIONS[@]}"; do
        echo "  - $section"
    done
    echo ""
    echo "RECOMMENDATION: Use persona-creator agent to generate agents."
    echo "Location: .claude/agents/persona-creator.md"
    echo ""
    echo "Required structure reduces hallucination by 40% → 13% (Harvard research)"
    echo ""
    echo "Proceeding anyway... but consider regenerating with persona-creator."
    # Exit 0 to allow (warning only), exit 1 to block
    exit 0
fi

# All checks passed
echo "✅ Agent file validation passed: $FILE_PATH"
exit 0
