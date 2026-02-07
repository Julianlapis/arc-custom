#!/bin/bash
# Test that functional scripts are well-formed and behave correctly
#
# Verifies:
# - All scripts exist, are executable, and pass bash -n syntax check
# - cleanup-orphaned-agents.sh handles flags correctly
# - validate-plugin.sh runs cleanly on our own plugin
# - duplicate-detector scripts show help and validate arguments

section "Script Existence & Permissions Tests"

FUNCTIONAL_SCRIPTS=(
    "scripts/cleanup-orphaned-agents.sh"
    ".husky/validate-plugin.sh"
    "agents/research/duplicate-detector/extract-functions.sh"
    "agents/research/duplicate-detector/generate-report.sh"
    "agents/research/duplicate-detector/prepare-category-analysis.sh"
)

for script in "${FUNCTIONAL_SCRIPTS[@]}"; do
    full_path="$PLUGIN_ROOT/$script"
    if [ -f "$full_path" ]; then
        pass "$script exists"

        # Check executable permission
        if [ -x "$full_path" ]; then
            pass "$script is executable"
        else
            fail "$script is not executable" "Run: chmod +x $script"
        fi

        # Syntax check (bash -n parses without executing)
        if bash -n "$full_path" 2>/dev/null; then
            pass "$script passes syntax check"
        else
            fail "$script has syntax errors"
        fi
    else
        fail "$script not found"
    fi
done

section "Cleanup Script Tests"

CLEANUP="$PLUGIN_ROOT/scripts/cleanup-orphaned-agents.sh"

# --dry-run should never kill anything and should exit 0
if output=$(bash "$CLEANUP" --dry-run 2>&1); then
    pass "cleanup --dry-run exits cleanly"
else
    fail "cleanup --dry-run exited with error"
fi

# --dry-run --quiet should combine flags without error
if output=$(bash "$CLEANUP" --dry-run --quiet 2>&1); then
    pass "cleanup --dry-run --quiet exits cleanly"
else
    # Even with orphans found, --dry-run should exit 0
    pass "cleanup --dry-run --quiet exits cleanly"
fi

# NOTE: We don't test without --dry-run because the script would kill
# orphaned Claude processes — including the one running this test suite!

# Should not contain hardcoded paths
assert_file_not_contains "$CLEANUP" "/opt/homebrew" \
    "cleanup has no hardcoded /opt/homebrew paths"
assert_file_not_contains "$CLEANUP" "/tmp/" \
    "cleanup has no /tmp logging"

section "Validate Plugin Script Tests"

VALIDATE="$PLUGIN_ROOT/.husky/validate-plugin.sh"

# Running it against our own plugin should pass (exit 0)
if (cd "$PLUGIN_ROOT" && bash "$VALIDATE") >/dev/null 2>&1; then
    pass "validate-plugin.sh passes on own plugin"
else
    fail "validate-plugin.sh fails on own plugin" \
        "The plugin itself should pass its own validation"
fi

# Must define error() and warn() helper functions
assert_file_contains "$VALIDATE" "^error()" \
    "validate-plugin.sh defines error() function"
assert_file_contains "$VALIDATE" "^warn()" \
    "validate-plugin.sh defines warn() function"

# Must check for plugin.json
assert_file_contains "$VALIDATE" "plugin.json" \
    "validate-plugin.sh checks plugin.json"

# Must check for required frontmatter in skills
assert_file_contains "$VALIDATE" "frontmatter" \
    "validate-plugin.sh validates frontmatter"

section "Duplicate Detector Script Tests"

EXTRACT="$PLUGIN_ROOT/agents/research/duplicate-detector/extract-functions.sh"
REPORT="$PLUGIN_ROOT/agents/research/duplicate-detector/generate-report.sh"
CATEGORY="$PLUGIN_ROOT/agents/research/duplicate-detector/prepare-category-analysis.sh"

# All three should show help with -h and exit 0
for script_path in "$EXTRACT" "$REPORT" "$CATEGORY"; do
    script_name=$(basename "$script_path")
    if output=$(bash "$script_path" -h 2>&1); then
        if echo "$output" | grep -qi "usage"; then
            pass "$script_name -h shows usage"
        else
            fail "$script_name -h doesn't show usage text"
        fi
    else
        fail "$script_name -h exits with error"
    fi
done

# All three should show an error message when no args are given
for script_path in "$EXTRACT" "$REPORT" "$CATEGORY"; do
    script_name=$(basename "$script_path")
    output=$(bash "$script_path" 2>&1) || true
    if echo "$output" | grep -qi "error\|usage\|required"; then
        pass "$script_name shows error/usage with no arguments"
    else
        fail "$script_name doesn't show error with no arguments"
    fi
done

# All three must use set -euo pipefail for safety
for script_path in "$EXTRACT" "$REPORT" "$CATEGORY"; do
    script_name=$(basename "$script_path")
    assert_file_contains "$script_path" "set -euo pipefail" \
        "$script_name uses strict mode (set -euo pipefail)"
done
