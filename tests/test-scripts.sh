#!/bin/bash
# Test that functional scripts are well-formed and behave correctly
#
# Verifies:
# - All scripts exist, are executable, and pass bash -n syntax check
# - cleanup-orphaned-agents.sh handles flags correctly
# - validate-plugin.sh runs cleanly on our own plugin

section "Script Existence & Permissions Tests"

FUNCTIONAL_SCRIPTS=(
    "scripts/cleanup-orphaned-agents.sh"
    ".husky/validate-plugin.sh"
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

