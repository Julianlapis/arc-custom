# AGENTS.md (Codex Compatibility)

This repository is distributed primarily as a **Claude Code** plugin, but the same `skills/*/SKILL.md` documents are also intended to be executable in **Codex**.

## How To Use In Codex

- If the user types a Claude-style command like `/arc:<skill> ...`, treat it as selecting that skill.
- If the user mentions a skill name (e.g. `audit`, `worktree`, `ideate`) or asks for the behavior described by a skill, open that skill's `SKILL.md` and follow it.
- If the user starts generally ("let's work on something"), default to `skills/start/SKILL.md`.

## Interop Notes (Claude Code -> Codex)

- Treat `${CLAUDE_PLUGIN_ROOT}` as "the repository root" when resolving paths.
- `Task ...` blocks in skills are Claude Code parallel subtasks. In Codex, do the equivalent exploration using terminal commands and repo reads (parallelize where possible).
- `TaskList` is Claude-specific; in Codex, approximate by scanning for existing issues/plans (`docs/plans/`), TODOs, or by asking the user.
- `mcp__claude-in-chrome__*` is Claude-in-Chrome MCP. In Codex, prefer Playwright or ask the user for screenshots/URLs when visual verification is required.

## Available Skills

- audit - Comprehensive codebase audit with specialized reviewers. Generates actionable reports. Use when asked to "audit the codebase", "review code quality", "check for issues", "security review", or "performance audit". Accepts path scope like "apps/web". Reviewers run in batches of 2 by default to avoid resource exhaustion. Use --parallel to run all reviewers simultaneously (resource-intensive). (file: skills/audit/SKILL.md)
- cleanup - Kill orphaned Claude subagent processes that didn't exit cleanly. Use when asked to "clean up agents", "kill orphaned processes", or when subagents accumulate from Task tool usage. (file: skills/cleanup/SKILL.md)
- commit - Smart commit and push with auto-splitting across domains. Creates atomic commits. Use when asked to "commit", "push changes", "save my work", or after completing implementation work. Automatically groups changes into logical commits. (file: skills/commit/SKILL.md)
- dedup - Detect semantic code duplication — functions that do the same thing but have different names or implementations. Use when asked to "find duplicates", "check for duplicate functions", "consolidate utilities", or before major refactoring efforts. (file: skills/dedup/SKILL.md)
- deps - Dependency audit, alternative discovery, and batch upgrades with test verification. Use when asked to "check dependencies", "audit packages", "update dependencies", "find outdated packages", or "check for CVEs". Generates a prioritized report, then optionally walks through batch upgrades with rollback on failure. (file: skills/deps/SKILL.md)
- design - Create distinctive, non-generic UI designs with aesthetic direction and ASCII wireframes. Use when asked to "design the UI", "create a layout", "wireframe this", or when building UI that should be memorable rather than generic. Avoids AI slop patterns. (file: skills/design/SKILL.md)
- detail - Create a detailed implementation plan with exact file paths, test code, and TDD cycles. Use when asked to "create an implementation plan", "break this down into tasks", "detail the steps", or after /arc:ideate to turn a design into executable tasks. (file: skills/detail/SKILL.md)
- document - Generate documentation for your codebase — reference docs for a file, feature guides, or a full documentation site. Use when asked to "document this", "generate docs", "write documentation", "create API reference", or when you need thorough documentation for a module, feature, or entire project. Framework-aware: detects Fumadocs, Nextra, Docusaurus, etc. and generates in the right format. (file: skills/document/SKILL.md)
- figma - Implement UI directly from Figma designs using the Figma MCP with pixel-perfect fidelity. Use when given a Figma URL, asked to "implement from Figma", "match the design", or when building UI that needs to precisely match design specs. (file: skills/figma/SKILL.md)
- ideate - Turn ideas into validated designs through collaborative dialogue. Use when asked to "design a feature", "plan an approach", "think through implementation", or when starting new work that needs architectural thinking before coding. (file: skills/ideate/SKILL.md)
- implement - Execute an implementation plan task-by-task with TDD and continuous quality checks. Use when asked to "implement the plan", "execute the tasks", "start building from the plan", or after /arc:detail has created an implementation plan ready for execution. (file: skills/implement/SKILL.md)
- legal - Generate Privacy Policy, Terms of Service, and Cookie Policy pages. Use when setting up legal pages for a new project, when asked to "create privacy policy", "add terms of service", "generate legal pages", or when /arc:letsgo identifies missing legal documents. (file: skills/legal/SKILL.md)
- letsgo - Production readiness checklist covering domains, SEO, security, and deployment. Use when asked to "ship it", "deploy to production", "go live", "launch", or when preparing a project for production deployment. (file: skills/letsgo/SKILL.md)
- naming - Generate and validate project names. Reads codebase context, produces candidates using tech naming strategies, and checks domain + GitHub availability. Use when naming a new project, renaming, or validating an existing name. (file: skills/naming/SKILL.md)
- responsive - Audit and fix responsive/mobile issues across every page of a project, using Chrome MCP screenshots at two breakpoints (375px mobile, 1440px desktop). Design-aware: reads existing design docs to preserve aesthetic intent, not just "make it fit." Use when asked to "make it responsive", "fix mobile", "responsive audit", or after building a desktop-first UI that needs mobile adaptation. (file: skills/responsive/SKILL.md)
- review - Run expert review on a plan with parallel reviewer agents. Presents findings as Socratic questions. Use when asked to "review the plan", "get feedback on the design", "check this approach", or before implementation to validate architectural decisions. Optional argument: reviewer name (e.g., `/arc:review daniel-product-engineer` to use a specific reviewer) (file: skills/review/SKILL.md)
- rules - Apply Arc's coding rules to the current project. Copies rules to .ruler/ directory. Use when asked to "set up coding rules", "apply standards", "configure rules", or when starting a project that should follow Arc's conventions. (file: skills/rules/SKILL.md)
- seo - Deep SEO audit for web projects. Analyzes codebase for crawlability, indexability, on-page SEO, structured data, social previews, and technical foundations. Optionally runs Lighthouse and PageSpeed against a live URL. Reports findings with severity, offers direct fixes or /arc:detail plans. Use when asked to "audit SEO", "check SEO", "review SEO", or "is my site SEO-ready". (file: skills/seo/SKILL.md)
- start - The main entry point. Understands your codebase and routes to the right workflow. Use when starting a session, saying "let's work on something", or unsure which Arc command to use. Gathers context and asks what you want to do. (file: skills/start/SKILL.md)
- suggest - Opinionated recommendations for what to work on next based on existing tasks and codebase. Use when asked "what should I work on", "what's next", "suggest priorities", or when starting a session and unsure where to begin. (file: skills/suggest/SKILL.md)
- test - Test strategy and execution. Create test plans, run test suites, or fix failing tests. Use when asked to "run tests", "create test strategy", "fix failing tests", "check coverage", or when you need to verify code works. Supports vitest, playwright, jest, and cypress. (file: skills/test/SKILL.md)
- tidy - Clean up completed plans in docs/plans/. Archives or deletes finished plans. Use when asked to "clean up plans", "tidy the docs", "archive old plans", or after completing implementation to remove stale planning documents. (file: skills/tidy/SKILL.md)
- vision - Create or review a high-level vision document capturing project goals and purpose. Use when asked to "define the vision", "what is this project", "set goals", or when starting a new project that needs clarity on purpose and direction. (file: skills/vision/SKILL.md)
- worktree - Create an isolated git worktree for feature development. Use proactively when starting any non-trivial work on main branch, when asked to "create a branch", "set up a worktree", or when implementing features that should be isolated from the main workspace. (file: skills/worktree/SKILL.md)

## Repo Layout

- `skills/`: primary workflows (source of truth)
- `commands/`: Claude Code command stubs (thin wrappers)
- `.claude-plugin/`: Claude Code plugin metadata
