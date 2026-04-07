---
name: flow
description: |
  Discover, store, and walk user flows. Scans your codebase for routes and interactive elements,
  generates walkable flow artifacts, then executes them in Chrome to verify they work.
  Four modes: discover (scan code → generate flows), walk (execute flows in browser),
  check (detect drift via file checksums), gaps (identify missing journeys from app signals).
  Use when asked to "discover flows", "walk the app", "check for drift", "test user journeys",
  "generate user flows", "what flows am I missing", or "flow gap analysis".
license: MIT
metadata:
  author: howells
website:
  order: 14
  desc: User flow discovery & verification
  summary: Discover user flows from your codebase, store them as walkable artifacts, and execute them in Chrome to verify they work.
  what: |
    Flow scans your codebase for routes and interactive elements, then generates structured user flow artifacts. Each flow is a sequence of steps — navigate, fill, click, expect — stored as markdown. Walk mode executes these flows in Chrome via browser automation, reporting which pass and which fail. Check mode detects when source files have changed, marking affected flows as stale so you know what to re-verify. Gaps mode analyzes your app's dependencies and route structure to identify user journeys that should exist but don't — then offers to discover or plan them.
  why: |
    Routes and page structure are easy to discover. What users actually do on those pages — fill forms, click buttons, navigate between sections — is invisible without manual testing. This skill makes user journeys concrete, persistent, and re-walkable. When code changes, you know which flows might be broken before users find out.
  decisions:
    - LLM reads code to understand interactions. AST parsers find structure, not intent.
    - Flows stored as markdown. Human-readable, editable, version-controlled.
    - File checksums for drift. Pull-based — run when you want to know.
    - Manual auth in v1. Works with any auth system universally.
  agents:
    - flow-discoverer
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill manages its own workflow.
- **`ExitPlanMode`** — BANNED. You are never in plan mode. There is nothing to exit.

## REQUIRED TOOLS:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for every question, including confirming dev server state, auth status, and stale flows. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Keep context before the question to 2-3 sentences max, and do not narrate missing tools or fallbacks to the user.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.
Resolve the Arc install root from this skill's location and refer to it as `${ARC_ROOT}`.
Use `${ARC_ROOT}/...` for Arc-owned files such as `references/`, `disciplines/`, `agents/`, `templates/`, and `scripts/`.
Use project-local paths such as `.ruler/` or `rules/` for the user's repository.
</arc_runtime>

# User Flow Discovery & Verification

Discover user flows from your codebase, store them as walkable artifacts, and execute them in Chrome to verify they work.

**Announce at start:** "I'm using the flow skill to [discover/walk/check] user flows."

---

<process>

## Mode Dispatch

Parse the first argument to determine mode:

| Argument | Mode | Description |
|----------|------|-------------|
| `discover` | Discover | Scan codebase, generate flow artifacts |
| `walk` | Walk | Execute stored flows in browser |
| `check` | Check | Detect drift via file checksums |
| `gaps` | Gaps | Identify missing journeys from app signals |
| *(none)* | Smart routing | Assess state, ask what to do |

---

## Mode: Smart Routing (no arguments)

When invoked without a mode argument, assess the current state and route intelligently.

### Step 1: Check State

Check if `docs/arc/flows/` exists and read any `.md` files. Count flows by status.

### Step 2: Route Based on State

**No flows exist** (directory missing or empty):
```
"No user flows discovered yet. I'll scan your codebase for routes and generate walkable flows."
```
→ Proceed directly to Discover mode. No question needed — discovery is the only useful action.

**Flows exist, some are stale:**
Show a brief status summary, then ask:
```
AskUserQuestion:
  question: "[X] flows found ([Y] stale). What would you like to do?"
  header: "User Flows"
  options:
    - label: "Check for drift"
      description: "[Y] flows may be out of date — check which source files changed"
    - label: "Walk all flows"
      description: "Execute all [X] flows in Chrome to verify they work"
    - label: "Re-discover"
      description: "Regenerate stale flows from current code"
    - label: "Discover new routes"
      description: "Scan for routes not yet covered by flows"
    - label: "Find missing journeys"
      description: "Analyze app signals to find journeys that should exist but don't"
```

**Flows exist, none stale, some not yet walked:**
```
AskUserQuestion:
  question: "[X] flows found ([V] not yet walked). What would you like to do?"
  header: "User Flows"
  options:
    - label: "Walk all flows"
      description: "Execute flows in Chrome to verify they work"
    - label: "Walk unwalked only"
      description: "Just the [V] flows that haven't been tested yet"
    - label: "Check for drift"
      description: "See if source files have changed since discovery"
    - label: "Discover new routes"
      description: "Scan for routes not yet covered"
    - label: "Find missing journeys"
      description: "Analyze app signals to find journeys that should exist but don't"
```

**Flows exist, all current and passed:**
```
AskUserQuestion:
  question: "All [X] flows are current and passing. What would you like to do?"
  header: "User Flows"
  options:
    - label: "Walk all flows"
      description: "Re-run all flows to verify they still pass"
    - label: "Check for drift"
      description: "See if any source files have changed"
    - label: "Discover new routes"
      description: "Scan for routes not yet covered"
    - label: "Find missing journeys"
      description: "Analyze app signals to find journeys that should exist but don't"
```

**Flows exist, some failed:**
```
AskUserQuestion:
  question: "[X] flows found ([Z] failing). What would you like to do?"
  header: "User Flows"
  options:
    - label: "Walk failed flows"
      description: "Re-run the [Z] failing flows to see if they pass now"
    - label: "Walk all flows"
      description: "Execute all [X] flows"
    - label: "Check for drift"
      description: "See if source files have changed"
    - label: "Re-discover failed"
      description: "Regenerate the failing flows from current code"
```

After the user selects, proceed to the corresponding mode.

---

## Mode: Discover

### Step 1: Detect Framework

Check `package.json` for framework:

| Check | Framework | Route glob pattern |
|-------|-----------|-------------------|
| `"next"` in dependencies | Next.js App Router | `app/**/page.{tsx,jsx,ts,js}` (exclude `app/api/**`) |
| `"next"` + `pages/` dir exists | Next.js Pages Router | `pages/**/*.{tsx,jsx,ts,js}` (exclude `pages/api/**`) |
| `"@sveltejs/kit"` in dependencies | SvelteKit | `src/routes/**/+page.svelte` |
| `"@remix-run"` in dependencies | Remix | `app/routes/**/*.{tsx,jsx}` |

If no framework detected:
```
"Could not detect a supported framework. Supported: Next.js, SvelteKit, Remix.
Is this the right directory?"
```
Stop.

### Step 2: Glob for Routes

Use the detected glob pattern to find all route files.

If zero routes found:
```
"No route files found using pattern [pattern]. Is this the right directory?
Detected framework: [framework]"
```
Stop.

### Step 3: Classify Routes (Auth)

**Read middleware/proxy file** to determine which routes are protected:

| Framework | Auth file to check |
|-----------|-------------------|
| Next.js | `proxy.ts`, `middleware.ts`, `src/proxy.ts`, `src/middleware.ts` |
| SvelteKit | `src/hooks.server.ts` |
| Remix | `app/root.tsx` or route-level loaders |

**Detect auth provider** by scanning `package.json` dependencies and middleware:

| Signal | Provider |
|--------|----------|
| `@clerk/nextjs` + `clerkMiddleware` | Clerk |
| `@workos-inc/authkit-nextjs` + `authkitMiddleware` | WorkOS |
| Session/JWT patterns without known provider | Self-rolled |
| No auth middleware | None |
| Both Clerk and WorkOS detected | Ask user which is primary |

**Classify each route:**
- Routes explicitly in public matchers → `auth: none`
- Routes behind middleware protection → `auth: user`
- Routes with role checks (admin, org) → `auth: admin` or `auth: org-admin`
- If unclear → default to `auth: user` (safer to over-classify)

### Step 4: Check Existing Flows

If `docs/arc/flows/` already has `.md` files:

Read each existing flow file's `route` field. Build a set of already-discovered routes.

Check if `--force` was passed as an argument.

- **Without `--force`**: Skip routes that already have a flow file. Report: "Found X existing flows. New routes will be added, existing flows preserved."
- **With `--force`**: Overwrite all. Report: "Found X existing flows. All will be regenerated (--force)."

### Step 5: Group Routes

Group remaining routes by top-level path segment:
- `/` → `root` group
- `/about`, `/pricing` → `marketing` group (or by first segment)
- `/dashboard/*` → `dashboard` group
- `/settings/*` → `settings` group

**Max 10 routes per group.** If a group exceeds 10, split it.

### Step 6: Dispatch Flow Discoverer Agents

For each route group, dispatch the `flow-discoverer` agent via a parallel Agent tool call:

```
Agent flow-discoverer: "Discover user flows for these routes.

Framework: [detected framework]
Auth provider: [detected provider]
Today's date: [YYYY-MM-DD]

Routes in this group:
1. [route path] → [file path] (auth: [level])
2. [route path] → [file path] (auth: [level])
...

Read each route's component code, follow imports to find interactive elements,
and generate flow artifacts using the step DSL.

See ${ARC_ROOT}/agents/workflow/flow-discoverer.md for the full protocol."
```

Dispatch all groups in a single message for maximum parallelism.

If an agent errors or times out, log a warning and continue with other groups:
```
"Warning: Could not discover flows for [group name] routes. [X] other groups completed successfully."
```

### Step 7: Write Flow Files

Parse each agent's output for flow artifacts (separated by `--- FLOW: <name> ---`).

For each flow artifact:
1. Create `docs/arc/flows/<name>.md` with the artifact content
2. If the file already exists and `--force` was not passed, skip it

### Step 8: Report

```
Discovery complete:
- Routes scanned: X
- Flows generated: Y (Z public, W authenticated)
- Skipped (already existed): V
- Auth provider: [provider]

Flows written to docs/arc/flows/

Next steps:
- /arc:flow walk --all — Execute all flows in Chrome
- /arc:flow gaps — Find journeys that should exist but don't
- /arc:flow check — Check for drift later
```

---

## Mode: Walk

### Step 1: Select Browser Tool

**Browser tool hierarchy:**

1. **Chrome MCP** (preferred) — `mcp__claude-in-chrome__*` tools
2. **agent-browser** — `/agent-browser` skill as fallback outside Claude Code
3. **Playwright** — scripted browser fallback as last resort

Check for Chrome MCP availability first. If Chrome MCP tools are not available, check for agent-browser. If neither is available, note that Playwright would need to be scripted manually and ask the user how to proceed.

### Step 2: Confirm Dev Server

```
AskUserQuestion:
  question: "What's your dev server URL?"
  header: "Dev server"
  options:
    - label: "localhost:3000"
      description: "Default Next.js / Remix dev server"
    - label: "localhost:5173"
      description: "Default Vite / SvelteKit dev server"
    - label: "localhost:4321"
      description: "Default Astro dev server"
    - label: "Custom URL"
      description: "I'll type the URL"
```

### Step 3: Verify Dev Server

Navigate the browser to the base URL:
```
mcp__claude-in-chrome__tabs_context_mcp (get current tabs)
mcp__claude-in-chrome__navigate to [base URL]
```

If the page fails to load or shows a connection error:
```
"Dev server doesn't seem to be running at [URL]. Please start it and try again."
```
Stop.

### Step 4: Read Flow Files

Read all `.md` files from `docs/arc/flows/`.

If no flows found:
```
"No flows found in docs/arc/flows/. Run /arc:flow discover first."
```
Stop.

**Filter flows:**
- `--flow <name>`: Walk only the named flow
- `--all`: Walk all flows
- No filter specified: Ask which flows to walk

**Sort order:** Public flows first (`auth: none`), then authenticated flows.

**Stale flow handling:**
- If stale flows are selected and `--force` was NOT passed:
  ```
  AskUserQuestion:
    question: "Some selected flows are stale (source files changed). Walk them anyway?"
    header: "Stale flows"
    options:
      - label: "Walk anyway"
        description: "Run the flows as-is — they may fail due to code changes"
      - label: "Skip stale"
        description: "Only walk current flows"
      - label: "Re-discover first"
        description: "Regenerate stale flows from current code, then walk"
  ```

### Step 5: Auth Gate

If any selected flows have `auth` other than `none`:

1. Detect auth provider (scan `package.json` and middleware)
2. Report:
   ```
   "Your app uses [provider]. [X] flows require authentication.
   Please log in to your app at [base URL] in Chrome, then confirm."
   ```
3. Ask:
   ```
   AskUserQuestion:
     question: "Are you logged in?"
     header: "Authentication"
     options:
       - label: "Yes, I'm logged in"
         description: "Continue with all flows including authenticated ones"
       - label: "Skip authenticated flows"
         description: "Only walk public flows for now"
   ```

### Step 6: Walk Each Flow

For each flow in order (public first, then authenticated):

1. **Navigate** to `[base URL][route]`
   ```
   mcp__claude-in-chrome__navigate to [full URL]
   ```

2. **Execute each step** sequentially:
   - **navigate**: `mcp__claude-in-chrome__navigate`
   - **click**: `mcp__claude-in-chrome__find` to locate element, then `mcp__claude-in-chrome__computer` to click
   - **fill**: `mcp__claude-in-chrome__form_input` with selector and value
   - **select**: `mcp__claude-in-chrome__form_input` with selector and value
   - **wait**: `mcp__claude-in-chrome__find` with retries

3. **Check expectations** after each step:
   - `expect: url /path` — read current tab URL, check it ends with `/path`
   - `expect: visible "text"` — `mcp__claude-in-chrome__find` for the text
   - `expect: heading "text"` — `mcp__claude-in-chrome__find` for heading with text
   - `expect: not-visible "text"` — `mcp__claude-in-chrome__find` returns no match

4. **Resolve `$ENV_VAR` values** before filling:
   ```bash
   echo $TEST_EMAIL
   ```
   If a variable is not set, abort with: "Missing environment variable: [VAR]. Set it before walking authenticated flows."

5. **Translate `>>` selectors**:
   `button >> "Create Account"` → use `mcp__claude-in-chrome__find` with query `Create Account`, then verify the matched element is a button, then click it.

6. **On step failure** (element not found, expectation failed, timeout):
   - Record: flow name, failing step index, step text, error message
   - Mark flow as `failed`
   - Skip remaining steps
   - Move to next flow

7. **On all steps passed**:
   - Mark flow as `passed`

### Step 7: Update Flow Files

For each walked flow, update the frontmatter:
- Set `last_walked: YYYY-MM-DD`
- Set `status: passed` or `status: failed`

Use the Edit tool to update only the frontmatter fields, preserving the rest of the file.

### Step 8: Report Results

```
Walk complete:

Passed (X):
  ✓ signup-create-account
  ✓ home-view
  ✓ dashboard-view

Failed (Y):
  ✗ settings-profile-edit — Step 3: fill [name="phone"] → element not found
  ✗ checkout-submit — Step 5: expect url /confirmation → got /checkout/error

Skipped (Z):
  ○ admin-users-list — auth required, skipped
```

---

## Mode: Check

### Step 1: Read All Flows

Read all `.md` files from `docs/arc/flows/`.

If no flows found:
```
"No flows to check. Run /arc:flow discover first."
```
Stop.

### Step 2: Compute Current Checksums

For each flow, read the `source_files` list from frontmatter.

For each source file:
```bash
sha256sum <file path> | cut -c1-8
```

If a source file doesn't exist:
- Record: "source file not found: [path]"
- Mark flow as needing staleness update

### Step 3: Compare Checksums

For each flow:
- If all checksums match stored values → flow is current
- If any checksum differs OR any source file is missing → flow is stale

### Step 4: Update Stale Flows

For each stale flow:
- Set `status: stale` in frontmatter
- If a source file was deleted, add to Notes: "Source file not found: [path] (detected [date])"

### Step 5: Report

```
Drift check complete:

Current (X):
  ✓ home-view
  ✓ signup-create-account

Stale (Y):
  ⚠ dashboard-view — src/components/dashboard-stats.tsx changed
  ⚠ settings-profile-edit — src/app/settings/profile/page.tsx changed
  ⚠ admin-users-list — src/components/admin/user-table.tsx deleted
```

### Step 6: Offer Next Steps

If stale flows found:
```
AskUserQuestion:
  question: "What would you like to do with the stale flows?"
  header: "Stale flows"
  options:
    - label: "Re-discover"
      description: "Regenerate stale flows from current code"
    - label: "Walk anyway"
      description: "Run the stale flows to see if they still pass"
    - label: "Do nothing"
      description: "Just the report for now"
```

If "Re-discover": Run the Discover mode for only the stale routes (re-read the route files, dispatch flow-discoverer for those routes, overwrite the stale flow files).

If "Walk anyway": Run the Walk mode with `--force` for the stale flows.

---

## Mode: Gaps

Identify user journeys that **should** exist based on app signals but have no flow artifacts — or no routes at all.

### Step 1: Scan App Signals

Read `package.json` dependencies and scan the route/middleware structure.

**Dependency signals → expected journeys:**

| Signal | Detection | Expected Journeys |
|--------|-----------|-------------------|
| Auth (any) | Auth middleware detected | sign-up, sign-in, sign-out |
| Clerk | `@clerk/nextjs` in deps | + org creation, org switcher, member invite, profile management |
| WorkOS | `@workos-inc/authkit-nextjs` in deps | + SSO configuration |
| Stripe | `stripe` in deps | checkout, subscription management, billing portal, plan change |
| Resend | `resend` in deps | email verification, notification preferences |
| File storage | `@vercel/blob` or S3/Cloudinary in deps | file upload, file management |
| Search | `algoliasearch`, `@tanstack/react-table`, or search input components | search, filtered results |
| i18n | `next-intl`, `i18next` in deps | language switching |

**Route structure signals → expected journeys:**

| Signal | Detection | Expected Journeys |
|--------|-----------|-------------------|
| Admin area | `/admin/*` routes exist | admin dashboard, user management |
| Settings | `/settings/*` routes exist | profile edit, account settings, notification settings |
| Onboarding | `/onboarding/*` routes or redirect-after-signup pattern | onboarding flow |
| Dashboard | `/dashboard/*` routes exist | dashboard view, key dashboard actions |
| Marketing pages | `/`, `/pricing`, `/about` routes exist | landing page, pricing comparison |

### Step 2: Read Existing Flows

Read all `.md` files from `docs/arc/flows/` (excluding `gaps-report.md`). Build a set of covered journeys by matching flow names and route paths against the expected journey list from Step 1.

### Step 3: Identify Gaps

For each expected journey:

1. **Check if a flow exists** — match by route path or flow name pattern
2. **Check if the route exists** — glob for the route file
3. Classify:
   - **Covered** — flow artifact exists → skip
   - **Discoverable gap** — route exists in code but no flow artifact → can discover immediately
   - **Feature gap** — no route exists → this is a missing feature, not a missing flow

If zero gaps found:
```
"No gaps detected. Your flows cover the expected journeys for this app's capabilities.

Signals detected: [auth provider], [payments], [email], etc.
Existing flows: [X]"
```
Stop.

### Step 4: Present Gaps by Domain

Group gaps by domain. Present one AskUserQuestion per domain that has gaps:

```
AskUserQuestion:
  question: "Auth: Your app uses [provider] but these journeys have no flows. Which should exist?"
  header: "Auth Gaps"
  options:
    - label: "[journey name]"
      description: "[route exists / no route found] — [brief reason]"
    - label: "[journey name]"
      description: "..."
    - label: "All of these"
    - label: "None — handled externally"
```

Example for Clerk:
```
AskUserQuestion:
  question: "Auth: Your app uses Clerk but these journeys have no flows. Which should exist?"
  header: "Auth Gaps"
  options:
    - label: "Password reset"
      description: "No /forgot-password route — Clerk hosted UI may handle this"
    - label: "Organization creation"
      description: "Route /create-org exists but has no flow"
    - label: "Sign out"
      description: "No explicit sign-out flow found"
    - label: "All of these"
    - label: "None — Clerk hosted UI handles these"
```

Example for Stripe:
```
AskUserQuestion:
  question: "Payments: Stripe detected but these journeys have no flows. Which should exist?"
  header: "Payments Gaps"
  options:
    - label: "Checkout"
      description: "No /checkout route — Stripe may use hosted checkout"
    - label: "Billing portal"
      description: "Route /settings/billing exists but has no flow"
    - label: "Plan upgrade"
      description: "No upgrade flow found"
    - label: "All of these"
    - label: "None — Stripe hosted pages handle these"
```

Skip domains with zero gaps. Proceed through each domain sequentially.

### Step 5: Process Confirmed Gaps

After all domains are reviewed, split confirmed gaps into two lists:

**Discoverable gaps** (route exists, no flow):

If any discoverable gaps were confirmed:
```
AskUserQuestion:
  question: "[X] confirmed gaps have existing routes. Discover flows for them now?"
  header: "Discover Missing Flows"
  options:
    - label: "Discover now"
      description: "Run flow discovery on the [X] routes"
    - label: "Add to report only"
      description: "Note them in the gaps report for later"
```

If "Discover now": dispatch flow-discoverer agents for those routes using Discover mode Steps 5-7 (group routes, dispatch agents, write flow files).

**Feature gaps** (no route): go directly to the report. These are feature suggestions, not actionable flows.

### Step 6: Write Gaps Report

Write `docs/arc/flows/gaps-report.md`:

```markdown
---
generated: YYYY-MM-DD
app_signals:
  auth: [provider or none]
  payments: [stripe or none]
  email: [resend or none]
  storage: [blob/s3 or none]
  search: [provider or none]
  i18n: [library or none]
total_expected: [count]
total_covered: [count]
total_gaps: [count]
---

# Flow Gaps Report

Generated by `/arc:flow gaps` on YYYY-MM-DD.

## Discoverable Gaps (route exists, no flow)

| Journey | Route | Status |
|---------|-------|--------|
| Billing settings | /settings/billing | Discovered ✓ |
| Organization creation | /create-org | Added to report |

## Feature Gaps (no route found)

| Journey | Expected Route | Signal | Notes |
|---------|---------------|--------|-------|
| Password reset | /forgot-password | Clerk auth | May be handled by Clerk hosted UI |
| Checkout | /checkout | Stripe | May use Stripe hosted checkout |

## Already Covered

| Journey | Flow | Signal |
|---------|------|--------|
| Sign up | signup-create-account | Clerk auth |
| Dashboard | dashboard-view | /dashboard route |
| Profile edit | settings-profile-edit | /settings route |
```

If the file already exists, overwrite it — it's a point-in-time snapshot, not an accumulating log.

### Step 7: Report

```
Gap analysis complete:

Signals detected: [list]
Expected journeys: X
Already covered: Y
Discoverable gaps: Z (W discovered now)
Feature gaps: V

Feature gaps are journeys your app likely needs but doesn't have routes for yet.
See docs/arc/flows/gaps-report.md for the full breakdown.

Next steps:
- /arc:flow walk — Walk newly discovered flows
- /arc:flow gaps — Re-run after adding new routes
- Review feature gaps when planning next sprint
```

</process>

<required_reading>
Read before running:
- `docs/arc/specs/2026-03-13-user-flows-design.md` — Full design spec with decisions and rationale
- `${ARC_ROOT}/references/authentication.md` — Auth patterns for Clerk, WorkOS, self-rolled (when auth is detected)
- `${ARC_ROOT}/references/platform-tools.md` — Browser tool mappings across platforms
</required_reading>

<progress_append>
After completing any mode, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:flow [mode]
**Task:** [Mode] user flows
**Outcome:** [Complete / Partial]
**Details:**
- Mode: [discover/walk/check/gaps]
- Flows: [count by status]
- Auth: [detected provider]
**Next:** [suggested next step]

---
```
</progress_append>
