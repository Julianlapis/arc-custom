#!/bin/bash
# Test that all agents are properly structured and skill references are valid
#
# Verifies:
# - All expected agent files exist with required frontmatter
# - Skills that reference agents point to files that exist
# - Skills that reference rules point to files that exist

section "Agent Structure Tests"

# Expected agents by category
REVIEW_AGENTS=(
    "accessibility-engineer"
    "architecture-engineer"
    "daniel-product-engineer"
    "data-engineer"
    "designer"
    "lee-nextjs-engineer"
    "hygiene-engineer"
    "organization-engineer"
    "performance-engineer"
    "security-engineer"
    "senior-engineer"
    "seo-engineer"
    "simplicity-engineer"
    "test-quality-engineer"
)

RESEARCH_AGENTS=(
    "docs-researcher"
    "duplicate-detector"
    "feature-scout"
    "git-history-analyzer"
    "naming"
)

BUILD_AGENTS=(
    "code-reviewer"
    "debugger"
    "design-specifier"
    "e2e-runner"
    "e2e-test-writer"
    "figma-builder"
    "fixer"
    "implementer"
    "integration-test-writer"
    "spec-reviewer"
    "test-runner"
    "ui-builder"
    "unit-test-writer"
)

WORKFLOW_AGENTS=(
    "docs-writer"
    "e2e-test-runner"
    "plan-document-reviewer"
    "spec-document-reviewer"
    "spec-flow-analyzer"
)

echo "Checking review agents..."
echo ""
for agent in "${REVIEW_AGENTS[@]}"; do
    agent_file="$PLUGIN_ROOT/agents/review/$agent.md"
    if [ -f "$agent_file" ]; then
        pass "agents/review/$agent exists"
    else
        fail "agents/review/$agent.md not found"
    fi
done

echo ""
echo "Checking research agents..."
echo ""
for agent in "${RESEARCH_AGENTS[@]}"; do
    agent_file="$PLUGIN_ROOT/agents/research/$agent.md"
    if [ -f "$agent_file" ]; then
        pass "agents/research/$agent exists"
    else
        fail "agents/research/$agent.md not found"
    fi
done

echo ""
echo "Checking build agents..."
echo ""
for agent in "${BUILD_AGENTS[@]}"; do
    agent_file="$PLUGIN_ROOT/agents/build/$agent.md"
    if [ -f "$agent_file" ]; then
        pass "agents/build/$agent exists"
    else
        fail "agents/build/$agent.md not found"
    fi
done

echo ""
echo "Checking workflow agents..."
echo ""
for agent in "${WORKFLOW_AGENTS[@]}"; do
    agent_file="$PLUGIN_ROOT/agents/workflow/$agent.md"
    if [ -f "$agent_file" ]; then
        pass "agents/workflow/$agent exists"
    else
        fail "agents/workflow/$agent.md not found"
    fi
done

# Verify agent frontmatter has required fields
section "Agent Frontmatter Tests"

echo "Verifying all agents have name, model, and description..."
echo ""

for agent_file in "$PLUGIN_ROOT"/agents/*/*.md; do
    agent_name=$(basename "$agent_file" .md)
    category=$(basename "$(dirname "$agent_file")")

    frontmatter=$(get_frontmatter "$agent_file")

    if echo "$frontmatter" | grep -q "^name:"; then
        if echo "$frontmatter" | grep -q "^model:"; then
            if echo "$frontmatter" | grep -q "^description:"; then
                pass "$category/$agent_name has name, model, description"
            else
                fail "$category/$agent_name missing description"
            fi
        else
            fail "$category/$agent_name missing model"
        fi
    else
        fail "$category/$agent_name missing name"
    fi
done

# Verify skills reference existing files
section "Skill Reference Tests"

echo "Checking Arc references in skills..."
echo ""

ref_errors=0
ref_checked=0

for skill_file in "$PLUGIN_ROOT"/skills/*/SKILL.md; do
    skill_name=$(basename "$(dirname "$skill_file")")

    refs=$(extract_arc_refs "$skill_file")

    if [ -n "$refs" ]; then
        while IFS= read -r ref; do
            rel_path="$(normalize_arc_ref "$ref")"
            full_path="$PLUGIN_ROOT/$rel_path"

            ((ref_checked++))

            # Check if path exists (file or directory)
            if [ -e "$full_path" ] || [ -e "${full_path}.md" ]; then
                : # exists, no output needed to keep it concise
            else
                fail "skill/$skill_name references missing: $rel_path"
                ((ref_errors++))
            fi
        done <<< "$refs"
    fi
done

if [ $ref_errors -eq 0 ] && [ $ref_checked -gt 0 ]; then
    pass "All $ref_checked Arc references are valid in skills"
elif [ $ref_checked -eq 0 ]; then
    skip "No Arc references found in skills"
fi

echo ""
echo "Checking Arc references in agents..."
echo ""

agent_ref_errors=0
agent_ref_checked=0

for agent_file in "$PLUGIN_ROOT"/agents/*/*.md; do
    agent_name="$(basename "$(dirname "$agent_file")")/$(basename "$agent_file" .md)"

    refs=$(extract_arc_refs "$agent_file")

    if [ -n "$refs" ]; then
        while IFS= read -r ref; do
            rel_path="$(normalize_arc_ref "$ref")"
            full_path="$PLUGIN_ROOT/$rel_path"

            ((agent_ref_checked++))

            if [ -e "$full_path" ] || [ -e "${full_path}.md" ]; then
                : # exists
            else
                fail "agent/$agent_name references missing: $rel_path"
                ((agent_ref_errors++))
            fi
        done <<< "$refs"
    fi
done

if [ $agent_ref_errors -eq 0 ] && [ $agent_ref_checked -gt 0 ]; then
    pass "All $agent_ref_checked Arc references are valid in agents"
elif [ $agent_ref_checked -eq 0 ]; then
    skip "No Arc references found in agents"
fi

# Verify no unexpected agents
echo ""
echo "Checking for unexpected agent files..."
ALL_EXPECTED_AGENTS=(
    "${REVIEW_AGENTS[@]}"
    "${RESEARCH_AGENTS[@]}"
    "${BUILD_AGENTS[@]}"
    "${WORKFLOW_AGENTS[@]}"
)

for agent_file in "$PLUGIN_ROOT"/agents/*/*.md; do
    agent_name=$(basename "$agent_file" .md)
    found=false
    for expected in "${ALL_EXPECTED_AGENTS[@]}"; do
        if [ "$agent_name" = "$expected" ]; then
            found=true
            break
        fi
    done
    if [ "$found" = false ]; then
        echo -e "${YELLOW}⚠${NC} Unexpected agent: $agent_name (not in expected list)"
    fi
done
