#!/bin/bash
# Test that Arc provides a plugin-level SessionStart hook and bootstrap skill

section "Session Start Hook Tests"

assert_file_exists "$PLUGIN_ROOT/hooks/hooks.json" "hooks/hooks.json"
assert_file_exists "$PLUGIN_ROOT/hooks/session-start" "hooks/session-start"
assert_file_exists "$PLUGIN_ROOT/skills/using-arc/SKILL.md" "skills/using-arc/SKILL.md"

assert_file_contains "$PLUGIN_ROOT/hooks/hooks.json" '"SessionStart"' \
    "hooks/hooks.json registers SessionStart"
assert_file_contains "$PLUGIN_ROOT/hooks/hooks.json" "hooks/session-start" \
    "hooks/hooks.json invokes session-start directly"
assert_file_contains "$PLUGIN_ROOT/hooks/session-start" "using-arc" \
    "session-start injects using-arc"
