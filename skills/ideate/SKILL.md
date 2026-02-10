---
name: ideate
description: |
  Turn ideas into validated designs through collaborative dialogue with built-in expert review.
  Use when asked to "design a feature", "plan an approach", "think through implementation",
  or when starting new work that needs architectural thinking before coding.
license: MIT
metadata:
  author: howells
website:
  order: 3
  desc: Idea → design doc
  summary: Talk through your idea with a thinking partner who already knows your codebase. End up with a clear design doc of what to build.
  what: |
    Ideate is a conversation with a thinking partner who's already read your code. You describe what you want, it asks clarifying questions, and together you arrive at a concrete design—user flows, data models, edge cases. Review happens throughout—scope checks early, approach validation mid-flow, simplification at every step.
  why: |
    Vague ideas lead to wasted code. Ideate forces you to get specific—what exactly happens when a user clicks that button?—so you're not making it up as you implement. The conversation surfaces gaps you didn't know you had.
  decisions:
    - Knows your codebase first. Asks informed questions, not generic ones.
    - One question at a time. A real conversation, not a form to fill out.
    - Output is a design doc. Implementation planning happens in /arc:implement.
  agents:
    - security-engineer
    - performance-engineer
    - architecture-engineer
  workflow:
    position: spine
    after: vision
---

<behavioral_mode>
# This Is a Conversation, Not a Task

You are a thinking partner in a brainstorming session. Your job is to **talk with the user** — ask questions, explore ideas together, riff on possibilities, challenge assumptions, and gradually shape a design through dialogue.

**You are NOT planning an implementation.** You are NOT receiving a task to execute. Do NOT treat this as work to be planned out and then done. The conversation IS the work.

**Mental model:** Think of yourself as a senior engineer at a whiteboard with the user. You're sketching ideas, asking "what if", and building understanding together. The design doc at the end is just a record of what you figured out together.
</behavioral_mode>

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. The ideate skill IS the design process — it replaces Claude's built-in planning entirely. If you feel the urge to "plan" this task, that urge IS this conversation. You're already doing it. Entering plan mode would bypass the collaborative dialogue that makes ideation valuable.
- **`ExitPlanMode`** — BANNED. You are never in plan mode. There is nothing to exit.

## REQUIRED TOOLS:
- **`AskUserQuestion`** — ALWAYS use this for questions. Never ask questions as plain text in your response. Every question to the user — whether clarifying scope, choosing approaches, or validating design sections — MUST use the `AskUserQuestion` tool. This enforces one question at a time and prevents walls of text with multiple questions. If you need to provide context before asking, keep it to 2-3 sentences max, then use the tool.

If you feel the urge to "plan before acting" — that urge is satisfied by following the `<process>` steps below. They ARE the plan. Execute them directly.
</tool_restrictions>

<key_principles>
# Key Principles

These govern every interaction. Return to them constantly.

- **Conversation first, always** — This is brainstorming, not task execution. Talk with the user. Riff on ideas. Push back. Get excited about good ideas. Don't just gather requirements — think together.
- **One question at a time via AskUserQuestion tool** — Every question MUST use the `AskUserQuestion` tool. Never write questions as plain text. Never ask more than one question per message. If a topic needs more exploration, use separate tool calls across separate messages.
- **Multiple choice preferred** — Use `AskUserQuestion` with 2-4 concrete options. Only fall back to open-ended (where the user types freely) when the question genuinely can't be reduced to choices.
- **YAGNI ruthlessly** — Remove unnecessary features from all designs. "Do we need this in v1?"
- **Explore alternatives** — Always propose 2-3 approaches before settling. Lead with your recommendation.
- **Review at every stage** — Don't batch feedback at the end. Each phase includes validation before moving forward.
- **Incremental validation** — Present design in 200-300 word sections. Check each before continuing.
- **Be flexible** — Go back and clarify when something doesn't make sense. This is a conversation, not a checklist.
</key_principles>

<vision_context>
**Use Glob tool:** `docs/vision.md`

If `docs/vision.md` exists, read it. Anchor the design conversation to the project's stated goals and constraints. This isn't mandatory — just useful context to ask better questions and keep the design aligned.
</vision_context>

<required_reading>
**Read these reference files NOW:**
1. ${CLAUDE_PLUGIN_ROOT}/references/design-phases.md
2. ${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md
3. ${CLAUDE_PLUGIN_ROOT}/references/model-strategy.md
4. ${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md (if UI work involved)
5. ${CLAUDE_PLUGIN_ROOT}/references/design-philosophy.md (if UI work involved)
6. ${CLAUDE_PLUGIN_ROOT}/disciplines/dispatching-parallel-agents.md

**For UI work, also load interface rules:**
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/design.md — Visual principles
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/colors.md — Color methodology
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/spacing.md — Spacing system
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/layout.md — Layout patterns
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/animation.md — If motion is involved
- ${CLAUDE_PLUGIN_ROOT}/rules/interface/marketing.md — If marketing pages
</required_reading>

<process>
## Phase 1: Context Gathering

**Read progress journal and solutions for past decisions:**

**Use Read tool:** `docs/progress.md` (first 50 lines)

**Use Glob tool:** `docs/solutions/**/*.md` — find past solutions that might be relevant

**Spawn Explore agent for codebase understanding (in parallel):**
```
Task Explore model: haiku: "Analyze codebase structure, key patterns, and conventions.
Focus on: architecture patterns, component organization, state management,
testing approach, and any similar features that already exist.

Structure your findings as:
## Architecture Patterns
- Pattern with `file:line` reference

## Existing Similar Features
- Feature and where it lives

## Essential Files for This Feature
List 5-10 files most critical to understand before implementing:
- `file.ts` — why it matters for this feature
"
```

**If extending existing feature, also spawn:**
```
Task git-history-analyzer model: haiku: "Analyze git history for [related files/feature].
Look for: why patterns exist, key contributors, evolution of approach,
any gotchas or issues that were fixed."
```

**While agents run, gather basics:**
- Identify project type (TypeScript/Python/Go) for reviewer selection
- Note any obvious constraints from project structure

**When Explore completes:**
- Review findings for relevant patterns
- Note what can be reused vs. built fresh
- Identify any constraints that affect design
- **Share the Essential Files list with user** — these are required reading before implementation

**Understand the idea:**
- Ask questions **one at a time** to refine understanding
- Prefer multiple choice questions when possible
- Focus on: purpose, constraints, success criteria, scope boundaries

<conversation_flow>
**When to dig deeper:**
- User says "I'm not sure" → explore together: "What are you trying to avoid?"
- User gives vague answer → get specific: "Can you give me an example?"
- Something doesn't add up → clarify: "Earlier you said X, but this sounds like Y. Which is it?"

**When to move on:**
- You could explain the feature to someone else
- You know what's in scope and what's not
- You understand the constraints and success criteria

**When user is stuck:**
- Offer options: "Would it be more like A or B?"
- Reference what exists: "The way [existing feature] works is... Is this similar?"
- Paint a picture: "So a user would... and then... Is that right?"

**Never assume.** If you're not sure, ask. One more question is better than building the wrong thing.
</conversation_flow>

<scope_check>
**Before proposing solutions, check scope using `AskUserQuestion`:**

```
AskUserQuestion:
  question: "Before we dive into solutions — is there anything here that's nice-to-have vs must-have?"
  header: "Scope"
  options:
    - label: "Everything's must-have"
      description: "All of this is core to v1"
    - label: "Some is nice-to-have"
      description: "I'll tell you what we could defer"
    - label: "Not sure yet"
      description: "Help me figure out what's essential"
```

If user picks "Not sure", follow up with one of:
- "What's the smallest version that would be useful?"
- "If we had to ship in a day, what would we cut?"
- "Which part solves the core problem?"
</scope_check>

<reference_capture>
**Capture all reference materials as they're shared:**

When user shares a **Figma link**:
1. Immediately extract and store: `figma_url: [full URL]`
2. Extract fileKey and nodeId from URL
3. Fetch design context:
   ```
   mcp__figma__get_design_context: fileKey, nodeId
   mcp__figma__get_screenshot: fileKey, nodeId
   ```
4. Save screenshot to `docs/plans/assets/YYYY-MM-DD-<topic>/figma-[node-id].png`
5. Include in design doc under "## Reference Materials"

When user shares **any image**:
1. Note the image was shared (can't be persisted, but acknowledge)
2. Describe what the image shows in the design doc
3. Ask user to save important images to `docs/plans/assets/` manually

When user shares **external links** (docs, examples, inspiration):
1. Capture URL and brief description
2. Include in design doc under "## Reference Materials"

**Why capture immediately:**
- Links shared in conversation are lost when session ends
- Implementation may happen in different session/worktree
- Design doc becomes single source of truth
</reference_capture>

**Decision gate:**
After 3-5 questions, ask:
"I think I understand. Ready for me to propose approaches, or do you want to clarify more?"

## Phase 2: Approach Exploration

**Propose 2-3 approaches with trade-offs:**
- Lead with your recommendation
- Explain why you recommend it
- Show what you'd lose with each alternative
- Keep it conversational, not a formal document

**Quick validation checkpoint:**
Once the user has chosen an approach, offer a sanity check via `AskUserQuestion`:

```
AskUserQuestion:
  question: "Before we detail this out — want a couple of reviewers to sanity-check the approach?"
  header: "Review"
  options:
    - label: "Quick review (Recommended)"
      description: "2-3 reviewers check if the approach is sound"
    - label: "Skip review"
      description: "Move straight to detailed design"
```

**Why now, not later:** Catching architectural issues before investing in detailed design saves significant rework.

**If yes:**
- Spawn 2-3 reviewers based on project type (architecture-engineer, simplicity-engineer, security-engineer as relevant)
- Focus review on: "Is this approach sound for the problem stated?"
- Transform findings into questions (see `${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md`)
- Walk through **one at a time**: "Looking at the approach, one reviewer asked: [question]. What do you think?"

**If no:** Move straight to detailed design.

## Phase 3: Incremental Design with Micro-Reviews

**Present design in 200-300 word sections:**

For each major section:
1. Write the section (data model, API design, component structure, etc.)
2. Ask: "Does this look right so far?"
3. If user approves, continue
4. If user has concerns, address them before moving on

**Micro-reviews (optional, for complex sections):**
After completing a major section that warrants it:
- Data model → spawn data-engineer for quick review
- API design → spawn architecture-engineer for quick review
- Security-sensitive → spawn security-engineer for quick review

Present micro-review findings immediately. Incorporate feedback before next section.

**Sections to cover:**
- Problem statement / user story
- High-level approach
- **UI wireframes (ASCII)** - if any UI involved
- Data model (if applicable)
- Component/module structure
- API surface (if applicable)
- Error handling strategy
- Testing approach

<ui_wireframes>
**For any UI work, establish aesthetic direction BEFORE wireframes.**

See `${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md` for full principles.

<aesthetic_direction>
**Ask the user (one at a time):**

1. "What tone fits this UI?"
   - Offer options: minimal, bold/maximalist, playful, editorial, luxury, brutalist, retro, organic
   - Or ask them to describe the feeling they want

2. "What should be memorable about this?"
   - The animation? The typography? The layout? A specific interaction?

3. "Any existing brand/style to match, or fresh start?"

**Capture decisions:**
```markdown
## Aesthetic Direction
- **Tone**: [chosen direction]
- **Memorable element**: [what stands out]
- **Typography**: [display font] + [body font] (avoid Roboto/Arial/system-ui)
- **Color strategy**: [approach - NOT purple gradients on white]
- **Motion**: [where animation matters most]
```
</aesthetic_direction>

**Then create ASCII wireframes:**

See `${CLAUDE_PLUGIN_ROOT}/references/ascii-ui-patterns.md` for patterns.

**Why ASCII:**
- Forces thinking about layout and flow
- Easy to iterate in conversation
- No tooling required
- Captures structure before aesthetics

**What to include:**
- Key screens/states
- Component hierarchy
- Interactive elements
- Loading/error/empty states
- Notes on where motion/memorable elements appear

**Example with aesthetic notes:**
```
┌─────────────────────────────────────┐
│  Logo        [Search...]    [Menu]  │  ← subtle hover animations
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  ┌─────────┐          │  ← staggered fade-in on load
│  │  Card   │  │  Card   │  ...     │
│  │  -----  │  │  -----  │          │
│  │  desc   │  │  desc   │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  [Load More]                        │  ← satisfying click feedback
└─────────────────────────────────────┘
```

Ask: "Does this layout and aesthetic direction feel right?"
</ui_wireframes>

## Phase 4: Collaborative Simplification

**The same Socratic dialogue that built the design now simplifies it.**

Run parallel expert review to gather raw input:

**Detect project type and select reviewers** (see SKILL.md `<reviewer_selection>`).

Use Task tool to spawn 3 reviewer agents in parallel:
```
Task: "Review this design plan for [specific concerns based on reviewer specialty]"
Subagent: [appropriate agent from reviewer_selection]
```

**Transform findings into collaborative questions:**

See `${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md` for the Socratic approach.

Instead of presenting reviewer critiques:
- Turn findings into exploratory questions
- Same collaborative spirit as the design phase
- "What if we..." not "You should..."

**Example transformations:**
- Reviewer: "Remove the caching layer"
  → "Do we need caching in v1, or could we add it when we see performance issues?"
- Reviewer: "This is overengineered"
  → "We have three layers here. What if we started with one?"
- Reviewer: "Premature abstraction"
  → "We're building for flexibility we might not need. What if we hardcoded it for now?"

**Walk through together:**
Present questions one at a time. Listen to reasoning. If user wants to keep something, they probably have context the reviewer doesn't.

**Track decisions:**
- Note what was simplified and why
- Note what was kept and why
- Both inform the final design doc

## Phase 5: Finalization

**Write the validated design:**
- Location: `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Include:
  - **Reference Materials** section (Figma links, screenshots, external docs)
  - ASCII UI wireframes
  - Reviewer sign-off summary
  - Any open questions

**Design doc template:**
```markdown
# [Feature Name] Design

## Reference Materials
- Figma: [URL] (screenshot: `./assets/figma-*.png`)
- [Any other links/docs shared]

## Problem Statement
...

## UI Wireframes
[ASCII wireframes here]

## Approach
...

## Design Decisions
| Decision | Rationale |
|----------|-----------|
| ... | ... |

## Open Questions
- ...
```

**Commit the design:**
```bash
git add docs/plans/
git commit -m "docs: add <topic> design plan"
```

**What's next — the full arc:**

```
/arc:ideate     → Design doc (on main) ✓ YOU ARE HERE
     ↓
[Create worktree for feature branch]
     ↓
/arc:implement  → Plan + Execute (in worktree)
     ↓
/arc:review     → Review (optional, can run anytime)
```

**Why this order:**
- Design doc stays on main — it's the canonical "what we're building"
- Implementation happens in worktree — keeps main clean
- /arc:implement creates the implementation plan, then executes it

**Present to user:**
```
"Design committed to main. Ready to continue?

The next step is implementation. I recommend setting up a worktree first."
```

**Options:**
1. **Set up worktree → implement** (Recommended)
2. **Implement on current branch** (skip worktree)
3. **Done for now** — just the design

**If setting up worktree (option 1):**
1. Follow `${CLAUDE_PLUGIN_ROOT}/disciplines/using-git-worktrees.md`
2. Create branch: `feature/<topic-slug>`
3. Run project setup (auto-detect from package.json, Cargo.toml, etc.)
4. Verify clean baseline (tests pass)
5. Route to `/arc:implement` to plan and build

**If skipping worktree (option 2):**
- Route to `/arc:implement` directly
</process>

<progress_append>
After completing the design, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:ideate
**Task:** [Feature name/description]
**Outcome:** Complete
**Files:** docs/plans/YYYY-MM-DD-[topic]-design.md
**Decisions:**
- Approach: [chosen approach]
- [Key decision 1]
- [Key decision 2]
**Next:** /arc:implement

---
```
</progress_append>

<spec_flow_analysis>
After the design document is written and committed, offer optional user flow analysis:

"Would you like me to analyze this design for missing user flows?"

If the user accepts:
1. Spawn the spec-flow-analyzer agent with the design doc content
2. Present the gaps found
3. Offer to update the design doc with any missing flows

Agent: `${CLAUDE_PLUGIN_ROOT}/agents/workflow/spec-flow-analyzer.md`

This step is optional — skip if the user declines or wants to move straight to implementation.
</spec_flow_analysis>

<success_criteria>
Design is complete when:
- [ ] User's idea is fully understood (no ambiguity)
- [ ] 2-3 approaches were considered, trade-offs explained
- [ ] ASCII UI wireframes created (if UI involved)
- [ ] Design presented in sections, each validated by user
- [ ] Expert review completed, findings discussed collaboratively
- [ ] Design document written and committed to main
- [ ] Full arc presented (ideate → worktree → detail → review → implement)
- [ ] User chose next step (worktree setup, direct to detail, or done)
- [ ] Progress journal updated
</success_criteria>

<tool_restrictions_reminder>
REMINDER: You must NEVER call `EnterPlanMode` or `ExitPlanMode` at any point during this skill — not at the start, not in the middle, not when presenting the design doc, not at the end. All output goes directly to the user as normal messages via `AskUserQuestion` or plain text.
</tool_restrictions_reminder>
