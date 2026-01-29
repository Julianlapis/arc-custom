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
