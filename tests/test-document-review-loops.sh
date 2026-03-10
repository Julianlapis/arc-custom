#!/bin/bash
# Test that Arc ships document review agents used by ideate/detail workflows

section "Document Review Loop Tests"

assert_file_exists "$PLUGIN_ROOT/agents/workflow/spec-document-reviewer.md" \
    "spec-document-reviewer exists"
assert_file_exists "$PLUGIN_ROOT/agents/workflow/plan-document-reviewer.md" \
    "plan-document-reviewer exists"
