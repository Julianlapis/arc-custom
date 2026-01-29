# SEO Audit Implementation Plan

> **For Claude:** Use /arc:implement to implement this plan task-by-task.

**Design:** docs/plans/2026-01-29-seo-audit-design.md
**Goal:** Add SEO audit capability — shared rules, light audit agent, standalone deep skill, letsgo update.
**Stack:** Claude Code plugin (markdown files, no application code)

---

## Task 1: Create `rules/seo.md`

**Why first:** This is the shared foundation. The agent, skill, and letsgo update all reference it.

**Create:** `rules/seo.md`

```markdown
# SEO Rules

Scope: Marketing pages of any web project. App pages (authenticated/gated) get basics only.

## Page Classification

- MUST: Distinguish marketing pages (public, indexable) from app pages (authenticated, gated).
- MUST: Marketing pages receive full SEO treatment.
- MUST: App pages receive basics only — `<title>` for browser tab, consider `noindex`.
- SHOULD: Let the user classify pages when ambiguous. Do not rely on auto-detection.

## SEO Vitals (all marketing pages)

- MUST: `<html lang="...">` attribute set on root element.
- MUST: `<meta name="viewport" content="width=device-width, initial-scale=1">` present.
- MUST: Unique `<title>` per page (under 60 characters).
- MUST: Unique `<meta name="description">` per page (under 160 characters).
- MUST: Single `<h1>` per page, logical heading hierarchy (no skipped levels).
- MUST: Canonical URL set on every page (`<link rel="canonical">`).
- MUST: Images have meaningful `alt` text (or `alt=""` if purely decorative).
- MUST: No `<meta name="robots" content="noindex">` on production marketing pages.
- SHOULD: Clean URL structure — no UUIDs, no query parameters for content routes.

## SEO Configuration

- MUST: `robots.txt` present and not blocking marketing pages.
- MUST: `sitemap.xml` generated, listing all marketing pages.
- SHOULD: Structured data / JSON-LD on key page types (Article, Product, Organization, FAQ).
- MUST: Open Graph tags set on all marketing pages — `og:title`, `og:description`, `og:image` (1200x630).
- MUST: Twitter Card meta tags set — `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.

## App Pages (basics only)

- MUST: `<title>` set for browser tab display.
- SHOULD: Add `<meta name="robots" content="noindex">` to keep out of search indexes.
- NEVER: Spend time optimizing heading hierarchy, structured data, or social previews for app pages.
```

**Verify:** File exists at `rules/seo.md`, follows the MUST/SHOULD/NEVER convention used by other rules files (see `rules/env.md`, `rules/code-style.md`).

**Commit:** `feat(rules): add seo.md rules file`

---

## Task 2: Create `agents/review/seo-engineer.md`

**Why second:** The agent consumes `rules/seo.md` (Task 1). It needs to exist before wiring into audit (Task 4).

**Create:** `agents/review/seo-engineer.md`

Follow the agent pattern from `agents/review/accessibility-engineer.md` and `agents/review/security-engineer.md`:
- YAML frontmatter with name, model, color, description (with examples), website metadata
- `<advisory>` block
- Role description
- Core review protocol with numbered sections
- Output format with severity levels
- "What NOT to flag" section

```markdown
---
name: seo-engineer
model: sonnet
color: green
description: |
  Use this agent to review web projects for SEO compliance. Checks all vitals from rules/seo.md — meta tags, heading hierarchy, Open Graph, robots.txt, sitemap, structured data, and page classification (marketing vs app). Flags missing or broken SEO elements that would hurt indexing or social sharing.

  <example>
  Context: User is preparing to launch a marketing site.
  user: "Check if my site is ready for SEO"
  assistant: "I'll use the seo-engineer to check all SEO vitals across your marketing pages"
  <commentary>
  Pre-launch SEO review catches missing meta tags, broken sitemaps, and noindex leftovers before they affect indexing.
  </commentary>
  </example>

  <example>
  Context: User has added new pages to their site.
  user: "I added a blog section, is the SEO set up correctly?"
  assistant: "Let me have the seo-engineer audit the blog pages for SEO compliance"
  <commentary>
  New page sections often miss meta descriptions, structured data, or OG images that existing pages have.
  </commentary>
  </example>
website:
  desc: SEO vitals and indexing checker
  summary: Checks meta tags, headings, Open Graph, sitemap, robots.txt, and structured data across marketing pages.
  what: |
    The SEO engineer reviews your marketing pages for completeness — every vital from the SEO rules. It checks that titles and descriptions exist and are unique, headings follow hierarchy, OG tags are set for social sharing, robots.txt isn't blocking important pages, sitemap lists all routes, and structured data is present where it should be. App pages get a lighter check (just title and noindex).
  why: |
    Missing a meta description doesn't break your app, but it kills your click-through rate on Google. Missing an OG image makes your link look broken on Twitter. This reviewer catches the SEO gaps that are invisible until someone searches for you or shares your link.
  usedBy:
    - audit
---

<advisory>
Your findings are advisory. Frame issues as observations and questions, not mandates.
The developer knows their project's goals better than you do. Push hard only on
genuinely dangerous issues (broken indexing, noindex in production). For everything else, explain
the tradeoff and let them decide.
</advisory>

You are an SEO Specialist focused on technical SEO compliance for web projects. You check that all essential SEO elements are present and correctly configured across marketing pages, while respecting the lighter requirements for authenticated app pages.

## Reference

SEO rules are documented in `${CLAUDE_PLUGIN_ROOT}/rules/seo.md`. Read this before reviewing. It defines page classification (marketing vs app), all required vitals, and configuration requirements.

## Core Review Protocol

### 1. Page Classification

Before checking anything, determine which pages are marketing (public, indexable) and which are app (authenticated, gated):

- Look for route groups: `(marketing)`, `(public)`, `(app)`, `(dashboard)`
- Look for auth middleware or layout boundaries
- Look for `noindex` tags that signal intentionally gated pages
- **If ambiguous, note it in findings** — don't guess

Marketing pages get the full checklist. App pages only get checked for basics (title, noindex).

### 2. HTML Foundations

For every marketing page:
- `<html lang="...">` attribute present and set to correct language?
- `<meta name="viewport">` present?
- `<meta charset="utf-8">` or equivalent declared?

### 3. Meta Tags

For every marketing page:
- `<title>` present, unique across pages, under 60 characters?
- `<meta name="description">` present, unique across pages, under 160 characters?
- Are any titles generic ("Home", "Page", "Untitled")?
- Are any descriptions duplicated across pages or boilerplate?

### 4. Heading Hierarchy

For every marketing page:
- Exactly one `<h1>` per page?
- Headings follow logical order (h1 → h2 → h3, no skipped levels)?
- `<h1>` content is meaningful (not just the site name)?

### 5. Canonical URLs

- `<link rel="canonical">` present on every marketing page?
- Canonical URLs are absolute (not relative)?
- No pages pointing canonical to a different page unintentionally?

### 6. Image Alt Text

- Do meaningful images have descriptive `alt` attributes?
- Are decorative images marked with `alt=""`?
- Are any `alt` attributes generic ("image", "photo", "screenshot")?

### 7. Indexing Controls

- `robots.txt` present in public directory?
- `robots.txt` not blocking marketing pages?
- No `<meta name="robots" content="noindex">` on production marketing pages?
- Common pitfall: Vercel preview deployment noindex leaking to production

### 8. Sitemap

- `sitemap.xml` exists?
- Sitemap lists all marketing pages?
- Sitemap doesn't list app/gated pages?
- Sitemap referenced in `robots.txt`?

### 9. Open Graph & Social

- `og:title`, `og:description`, `og:image` set on all marketing pages?
- `og:image` dimensions are 1200x630?
- `twitter:card` meta tag present?
- `twitter:title`, `twitter:description`, `twitter:image` set?

### 10. Structured Data

- JSON-LD present on key page types (homepage, blog posts, product pages)?
- Schema types appropriate for content (Article, Product, Organization, FAQ)?
- No invalid or empty structured data blocks?

## Output Format

For each finding, provide:

```
**[Severity]** [Brief title]
File: [path:line]
Issue: [What's wrong]
Impact: [How this affects SEO/indexing/sharing]
Fix: [Specific change needed]
```

Severity levels:
- **Critical**: Indexing is broken — noindex on production marketing pages, robots.txt blocks everything, no sitemap, no titles
- **High**: Core SEO element missing on marketing pages — missing descriptions, no OG image, no canonical, no h1, missing alt text
- **Medium**: Suboptimal but not broken — generic titles, duplicated descriptions, missing structured data on some pages

## Scope Boundaries

When running alongside other reviewers in `/arc:audit`, avoid overlapping with:

**Defer to accessibility-engineer:**
- Color contrast issues
- Keyboard navigation
- ARIA labels and roles on interactive elements
- Screen reader compatibility
- Focus management

**SEO-engineer owns (even though they overlap with accessibility):**
- Image alt text — from an indexing/image search perspective
- Heading hierarchy — from a crawler/content structure perspective
- Semantic HTML — from a crawlability perspective
- Page language attribute — from an indexing perspective

When both agents flag the same element (e.g., missing alt text), frame the SEO finding in terms of search impact, not accessibility impact. Let the accessibility-engineer handle the assistive technology angle.

## What NOT to Flag

- App/dashboard pages missing SEO elements beyond title (that's expected)
- Pages intentionally set to noindex (admin, settings, auth flows)
- Missing structured data on pages where it's not applicable (contact, terms, privacy)
- Alt text style preferences (as long as it's descriptive)
- Title/description wording quality (presence and uniqueness only — the /arc:seo skill handles quality)
```

**Verify:** File follows the agent pattern (frontmatter with name/model/color/description/website, advisory block, role, protocol sections, output format, severity levels, "What NOT to flag"). Compare structure against `agents/review/accessibility-engineer.md`.

**Commit:** `feat(agents): add seo-engineer review agent`

---

## Task 3: Create `skills/seo/SKILL.md`

**Why third:** The skill references `rules/seo.md` (Task 1) and the agent pattern (Task 2). This is the main deliverable.

**Create:** `skills/seo/SKILL.md`

Follow the skill pattern from `skills/test/SKILL.md` and `skills/letsgo/SKILL.md`:
- YAML frontmatter with name, description, license, metadata, website
- Context blocks (tasklist, progress, rules)
- Process section with numbered steps
- Success criteria
- Progress append template

```markdown
---
name: seo
description: |
  Deep SEO audit for web projects. Analyzes codebase for crawlability, indexability, on-page SEO,
  structured data, social previews, and technical foundations. Optionally runs Lighthouse and
  PageSpeed against a live URL. Reports findings with severity, offers direct fixes or /arc:detail plans.
  Use when asked to "audit SEO", "check SEO", "review SEO", or "is my site SEO-ready".
license: MIT
metadata:
  author: howells
website:
  order: 12
  desc: Deep SEO audit
  summary: Comprehensive SEO audit covering crawlability, meta tags, structured data, social previews, and optional live site analysis with Lighthouse and PageSpeed.
  what: |
    SEO audits your marketing pages across six categories: crawlability (robots.txt, sitemaps, noindex), indexability (canonicals, duplicates, hreflang), on-page (titles, descriptions, headings, alt text, URLs), structured data (JSON-LD, schema types), social previews (OG tags, Twitter Cards), and technical foundations (lang, viewport, charset). It distinguishes marketing pages from app pages—you tell it which is which. Optionally runs Lighthouse and PageSpeed against a live URL, with results folded into the report. Findings are severity-graded, and you can fix quick wins directly or generate an /arc:detail plan for larger efforts.
  why: |
    Your app works perfectly but Google can't find it. Your blog post is shared on Twitter with a broken preview. Your pricing page has the same meta description as your homepage. SEO problems are invisible until someone searches for you—this audit catches them before that.
  decisions:
    - You classify pages. The skill detects routes and asks which are marketing vs app. No fragile auto-detection.
    - Live checks are optional but blocking. If you provide a URL and opt in, Lighthouse/PageSpeed results go in the report. You wait, but you get a complete picture.
    - Fix scale determines next step. 1-3 files, fix now. 4-10, your choice. 10+, generate a plan.
  agents:
    - seo-engineer
---

<tasklist_context>
**Use TaskList tool** to check for existing tasks related to this work.

If a related task exists, note its ID and mark it `in_progress` with TaskUpdate when starting.
</tasklist_context>

<rules_context>
**Read SEO rules NOW:**

**Use Read tool:** `${CLAUDE_PLUGIN_ROOT}/rules/seo.md`

This defines page classification (marketing vs app), all required vitals, and configuration requirements. The skill goes deeper than these rules, but they are the shared baseline.
</rules_context>

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for recent changes that might affect SEO (new pages, redesigns, migrations).
</progress_context>

# SEO Audit Workflow

Deep SEO audit for web projects. Analyzes codebase for technical SEO compliance, content optimization, and social sharing readiness. Optionally validates against a live site.

## Process

### Phase 1: Detect & Classify

#### Step 1: Detect Framework

**Use Glob + Grep to detect project type:**

| Check | Tool | Pattern |
|-------|------|---------|
| Next.js | Grep | `"next"` in `package.json` |
| Remix | Grep | `"@remix-run"` in `package.json` |
| Astro | Grep | `"astro"` in `package.json` |
| SvelteKit | Grep | `"@sveltejs/kit"` in `package.json` |
| Nuxt | Grep | `"nuxt"` in `package.json` |
| Static HTML | Glob | `*.html` in root or `public/` |

Record framework — this determines where to look for routes, meta tags, and config.

#### Step 2: Find All Routes/Pages

**Framework-specific route discovery:**

| Framework | Glob Pattern | Route Pattern |
|-----------|-------------|---------------|
| Next.js (App Router) | `app/**/page.{tsx,jsx,ts,js}` | Directory = route |
| Next.js (Pages Router) | `pages/**/*.{tsx,jsx,ts,js}` | File = route |
| Remix | `app/routes/**/*.{tsx,jsx,ts,js}` | File = route |
| Astro | `src/pages/**/*.{astro,md,mdx}` | File = route |
| SvelteKit | `src/routes/**/+page.svelte` | Directory = route |
| Static HTML | `**/*.html` | File = route |

Present discovered routes to user.

#### Step 3: Classify Pages

**Ask the user to classify pages:**

Present the route list and ask which are app-only (authenticated/gated). Use AskUserQuestion with multiSelect.

Default: treat all as marketing unless user marks as app-only.

Example:
```
"I found these routes. Which are app pages (authenticated/gated)?
Marketing pages get full SEO audit. App pages get basics only (title, noindex)."

Routes:
- / (homepage)
- /about
- /pricing
- /blog
- /blog/[slug]
- /dashboard
- /settings
- /api/*
```

API routes are automatically excluded from SEO checks.

#### Step 4: Check Existing SEO Config

**Scan for what's already in place:**

| Check | Where to Look |
|-------|--------------|
| robots.txt | `public/robots.txt`, `app/robots.ts` (Next.js) |
| sitemap | `public/sitemap.xml`, `app/sitemap.ts` (Next.js) |
| Meta setup | Root layout, page-level metadata exports |
| Structured data | JSON-LD in layouts or pages |
| OG images | `app/opengraph-image.*`, static OG images in public/ |
| Favicons | `app/icon.*`, `app/favicon.ico`, `public/favicon.ico` |

Report what exists:
```markdown
## Existing SEO Config
- ✓ robots.txt present
- ✓ Meta titles in root layout
- ✗ sitemap.xml missing
- ✗ No structured data found
- ✗ OG images not configured
```

#### Step 5: Ask for Live URL

"Do you have a live URL (dev or production) for this site? If so, I can run Lighthouse and PageSpeed for additional analysis. This is optional."

If provided, store for Phase 2.

### Phase 2: Audit

Run checks against the codebase, organized by category. Marketing pages get full treatment. App pages get basics only.

#### Category 1: Crawlability

- **robots.txt** — Present? Any marketing paths blocked? Sitemap referenced?
- **Meta robots** — Any marketing pages with `noindex`? Common pitfall: Vercel preview noindex leaking to production.
- **Sitemap** — Present? Lists all marketing pages? Doesn't list app pages? Dynamically generated or static?
- **Redirect chains** — Any 301 → 301 → page chains? (Check middleware, vercel.json, next.config redirects)

#### Category 2: Indexability

- **Canonical tags** — Present on every marketing page? Absolute URLs? Self-referencing where appropriate?
- **Duplicate content** — Same title or description on multiple pages? Multiple URLs serving identical content?
- **Hreflang** — If i18n detected (next-intl, i18next, locale folders): hreflang tags present? Return links correct?

#### Category 3: On-Page

- **Titles** — Present? Unique per page? Under 60 chars? Not generic ("Home", "Page", "Untitled")? Descriptive of page content?
- **Meta descriptions** — Present? Unique per page? Under 160 chars? Not boilerplate? Includes call-to-action where appropriate?
- **Heading hierarchy** — Single h1 per page? Logical nesting (h1 → h2 → h3)? No skipped levels? h1 content meaningful?
- **Image alt text** — All meaningful images have descriptive alt? Decorative images use alt=""? No generic alt ("image", "photo")?
- **URL structure** — Clean, readable URLs? No UUIDs? No excessive nesting? No query params for content pages?

#### Category 4: Structured Data

- **Presence** — JSON-LD blocks present on key page types?
- **Schema types** — Appropriate for content?
  - Homepage: Organization or WebSite
  - Blog posts: Article or BlogPosting
  - Product pages: Product
  - FAQ pages: FAQPage
  - About: Organization or Person
- **Coverage gaps** — Some page types have structured data but others don't?
- **Validity** — Required properties present for each schema type?

#### Category 5: Social & Meta

- **Open Graph** — og:title, og:description, og:image set on all marketing pages?
- **OG image** — 1200x630 dimensions? Exists and loads?
- **Twitter Cards** — twitter:card type set (summary or summary_large_image)? twitter:title, twitter:description, twitter:image present?
- **Consistency** — OG title/description match or complement the page title/description?

#### Category 6: Technical Foundations

- **Language** — `<html lang="...">` set to correct language code?
- **Viewport** — `<meta name="viewport" content="width=device-width, initial-scale=1">` present?
- **Charset** — `<meta charset="utf-8">` or equivalent declared?
- **HTTPS** — Site enforces HTTPS? No mixed content?

#### Live Site Checks (Optional)

If user provided a live URL and wants live checks:

"Running Lighthouse and PageSpeed on `[URL]`. This may take a moment."

**Run programmatic tools (blocking — results go into the report):**

```bash
# Lighthouse SEO audit
npx lighthouse [URL] --output=json --only-categories=seo --chrome-flags="--headless=new" 2>/dev/null

# Lighthouse Performance (Core Web Vitals)
npx lighthouse [URL] --output=json --only-categories=performance --chrome-flags="--headless=new" 2>/dev/null
```

**PageSpeed Insights API (no key needed for light usage):**
```
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=[URL]&category=seo&strategy=mobile
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=[URL]&category=seo&strategy=desktop
```

**If user wants full-site crawl:**
```bash
npx unlighthouse --site [URL] --reporter jsonExpanded
```

**Failure handling:** If any check fails (timeout, auth wall, network error), note in the report: "Could not access [URL] — [reason]. Skipping live check." Continue with codebase-only findings.

**Extract from Lighthouse JSON:**
- SEO score (0-100)
- Specific audit failures (missing meta descriptions, missing alt text, etc.)
- Core Web Vitals (LCP, CLS, INP)

**Extract from PageSpeed API:**
- Mobile and desktop SEO scores
- Opportunities for improvement

### Phase 3: Report & Act

#### Step 1: Generate Report

**Create:** `docs/audits/YYYY-MM-DD-seo-audit.md`

```markdown
# SEO Audit Report

**Date:** YYYY-MM-DD
**Framework:** [detected framework]
**Marketing pages:** [count]
**App pages:** [count] (basics only)
**Live URL:** [URL or "not provided"]
**Live checks:** [run / not run]

## Summary

[1-2 paragraph overview of findings]

- **Critical:** X issues
- **High:** X issues
- **Medium:** X issues

## Critical Issues

> Indexing is broken or severely impaired

### [Issue Title]
**File:** `path/to/file.ts:123`
**Category:** [Crawlability / Indexability / On-page / etc.]
**Issue:** [What's wrong]
**Impact:** [How this affects SEO]
**Fix:** [Specific change needed]

## High Priority

> Core SEO elements missing

[Same format per finding]

## Medium Priority

> Suboptimal but not broken

[Same format per finding]

## Live Site Results

> From Lighthouse and PageSpeed (if run)

**Lighthouse SEO Score:** [X/100]
**Core Web Vitals:**
- LCP: [value] — [good/needs improvement/poor]
- CLS: [value] — [good/needs improvement/poor]
- INP: [value] — [good/needs improvement/poor]

**PageSpeed:**
- Mobile SEO: [X/100]
- Desktop SEO: [X/100]

[Specific audit failures from Lighthouse]

## Manual Validation Tools

Check these tools for additional validation:
- [Google Rich Results Test](https://search.google.com/test/rich-results?url=[URL])
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/?q=[URL])
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Framework-Specific Recommendations

[Tailored to detected framework — Next.js Metadata API, Astro SEO patterns, etc.]
```

#### Step 2: Determine Fix Approach

Count the number of files affected by findings.

**Fix heuristic:**
- **1-3 files affected:** Offer to fix directly. "I found [N] issues across [N] files. I can fix these now. Should I?"
- **4-10 files affected:** Give the user a choice. "There are [N] issues across [N] files. Want me to fix them now, or create an implementation plan with `/arc:detail`?"
- **10+ files affected:** Recommend a plan. "There are [N] issues across [N] files. This needs a structured approach. Want me to create an implementation plan with `/arc:detail`?"

**Use AskUserQuestion** to present the appropriate options based on file count.

#### Step 3: Framework-Specific Advice

Tailor recommendations to the detected framework:

**Next.js (App Router):**
- Use Metadata API (`export const metadata` or `generateMetadata`)
- Use `opengraph-image.tsx` for dynamic OG images
- Use `robots.ts` for programmatic robots.txt
- Use `sitemap.ts` for dynamic sitemap generation
- Use `icon.tsx` for dynamic favicons

**Next.js (Pages Router):**
- Use `next/head` for meta tags
- Use `next-seo` package or custom SEO component
- Static sitemap generation with `next-sitemap`

**Remix:**
- Use `meta` function exports per route
- Handle OG images in resource routes

**Astro:**
- Use `<head>` in layout components
- SEO component pattern for reusable meta
- Built-in sitemap integration (`@astrojs/sitemap`)

**Other:**
- Standard HTML meta tag patterns
- Suggest popular SEO packages if applicable

#### Step 4: Commit Report

```bash
mkdir -p docs/audits
git add docs/audits/YYYY-MM-DD-seo-audit.md
git commit -m "docs: add SEO audit report"
```

#### Step 5: Present Summary & Next Steps

```
## SEO Audit Complete

**Scope:** [N] marketing pages, [N] app pages
**Live checks:** [Yes — score X/100 / No]
**Report:** docs/audits/YYYY-MM-DD-seo-audit.md

### Findings
- Critical: X | High: X | Medium: X
- Files affected: X

### [Fix option based on heuristic]
```

<success_criteria>
SEO audit is complete when:
- [ ] Framework detected
- [ ] Routes discovered and classified (marketing vs app)
- [ ] Existing SEO config checked
- [ ] All 6 categories audited against marketing pages
- [ ] App pages checked for basics (title, noindex)
- [ ] Live site checks run (if opted in) and results in report
- [ ] Report generated in docs/audits/
- [ ] Report committed
- [ ] Fix approach offered (direct fix, plan, or done)
- [ ] Framework-specific recommendations included
- [ ] Manual validation tool links included (with pre-filled URLs if live URL provided)
- [ ] Progress journal updated
</success_criteria>

## Interop

- Reads **rules/seo.md** for baseline vitals
- References **/arc:detail** for creating implementation plans (10+ file fixes)
- Can be invoked after **/arc:letsgo** for deeper analysis
- SEO agent (**seo-engineer**) handles the lighter audit in `/arc:audit`

<progress_append>
After completing the SEO audit, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:seo
**Task:** SEO audit for [project/scope]
**Outcome:** [Complete / Issues found]
**Files:** docs/audits/YYYY-MM-DD-seo-audit.md
**Decisions:**
- Marketing pages: [N]
- Critical: [N], High: [N], Medium: [N]
- Live checks: [run / not run]
**Next:** [Fix issues / Create plan / Done]

---
```
</progress_append>
```

**Verify:** File follows skill pattern (frontmatter, context blocks, process, success criteria, interop, progress append). Compare structure against `skills/test/SKILL.md` and `skills/letsgo/SKILL.md`.

**Commit:** `feat(skills): add /arc:seo deep SEO audit skill`

---

## Task 4: Wire `seo-engineer` into `/arc:audit`

**Why fourth:** Agent and rules exist (Tasks 1-2). Now connect them to audit's reviewer selection.

**Modify:** `skills/audit/SKILL.md`

### Change 1: Add conditional reviewer selection

In Phase 2 "Select Reviewers", section "Conditional additions" (around line 240-247), add:

```markdown
- If project has marketing/public pages (pre-launch/production stage) → add `seo-engineer`
```

### Change 2: Add focus flag

In "Focus flag overrides" section (around line 249-256), add:

```markdown
- `--seo` → only `seo-engineer`
```

### Change 3: Add to rules-passing table

In the `rules_context` section "For each reviewer, pass domain-specific core rules" table (around line 80-92), add:

```markdown
| seo-engineer | seo.md |
```

### Change 4: Add model selection

In Phase 3 "Model selection per reviewer" table (around line 289-303), add:

```markdown
| seo-engineer | sonnet | Pattern recognition for SEO elements |
```

### Change 5: Add to argument hint

In the frontmatter `argument-hint` (line 12), add `--seo` to the list of focus flags.

**Verify:** Run a mental walkthrough of audit with `--seo` flag: it should select only `seo-engineer`, pass `seo.md` rules, run at sonnet, and produce findings in the standard audit format.

**Commit:** `feat(audit): wire seo-engineer into reviewer selection`

---

## Task 5: Update letsgo Section C

**Why fifth:** Rules file exists (Task 1). Now update the checklist to be complete.

**Modify:** `skills/letsgo/SKILL.md`

### Change 1: Expand Section C checklist

Expand the current Section C checklist items (lines 158-165 only). **Preserve all content below line 165** — the OG image guidance, favicon guidance, and everything in Section D onward must remain untouched.

Replace these 7 checklist items:

```markdown
### C. SEO & Meta (Always for public sites)
- [ ] Page titles set (unique, <60 chars per page)
- [ ] Meta descriptions written (<160 chars per page)
- [ ] Canonical URLs set (avoid duplicate content)
- [ ] robots.txt configured
- [ ] sitemap.xml generated and submitted
- [ ] Structured data / JSON-LD (if applicable)
- [ ] Rich Results Test passing
```

With these 13 items:

```markdown
### C. SEO & Meta (Always for public sites)

> Reference: `${CLAUDE_PLUGIN_ROOT}/rules/seo.md` for full SEO rules.

- [ ] `<html lang="...">` attribute set
- [ ] `<meta name="viewport">` present
- [ ] Page titles set (unique, <60 chars per page)
- [ ] Meta descriptions written (unique, <160 chars per page)
- [ ] Single `<h1>` per page, logical heading hierarchy
- [ ] Canonical URLs set (avoid duplicate content)
- [ ] Images have meaningful `alt` text
- [ ] No `noindex` on production marketing pages (check for Vercel preview leftover)
- [ ] Clean URL structure (no UUIDs, no query params for content)
- [ ] robots.txt configured and not blocking marketing pages
- [ ] sitemap.xml generated and submitted
- [ ] Structured data / JSON-LD (if applicable)
- [ ] Rich Results Test passing

*For a comprehensive SEO audit, run `/arc:seo`.*
```

**Verify:** Section C now covers all vitals from `rules/seo.md` as a checklist. The section stays as one block. The `/arc:seo` pointer is at the bottom.

**Commit:** `feat(letsgo): expand SEO checklist with all vitals from seo.md`

---

## Task 6: Update plugin metadata

**Why last:** All files exist. Update counts and any references.

**Modify:** `.claude-plugin/plugin.json`

Bump version to `1.0.80` (new skill added).

**Modify:** `CLAUDE.md`

Add `/arc:seo` to the command workflow table:

In the "Command Workflow" section, add under "CROSS-CUTTING (available anytime)":
```markdown
              /arc:seo      → Deep SEO audit
```

Add to the "Structure" tree:
```markdown
│   ├── seo/SKILL.md        # Cross-cutting: SEO audit
```

Update agent count in description if referenced.

**Verify:** Plugin validates (the pre-commit hook runs plugin validation automatically).

**Commit:** `chore: bump version to 1.0.80, add seo to docs`

---

## Task Order Summary

| # | Task | File(s) | Type |
|---|------|---------|------|
| 1 | Create SEO rules | `rules/seo.md` | Create |
| 2 | Create SEO agent | `agents/review/seo-engineer.md` | Create |
| 3 | Create SEO skill | `skills/seo/SKILL.md` | Create |
| 4 | Wire agent into audit | `skills/audit/SKILL.md` | Modify |
| 5 | Update letsgo Section C | `skills/letsgo/SKILL.md` | Modify |
| 6 | Update plugin metadata | `plugin.json`, `CLAUDE.md` | Modify |

Dependencies: Task 1 → Tasks 2, 3, 4, 5. Task 2 → Task 4. All → Task 6.
