# Arc Activity Log Design

## Problem Statement

Arc skills claim to maintain a progress journal at `docs/progress.md`, but it never actually gets written. The feature is documented in 19 skill files with `<progress_append>` blocks, but there's no enforcement — Claude simply doesn't do it. Users have no visibility into what Arc has done to their codebase across sessions.

## Approach

Create a simple, automatic activity log at `.arc/log.md` in each project. Every skill appends a brief entry on completion. The log is gitignored (avoids merge conflicts) and requires no manual invocation.

### Format

```markdown
## 2026-01-30 14:32
/arc:build — Added logout button to header
Files: src/components/Header.tsx, src/components/LogoutButton.tsx

---
```

### Behavior

- Every skill auto-appends on completion
- Newest entries first (prepend)
- Creates `.arc/` directory if needed
- Adds `.arc/` to `.gitignore` if not present
- No viewer skill — read the file directly

### Implementation

**Shared reference file:** `references/arc-log.md`
- Defines the append mechanism once
- Skills reference it instead of duplicating logic

**Skill updates:**
- Replace 19 `<progress_append>` blocks with reference to shared file
- Delete `skills/progress/` entirely

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `.arc/log.md` not `docs/progress.md` | Cleaner separation — `.arc/` is Arc's workspace, `docs/` is project docs |
| Gitignored | Multiple users would cause constant merge conflicts |
| No viewer skill | Just read the file — simpler, one less command to remember |
| Shared reference file | DRY — change format once, all skills follow |
| Newest first | Most relevant context is recent activity |

## Open Questions

None — design is complete.
