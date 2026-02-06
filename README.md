<p align="center">
  <img alt="Arc" src="./assets/logo-light.svg#gh-light-mode-only" width="48" height="48">
  <img alt="Arc" src="./assets/logo-dark.svg#gh-dark-mode-only" width="48" height="48">
</p>

<h1 align="center">Arc</h1>

<br>

The full arc from idea to shipped code.

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code): install as a plugin and run `/arc:*` commands in Claude.
- Codex: this repo includes `.agents/skills` so the same `skills/*/SKILL.md` workflows can run directly in Codex (no Claude plugin install required).

## What It Does

Arc provides 24 skills covering the complete development lifecycle:

```
ENTRY   /arc:start    - Main entry point, routes to right workflow
          ↓
WHY     /arc:vision     - High-level goals (500-700 words)
          ↓
WHAT    /arc:ideate     - From idea to working implementation
          ↓
HOW     /arc:detail     - Detailed implementation plan
          ↓
DO      /arc:implement  - Execute the plan with TDD
        /arc:design     - UI/UX design with wireframes
        /arc:test       - Test strategy and execution
        /arc:letsgo     - Production readiness checklist
        /arc:legal      - Generate privacy policy and terms

CROSS-CUTTING
        /arc:review     - Review a plan for feasibility
        /arc:audit      - Comprehensive codebase audit (includes deslop)
        /arc:document   - Feature documentation
        /arc:suggest    - Opinionated next-step recommendations (+ discovery mode)
        /arc:naming     - Generate and validate project names
        /arc:dedup      - Detect semantic code duplication
        /arc:deps       - Dependency management and updates
        /arc:responsive  - Mobile responsive audit & fix
        /arc:seo        - Deep SEO audit for web projects
        /arc:tidy       - Clean up completed plans
        /arc:cleanup    - Kill orphaned subagent processes

TOOLS   /arc:worktree   - Create isolated git worktree for feature work
        /arc:commit     - Smart commit + push with auto-splitting
        /arc:rules      - Apply coding standards to project
```

## Key Principles

- **Review is woven throughout, not bolted on at the end** — Each design section gets micro-reviewed before moving on
- **Reviewers advise, the user decides** — Suggestions are presented as questions, not mandates
- **One question at a time** — Never overwhelm with multiple questions
- **YAGNI where appropriate** — Simplifications suggested, but user has final say
- **TDD mandatory** — Tests first, implementation second
- **Frontend-design integrated** — Bold aesthetic direction, not generic AI slop

## Install

### Claude Code

```
claude plugins install arc@howells-arc
```

### Codex

Codex discovers skills from `~/.agents/skills` (and from `.agents/skills` inside repositories).

**Recommended (install once, use anywhere):**

Tell Codex:

```
Fetch and follow instructions from https://raw.githubusercontent.com/howells/arc/refs/heads/main/.codex/INSTALL.md
```

## Using In Codex

### Install Once (Recommended)

Follow `.codex/INSTALL.md`, then in any project you can invoke Arc skills directly.

### Repo-Local (Project Skills)

If you open this repo itself in Codex, it includes `.agents/skills/*` symlinks so Codex can discover the skills without a global install.

### Invoking Skills

Invoke skills explicitly (recommended):
- In CLI/IDE: run `/skills` or type `$` to pick a skill
- In the Codex app: type `$<skill-name>` in chat

```
$start
$ideate add user authentication with magic links
```

Codex loads the selected skill’s `SKILL.md` and follows its workflow.

### Codex Notes

- These skills are stored in `skills/<name>/SKILL.md` for Claude Code; `.agents/skills/<name>` is a symlink to the same folder so Codex can discover them.
- Some skills reference Claude-specific tooling (e.g. `TaskList`, `mcp__claude-in-chrome__*`). In Codex, use the closest equivalent:
  - terminal exploration instead of `Task` blocks
  - Playwright (or user-provided screenshots) instead of Claude-in-Chrome MCP

## Claude Code Dependencies (Optional)

Arc uses these plugins for enhanced functionality:

| Plugin | Used by |
|--------|---------|
| **Figma** | `/arc:ideate`, `/arc:detail`, `/arc:figma` |
| **Context7** | `/arc:implement` |
| **Chrome** | `figma-implement` agent |

```
# Official plugins
/plugin install figma@claude-plugins-official
/plugin install context7@claude-plugins-official

# Chrome extension: https://chromewebstore.google.com/detail/claude-in-chrome/
```

Arc works without these, but relevant features will be limited.

**Note:** Arc maintains an activity log (`.arc/log.md`, gitignored) for knowledge persistence across sessions. Every skill auto-appends a brief entry on completion.

### Optional: Vercel Labs Plugins

These plugins provide additional review capabilities:

| Plugin | Skill | Used by |
|--------|-------|---------|
| **[agent-skills](https://github.com/vercel-labs/agent-skills)** | `vercel-react-best-practices` | `/arc:implement`, `/arc:letsgo` |
| | `vercel-composition-patterns` | `/arc:implement`, `/arc:design` |
| | `vercel-react-native-skills` | `/arc:implement`, `/arc:letsgo`, `/arc:responsive` |
| **[web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)** | `web-design-guidelines` | `/arc:design`, `/arc:implement`, `/arc:responsive` |

```
# Vercel Labs plugins (optional)
/plugin marketplace add vercel-labs/agent-skills
/plugin install agent-skills@vercel-labs-agent-skills

/plugin marketplace add vercel-labs/web-interface-guidelines
/plugin install web-interface-guidelines@vercel-labs-web-interface-guidelines
```

When installed, Arc commands will automatically use these skills for React/Next.js performance reviews and UI compliance checks.

## Getting Started

### Claude Code

### 1. Open your project

```bash
cd your-project
claude
```

This starts an interactive Claude Code session in your terminal.

### 2. Run a command

Commands start with `/`. Type the command and press Enter:

```
/arc:ideate add user authentication with magic links
```

Claude will ask clarifying questions, explore your codebase, and create a design document.

### 3. Follow the flow

Arc commands chain together. After `/arc:ideate` creates a design:
- Claude asks if you want to continue to `/arc:detail` (implementation plan)
- Then to `/arc:implement` (write the code with TDD)

You can also jump in at any point if you already have docs.

### Codex

1. Open your project in Codex.
2. Ensure `.agents/skills` is present (see ["Using In Codex"](#using-in-codex)).
3. Run skills in chat, e.g. `$start` or `$ideate ...`.

### Quick Examples

```bash
# Design a new feature (full flow)
/arc:ideate add a notification system

# Get suggestions for what to work on
/arc:suggest

# Ship to production
/arc:letsgo
```

### Tips for Newcomers

- **One question at a time** — Arc asks focused questions, not overwhelming lists
- **You're in control** — Suggestions are questions, not mandates. Say no if you disagree.
- **TDD by default** — Implementation writes tests first, then code
- **Documents are created** — Plans go in `docs/plans/`, features in `docs/features/`

## Primary Flow

The main entry point is `/arc:ideate`, which can flow all the way through:

```
/arc:ideate → /arc:detail → /arc:implement
```

Each step asks if you want to continue. You can also enter at any point:
- Have a design doc already? Start at `/arc:detail`
- Have an implementation plan? Start at `/arc:implement`

## Commands

| Command | When to use | Output |
|---------|-------------|--------|
| `/arc:start` | Main entry point, routes to workflow | Context-aware guidance |
| `/arc:vision` | Starting a new project | `docs/vision.md` |
| `/arc:ideate` | From idea to working implementation | `docs/plans/YYYY-MM-DD-<feature>.md` |
| `/arc:detail` | Create implementation plan | `docs/plans/YYYY-MM-DD-<feature>-impl.md` |
| `/arc:implement` | Execute a plan | Code changes |
| `/arc:design` | UI/UX work | Wireframes + code |
| `/arc:figma` | Implement from Figma | Code matching design |
| `/arc:test` | Test strategy | Test files |
| `/arc:letsgo` | Ship to production | Deployment |
| `/arc:legal` | Generate legal pages | Privacy policy, ToS, cookies |
| `/arc:review` | Review a plan for feasibility | Updated plan file |
| `/arc:audit` | Comprehensive codebase audit | `docs/audits/YYYY-MM-DD-*.md` |
| `/arc:document` | Document features | `docs/features/<feature>.md` |
| `/arc:suggest` | What to work on next (+ discovery mode) | Recommendations |
| `/arc:naming` | Generate project names | Name candidates |
| `/arc:worktree` | Create isolated worktree | Feature branch + workspace |
| `/arc:commit` | Commit and push changes | Git commits |
| `/arc:rules` | Apply coding standards | `.ruler/` directory |
| `/arc:tidy` | Clean up completed plans | Archived/deleted plans |
| `/arc:dedup` | Detect semantic code duplication | Duplicate report |
| `/arc:deps` | Dependency management | Updated dependencies |
| `/arc:responsive` | Mobile responsive audit & fix | Responsive code changes |
| `/arc:seo` | Deep SEO audit for web projects | `docs/audits/YYYY-MM-DD-seo.md` |
| `/arc:cleanup` | Kill orphaned subagent processes | Clean process state |

## Agents

Arc includes 22 specialized agents:

| Category | Agents |
|----------|--------|
| **Research** | docs-researcher, git-history-analyzer, duplicate-detector, naming, feature-scout |
| **Review** | architecture-engineer, simplicity-engineer, daniel-product-engineer, data-engineer, designer, lee-nextjs-engineer, llm-engineer, performance-engineer, security-engineer, senior-engineer, seo-engineer, accessibility-engineer, organization-engineer, test-quality-engineer |
| **Design** | figma-implement |
| **Workflow** | spec-flow-analyzer, e2e-test-runner |

## Disciplines

Implementation methodologies in `disciplines/`:

- **test-driven-development** — Red-green-refactor cycle
- **systematic-debugging** — Methodical bug investigation
- **verification-before-completion** — Prove it works before claiming done
- **using-git-worktrees** — Isolated development branches
- **finishing-a-development-branch** — Cleanup after work complete
- **subagent-driven-development** — Parallel agent execution
- **dispatching-parallel-agents** — Efficient multi-agent coordination
- **receiving-code-review** — Handling review feedback

## Interop

Commands work together:

- `/arc:suggest` reads existing tasks (TaskList in Claude Code), codebase, `/arc:vision`, and external market trends (priority cascade with opt-in discovery mode)
- `/arc:ideate` can flow to `/arc:detail` → `/arc:implement`
- `/arc:ideate` naturally handles small scope quickly, larger scope with more depth
- `/arc:letsgo` runs `/arc:test` and `/arc:audit --deslop` as part of quality checks
- Claude Code can create tasks via TaskCreate; in Codex, track tasks in issues/docs instead.

## Acknowledgments

Arc builds on patterns and disciplines from:

- [superpowers](https://github.com/chadgauth/superpowers) — Implementation disciplines (TDD, debugging, verification)
- [compound-engineering](https://github.com/minuva/compound-engineering) — Agent patterns and workflows

## License

MIT
