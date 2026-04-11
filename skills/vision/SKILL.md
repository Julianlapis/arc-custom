---
name: vision
description: |
  Create or review a high-level vision document capturing project goals and purpose.
  Use when asked to "define the vision", "what is this project", "set goals",
  or when starting a new project that needs clarity on purpose and direction.
license: MIT
metadata:
  author: howells
website:
  order: 2
  desc: Project north star
  summary: Define what you're building and why. This document guides every future decision—yours and the AI's.
  what: |
    Vision creates a concise document (500-700 words) capturing why the project exists, who it's for, and what you're explicitly NOT building. Arc reads this document in future sessions, so the AI always understands the bigger picture when making implementation decisions.
  why: |
    Projects drift. Features creep. Without a reference point, both you and the AI lose sight of the goal. The vision document is that reference—something you return to when decisions get hard, and something Arc consults to stay aligned with your intent.
  decisions:
    - "Written for two audiences: you and the AI. Clear enough for both to act on."
    - Non-goals section mandatory. What you won't build prevents scope creep.
    - Lives in docs/vision.md. Arc reads it automatically in future sessions.
  workflow:
    position: spine
    after: go
---

Read `~/.claude/feedback/pre-flight.md` before any work.



<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for every question in this skill, including gathering context and validating drafts. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Keep context before the question to 2-3 sentences max, and do not narrate missing tools or fallbacks to the user.
</tool_restrictions>

<arc_runtime>
Arc-owned files live under the Arc install root for full-runtime installs.

Set `${ARC_ROOT}` to that root and use `${ARC_ROOT}/...` for Arc bundle files such as
`references/`, `disciplines/`, `agents/`, `templates/`, `scripts/`, and `rules/`.

Project-local files stay relative to the user's repository.
</arc_runtime>

# Vision Workflow

Create or review a 500-700 word vision document that captures the high-level goals and purpose of the app or codebase.

<progress_context>
**Use Read tool:** `docs/arc/progress.md` (first 50 lines)

Check for recent work that might inform vision decisions.
</progress_context>

## Process

### Step 1: Check for Existing Vision

**Use Read tool:** `docs/vision.md`

**If file exists:** Read it, then ask:
```
AskUserQuestion:
  question: "I found an existing vision document. What would you like to do?"
  header: "Existing Vision"
  options:
    - label: "Review and discuss"
      description: "Walk through the current vision and talk through it"
    - label: "Update"
      description: "Revise the vision based on a new direction"
    - label: "Start fresh"
      description: "Discard the current vision and write a new one"
```

**If not exists:** Proceed to Step 2.

### Step 2: Gather Context

**First: check for a strategy-engine handoff contract.**

**Use Read tool:** `docs/strategy/04-brief-handoff.yaml`

**If the handoff file exists:** The project has a strategic brief from `/strategy:product`.
Read the YAML. Extract: purpose, rallying_cry, audience, goals, success, non_goals, principles.
Also read `docs/strategy/04-brief.md` for richer context (the Problem and Proposition sections
add depth that the YAML summary compresses out).

Skip the Q&A below. Proceed directly to Step 3 with the handoff data as input.
Present a summary to the user:

```
AskUserQuestion:
  question: "I found a strategic brief with handoff contract. Here's what I'll use to generate
  the vision: [summarize purpose, rallying cry, goals, non-goals]. Generate from this, or
  do you want to adjust anything first?"
  header: "Brief Found"
  options:
    - label: "Generate from brief"
      description: "Use the strategic brief handoff data to draft the vision document"
    - label: "Adjust first"
      description: "I want to modify some inputs before you draft"
    - label: "Ignore brief, start fresh"
      description: "Skip the brief and use the Q&A intake instead"
```

**If the handoff file does NOT exist:** Fall back to the 5-question Q&A below.

---

**Q&A Intake (fallback when no handoff contract exists):**

Ask one question at a time. Wait for the user's response before asking the next question.

**Question 1:**
```
AskUserQuestion:
  question: "What is this project? (one sentence)"
  header: "Project Identity"
  options:
    - label: "I'll describe it"
      description: "Type a one-sentence description of what you're building"
```

**Question 2:**
```
AskUserQuestion:
  question: "Who is it for?"
  header: "Target Audience"
  options:
    - label: "I'll describe them"
      description: "Type who the target users or audience are"
```

**Question 3:**
```
AskUserQuestion:
  question: "What problem does it solve?"
  header: "Core Problem"
  options:
    - label: "I'll explain"
      description: "Type the problem this project addresses"
```

**Question 4:**
```
AskUserQuestion:
  question: "What does success look like?"
  header: "Success Criteria"
  options:
    - label: "I'll define it"
      description: "Type what success means for this project"
```

**Question 5:**
```
AskUserQuestion:
  question: "Any constraints or non-goals?"
  header: "Constraints"
  options:
    - label: "Yes, I have some"
      description: "Type constraints or things you're explicitly not building"
    - label: "None right now"
      description: "Skip this and move on to drafting"
```

### Step 3: Draft Vision

Write a 500-700 word vision document. If the handoff contract was used, the vision
should translate strategic language into builder language. The audience for this
document is the AI in future sessions and developers working in the repo.

```markdown
# Vision

## Rallying Cry
[If from handoff: carry the rallying cry verbatim from the brief.
If from Q&A: distill the project description into 2-5 words that name the core bet.]

## Purpose
[One paragraph: What is this and why does it exist?
If from handoff: translate the brief's Proposition into builder language.
"We're building X because Y" not "The market opportunity is Z."]

## Goals
[3-5 bullet points: What are we trying to achieve?
If from handoff: carry goals from the YAML contract.]

## Target Users
[Who is this for? What do they need?
If from handoff: carry audience from the YAML, add behavioral detail from the brief.]

## Success Criteria
[How do we know if we've succeeded?
If from handoff: carry success from the YAML contract. Keep the numbers.]

## Non-Goals
[What are we explicitly NOT trying to do?
If from handoff: carry non_goals from the YAML. Frame as builder constraints:
"No native mobile app" not "Mobile is out of scope for this engagement."]

## Principles
[2-3 guiding principles for decisions.
If from handoff: carry principles from the YAML.
If from Q&A: derive from the constraints and non-goals.]
```

**Source tracking:** At the bottom of the vision document, add:
```markdown
---
*Source: strategy-engine brief (docs/strategy/04-brief.md) | Generated: [date]*
```
Or if from Q&A:
```markdown
---
*Source: direct input | Generated: [date]*
```

This lets future sessions know whether to check the brief for richer context.

### Step 4: Validate

Present the draft in sections. After each section, ask:
```
AskUserQuestion:
  question: "Does this capture it?"
  header: "Section Review"
  options:
    - label: "Yes, looks good"
      description: "Move on to the next section"
    - label: "Needs changes"
      description: "I'll tell you what to adjust"
    - label: "Start this section over"
      description: "Rewrite this section from scratch"
```

### Step 5: Save

```bash
mkdir -p docs
# Write to docs/vision.md
git add docs/vision.md
git commit -m "docs: add project vision"
```

<arc_log>
**After completing this skill, append to the activity log.**
See: `${ARC_ROOT}/references/arc-log.md`

Entry: `/arc:vision — [Created / Updated] vision document`
</arc_log>

## Interop

- **/strategy:product** (vision mode) produces the brief that feeds this skill via `04-brief-handoff.yaml`
- **/arc:ideate** reads vision for context
- **/arc:suggest** references vision as lowest-priority source
- **/arc:letsgo** checks vision alignment

## Pipeline Position

In the full pipeline (strategy-engine → arc), this skill is the bridge:

```
strategy-engine:product (brief) → 04-brief-handoff.yaml → arc:vision → docs/vision.md
```

The brief is the human-facing strategy document. The vision is the agent-facing north star.
They contain overlapping information, but the vision is written for builders and machines,
not stakeholders. When the brief updates, re-run this skill to keep vision.md in sync.
