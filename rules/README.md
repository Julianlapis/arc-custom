# Complete Ruleset

These rules are designed for [Ruler](https://github.com/intellectronica/ruler) — a tool that distributes a single `.ruler/` directory of markdown instructions to every AI coding agent (Claude Code, Cursor, Copilot, Aider, etc.) in the right format. Write rules once, `ruler apply`, and all agents follow the same standards.

## Quick Setup

```bash
# Copy rules to your project's .ruler/ directory
cp -r /path/to/arc/rules/* /your-project/.ruler/

# Apply to all configured agents
npx ruler apply
```

## Rule Index

All rule docs use RFC 2119 terms (MUST/SHOULD/NEVER). Files are lowercase/kebab-case.

### Core Rules
| File | Purpose |
|------|---------|
| [stack.md](stack.md) | **Preferred technologies and rejected alternatives** |
| [versions.md](versions.md) | **Mandatory version requirements** |
| [code-style.md](code-style.md) | Formatting, syntax, naming |
| [typescript.md](typescript.md) | Type definitions and safety |
| [react.md](react.md) | Component patterns and hooks |
| [nextjs.md](nextjs.md) | App Router, assets, structure |
| [tailwind.md](tailwind.md) | Tailwind v4 configuration |

### Workflow Rules
| File | Purpose |
|------|---------|
| [testing.md](testing.md) | Unit, integration, E2E tests |
| [git.md](git.md) | Commits, PRs, workflow |
| [env.md](env.md) | Environment variable handling |
| [security.md](security.md) | Auth, input validation, headers, CSRF |
| [auth.md](auth.md) | Clerk, WorkOS, provider-agnostic auth |
| [error-handling.md](error-handling.md) | Error boundaries, logging, error pages |
| [database.md](database.md) | Schema design, migrations, queries |
| [turborepo.md](turborepo.md) | Monorepo package patterns |
| [integrations.md](integrations.md) | External service adapters |
| [api.md](api.md) | API design, tRPC, error formats |
| [cloudflare-workers.md](cloudflare-workers.md) | Workers runtime, KV, R2, wrangler |
| [cli.md](cli.md) | CLI patterns, dual-mode, agent friendliness |
| [plan-mode.md](plan-mode.md) | Constraints for Claude's plan mode |

### Interface Guidelines
| File | Purpose |
|------|---------|
| [interface/index.md](interface/index.md) | Interface rules index |
| [interface/design.md](interface/design.md) | Visual design, contrast, shadows |
| [interface/colors.md](interface/colors.md) | Color palettes and methodology |
| [interface/spacing.md](interface/spacing.md) | Spacing system and layout |
| [interface/typography.md](interface/typography.md) | Type hierarchy and rendering |
| [interface/layout.md](interface/layout.md) | Alignment, responsive, safe areas |
| [interface/forms.md](interface/forms.md) | Form behavior and validation |
| [interface/interactions.md](interface/interactions.md) | Keyboard, touch, navigation |
| [interface/animation.md](interface/animation.md) | Motion and transitions |
| [interface/performance.md](interface/performance.md) | Rendering, loading, CLS |
| [interface/content-accessibility.md](interface/content-accessibility.md) | ARIA, content, a11y |
| [interface/marketing.md](interface/marketing.md) | Marketing pages, distinctive design |

## Customization

Adapt these rules to fit your project:

1. **Remove unused rules** - Delete files for tech you don't use
2. **Update package names** - Replace `@project/ui`, `@project/env` with your actual package names
3. **Add project-specific rules** - Create new `.md` files as needed

## Notes

- Internationalization: Intentionally out-of-scope (add if needed)
