---
name: responsive
description: |
  Audit and fix responsive/mobile issues across every page of a project, using Chrome MCP
  screenshots at two breakpoints (375px mobile, 1440px desktop). Design-aware: reads existing
  design docs to preserve aesthetic intent, not just "make it fit."
  Use when asked to "make it responsive", "fix mobile", "responsive audit", or after building
  a desktop-first UI that needs mobile adaptation.
license: MIT
metadata:
  author: howells
website:
  order: 13
  desc: Mobile responsive audit & fix
  summary: Systematically audit and fix every page for mobile responsiveness, with visual verification via browser screenshots.
  what: |
    Responsive discovers all routes in your project, then works through each page with a tight loop: screenshot at mobile width, identify issues, fix them in code, re-screenshot to verify, then check desktop hasn't broken. It reads your design doc first so fixes preserve your aesthetic direction—typography hierarchy, memorable elements, spacing system—not just make things fit on a small screen. Uses container queries for reusable components and viewport queries for page layout.
  why: |
    Desktop-first is a valid workflow, but the "make it responsive later" pass is tedious and error-prone. You resize the browser, spot something broken, fix it, accidentally break desktop, fix that, move to the next page, miss three others. This skill automates the systematic part so you can focus on the design decisions.
  decisions:
    - Two breakpoints only. 375px mobile and 1440px desktop catches 95% of issues. Tablet deferred to v2.
    - Design-aware. Reads your design doc first to preserve aesthetic intent, not just fix layout.
    - Chrome MCP required. No fallback path—single code path, already the Arc standard.
    - Container queries for components. Reusable components adapt to their container, not the viewport.
---

<tool_restrictions>
# Tool Restrictions

**Do NOT use the `EnterPlanMode` tool.** This skill manages its own workflow and writes results directly. Claude's built-in plan mode would bypass this process.

**Do NOT use the `ExitPlanMode` tool.** This skill is never in plan mode.

**ALWAYS use the `AskUserQuestion` tool for questions.** Never ask questions as plain text in your response. Every question to the user — whether confirming routes, choosing options, or validating fixes — MUST use the `AskUserQuestion` tool. This enforces one question at a time and prevents walls of text. If you need to provide context before asking, keep it to 2-3 sentences max, then use the tool.
</tool_restrictions>

# Responsive Audit & Fix

Systematically audit and fix every page for mobile responsiveness, with visual verification via Chrome MCP screenshots.

**Announce at start:** "I'm using the responsive skill to audit and fix mobile responsiveness across your project."

---

## Phase 1: Setup & Discovery

### Step 1: Check Chrome MCP

Attempt to use `mcp__claude-in-chrome__tabs_context_mcp` to verify Chrome MCP is available.

**If Chrome MCP is unavailable:**
Tell the user: "This skill requires the Claude in Chrome extension for screenshot-based verification. Please install it and try again."
**Stop.**

### Step 2: Confirm Dev Server

```
AskUserQuestion:
  question: "What's your dev server URL?"
  header: "Dev server"
  options:
    - label: "localhost:3000"
      description: "Default Next.js dev server"
    - label: "localhost:5173"
      description: "Default Vite dev server"
    - label: "localhost:4321"
      description: "Default Astro dev server"
```

Then verify the server is running:
```
mcp__claude-in-chrome__tabs_context_mcp (get or create tab)
mcp__claude-in-chrome__navigate to the dev server URL
mcp__claude-in-chrome__computer action=screenshot
```

If the page doesn't load, tell the user to start their dev server and try again.

### Step 3: Load Design Context

**Read design doc (if exists):**
```
Glob: docs/plans/design-*.md
```

If found, read the design doc and note:
- **Aesthetic direction** (tone, memorable element)
- **Typography hierarchy** (display, body, mono fonts)
- **Spacing system** (base unit, scale)
- **Color palette** (so you don't introduce new colors)

This context guides every fix decision. If there's no design doc, that's fine — apply general responsive best practices from the interface rules.

**Read interface rules:**
1. `${CLAUDE_PLUGIN_ROOT}/rules/interface/layout.md`
2. `${CLAUDE_PLUGIN_ROOT}/rules/interface/interactions.md`
3. `${CLAUDE_PLUGIN_ROOT}/rules/interface/spacing.md`

### Step 4: Discover Routes

**Detect framework:**

| Check | Grep Pattern | Framework |
|-------|-------------|-----------|
| `"next"` in `package.json` | Next.js | `app/**/page.{tsx,jsx}` |
| `"@remix-run"` in `package.json` | Remix | `app/routes/**/*.{tsx,jsx}` |
| `"astro"` in `package.json` | Astro | `src/pages/**/*.{astro,mdx}` |
| `"@sveltejs/kit"` in `package.json` | SvelteKit | `src/routes/**/+page.svelte` |

**Scan for page files** using the appropriate glob pattern. Exclude API routes (`app/api/**`).

**Build route list** from file paths:
- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/blog/[slug]/page.tsx` → `/blog/[slug]` (dynamic)
- `app/dashboard/page.tsx` → `/dashboard` (may need auth)

**Flag dynamic routes** — these need sample values from the user.

**Flag potentially auth-protected routes** — routes under common auth-gated paths like `/dashboard`, `/settings`, `/account`, `/admin`.

### Step 5: Confirm Routes with User

Present the discovered routes:

```
AskUserQuestion:
  question: "I found these routes. Any to skip?"
  header: "Routes"
  multiSelect: true
  options:
    - label: "/ (homepage)"
      description: "Public page"
    - label: "/about"
      description: "Public page"
    - label: "/blog/[slug]"
      description: "Dynamic — I'll need a sample slug"
    - label: "/dashboard"
      description: "May need auth — log in via Chrome first"
```

**If dynamic routes exist**, ask for sample slugs:
```
AskUserQuestion:
  question: "What slug should I use for /blog/[slug]?"
  header: "Sample URL"
  options:
    - label: "first-post"
      description: "Use /blog/first-post"
    - label: "hello-world"
      description: "Use /blog/hello-world"
```

**If auth-protected routes exist:**
Tell the user: "Some routes may need authentication. Please log in via the Chrome browser, then let me know when you're ready."

```
AskUserQuestion:
  question: "Are the auth-protected routes ready to audit?"
  header: "Auth"
  options:
    - label: "Yes, I'm logged in"
      description: "Continue with all routes including auth-protected ones"
    - label: "Skip auth routes"
      description: "Only audit public pages for now"
```
