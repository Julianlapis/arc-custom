# Context Update Template

This block should be included in every Arc skill that performs meaningful work.
Copy it into the skill's SKILL.md file, replacing any existing `<progress_append>` block.

---

```markdown
<context_update>
After completing this skill's main work, update the project context file.

**Skip this step if:**
- The project has no `docs/` directory
- The skill made no meaningful changes (read-only operations)

**Steps:**

1. Read `docs/context.md` if it exists (to carry forward the Decisions section)
2. Write `docs/context.md` with this schema:

   ```markdown
   # Project Context
   > Auto-maintained by Arc. Last updated: YYYY-MM-DD HH:MM TZ

   ## Status
   - **Phase:** [v1-build | v1-polish | v2-planning | shipped | on-hold]
   - **Stack:** [framework, language, key deps]
   - **Branch:** [current branch]
   - **Build:** [passing | failing (brief reason)]

   ## Last Session
   - [What was just done, 2-4 bullet points]
   - [Key files touched]

   ## Decisions
   - [Decision]: [Rationale] (YYYY-MM-DD)
   <!-- Carry forward from existing file. Cap at 10. Drop decisions older than 90 days unless still constraining current work. -->

   ## Blockers
   - [Current blocker or "None"]

   ## Next
   1. [Highest priority]
   2. [Second priority]
   3. [Third priority]

   ## Open Questions
   - [Unresolved question or "None"]
   ```

3. Commit (skip if commit fails for any reason):
   ```bash
   git add docs/context.md && git commit -m "context: update project state" || true
   ```
</context_update>
```
