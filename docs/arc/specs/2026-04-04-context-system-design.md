# Automatic Project Context System

## Problem Statement

Every new Claude conversation starts cold. No knowledge of current phase, recent decisions, blockers, or next steps. Mid-session, context compression loses earlier decisions. The existing `progress.md` is maintained by hand and often stale. Session handoffs are one-off documents that get archived and forgotten.

**Two problems, same root cause:** No persistent state that survives across and within sessions.

## Approach

A single `docs/context.md` per project, maintained by Arc skills as their final step and injected at session start. The file is overwritten (not appended). Git history preserves the timeline. Decisions accumulate across sessions (carried forward, capped at 10).

### What This Replaces

- `docs/arc/progress.md` (replaced)
- `session-handoff-*.md` files (no longer needed)
- Manual CLAUDE.md state updates (automated)

## The `docs/context.md` Schema

```markdown
# Project Context
> Auto-maintained by Arc. Last updated: YYYY-MM-DD HH:MM TZ

## Status
- **Phase:** [v1-build | v1-polish | v2-planning | shipped | on-hold]
- **Stack:** [framework, language, key deps]
- **Branch:** [current branch]
- **Build:** [passing | failing (brief reason)]

## Last Session
- [What was done, 2-4 bullet points]
- [Files touched]

## Decisions
- [Decision]: [Rationale] (YYYY-MM-DD)
- [Decision]: [Rationale] (YYYY-MM-DD)
<!-- Cap: 10 most recent load-bearing decisions. Drop older ones unless still constraining. -->

## Blockers
- [Blocker or "None"]

## Next
1. [Highest priority]
2. [Second priority]
3. [Third priority]

## Open Questions
- [Unresolved question, if any, or "None"]
```

**Rules:**
- Status, Last Session, Next: overwritten each session
- Decisions: carried forward, capped at 10 entries, oldest dropped unless still load-bearing
- Blockers, Open Questions: overwritten each session
- The file header timestamp updates on every write

## Architecture

### Write Path: Global + Skill-Driven

**Primary (global):** A Hard Rule in `~/.claude/CLAUDE.md` instructs the model to write `docs/context.md` before ending any meaningful work session. This works on every project, whether or not Arc skills are used.

**Secondary (Arc skills):** Each Arc skill also writes `docs/context.md` as its final step via `<context_update>` blocks. This provides higher-quality, more precise updates at specific workflow moments.

**Safety net (Stop hook):** `context_writer.py` fires at session end. If `docs/context.md` wasn't updated in the last 2 minutes (likely this session), it injects a `systemMessage` reminding the model to write it. This catches sessions where the CLAUDE.md instruction was forgotten or where non-Arc, non-strategy-engine workflows were used.

**Skills that write context:**
- `/arc:build` (after build completes)
- `/arc:implement` (after each task or at plan completion)
- `/arc:ideate` (after design doc is written)
- `/arc:testing` (after test run)
- `/arc:review` (after review completes)
- `/arc:design` (after UI design)
- `/arc:letsgo` (after ship checklist)
- `/arc:commit` (after commit)
- `/arc:audit` (after audit completes)
- `/arc:polish`, `/arc:harden`, `/arc:distill`, `/arc:animate` (after refinement)

**Implementation:** A shared `<context_update>` block added to each skill's SKILL.md, similar to the existing `<progress_append>` pattern. The block instructs the model to:

1. Read existing `docs/context.md` (if it exists) to preserve Decisions
2. Write an updated `docs/context.md` with current state
3. Auto-commit: `git add docs/context.md && git commit -m "context: update project state"`

**The `<context_update>` block template:**

```markdown
<context_update>
After completing this skill's main work, update the project context file.

1. Read `docs/context.md` if it exists (to carry forward Decisions)
2. Write `docs/context.md` following the schema:
   - Status: current phase, stack, branch, build status
   - Last Session: what was just done (2-4 bullets), files touched
   - Decisions: carry forward existing (cap at 10, drop stale), add any new
   - Blockers: current blockers or "None"
   - Next: top 3 priorities based on current state
   - Open Questions: unresolved items or "None"
3. Commit: `git add docs/context.md && git commit -m "context: update project state"`

If the commit fails (merge conflict, detached HEAD, no git repo), write the file but skip the commit silently.
</context_update>
```

### Read Path: SessionStart Hook

A `SessionStart` hook reads `docs/context.md` and injects it as `additionalContext`.

**File:** `~/.claude/hooks/context-reader.sh`

```bash
#!/bin/bash
# Context Reader: SessionStart hook
# Reads docs/context.md from the working directory and injects it as context
# Note: stat -f is macOS. For Linux, replace with: stat -c %Y

CONTEXT_FILE="docs/context.md"

if [[ ! -f "$CONTEXT_FILE" ]]; then
  exit 0
fi

# Check staleness: warn if older than 7 days
FILE_MOD=$(stat -f %m "$CONTEXT_FILE" 2>/dev/null || stat -c %Y "$CONTEXT_FILE" 2>/dev/null || echo 0)
FILE_AGE_DAYS=$(( ($(date +%s) - FILE_MOD) / 86400 ))
STALE_WARNING=""
if [[ $FILE_AGE_DAYS -gt 7 ]]; then
  STALE_WARNING=" [STALE: last updated ${FILE_AGE_DAYS} days ago. Verify before trusting.]"
fi

# Read and JSON-escape the content
CONTENT=$(python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" < "$CONTEXT_FILE")
# Strip outer quotes from json.dumps output
CONTENT=${CONTENT:1:-1}

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"PROJECT CONTEXT%s:\\n\\n%s"}}\n' "$STALE_WARNING" "$CONTENT"
```

**Registration:** Add to `~/.claude/hooks/orchestrator/manifest.yaml` as a SessionStart hook with priority 5 (runs before other SessionStart hooks so context is available early).

### Git Safety Guards

The auto-commit in the `<context_update>` block includes these guards:

```bash
# Skip commit if repo is in a bad state
[[ -f .git/MERGE_HEAD ]] && exit 0
[[ -f .git/CHERRY_PICK_HEAD ]] && exit 0
git rev-parse --abbrev-ref HEAD 2>/dev/null | grep -q "^HEAD$" && exit 0
# Only commit context.md. Never bundle other files.
git add docs/context.md && git commit -m "context: update project state" || true
```

### Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Skill doesn't write context.md | Next session starts cold (same as today) | No worse than status quo. Skills have the instruction; compliance improves over time. |
| Model writes incomplete context | Partial orientation, possible false confidence | SessionStart hook injects raw file. Model can see gaps and ask. |
| No git repo in project | File written, commit skipped | `<context_update>` instruction handles this. Context still works, just no git trail. |
| Concurrent sessions write same file | Second commit silently drops | `|| true` on commit. File on disk is from whichever session wrote last. |
| Context.md goes stale (project untouched) | Old context injected | Staleness warning if >7 days old. Model told to verify before trusting. |
| Decisions section exceeds cap | Extra tokens injected | Cap at 10 in the `<context_update>` instruction. Model enforces. |

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Skill-driven writes, not Stop hook | Stop hook can't reliably trigger a model write. Session may terminate before the model acts. Skills are active when they complete. |
| Overwrite, not append | The file is always-current state, not history. Git diff is the changelog. |
| Auto-commit every write | Creates session boundary markers in git history. User wants the trail. |
| Keep all 7 schema sections | Blockers and Open Questions earn their own sections for scanability. |
| Cap Decisions at 10 | Prevents unbounded growth. Older decisions either live in code or are no longer relevant. |
| Global SessionStart reader | Works on every project, not just Arc-managed ones. No-op if file doesn't exist. |
| No migration of existing progress.md | Clean break. Old files stay until you remove them. |

## Implementation Plan

### Phase 1: Core Infrastructure
1. Create `context-reader.sh` SessionStart hook
2. Register it in the orchestrator manifest
3. Create the shared `<context_update>` block template
4. Add `<context_update>` to the 3 most-used skills: `/arc:build`, `/arc:implement`, `/arc:commit`

### Phase 2: Full Skill Coverage
5. Add `<context_update>` to remaining skills (ideate, testing, review, design, letsgo, audit, polish, harden, distill, animate)
6. Update `/arc:go` to read `docs/context.md` first, fall back to `docs/arc/progress.md`, fall back to cold start

### Phase 3: Deprecation (only after Phase 2 is complete)
7. Remove `<progress_append>` blocks from all skills
8. Update `skills/progress/SKILL.md` to reference context.md
9. Add note to `docs/arc/progress.md` template pointing to context.md

## What This Does NOT Do

- No cross-project dashboard (future evolution if needed)
- No mid-session continuous updates (skills write at completion only)
- No migration of existing handoff docs or progress files
- No validation of context.md format (model generates, model consumes)
- No Stop hook fallback (if skills don't write, context stays stale, same as today)
