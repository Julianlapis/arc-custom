# Platform Tool Mapping

Arc skills are written primarily for Claude Code naming, but the workflows should adapt to
the current harness instead of assuming one toolset.

## Claude Code

- `Skill` -> load the named skill
- `Task` -> dispatch a focused subagent
- `AskUserQuestion` -> structured one-question prompt

## Codex

- Native skill discovery loads `SKILL.md` files from `~/.agents/skills/`
- Terminal exploration replaces most `Read` / `Glob` / `Grep` examples
- Use commentary updates for progress instead of Claude-specific question primitives
- Use the built-in plan/todo tools only when a workflow explicitly benefits from them

## General Guidance

- Prefer the platform's native tool when a skill names an equivalent Claude tool
- Keep the workflow behavior the same even if tool names differ
- When a platform lacks a feature, degrade gracefully rather than inventing ceremony
