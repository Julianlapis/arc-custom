# User Flows Design

## Problem Statement

Arc can discover routes and review individual pages, but has no way to understand or verify **what users actually do** — the journeys across pages, the forms they fill, the state transitions they trigger. When code changes, there's no way to know which user flows might be broken without manually walking through the app.

The gap: there's no persistent, re-walkable representation of user flows derived from the codebase itself.

## Approach

A new `/arc:flow` skill with four modes:

| Mode | What it does |
|------|-------------|
| `discover` | Scan codebase → generate flow artifacts |
| `walk` | Execute stored flows via Chrome MCP |
| `check` | Detect drift between flows and current code |
| `gaps` | Identify missing journeys from app signals |

### File Structure

| File | Purpose |
|------|---------|
| `skills/flow/SKILL.md` | Single skill file handling all three modes via argument dispatch |
| `agents/workflow/flow-discoverer.md` | LLM agent that reads component code and generates flow steps |

The skill dispatches modes based on the first argument: `discover`, `walk`, or `check`. No argument defaults to a status summary (how many flows exist, how many are stale).

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│ Route        │     │ Flow         │     │ Flow       │
│ Scanner      │────▶│ Discoverer   │────▶│ Store      │
│ (mechanical) │     │ (LLM agent)  │     │ (markdown) │
└─────────────┘     └──────────────┘     └─────┬──────┘
                                               │
                    ┌──────────────┐            │
                    │ Flow Walker  │◀───────────┘
                    │ (Chrome MCP) │
                    └──────────────┘
                                               │
                    ┌──────────────┐            │
                    │ Drift        │◀───────────┘
                    │ Detector     │
                    │ (checksums)  │
                    └──────────────┘
                                               │
┌─────────────┐     ┌──────────────┐           │
│ Signal       │     │ Gap          │◀──────────┘
│ Scanner      │────▶│ Analyzer     │────▶ Gaps Report
│ (deps+routes)│     │ (comparison) │     (markdown)
└─────────────┘     └──────────────┘
```

**Route Scanner** — mechanical. Reuses existing framework-specific glob patterns from `/arc:responsive` and `/arc:seo`:
- Next.js App Router: `app/**/page.{tsx,jsx,ts,js}`
- Next.js Pages Router: `pages/**/*.{tsx,jsx,ts,js}`
- SvelteKit: `src/routes/**/+page.svelte`
- Remix: `app/routes/**/*.{tsx,jsx}`

**Flow Discoverer** — LLM agent. The novel part. Reads each route's component tree and generates structured flow steps. This is inherently fuzzy — the agent interprets UI code and produces its best understanding of what a user can do. Dispatched via multiple Agent tool calls in a single message for parallelism (Claude Code's native parallel tool calling).

**Flow Store** — markdown files in `docs/arc/flows/`. Human-readable, machine-walkable, version-controlled.

**Flow Walker** — Chrome MCP execution engine. Reads flow files, navigates to routes, executes steps, captures results.

**Drift Detector** — checksums of source files. When files change, flows are marked stale.

**Signal Scanner** — mechanical. Reads `package.json` dependencies and route structure to identify app capabilities (auth provider, payments, email, storage, etc.). Maps each signal to expected user journeys.

**Gap Analyzer** — comparison engine. Cross-references expected journeys (from signals) against existing flows (from Flow Store). Classifies gaps as discoverable (route exists, no flow) or feature-level (no route exists). Writes a gaps report with planning recommendations.

## Flow Artifact Format

Location: `docs/arc/flows/<flow-name>.md`

```markdown
---
name: user-signup
description: New user creates an account via email
route: /signup
auth: none
source_files:
  - path: src/app/(marketing)/signup/page.tsx
    checksum: a1b2c3d4
  - path: src/components/signup-form.tsx
    checksum: e5f6a7b8
discovered: 2026-03-13
last_walked: null
status: discovered
---

## Steps

1. **navigate** `/signup`
   - expect: heading "Create your account"

2. **fill** `[name="email"]` → `$TEST_EMAIL`

3. **fill** `[name="password"]` → `$TEST_PASSWORD`

4. **click** `button >> "Create Account"`
   - expect: url `/dashboard`
   - expect: visible "Welcome"

## Notes

- Password field has client-side validation (min 8 chars)
- Form shows inline errors on blur
```

### Status lifecycle

```
discovered ──▶ passed ──▶ stale ──▶ re-discovered
     │              │         │
     │              │         ├──▶ passed (via "walk anyway")
     │              │         └──▶ failed (via "walk anyway")
     │              │
     ▼              ▼
   failed ───▶ stale (when source files change after failure)
```

**Transitions:**
- `discovered → passed/failed`: first walk
- `passed → stale`: source file checksum changed
- `failed → stale`: source file checksum changed (code may have fixed the issue)
- `stale → passed/failed`: "walk anyway" — walks the flow, updates status based on result
- `stale → discovered`: re-discover regenerates the flow from current code
- Any status where a referenced source file is **deleted**: flow marked `stale` with a note "source file not found: [path]"

### Frontmatter fields

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Unique identifier (kebab-case) |
| `description` | string | One-line human summary |
| `route` | string | Starting URL path (relative — base URL provided at walk time) |
| `auth` | `none` \| `user` \| `admin` \| `org-admin` | Required auth level |
| `source_files` | array | Files this flow depends on, with SHA-256 checksums (first 8 hex chars) |
| `discovered` | date | When the flow was generated |
| `last_walked` | date \| null | Last walk attempt (pass or fail) |
| `status` | enum | `discovered` \| `passed` \| `failed` \| `stale` |

### Step DSL

Steps use a minimal DSL that maps to Chrome MCP tools:

| Action | Syntax | Chrome MCP tool |
|--------|--------|-----------------|
| Navigate | `**navigate** /path` | `navigate` (prepends base URL) |
| Click | `**click** selector` | `find` (to locate) + `computer` (to click) |
| Fill | `**fill** selector → value` | `form_input` |
| Select | `**select** selector → option` | `form_input` |
| Wait | `**wait** selector` | `find` with retries |
| Expect | `- expect: condition` | See expect types below |

**Selectors:** CSS selectors for structural elements. For text-based selection, use `>>` operator: `button >> "Create Account"` means "find a button element containing the text 'Create Account'". The walker translates `>>` to Chrome MCP's `find` tool with both element type and text query. Do **not** use Playwright-specific pseudo-selectors like `:has-text()` — they are not available in Chrome MCP.

**Expect types:**
| Syntax | Meaning | Chrome MCP check |
|--------|---------|-----------------|
| `expect: url /path` | Current URL ends with `/path` | Read tab URL |
| `expect: visible "text"` | Text is visible on page | `find` with text query |
| `expect: heading "text"` | An h1-h6 contains text | `find` with heading + text |
| `expect: not-visible "text"` | Text is not on page | `find` returns no match |

**Environment variable substitution:** Values prefixed with `$` are resolved from environment variables at walk time. Use for credentials and test data: `$TEST_EMAIL`, `$TEST_PASSWORD`. Flow files must never contain real credentials.

### Sensitive Data

Flow files are committed to version control. Rules:

- **Never hardcode credentials** in flow steps. Use `$ENV_VAR` syntax.
- **Test data** (names, emails) should use obviously fake values or env vars.
- The walker reads env vars from the shell environment at runtime.
- If a `$VAR` is referenced but not set, the walker aborts with: "Missing environment variable: VAR. Set it before walking authenticated flows."

## Auth Strategy

Auth handling is the critical integration point.

### Detection

The discover phase detects the auth provider by scanning for:

| Provider | Detection signal |
|----------|-----------------|
| Clerk | `@clerk/nextjs` in dependencies, `clerkMiddleware` in proxy/middleware |
| WorkOS | `@workos-inc/authkit-nextjs` in dependencies, `authkitMiddleware` in proxy |
| Self-rolled | Session/JWT patterns in middleware without known provider imports |
| None | No auth middleware, no protected routes |
| Multiple | Both Clerk and WorkOS detected → ask user which is primary |

### Walk-time auth (v1)

For v1, all providers use the **manual login fallback**:

1. Before walking authenticated flows, ask: "Your app uses [detected provider]. Please log in to your app at [base URL] in Chrome, then confirm."
2. Wait for user confirmation via `AskUserQuestion`.
3. Walk public flows first (no auth needed), then authenticated flows.

**v2 candidates** (not in scope):
- Clerk testing token injection via `javascript_tool`
- WorkOS API-based test login
- Storage state capture and replay

### Route classification

During discovery, routes are classified as:

| Classification | Auth field | How detected |
|----------------|-----------|--------------|
| Public | `auth: none` | Outside middleware protection, no auth checks in component |
| Authenticated | `auth: user` | Behind middleware, basic auth check |
| Admin | `auth: admin` | Role-based checks for admin role |
| Org-scoped | `auth: org-admin` | Organization role checks |

All auth levels beyond `none` require the same manual login for v1. The distinction is recorded for future automated auth (v2) and for documentation value — developers can see which flows need which access level.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Markdown flow files, not JSON | Human-readable, editable, version-controllable. The DSL is simple enough that markdown works. |
| LLM agent for discovery, not AST parser | Only an LLM can read a React component and understand "this form submits to create a user." AST parsers find structure, not intent. |
| File checksums for drift, not git hooks | Simpler. `check` is pull-based — run when you want to know. No background processes. |
| `>>` text operator, not `:has-text()` | `:has-text()` is Playwright-specific. `>>` is a simple convention the walker translates to Chrome MCP's `find` + text query. |
| Manual auth only in v1 | Automated auth (Clerk tokens, WorkOS API) requires test environment setup most users won't have. Manual login works universally. |
| Env var substitution for credentials | Flow files are version-controlled. Real credentials must not appear in them. |
| SHA-256 truncated to 8 hex chars | Sufficient for drift detection (collision probability negligible for <1000 files). Short enough to be readable in frontmatter. |
| Fail-fast on step failure | When a step fails, mark the flow `failed` and move to the next flow. Don't attempt remaining steps — they likely depend on the failed step. |
| Skip existing files on re-discover | Protects hand-edited flows. Use `--force` to overwrite. |
| No tags in v1 | `--flow name` and `--all` cover the primary use cases. Tag filtering adds surface area without a forcing need until the flow count is high. |
| Gaps report, not stub flow files | Flow files are executable artifacts — every one should be walkable. Feature gaps (no route) can't be walked, so they belong in a separate report. Mixing executable and aspirational artifacts pollutes the walk/check lifecycle. |
| Signal-based gap detection, not hardcoded checklists | Gaps are inferred from dependency and route signals (Clerk → auth flows, Stripe → payment flows). Flexible enough to work across app types without maintaining a universal journey catalog. |
| Gaps report is a snapshot, not a log | Overwritten on each run. It's a planning tool, not a history. Git tracks changes if needed. |

## Skill Design

### `/arc:flow` (no args) — Status

1. Check if `docs/arc/flows/` exists
2. If not: "No flows discovered yet. Run `/arc:flow discover` to scan your codebase."
3. If yes: count flows by status, report summary

### `/arc:flow discover`

1. Detect framework (Next.js App Router, Pages, SvelteKit, Remix)
2. If no routes found: report "No route files found. Is this the right directory? Detected framework: [X]" and stop
3. Glob for route files using framework patterns
4. Classify routes: public vs authenticated (scan middleware/proxy)
5. Detect auth provider (Clerk, WorkOS, self-rolled, none)
6. If `docs/arc/flows/` has existing files:
   - Report: "Found X existing flows. New routes will be added, existing flows preserved."
   - Skip routes that already have a flow file (match by `route` field)
   - Use `--force` to overwrite all
7. Group routes by top-level path segment (e.g., all `/dashboard/*` together). Max 10 routes per group.
8. Dispatch `flow-discoverer` agent per group via parallel Agent tool calls
   - If an agent errors, write a warning and continue with other groups
   - Agent reads component code for each route
   - Generates flow steps using the step DSL
   - Identifies related source files and computes checksums
9. Write flow files to `docs/arc/flows/`
10. Report: X flows discovered, Y public, Z authenticated, W skipped (already existed)

### `/arc:flow walk [--flow name] [--all] [--force]`

**Preamble (dev server verification):**
1. Ask via `AskUserQuestion`: "What's your dev server URL?" with options: `http://localhost:3000` (default), `http://localhost:5173` (Vite), custom
2. Navigate Chrome MCP to the base URL
3. If the page fails to load: "Dev server doesn't seem to be running at [URL]. Start it and try again." Stop.
4. Store base URL for this walk session

**Auth gate (if any flows need auth):**
5. If authenticated flows are selected:
   - Report detected auth provider
   - Ask: "Please log in to your app at [base URL] in Chrome, then confirm you're logged in."
   - Wait for confirmation via `AskUserQuestion`

**Walk execution:**
6. Read flow files from `docs/arc/flows/`, filter by `--flow` or `--all`
7. If no flows found: "No flows match. Run `/arc:flow discover` first." Stop.
8. Walk public flows first, then authenticated flows
9. For each flow:
   - Navigate to route (base URL + route path)
   - Execute each step sequentially
   - On step failure: record which step failed and the error, mark flow `failed`, skip remaining steps, move to next flow
   - On all steps passed: mark flow `passed`
10. Update `last_walked` and `status` in flow files
11. Report results:
    - Passed: list of flow names
    - Failed: flow name + failing step index + error message
    - Skipped: flows filtered out or auth-gated without session

**`--force`**: Walk stale flows without prompting. (Distinct from `discover --force` which overwrites existing flow files.)

### `/arc:flow check`

1. Read all flow files from `docs/arc/flows/`
2. If no flows: "No flows to check. Run `/arc:flow discover` first." Stop.
3. For each flow, compute SHA-256 (first 8 hex chars) of each referenced source file
4. If a source file doesn't exist: mark flow `stale`, add note "source file not found: [path]"
5. Compare computed checksums against stored checksums
6. Mark changed flows as `status: stale`
7. Report: X current, Y stale, Z source files changed
8. If stale flows found, ask via `AskUserQuestion`:
   - "Re-discover stale flows" — run discover on just the stale routes
   - "Walk anyway" — walk stale flows to see if they still pass
   - "Do nothing" — just the report

### `/arc:flow gaps`

1. Scan `package.json` dependencies and route structure for app signals (auth provider, payments, email, storage, search, i18n, admin/settings/onboarding routes)
2. Map signals to expected user journeys (e.g., Clerk → sign-up, sign-in, sign-out, org creation, profile management)
3. Read existing flows from `docs/arc/flows/` and build a set of covered journeys
4. For each expected journey, classify as: covered (flow exists), discoverable gap (route exists but no flow), or feature gap (no route exists)
5. Present gaps grouped by domain (auth, payments, settings, etc.) via `AskUserQuestion` — one question per domain
6. For confirmed discoverable gaps: offer to run flow-discoverer immediately
7. Write `docs/arc/flows/gaps-report.md` with three sections: discoverable gaps, feature gaps, and already-covered journeys
8. Report summary with counts and next steps

**Key distinction:** Flow files remain executable artifacts — every flow file is walkable. Feature gaps (no route exists) go into the gaps report as planning suggestions, not as stub flow files. This keeps the walk/check lifecycle clean.

**Gap report format:** `docs/arc/flows/gaps-report.md` is a point-in-time snapshot, overwritten on each run. It has YAML frontmatter with `app_signals` and counts, plus three tables (discoverable gaps, feature gaps, covered journeys).

### Agent: `flow-discoverer`

A new agent in `agents/workflow/flow-discoverer.md`. Given a list of route files and the project's auth classification:

1. Reads the component tree for each route (follows imports to find forms, buttons, links)
2. Identifies interactive elements (forms, buttons, links, modals, dropdowns)
3. Traces navigation (links, redirects, router.push, form actions)
4. Generates flow steps using the step DSL
5. Lists source files the flow depends on (the page file + key imported components)
6. Computes SHA-256 checksums (first 8 hex chars) of each source file
7. Uses env var `$` syntax for any credential-like fill values
8. Names flows as `<route-slug>-<action>` (e.g., `signup-create-account`, `dashboard-view`)

**Scope per agent invocation:** One route group (max 10 routes). Each group dispatched as a separate Agent tool call for parallelism.

**Dynamic routes** (e.g., `/projects/[id]`): Generate one example flow per dynamic pattern. Use placeholder values (e.g., `**navigate** /projects/example-id`). Add a note: "Dynamic route — uses placeholder ID."

## Drift Model

Drift is detected at the file level using SHA-256 checksums (first 8 hex chars):

```
Flow "user-signup" references:
  - src/app/signup/page.tsx (stored: a1b2c3d4, current: a1b2c3d4) ← match
  - src/components/signup-form.tsx (stored: e5f6a7b8, current: 9c0d1e2f) ← CHANGED

Result: flow marked "stale"
```

### Known limitations

- **False positives**: A CSS-only change triggers staleness. Cost is low — re-discover or walk-anyway.
- **False negatives**: Changes to transitive dependencies (e.g., a shared utility imported by a listed component) are not detected unless the listed component's file also changes. This is a known v1 limitation. The discoverer should list direct imports but does not trace the full dependency tree.
- **Deleted files**: If a source file is deleted, the flow is marked stale with a note. The route may also have been removed — the developer should check.

## AskUserQuestion Discipline

All user-facing questions in this skill use `AskUserQuestion` with multiple-choice options where possible. This follows the convention established in `/arc:responsive` and `/arc:ideate`:

- Dev server URL → multiple choice with common defaults + custom
- Auth confirmation → yes/I'm logged in
- Stale flow handling → re-discover / walk anyway / do nothing
- Re-discover overwrite → skip existing / overwrite all
- Gap confirmation → per-domain journey checklist with "all" / "none" options
- Discoverable gap action → discover now / add to report only

## Open Questions (Deferred to v2)

- **Expected data states**: Should flows capture "dashboard shows 3 projects"? Fragile but valuable for data-layer testing.
- **Flow dependency graph**: "signup" must pass before "dashboard" can be walked. Adds complexity.
- **Automated auth**: Clerk testing tokens, WorkOS API login, storage state capture.
- **Tag filtering**: `--tag onboarding` to filter flows. Useful once flow count is high.
- **Walk screenshots**: Capture screenshots at key steps for visual regression. Needs a storage/cleanup policy.
- **Framework field**: Record which router convention a flow was discovered under, for migration detection.
