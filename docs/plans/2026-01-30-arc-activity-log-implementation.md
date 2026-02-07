# Arc Activity Log Implementation Plan

> **For Claude:** Use /arc:implement to implement this plan task-by-task.

**Design:** [docs/plans/2026-01-30-arc-activity-log-design.md](./2026-01-30-arc-activity-log-design.md)
**Goal:** Replace never-working `docs/progress.md` with automatic `.arc/log.md`
**Stack:** Claude Code plugin (markdown files) — no test runner

---

## Task 1: Create shared reference file

Create `references/arc-log.md` that defines the append mechanism once. All skills will reference this instead of duplicating logic.

**Files:**
- Create: `references/arc-log.md`

**Implementation:**

```markdown
# Arc Activity Log

Skills append to `.arc/log.md` on completion to maintain a running history of what Arc has done.

## Log Location

`.arc/log.md` in the project root (gitignored)

## Entry Format

```markdown
## YYYY-MM-DD HH:MM
/arc:[skill] — [Brief description of what was done]
Files: [comma-separated list of key files]

---
```

## Append Mechanism

After completing the skill's main work:

1. **Ensure .arc/ exists and is gitignored:**
```bash
mkdir -p .arc
if ! grep -q "^\.arc/$" .gitignore 2>/dev/null; then
  echo ".arc/" >> .gitignore
fi
```

2. **Prepend the new entry** (newest first):
```bash
# Create entry
cat > /tmp/arc-log-entry.md << 'EOF'
## YYYY-MM-DD HH:MM
/arc:[skill] — [description]
Files: [files]

---

EOF

# Prepend to log
if [ -f .arc/log.md ]; then
  cat .arc/log.md >> /tmp/arc-log-entry.md
fi
mv /tmp/arc-log-entry.md .arc/log.md
```

## Reading the Log

Skills that benefit from context should read recent entries:

```bash
head -50 .arc/log.md 2>/dev/null
```

Look for:
- Recent work on related features
- Decisions that affect current work
- Patterns in what's been done

## What Gets Logged

| Skill | What to Log |
|-------|-------------|
| `/arc:ideate` | Feature designed, approach chosen |
| `/arc:detail` | Plan created, task count |
| `/arc:implement` | Tasks completed, remaining |
| `/arc:build` | What was built |
| `/arc:test` | Test results, coverage |
| `/arc:review` | Plan reviewed, changes |
| `/arc:audit` | Issue counts by severity |
| `/arc:design` | UI designed, aesthetic direction |
| `/arc:letsgo` | Deployment status |
| `/arc:document` | Solution documented |
| `/arc:commit` | What was committed |
| `/arc:vision` | Vision created/updated |
| `/arc:figma` | Components implemented |
| `/arc:legal` | Legal pages generated |
| `/arc:seo` | SEO audit results |
| `/arc:deps` | Dependency audit results |
| `/arc:worktree` | Worktree created |
| `/arc:dedup` | Duplicates found |

## What Doesn't Get Logged

- `/arc:start` (routing only)
- `/arc:suggest` (read-only)
- `/arc:prune-agents` (utility)
- `/arc:tidy` (utility)
- `/arc:rules` (one-time setup)
- `/arc:naming` (standalone)
```

**Verify:** File exists at `references/arc-log.md`

**Commit:** `feat: add shared arc-log reference for activity logging`

---

## Task 2: Update skills with progress_append blocks (batch 1)

Replace `<progress_append>` blocks in first 6 skills with reference to shared file.

**Files:**
- Modify: `skills/ideate/SKILL.md`
- Modify: `skills/detail/SKILL.md`
- Modify: `skills/implement/SKILL.md`
- Modify: `skills/build/SKILL.md`
- Modify: `skills/review/SKILL.md`
- Modify: `skills/design/SKILL.md`

**Pattern for each skill:**

Find the `<progress_append>` block (including closing `</progress_append>`) and replace with:

```markdown
<arc_log>
**After completing this skill, append to the activity log.**
See: `${CLAUDE_PLUGIN_ROOT}/references/arc-log.md`

Entry: `/arc:[skill-name] — [what was done]`
</arc_log>
```

**Verify:** Each file has `<arc_log>` block, no `<progress_append>` block

**Commit:** `refactor: update skills batch 1 to use arc-log reference`

---

## Task 3: Update skills with progress_append blocks (batch 2)

Replace `<progress_append>` blocks in next 6 skills.

**Files:**
- Modify: `skills/test/SKILL.md`
- Modify: `skills/commit/SKILL.md`
- Modify: `skills/audit/SKILL.md`
- Modify: `skills/seo/SKILL.md`
- Modify: `skills/letsgo/SKILL.md`
- Modify: `skills/document/SKILL.md`

**Same pattern as Task 2.**

**Verify:** Each file has `<arc_log>` block, no `<progress_append>` block

**Commit:** `refactor: update skills batch 2 to use arc-log reference`

---

## Task 4: Update skills with progress_append blocks (batch 3)

Replace `<progress_append>` blocks in remaining 6 skills.

**Files:**
- Modify: `skills/vision/SKILL.md`
- Modify: `skills/figma/SKILL.md`
- Modify: `skills/legal/SKILL.md`
- Modify: `skills/worktree/SKILL.md`
- Modify: `skills/deps/SKILL.md`
- Modify: `skills/dedup/SKILL.md`

**Same pattern as Task 2.**

**Verify:** Each file has `<arc_log>` block, no `<progress_append>` block

**Commit:** `refactor: update skills batch 3 to use arc-log reference`

---

## Task 5: Update start skill to read .arc/log.md

The start skill reads progress for context. Update to read new location.

**Files:**
- Modify: `skills/start/SKILL.md`

**Changes:**

1. Replace `docs/progress.md` with `.arc/log.md`
2. Update context text from "progress journal" to "activity log"

**Verify:** No references to `docs/progress.md` in file

**Commit:** `refactor: update start skill to read .arc/log.md`

---

## Task 6: Update suggest skill to read .arc/log.md

The suggest skill reads progress to avoid re-suggesting completed work.

**Files:**
- Modify: `skills/suggest/SKILL.md`

**Changes:**

1. Replace `<progress_context>` with `<arc_log_context>`
2. Change `docs/progress.md` to `.arc/log.md`
3. Update text from "progress journal" to "activity log"

**Verify:** No references to `docs/progress.md` in file

**Commit:** `refactor: update suggest skill to read .arc/log.md`

---

## Task 7: Delete progress skill

Remove the entire progress skill directory.

**Files:**
- Delete: `skills/progress/` (entire directory)

**Verify:** Directory no longer exists

**Commit:** `feat!: remove /arc:progress skill (replaced by .arc/log.md)`

---

## Task 8: Update CLAUDE.md

Remove references to `/arc:progress` from the project docs.

**Files:**
- Modify: `CLAUDE.md`

**Changes:**

1. Remove `│   ├── progress/SKILL.md   # Cross-cutting: session journal` from structure
2. Remove `/arc:progress   → Session journal` from workflow section

**Verify:** No references to `progress` in CLAUDE.md

**Commit:** `docs: remove /arc:progress from CLAUDE.md`

---

## Task 9: Update README.md

Remove references to `/arc:progress` from README.

**Files:**
- Modify: `README.md`

**Changes:**

1. Remove `/arc:progress` line from command list
2. Update the "Note" about progress journal to describe `.arc/log.md` instead
3. Remove `/arc:progress` row from command table

**Verify:** No references to `docs/progress.md` or `/arc:progress` in README.md

**Commit:** `docs: remove /arc:progress from README, document .arc/log.md`

---

## Summary

| Task | Files | Purpose |
|------|-------|---------|
| 1 | 1 create | Shared reference file |
| 2 | 6 modify | Skills batch 1 |
| 3 | 6 modify | Skills batch 2 |
| 4 | 6 modify | Skills batch 3 |
| 5 | 1 modify | Start skill reads log |
| 6 | 1 modify | Suggest skill reads log |
| 7 | 1 delete | Remove progress skill |
| 8 | 1 modify | Update CLAUDE.md |
| 9 | 1 modify | Update README.md |

**Total:** 9 tasks, 18 modifications, 1 creation, 1 deletion
