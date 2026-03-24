---
name: using-arc
description: Use when starting any conversation - establishes Arc's skill routing, instruction priority, and bootstrap rules
---

<SUBAGENT-STOP>
If you were dispatched as a subagent to execute a specific task, skip this skill.
</SUBAGENT-STOP>

<required_reading>
Read before doing ANY work:
1. `feedback-log.md` — Binding corrections from Julian. These override everything except direct conversation input.
2. `rules/observation.md` — Scoring dimensions and drift prevention rules.
</required_reading>

# Using Arc

Arc has a broad workflow surface. Use this skill as the small control plane that decides
how to route work without loading every workflow into context at once.

## Instruction Priority

When instructions conflict, use this order:

1. User instructions in the conversation
2. Project instructions (`AGENTS.md`, `CLAUDE.md`, repo docs)
3. Arc skills
4. Default system behavior

The user stays in control. Arc provides process, not authority over explicit user intent.

## The Rule

Before substantial work, decide whether an Arc skill clearly applies.

- If the user names an Arc skill, use it.
- If the task clearly matches an Arc workflow, use that skill before acting.
- If the task is small, direct, or outside Arc's workflows, respond normally.

Arc should improve routing, not create ceremony for every trivial request.

## Platform Adaptation

<required_reading>
Arc skills may mention Claude Code tool names. For platform mappings and equivalents, read:

`references/platform-tools.md`
</required_reading>

For UI work, keep these roles separate:

- WireText -> low-fidelity wireframes and layout exploration
- Chrome MCP -> preferred rendered-page verification in Claude Code
- `agent-browser` -> preferred browser automation fallback outside Claude Code
- Playwright -> scripted browser fallback when needed
- Figma MCP -> implementation from real design files

## Progressive Disclosure

Do not preload large Arc workflows.

- Start with the smallest relevant skill
- Load reference files only when the active task actually needs them
- Prefer targeted rules and references over broad up-front reading

## Lead Agent Integration

The lead agent (`~/Projects/lead-agent/lead.py`) is the orchestration layer that keeps Arc workflows aligned with the project vision. It runs automatically via hooks but should also be consulted directly.

### Automatic (Hook-Based)
A `UserPromptSubmit` hook runs `lead.py check` on every prompt. When it detects an `/arc:` command, it:
- Reads the project vision (`docs/vision.md`)
- Injects it as context so the skill has the north star loaded
- Warns if a drift check is due (every 3 tasks)
- Warns if no vision exists

This happens transparently. You don't need to invoke it.

### When to Consult Lead Agent Directly
Before starting substantial multi-step work, run:
```bash
~/Projects/lead-agent/.venv/bin/python ~/Projects/lead-agent/lead.py advise [project-dir]
```

Do this when:
- Starting a session on a complex project (it reads vision, plans, progress, and advises next steps)
- Unsure which Arc skill to use (it knows the full surface and will recommend)
- After 3+ tasks without checking alignment (it compares implementation against vision)
- When the user asks "what should I do next" and a vision doc exists

### Drift Prevention
The lead agent exists because of a real failure: Sightline v1/v2 rebuilt Chrome's MCP infrastructure instead of wrapping it. The vision doc's "DO NOT BUILD" section was ignored because no one checked.

Rules:
- **Every project with a vision doc gets automatic drift checks** via the hook
- **Every 3 tasks, explicitly compare current state against docs/vision.md** — the hook will warn, but the skill should also self-check
- **If drift is detected, STOP.** Tell the user what drifted and why before continuing.
- **If no vision exists and the work is substantial, suggest `/arc:vision` first.**

## Workflow Routing

Use these defaults:

- New feature or product thinking -> `ideate`
- Plan execution -> `implement`
- Small scoped change -> `build`
- Architecture or quality review -> `review` or `audit`
- Testing work -> `testing`
- Production readiness -> `letsgo`
- Unsure what to do -> `go` or `suggest`

## Artifact Locations

Arc-owned artifacts live under:

- `docs/arc/specs/`
- `docs/arc/plans/`
- `docs/arc/archive/`
- `docs/arc/progress.md`

If a workflow references legacy `docs/plans/` or `docs/progress.md`, treat those as
compatibility fallbacks while the repo migrates.

## Observation Logging (Mandatory)

After every skill run, append an entry to `logs/execution-log.md` following the format in `rules/observation.md`. Score on 5 dimensions: Vision Alignment, Craft Quality, Process Adherence, User Satisfaction, Knowledge Capture.

- Log AFTER internal quality checks, BEFORE presenting to Julian
- Update "User Feedback" section AFTER Julian responds
- Every 3rd run: scan recent entries for recurring weak dimensions. If any dimension scored below 7 three or more times in the last 10 runs, flag it as a systemic issue.
- Keep the 20 most recent entries. Archive older entries to `logs/archive/YYYY-MM.md`.
