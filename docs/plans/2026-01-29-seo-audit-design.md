# SEO Audit Design

## Problem Statement

SEO currently lives in one place: Section C of `/arc:letsgo`, a 7-item checklist covering meta tags, robots.txt, sitemap, and structured data. This is fine as a pre-launch vitals check, but there's no way to do a deep SEO audit — checking quality, not just presence. Arc has 20+ review agents for security, performance, accessibility, and design, but nothing for SEO.

## Approach

Three layers, each with a distinct job:

| Layer | File | Job |
|-------|------|-----|
| Shared rules | `rules/seo.md` | SEO vitals + page classification rule |
| Audit agent | `agents/review/seo-engineer.md` | Light completeness check for `/arc:audit` |
| Standalone skill | `skills/seo/SKILL.md` | Deep interactive SEO audit |

Plus an update to letsgo Section C to add missing vitals and reference the rules file.

### Why three layers

- **Rules file** has two real consumers from day one (letsgo + audit agent), with the skill going deeper than the rules.
- **Agent** keeps `/arc:audit` aware of SEO without making it a deep dive. Audit flags what's missing; the skill judges what's good.
- **Skill** is the product. Interactive, deep, framework-aware, with live site checks and actionable fixes.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Skill + agent, not just one | Agent plugs into audit for critical flags. Skill is standalone for deep work. Different jobs. |
| Marketing vs app page detection is user-driven | Auto-detecting route groups is fragile across frameworks. Skill detects routes, presents list, user confirms which are app-only. |
| Live site checks are blocking when opted in | Results are part of the audit report, not a separate step. If user provides a URL and opts in, the audit waits for results. |
| Fix heuristic based on file count | 1-3 files: fix directly. 4-10: ask. 10+: offer `/arc:detail` plan. |
| Browser-only tools listed as reference links | Twitter Card Validator, Facebook Debugger, LinkedIn Inspector require auth. Can't automate. Pre-fill URLs where possible. |
| letsgo Section C stays as one section | No split into "Configuration" vs "Foundations." One section, all vitals, user scans top to bottom. |

## Layer 1: `rules/seo.md`

~30 lines. The shared baseline.

```markdown
## Page Classification

- Marketing pages (public, indexable): full SEO treatment
- App pages (authenticated, gated): basics only (title, noindex)

## SEO Vitals (all marketing pages)

- <html lang="..."> attribute set
- <meta name="viewport"> present
- Unique <title> per page (<60 chars)
- Unique <meta name="description"> per page (<160 chars)
- Single <h1> per page, logical heading hierarchy (no skipped levels)
- Canonical URLs set
- Images have meaningful alt text (or alt="" if decorative)
- No <meta name="robots" content="noindex"> on production marketing pages
- Clean URL structure (no UUIDs, no query params for content routes)

## SEO Configuration

- robots.txt configured and not blocking marketing pages
- sitemap.xml generated, listing all marketing pages
- Structured data / JSON-LD on key page types (if applicable)
- og:title, og:description, og:image (1200x630) set on all marketing pages
- Twitter Card meta tags set (twitter:card, twitter:title, twitter:description, twitter:image)

## App Pages (basics only)

- <title> set (for browser tab)
- Consider noindex to keep out of search
```

## Layer 2: `agents/review/seo-engineer.md`

Light agent for `/arc:audit`. Checks all vitals from `rules/seo.md` for presence/absence.

**What it checks:** Everything in the rules file. Full vitals list.

**What it does NOT check (skill's job):**
- Quality of titles/descriptions (length ok, but is the content good?)
- Heading hierarchy quality beyond "is there an h1?"
- Alt text completeness across all images
- Structured data validity/depth
- URL structure quality
- Redirect chains
- Live site performance
- Content optimization

**Severity calibration:**
- **Critical:** Indexing broken — noindex on production marketing pages, robots.txt blocks everything, no sitemap
- **High:** Any vital from rules/seo.md missing on marketing pages — title, description, canonical, OG tags, lang, viewport, h1, alt text
- **Medium:** Vitals missing on app pages that should have basics (no title)

**Conditional inclusion in audit:**
- Runs at `pre-launch` and `production` stages
- Skipped for `prototype` and `development`

**Wiring into audit:** Add `seo-engineer` to the conditional reviewer selection in `skills/audit/SKILL.md`, alongside existing conditional additions (data-engineer for DB, designer for UI, etc.).

## Layer 3: `skills/seo/SKILL.md`

Standalone deep audit. Three phases.

### Phase 1: Detect & Classify

1. **Detect framework** — Next.js, Remix, Astro, etc. (same pattern as audit detection)
2. **Find all routes/pages** — Framework-aware route discovery
3. **Present route list to user** — Ask which routes are app-only (gated/authenticated). Default: treat all as marketing unless user says otherwise.
4. **Check existing SEO config** — What's already in place (robots.txt, sitemap, meta setup, structured data, OG images)
5. **Ask for live URL** — Optional. If provided, used for programmatic live checks in Phase 2.

### Phase 2: Audit

Runs against the codebase. Marketing pages get full treatment. App pages get basics only.

| Category | Checks |
|----------|--------|
| **Crawlability** | robots.txt rules (any marketing paths blocked?), meta robots tags, noindex leftovers (Vercel preview?), sitemap completeness vs actual routes, redirect chains (301 → 301 → page) |
| **Indexability** | Canonical tags (present, correct, self-referencing where needed), duplicate content signals (same title/description on multiple pages), hreflang tags if i18n detected |
| **On-page** | Title quality (length, uniqueness, not generic like "Home"), meta description quality (length, uniqueness, not boilerplate), heading hierarchy (single h1, logical nesting h1>h2>h3, no skipped levels), image alt text audit (missing, empty on non-decorative, overly generic like "image"), URL cleanliness (no UUIDs, no excessive nesting, no query params for content) |
| **Structured data** | JSON-LD present on key page types, valid schema types for content (Article, Product, Organization, FAQ, etc.), coverage gaps (blog has it, pricing doesn't) |
| **Social & meta** | OG tags complete on all marketing pages, og:image dimensions (1200x630), Twitter Card type and tags, consistency across platforms (title/description match) |
| **Technical foundations** | `<html lang>` set, viewport meta present, charset declared, HTTPS enforcement |

**If live URL provided and user opts in:**

Run programmatic checks (blocking — results go into the report):

| Tool | Command | What it adds |
|------|---------|-------------|
| Lighthouse SEO | `npx lighthouse <url> --output=json --only-categories=seo` | SEO score, specific issues |
| Lighthouse Performance | `npx lighthouse <url> --output=json --only-categories=performance` | Core Web Vitals (LCP, CLS, FID) |
| PageSpeed Insights API | `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<url>&category=seo` | Mobile + desktop SEO scores |
| Unlighthouse | `npx unlighthouse --site <url>` | Full-site crawl with Lighthouse (if user wants all pages, not just one) |

Warn user that live checks add time. If a check fails (timeout, auth wall, network error), note it in the report as "could not access" and continue.

**Browser-only tools (reference links in report, pre-fill URL where possible):**
- [Google Rich Results Test](https://search.google.com/test/rich-results?url=URL)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/?q=URL)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Phase 3: Report & Act

**Generate report:** `docs/audits/YYYY-MM-DD-seo-audit.md`

Severity-graded findings, organized by category. Each finding includes file:line, what's wrong, and how to fix it.

**Fix heuristic:**
- **1-3 files affected:** "I can fix these now. Should I?"
- **4-10 files affected:** "Here are the findings. Want me to fix them now, or create a plan?"
- **10+ files affected:** "This needs a plan. Want me to create one with `/arc:detail`?"

**Framework-specific advice:**
- Next.js: Recommend Metadata API, `opengraph-image.tsx`, `robots.ts`, `sitemap.ts`
- Astro: Recommend SEO component patterns
- Remix: Recommend meta function patterns
- Other: Generic HTML/meta tag advice

**Report footer includes:**
- Reference links to browser-only validation tools (pre-filled with live URL if provided)
- Pointer to `/arc:seo` for re-running after fixes
- Live check results (if run)

**Commit report.**

## Layer 4: Letsgo Section C Update

Add missing vitals to the existing "SEO & Meta" section. Keep it as one section.

**Items to add:**
- `<html lang="...">` attribute set
- `<meta name="viewport">` present
- Single `<h1>` per page, logical heading hierarchy
- Images have meaningful `alt` text
- No `noindex` on production marketing pages (common Vercel preview leftover)
- Clean URL structure (no UUIDs, no query params for content routes)

**Add at bottom of Section C:**
> *For a comprehensive SEO audit, run `/arc:seo`.*

Section C references `rules/seo.md` as its source of truth rather than hardcoding.

## Interop

| From | To | How |
|------|-----|-----|
| `/arc:seo` | `/arc:detail` | Offers to create implementation plan for large fix sets (10+ files) |
| `/arc:audit` | `seo-engineer` agent | Conditional: spawns at pre-launch/production stage |
| `/arc:letsgo` | `rules/seo.md` | References vitals for Section C checklist |
| `/arc:letsgo` | `/arc:seo` | Points user to skill for deep audit |
| `seo-engineer` agent | `rules/seo.md` | Reads rules as review context |
| `/arc:seo` skill | `rules/seo.md` | Reads rules as baseline, goes deeper |

## File Structure

```
arc/
├── rules/
│   └── seo.md                          # Shared vitals + page classification
├── agents/
│   └── review/
│       └── seo-engineer.md             # Light agent for /arc:audit
├── skills/
│   ├── seo/
│   │   └── SKILL.md                    # Standalone deep SEO audit
│   └── letsgo/
│       └── SKILL.md                    # Updated Section C
```

## Open Questions

- None remaining. Design is ready for implementation.
