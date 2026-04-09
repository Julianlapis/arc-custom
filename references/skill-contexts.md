# Skill Context Map

Skills are context-dependent. When routing work (via `/arc:go`, `/arc:help`, or `/arc:suggest`),
use this map to determine which skills are relevant to the current project.

## Context Detection (Quick Checks)

Run these once at the start of routing. Results determine which skills to surface.

| Signal | Check | What it means |
|--------|-------|---------------|
| `has_web` | `package.json` OR `next.config.*` OR `vite.config.*` | Web project |
| `has_ui` | `*.tsx` OR `*.vue` OR `*.svelte` in src/app/components | Has UI components |
| `has_api` | `api/` OR `routes/` OR `server/` directory | Has backend/API |
| `has_tests` | `vitest.config.*` OR `jest.config.*` OR `playwright.config.*` | Test infrastructure exists |
| `has_ai` | imports from `ai`, `anthropic`, `openai`, `@ai-sdk` | Uses AI SDKs |
| `has_vision` | `docs/vision.md` exists | Vision doc established |
| `has_plans` | `docs/arc/plans/*.md` exists | Active implementation plans |
| `has_design` | `docs/arc/specs/design-*.md` OR `docs/design-context.md` | Design docs exist |
| `has_brand` | `docs/arc/specs/brand-*.md` | Brand system exists |
| `has_git` | `.git/` exists | Version controlled |
| `is_nextjs` | `next.config.*` exists | Next.js specifically |
| `is_deployed` | `vercel.json` OR `.vercel/` OR `fly.toml` | Has deployment config |

## Skill Relevance

### Always relevant (any project)
- `/arc:go` — entry point
- `/arc:help` — command guide
- `/arc:vision` — if `!has_vision`
- `/arc:commit` — if `has_git`
- `/arc:suggest` — always
- `/arc:rules` — always
- `/arc:prune-agents` — always

### Requires web/UI project (`has_web` OR `has_ui`)
- `/arc:design` — UI design
- `/arc:responsive` — mobile audit
- `/arc:brand` — visual identity

### Requires backend/API (`has_api` OR `has_web`)
- `/arc:harden` — production resilience
- `/arc:letsgo` — ship readiness

### Requires test infrastructure (`has_tests`)
- `/arc:testing` — test strategy
- `/arc:verify` — run tests

### Requires AI SDK (`has_ai`)
- `/arc:ai` — AI patterns

### Requires deployed site (`is_deployed` OR `has_web`)
- `/arc:seo` — SEO audit

### Requires existing plans/specs
- `/arc:implement` — needs plan or spec
- `/arc:tidy` — needs completed plans
- `/arc:review` — needs plan or diff to review

### Requires vision (`has_vision`)
- `/arc:audit` — codebase audit (uses vision for alignment)

### No project needed (can run from ~)
- `/arc:ideate` — thinking doesn't need code
- `/arc:naming` — name generation
- `/arc:document` — can document anything

## How to Use This Map

When routing:
1. Run the quick checks from the table above
2. Filter the skill catalog using the relevance rules
3. Surface relevant skills prominently, dim irrelevant ones with a reason
4. Never hide skills entirely — dim with explanation (user may know better)

When suggesting (`/arc:suggest`):
1. Only suggest skills that match the current context
2. If `!has_vision` and the project is non-trivial, always suggest `/arc:vision` first
3. If `has_plans` with incomplete tasks, suggest `/arc:implement`
