# Arc Plugin

The full arc from idea to shipped code. This plugin provides 25 skills for the complete development lifecycle.

## Structure

```
arc/
├── .claude-plugin/
│   └── plugin.json         # Plugin metadata
├── skills/                  # Each skill = one /arc:* command
│   ├── start/SKILL.md      # 1. Entry point
│   ├── vision/SKILL.md     # 2. Foundation: project goals
│   ├── ideate/SKILL.md     # 3. Design: idea → validated design
│   ├── detail/SKILL.md     # 4. Plan: design → implementation plan
│   ├── review/SKILL.md     # 5. Review: validate before execution
│   ├── implement/SKILL.md  # 6. Execute: TDD implementation
│   ├── design/SKILL.md     # 6. Execute: distinctive UI
│   ├── figma/SKILL.md      # 6. Execute: from Figma designs
│   ├── test/SKILL.md       # 7. Test: strategy & execution
│   ├── letsgo/SKILL.md     # 8. Ship: production readiness
│   ├── legal/SKILL.md      # 8. Ship: privacy policy, ToS
│   ├── naming/SKILL.md     # Cross-cutting: project naming
│   ├── worktree/SKILL.md   # Cross-cutting: isolated workspaces
│   ├── seo/SKILL.md        # Cross-cutting: SEO audit
│   ├── audit/SKILL.md      # Cross-cutting: codebase audit
│   ├── commit/SKILL.md     # Cross-cutting: smart commits
│   ├── suggest/SKILL.md    # Cross-cutting: what to work on
│   ├── document/SKILL.md   # Cross-cutting: capture solutions
│   ├── tidy/SKILL.md       # Cross-cutting: cleanup plans
│   ├── responsive/SKILL.md  # Cross-cutting: mobile responsive audit
│   ├── rules/SKILL.md      # Cross-cutting: coding standards
│   └── deps/SKILL.md       # Cross-cutting: dependency audit
├── agents/                  # Specialized reviewers
│   ├── review/
│   ├── research/
│   ├── design/
│   └── workflow/
├── disciplines/             # Implementation methodologies
├── references/              # Domain knowledge
├── templates/               # Output templates
├── CLAUDE.md                # This file
├── README.md                # Documentation
└── LICENSE                  # MIT
```

## Command Workflow

All commands use the `/arc:` namespace prefix. The typical workflow:

```
1. ENTRY      /arc:start      → Routes to right workflow based on context
2. FOUNDATION /arc:vision     → Define project goals (one-time setup)
3. DESIGN     /arc:ideate     → Turn idea into validated design doc
4. PLAN       /arc:detail     → Create step-by-step implementation plan
5. REVIEW     /arc:review     → Expert validation before execution
6. EXECUTE    /arc:implement  → TDD implementation of plan
              /arc:design     → Create distinctive UI
              /arc:figma      → Implement from Figma designs
7. TEST       /arc:test       → Test strategy and execution
8. SHIP       /arc:letsgo     → Production readiness checklist
              /arc:legal      → Privacy policy, Terms of Service

CROSS-CUTTING (available anytime):
              /arc:naming     → Generate and validate project names
              /arc:worktree   → Create isolated git worktree
              /arc:responsive  → Mobile responsive audit & fix
              /arc:seo        → Deep SEO audit
              /arc:audit      → Comprehensive codebase audit
              /arc:commit     → Smart commits with auto-splitting
              /arc:suggest    → What to work on next (+ discovery mode)
              /arc:document   → Capture solved problems
              /arc:tidy       → Clean up completed plans
              /arc:rules      → Apply coding standards
              /arc:deps       → Dependency audit with batch upgrades
```

## Development

To test changes locally:
1. Edit the skill in `skills/<command>/SKILL.md`
2. Run the corresponding command (e.g., `/arc:ideate`)
3. Iterate based on results

## Key Principles

- **Reviewers advise, user decides** — Suggestions are questions, not mandates
- **One question at a time** — Never overwhelm
- **TDD mandatory** — Tests first, implementation second
- **Continuous quality** — TS/lint after every task
- **Knowledge compounds** — Solved problems documented for future sessions

## Complementary Plugins

Arc focuses on the development lifecycle. For specialized domains, consider these Vercel Labs plugins:

- **[agent-skills](https://github.com/vercel-labs/agent-skills)** — `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-native-skills`
- **[web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)** — `web-design-guidelines` skill for UI compliance review

**When installed, Arc commands will suggest these skills:**
| Arc Command | Complementary Skill | Use Case |
|-------------|-------------------|----------|
| `/arc:design` | `web-design-guidelines`, `vercel-composition-patterns` | UI compliance, component architecture |
| `/arc:implement` | All agent-skills + `web-design-guidelines` | Quality checkpoints |
| `/arc:letsgo` | `vercel-react-best-practices`, `vercel-react-native-skills`, `vercel:deploy` | Production readiness |
| `/arc:responsive` | `web-design-guidelines`, `vercel-react-native-skills` | Mobile audit |

## Publishing

1. Bump version in `.claude-plugin/plugin.json`
2. Commit and push to GitHub
3. Users update via `claude plugins update`
