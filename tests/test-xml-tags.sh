#!/bin/bash
# Test that XML tags are used consistently across skills and agents
#
# Verifies:
# - All agents with CLAUDE_PLUGIN_ROOT file references have them inside <required_reading> or <rules_context>
# - No files use retired tags (<mandatory_references>, <arc_log_context>)
# - All review agents have <advisory> tag

section "XML Tag Consistency Tests"

# --- Test 1: No retired tags ---
echo "Checking for retired tags..."
echo ""

RETIRED_TAGS=("mandatory_references" "arc_log_context")

for tag in "${RETIRED_TAGS[@]}"; do
    files_with_retired=$(grep -rl "<${tag}>" "$PLUGIN_ROOT/skills" "$PLUGIN_ROOT/agents" 2>/dev/null)
    if [ -z "$files_with_retired" ]; then
        pass "No files use retired tag <${tag}>"
    else
        for f in $files_with_retired; do
            rel_path="${f#$PLUGIN_ROOT/}"
            fail "$rel_path uses retired tag <${tag}>"
        done
    fi
done

# --- Test 2: All review agents have <advisory> ---
echo ""
echo "Checking review agents for <advisory> tag..."
echo ""

for agent_file in "$PLUGIN_ROOT"/agents/review/*.md; do
    agent_name=$(basename "$agent_file" .md)
    if grep -q "<advisory>" "$agent_file"; then
        pass "review/$agent_name has <advisory>"
    else
        fail "review/$agent_name missing <advisory>"
    fi
done

# --- Test 3: CLAUDE_PLUGIN_ROOT refs in agents are inside proper tags ---
echo ""
echo "Checking agent file references are inside <required_reading> or <rules_context>..."
echo ""

tag_errors=0
tag_checked=0

for agent_file in "$PLUGIN_ROOT"/agents/*/*.md; do
    agent_name=$(basename "$agent_file" .md)
    category=$(basename "$(dirname "$agent_file")")

    # Check if this agent references CLAUDE_PLUGIN_ROOT at all
    if ! grep -q 'CLAUDE_PLUGIN_ROOT' "$agent_file"; then
        continue
    fi

    ((tag_checked++))

    # Check if it has <required_reading> or <rules_context>
    if grep -q '<required_reading>\|<rules_context>' "$agent_file"; then
        # Now verify ALL CLAUDE_PLUGIN_ROOT refs are inside these tags, not floating loose
        # Extract lines with CLAUDE_PLUGIN_ROOT that are NOT between tag pairs
        in_tag=false
        has_loose_ref=false
        while IFS= read -r line; do
            if echo "$line" | grep -q '<required_reading>\|<rules_context>'; then
                in_tag=true
            elif echo "$line" | grep -q '</required_reading>\|</rules_context>'; then
                in_tag=false
            elif [ "$in_tag" = false ] && echo "$line" | grep -q 'CLAUDE_PLUGIN_ROOT'; then
                has_loose_ref=true
            fi
        done < "$agent_file"

        if [ "$has_loose_ref" = true ]; then
            fail "$category/$agent_name has CLAUDE_PLUGIN_ROOT refs outside <required_reading>/<rules_context>"
            ((tag_errors++))
        else
            pass "$category/$agent_name file refs properly wrapped"
        fi
    else
        fail "$category/$agent_name has CLAUDE_PLUGIN_ROOT refs but no <required_reading> or <rules_context>"
        ((tag_errors++))
    fi
done

if [ $tag_errors -eq 0 ] && [ $tag_checked -gt 0 ]; then
    pass "All $tag_checked agents with file refs have them properly tagged"
fi

# --- Test 4: Skills with references/rules paths have <required_reading> or <rules_context> ---
echo ""
echo "Checking skills that load references or rules files..."
echo ""

# Skills that reference references/ or rules/ paths for loading should have
# <required_reading> or <rules_context> tags. Skills that only reference
# agents/ or arc-log.md paths contextually don't need these tags.

skill_tag_errors=0
skill_tag_checked=0

for skill_file in "$PLUGIN_ROOT"/skills/*/SKILL.md; do
    skill_name=$(basename "$(dirname "$skill_file")")

    # Only check skills that reference specific .md files in references/ or rules/ for loading.
    # Exclude: arc-log.md (belongs in <arc_log>), cp commands (file copying),
    # bare directory paths like rules/ (not doc loading), and > Reference: inline tips.
    refs_to_check=$(grep 'CLAUDE_PLUGIN_ROOT}/\(references\|rules\)/[a-zA-Z]' "$skill_file" \
        | grep '\.md' \
        | grep -v 'arc-log\.md' \
        | grep -v 'cp -r' \
        | grep -v '> Reference:' \
        2>/dev/null)
    if [ -z "$refs_to_check" ]; then
        continue
    fi

    ((skill_tag_checked++))

    if grep -q '<required_reading>\|<rules_context>' "$skill_file"; then
        pass "skill/$skill_name has required_reading/rules_context for loaded docs"
    else
        fail "skill/$skill_name loads references/rules but has no <required_reading> or <rules_context>"
        ((skill_tag_errors++))
    fi
done

if [ $skill_tag_errors -eq 0 ] && [ $skill_tag_checked -gt 0 ]; then
    pass "All $skill_tag_checked skills loading docs have proper tags"
fi
