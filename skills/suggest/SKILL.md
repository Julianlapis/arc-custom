---
name: suggest
description: |
  Opinionated recommendations for what to work on next based on existing tasks and codebase.
  Use when asked "what should I work on", "what's next", "suggest priorities",
  or when starting a session and unsure where to begin.
license: MIT
metadata:
  author: howells
website:
  order: 17
  desc: Opinionated next steps
  summary: Opinionated recommendations for what to work on next based on existing tasks and codebase. Includes a discovery mode that researches market trends and proposes new features.
  what: |
    Suggest checks your existing tasks, scans your codebase for TODOs and technical debt, and compares against your vision. It synthesizes this into 3-5 ranked recommendations with clear rationale and the command to start each one. When the normal cascade runs dry, it offers to research external trends and propose entirely new feature ideas.
  why: |
    Starting is the hardest part. When you sit down with an hour to code, decision fatigue can burn half of it. Suggest removes the "what should I work on?" loop.
  decisions:
    - "Priority cascade: Tasklist first, codebase issues second, vision gaps third, discovery fourth."
    - Opinionated, not neutral. It picks winners and says why.
    - One click to act. Each suggestion includes the exact command to run.
    - Discovery mode researches externally — market trends, competitors, emerging tech — and proposes new features.
---

<arc_log_context>
**Use Read tool:** `.arc/log.md` (first 50 lines)

Check what was recently worked on to avoid re-suggesting completed work.
</arc_log_context>

# Suggest Workflow

Analyze tasks, codebase, and vision to give opinionated recommendations for what to work on next.

## Priority Cascade

1. **Existing tasks** (highest priority) — Already noted, most immediate
2. **Codebase issues** — Technical debt, gaps, patterns
3. **Vision gaps** — Goals not yet implemented
4. **Discovery** (lowest priority, opt-in) — New feature ideas from external research

## Process

### Step 1: Check Tasks

**Use TaskList tool** to check for existing tasks.

If tasks exist with status `pending`:
→ Recommend those first with brief rationale

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

Only if no tasks exist AND codebase analysis found nothing urgent:

**Use Read tool:** `docs/vision.md`

Compare vision goals to current state. Identify gaps.

### Step 4: Synthesize Recommendations

Present top 3-5 suggestions:

```markdown
## Suggestions

### 1. [Top recommendation]
**Why:** [Brief rationale]
**Command:** /arc:ideate [topic]

### 2. [Second recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]

### 3. [Third recommendation]
**Why:** [Brief rationale]
**Command:** [relevant command]
```

### Step 5: Offer Discovery

**After presenting normal suggestions**, if fewer than 3 strong recommendations emerged from Steps 1-3, or if the suggestions are mostly maintenance (tech debt, TODOs), offer discovery:

"Those are the immediate priorities. Want me to look beyond the codebase — research what's trending in your space and propose new feature ideas?"

**Use AskUserQuestion tool:**
```
Question: "Want me to research new feature opportunities?"
Header: "Discover"
Options:
  1. "Yes, research ideas" — I'll analyze your project, research market trends, and propose new features
  2. "No, these are enough" — Stick with the suggestions above
```

**If the user declines:** End here. The normal suggestions stand.

**If the user accepts:** Proceed to Step 6.

### Step 6: Discovery — Build Project Profile

**Use Task tool to spawn exploration agent:**
```
Task Explore model: haiku: "Build a project profile for feature discovery. Analyze:

1. DOMAIN: What does this project do? (e-commerce, SaaS, blog, API, dev tool, etc.)
2. TECH STACK: Frameworks, databases, APIs, third-party integrations
3. AUDIENCE: Who uses this? Infer from UI copy, auth patterns, data models, documentation
4. BUSINESS MODEL: Does it make money? Look for: payment integrations (Stripe, PayPal), subscription logic, ad placements, affiliate links, pricing pages. If none found, note 'No obvious monetization'
5. CURRENT FEATURES: List the main capabilities — what does this product already do well?
6. ARCHITECTURE NOTES: Monolith vs micro, test coverage level, CI/CD presence, deployment target

Return a structured profile with all six sections."
```

### Step 7: Discovery — External Research

**Use Task tool to spawn the feature-scout agent:**

Read the agent definition from: `${CLAUDE_PLUGIN_ROOT}/agents/research/feature-scout.md`

```
Task feature-scout model: sonnet: "Here is the project profile:
[paste project profile from Step 6]

Research external market trends, competitor features, emerging technologies, and (if the project monetizes) business opportunities. Return 3-5 validated feature ideas ranked by impact."
```

**Note:** The feature-scout agent uses WebSearch internally to find real market signals. Ideas without evidence are discarded.

### Step 8: Present Discovered Features

Present the feature-scout's findings using this format:

```markdown
## Discovered Feature Opportunities

Based on market research for [domain] projects:

### 1. [Feature Name]
**What:** One-sentence description
**Why now:** Market signal or trend that makes this timely
**Effort:** Low / Medium / High
**Business angle:** Revenue impact (if applicable)
**Command:** /arc:ideate [topic]

### 2. [Feature Name]
**What:** One-sentence description
**Why now:** Market signal or trend
**Effort:** Low / Medium / High
**Business angle:** Revenue impact (if applicable)
**Command:** /arc:ideate [topic]

### 3. [Feature Name]
...
```

### Step 9: Offer to Act

"Which of these interests you? I can dive deeper with `/arc:ideate` on any of them."

If user picks one, invoke the relevant command.

## Suggestion Categories

**From Tasks:**
- "You noted [X] — ready to tackle it?"

**From Codebase:**
- "Found [N] TODOs in [area] — want to address them?"
- "Test coverage is thin in [area]"
- "Outdated pattern in [file] — could modernize"

**From Vision:**
- "Vision mentions [goal] but I don't see it implemented"
- "Vision says [X] is a non-goal but code does [X]"

**From Discovery:**
- "Competitors in [space] are adding [feature] — your architecture already supports it"
- "[Emerging tech] could unlock [capability] with [effort level] effort"
- "Revenue opportunity: [strategy] is trending in [domain] and fits your stack"

## What Suggest is NOT

- Not a code review (use /arc:audit or /arc:review)
- Not a test runner (use /arc:test)
- Not a planner (use /arc:ideate)

It's a compass, not a map. Discovery mode just points the compass outward.
