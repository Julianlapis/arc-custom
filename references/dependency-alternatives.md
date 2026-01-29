# Dependency Alternatives Reference

Modern replacements for common npm packages. Used by `/arc:deps` to recommend lighter, faster, or built-in alternatives during dependency audits.

## How This Works

`/arc:deps` uses a two-tier lookup system:

1. **Tier 1 — Curated table (this file):** Instant lookup for known replacements. Covers the most common packages that have clear, well-tested alternatives.
2. **Tier 2 — Web search fallback:** For flagged dependencies not in this table (2+ major versions outdated, critical/high CVE, or deprecated), the skill searches the web for alternatives.

The curated table handles the majority of real-world cases. Web search catches the long tail.

## Curated Alternatives

| Package | Alternative | Reason | Migration Effort |
|---------|-------------|--------|-----------------|
| lodash | es-toolkit | 97% smaller, modern ESM, tree-shakeable | Medium — API differs slightly |
| underscore | es-toolkit | Same story as lodash | Medium |
| moment | date-fns | Immutable, tree-shakeable, actively maintained | Medium — API differs |
| request | native fetch / undici | request is deprecated, fetch is built-in since Node 18 | Medium — different API |
| axios | ky / native fetch | Smaller, modern, fetch-based | Low — ky has similar API |
| classnames | clsx | Smaller, faster, drop-in replacement | Low — API compatible |
| uuid | crypto.randomUUID() | Built-in, no dependency needed | Low — one-line replacement |
| chalk | picocolors | 14x smaller, faster | Low — similar API |
| dotenv | Node --env-file flag | Built-in since Node 20.6 | Low — CLI flag change |
| node-fetch | native fetch | Built-in since Node 18 | Low — API compatible |
| rimraf | fs.rm({ recursive: true }) | Built-in since Node 14.14 | Low — one-line replacement |
| mkdirp | fs.mkdir({ recursive: true }) | Built-in since Node 10.12 | Low — one-line replacement |
| glob | fs.glob() / tinyglobby | fs.glob built-in in Node 22, tinyglobby for older | Low — similar API |
| express | hono | Lighter, modern, works on edge/serverless | High — different patterns |
| body-parser | express built-in | Built into Express 4.16+ via express.json() | Low — remove import |
| cors | hono/cors or manual headers | Middleware bloat for a few response headers | Low |

## When to Search the Web

The skill triggers a web search for packages NOT in this table that meet any of these criteria:

- **2+ major versions outdated** — The package may have been superseded
- **Critical or high CVE** — A vulnerability may indicate the package is unmaintained
- **Marked deprecated on npm** — The author has explicitly abandoned it

The search query format: `"alternative to [package-name] npm 2026"`

If the search returns no clear alternative, the skill reports "no clear alternative found" and moves on. Not every package needs replacing.

## Adding New Entries

When you discover a new alternative worth adding:

1. Verify the alternative is actively maintained (check GitHub stars, recent commits, npm downloads)
2. Verify the alternative solves the same problem (not just a tangential tool)
3. Estimate migration effort:
   - **Low** — Drop-in replacement or one-line change
   - **Medium** — API differs but concepts map 1:1
   - **High** — Different patterns, significant rewrite needed
4. Add the entry to the table above in alphabetical order by package name

## Packages NOT to Flag

Some packages have no good alternative or are still the best choice:

- **react** — No alternative in the React ecosystem
- **next** — The framework itself
- **typescript** — The compiler
- **eslint** — The linter (biome covers some but not all)
- **prettier** — The formatter (biome covers some but not all)
- **tailwindcss** — The utility CSS framework
- **zod** — The validation library (best in class)
- **drizzle-orm** — The ORM (modern, actively maintained)

These are healthy, actively maintained packages that don't need alternatives. The skill should skip these during alternative discovery.
