---
name: suggest
description: |
  Opinionated recommendations for what to work on next based on Linear issues and codebase.
  Use when asked "what should I work on", "what's next", "suggest priorities",
  or when starting a session and unsure where to begin.
license: MIT
metadata:
  author: howells
---

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check what was recently worked on to avoid re-suggesting completed work.
</progress_context>

# Suggest Workflow

Analyze Linear issues, codebase, and vision to give opinionated recommendations for what to work on next.

## Priority Cascade

1. **Linear issues** (if MCP available) — Already triaged, most immediate
2. **Codebase issues** — Technical debt, gaps, patterns
3. **Vision gaps** (lowest priority) — Only if 1 & 2 are empty

## Process

### Step 1: Check Linear (if available)

**Check for Linear MCP:**
Look for `mcp__linear__*` tools in available tools.

**If Linear MCP available:**
```
mcp__linear__list_issues: { filter: { state: { type: { in: ["started", "unstarted"] } } }, first: 10 }
```

Prioritize issues marked as high priority or in current cycle.

**If Linear not available:** Skip to Step 2.

### Step 2: Analyze Codebase

**Use Task tool to spawn exploration agent:**
```
Task Explore model: haiku: "Analyze this codebase for:
- Incomplete features (TODOs, FIXMEs)
- Technical debt (outdated patterns, missing tests)
- Quality issues (type escapes, inconsistencies)
- Missing documentation
- Performance concerns

Prioritize by impact."
```

### Step 3: Read Vision (if needed)

Only if Linear is empty/unavailable AND codebase analysis found nothing urgent:

**Use Read tool:** `docs/vision.md`

Compare vision goals to current state. Identify gaps.

### Step 4: Synthesize Recommendations

Present top 3-5 suggestions:

```markdown
## Suggestions

### 1. [Top recommendation]
**Why:** [Brief rationale]
**Source:** [Linear issue / Codebase / Vision]
**Command:** /arc:ideate [topic] or /arc:build [thing]

### 2. [Second recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]

### 3. [Third recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]
```

### Step 5: Offer to Act

"Which of these interests you? Or tell me something else."

If user picks one, invoke the relevant command.

## Suggestion Categories

**From Linear:**
- "High priority: [issue title] — ready to tackle it?"
- "Current cycle has [N] issues — start with [X]?"

**From Codebase:**
- "Found [N] TODOs in [area] — want to address them?"
- "Test coverage is thin in [area]"
- "Outdated pattern in [file] — could modernize"

**From Vision:**
- "Vision mentions [goal] but I don't see it implemented"
- "Vision says [X] is a non-goal but code does [X]"

## What Suggest is NOT

- Not a code review (use /arc:audit or /arc:review)
- Not a test runner (use /arc:testing)
- Not a planner (use /arc:ideate)

It's a compass, not a map.
