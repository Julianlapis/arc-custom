---
name: tidy
disable-model-invocation: true
description: |
  Clean up completed plans in docs/arc/plans/. Archives or deletes finished plans.
  Use when asked to "clean up plans", "tidy the docs", "archive old plans",
  or after completing implementation to remove stale planning documents.
license: MIT
metadata:
  author: howells
website:
  order: 19
  desc: Plan cleanup
  summary: Clean up completed plans in docs/arc/plans/. Archives or deletes finished plans.
  what: |
    Tidy analyzes your docs/arc/plans/ folder, checks which plans have been implemented (by looking for the files they describe), and offers to archive or delete completed ones. One plan at a time, always with confirmation.
  why: |
    Planning documents accumulate. After implementation, they become clutter that obscures current work. Tidy keeps your plans folder relevant by archiving what's done.
  decisions:
    - One at a time presentation. Never bulk-deletes without review.
    - Evidence-based status detection. Checks if planned files exist and have commits.
    - Archive over delete. Completed plans move to docs/arc/archive/ by default.
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS:
- **`AskUserQuestion`** — ALWAYS use this for questions. Never ask questions as plain text. Every question — plan disposition, commit confirmation — MUST use `AskUserQuestion`. Keep context before the question to 2-3 sentences max.
</tool_restrictions>

# Tidy Workflow

Clean up the docs/arc/plans/ folder by analyzing which plans have been implemented. Archive what's done, keep what matters.

## Modes

1. **Full mode** (default): Review all plans
2. **Quick mode** (`--quick`): Only show implemented plans ready to archive

## Process

### Step 1: Discover Plans

**Use Glob tool:** `docs/arc/plans/*.md`
Fallback: `docs/plans/*.md`

**Handle empty states:**
- No `docs/arc/plans/`: "No plans folder found. Nothing to tidy!"
- Empty folder: "Your plans folder is already spotless!"

**Preview:**
```
Let me tidy up your plans folder...

Found [N] plans in docs/arc/plans/
```

### Step 2: Analyze Each Plan

For each plan file:

**1. Parse metadata from filename:**
- Date: `YYYY-MM-DD` prefix
- Topic: middle slug
- Type: `-design.md` or `-implementation.md` suffix

**2. Extract signals from plan content:**
- File paths in "Create:", "File:", "Modify:" sections
- Function/component/type names mentioned
- Test file paths

**3. Check implementation status:**

**Use Glob tool:** Check if planned files exist (use paths from plan)

**Use Bash for git history:**
```bash
git log --after="YYYY-MM-DD" --oneline -- [file-paths]
```

**Use Grep tool:** Pattern `identifier` in `[file-paths]` — check for key identifiers

**4. Determine status:**

| Condition | Status |
|-----------|--------|
| 70%+ signals positive | Implemented |
| 30-70% signals positive | Partial |
| 0 signals positive | Outstanding |
| Cannot parse/analyze | Unknown |

### Step 3: Present to User (One at a Time)

Present the plan summary as context, then ask:

```markdown
## Plan: [Topic] ([YYYY-MM-DD])

[1-3 sentence summary from plan]

**Status:** [status]

**Evidence:**
- [file] exists (planned to create)
- [file] modified after plan date
- [N] commits after plan date
- OR: No activity found on planned files
```

```
AskUserQuestion:
  question: "What should I do with this plan?"
  header: "[Topic]"
  options:
    - label: "Archive"
      description: "Move to docs/arc/archive/"
    - label: "Delete"
      description: "Remove the file and associated assets"
    - label: "Keep"
      description: "Leave in place"
    - label: "Skip"
      description: "Decide later"
```

Wait for user response before proceeding to next plan.

### Step 4: Execute Actions

**Archive:**
```bash
mkdir -p docs/arc/archive/
mv docs/arc/plans/[plan].md docs/arc/archive/
# Move associated assets if they exist
mv docs/arc/specs/assets/[topic]/ docs/arc/archive/assets/ 2>/dev/null
```

**Delete:**
```bash
rm docs/arc/plans/[plan].md
rm -rf docs/arc/specs/assets/[topic]/ 2>/dev/null
```

**Keep/Skip:** No action, continue to next plan.

### Step 5: Summary

After all plans processed:

```markdown
## Tidy Complete!

| Action | Count |
|--------|-------|
| Archived | X |
| Deleted | Y |
| Kept | Z |
| Skipped | W |

Your plans folder is now tidy!
```

**Offer to commit:**
```
AskUserQuestion:
  question: "Want me to commit these changes?"
  header: "Commit"
  options:
    - label: "Yes, commit"
      description: "Stage and commit the tidy changes"
    - label: "No, not yet"
      description: "Leave changes uncommitted"
```

If yes:
```bash
git add docs/arc/plans/ docs/arc/archive/
git commit -m "docs: tidy up completed plans"
```

## Edge Cases

**Paired design + implementation:**
- If both exist for same topic, analyze implementation plan
- Offer to archive/delete both together

**Plans with assets:**
- Check `docs/arc/specs/assets/YYYY-MM-DD-topic/`
- Include in archive/delete actions

**Very old plans (>60 days, no activity):**
- Add note: "This plan is [N] days old with no activity"

**Unparseable plans:**
- Show filename and first few lines
- Let user decide: Keep or Delete

## Personality

Friendly, unobtrusive:
- "Let me tidy up around here..."
- "This one looks done. Ready to archive it?"
- "Your plans folder is now spotless!"

NOT: overly cute, emoji-heavy, or verbose.

## What Tidy Does NOT Do

- Modify plan contents
- Create new plans
- Touch anything outside `docs/arc/plans/`
- Make decisions without asking
- Auto-delete without confirmation

## Interop

- **/arc:ideate** creates design plans
- **/arc:implement** creates implementation plans
- **/arc:implement** executes plans
- **/arc:tidy** cleans up after implementation
