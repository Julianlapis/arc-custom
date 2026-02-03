---
name: documentation-guide
description: Guidelines for generating documentation — audience targeting, content structure, and framework-specific formats
---

# Documentation Guide

Reference for the `/arc:document` skill and docs-writer agent. Covers audience targeting, content structure for each documentation framework, and quality standards for generated docs.

## Audience Guidelines

Every documentation set targets one of three audiences. Determine the audience before writing anything — it shapes tone, content, and structure.

### Developer Docs

**Tone:** Technical, precise, assumes coding knowledge.

**Include:**
- Architecture overview with diagrams or descriptions of how modules connect
- Exported functions and types with full signatures
- Dependency graph (what depends on what)
- Design patterns used and why
- Configuration options with defaults and valid values
- Environment variables with descriptions and examples
- Error codes and their meanings

**Exclude:**
- Step-by-step tutorials (that belongs in user docs)
- Marketing language or feature pitches
- Screenshots of UI (use code references instead)

**Structure:**
```
1. Overview
2. API Reference
3. Architecture
4. Configuration
```

### User Docs

**Tone:** Friendly, clear, assumes product knowledge but not code knowledge.

**Include:**
- What the feature does (in plain language)
- Getting started guide with prerequisites
- Step-by-step configuration with screenshots where helpful
- Troubleshooting common issues
- Examples showing real workflows

**Exclude:**
- Internal architecture details
- Type signatures or function exports
- Dependency information or package internals

**Structure:**
```
1. Overview
2. Getting Started
3. Usage
4. Configuration
5. Troubleshooting
```

### Dual Audience (Both)

When documentation serves both developers and users:

- Start with a shared Overview section
- Split into clearly labeled "For Users" and "For Developers" sections
- Alternatively, use separate files with clear naming (`auth-guide.md` vs `auth-api.md`)
- Never interleave developer and user content — keep them in distinct sections

## Content Structure — Plain Markdown

For projects without a documentation framework.

**File extension:** `.md`

**File naming:** kebab-case, descriptive (e.g., `auth.md`, `getting-started.md`)

**Folder structure:**
```
docs/
├── README.md              # Index with table of contents
├── getting-started.md
├── features/
│   ├── auth.md
│   ├── billing.md
│   └── notifications.md
├── api/
│   ├── endpoints.md
│   └── errors.md
├── architecture/
│   ├── overview.md
│   └── data-flow.md
└── reference/
    ├── configuration.md
    └── environment.md
```

**README.md** serves as the index. It links to all sections with a table of contents:

```markdown
# Project Documentation

## Getting Started
- [Getting Started](./getting-started.md)

## Features
- [Authentication](./features/auth.md)
- [Billing](./features/billing.md)

## API
- [Endpoints](./api/endpoints.md)
- [Error Codes](./api/errors.md)
```

## Content Structure — Fumadocs MDX

For projects using [Fumadocs](https://fumadocs.vercel.app/).

**File extension:** `.mdx`

**Frontmatter** (required on every file):
```yaml
---
title: Authentication
description: How authentication works in the application
---
```

**Sidebar configuration** uses `meta.json` in each folder:
```json
{
  "title": "Features",
  "pages": ["auth", "billing", "notifications"]
}
```

The root `meta.json` lists top-level sections:
```json
{
  "title": "Documentation",
  "pages": ["getting-started", "features", "api", "architecture"]
}
```

**MDX features to use:**
- Callouts for warnings and tips: `<Callout type="warn">` and `<Callout type="info">`
- Tabs for showing alternatives: `<Tabs>` with `<Tab>` children
- Code blocks with titles: ` ```ts title="auth.ts" `

**Folder structure:**
```
content/docs/
├── meta.json
├── getting-started.mdx
├── features/
│   ├── meta.json
│   ├── auth.mdx
│   └── billing.mdx
└── api/
    ├── meta.json
    └── endpoints.mdx
```

## Content Structure — Nextra MDX

For projects using [Nextra](https://nextra.site/).

**File extension:** `.mdx`

**Sidebar configuration** uses `_meta.json` in each folder:
```json
{
  "auth": "Authentication",
  "billing": "Billing",
  "notifications": "Notifications"
}
```

Keys are filenames (without extension), values are display titles. Order in the JSON determines sidebar order.

**Folder structure:**
```
pages/docs/
├── _meta.json
├── getting-started.mdx
├── features/
│   ├── _meta.json
│   ├── auth.mdx
│   └── billing.mdx
└── api/
    ├── _meta.json
    └── endpoints.mdx
```

## Content Structure — Docusaurus

For projects using [Docusaurus](https://docusaurus.io/).

**File extension:** `.mdx` (or `.md`)

**Frontmatter:**
```yaml
---
sidebar_position: 1
sidebar_label: Authentication
title: Authentication
description: How authentication works
---
```

**Sidebar configuration** via `sidebars.js` at project root:
```js
module.exports = {
  docs: [
    'getting-started',
    {
      type: 'category',
      label: 'Features',
      items: ['features/auth', 'features/billing'],
    },
    {
      type: 'category',
      label: 'API',
      items: ['api/endpoints', 'api/errors'],
    },
  ],
};
```

**Category metadata** via `_category_.json` in each folder:
```json
{
  "label": "Features",
  "position": 2,
  "collapsed": false
}
```

**Folder structure:**
```
docs/
├── getting-started.mdx
├── features/
│   ├── _category_.json
│   ├── auth.mdx
│   └── billing.mdx
└── api/
    ├── _category_.json
    └── endpoints.mdx
```

## Content Structure — VitePress

For projects using [VitePress](https://vitepress.dev/).

**File extension:** `.md`

**Frontmatter:**
```yaml
---
title: Authentication
description: How authentication works
---
```

**Sidebar configuration** in `.vitepress/config.ts`:
```ts
export default defineConfig({
  themeConfig: {
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/getting-started' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Authentication', link: '/features/auth' },
          { text: 'Billing', link: '/features/billing' },
        ],
      },
    ],
  },
});
```

**Folder structure:**
```
docs/
├── .vitepress/
│   └── config.ts
├── index.md
├── getting-started.md
├── features/
│   ├── auth.md
│   └── billing.md
└── api/
    └── endpoints.md
```

## Content Structure — Starlight (Astro)

For projects using [Starlight](https://starlight.astro.build/).

**File extension:** `.mdx` (or `.md`)

**Frontmatter:**
```yaml
---
title: Authentication
description: How authentication works
---
```

**Sidebar configuration** in `astro.config.mjs`:
```js
export default defineConfig({
  integrations: [
    starlight({
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started' },
          ],
        },
        {
          label: 'Features',
          autogenerate: { directory: 'features' },
        },
        {
          label: 'API',
          items: [
            { label: 'Endpoints', slug: 'api/endpoints' },
          ],
        },
      ],
    }),
  ],
});
```

**Folder structure:**
```
src/content/docs/
├── index.mdx
├── getting-started.mdx
├── features/
│   ├── auth.mdx
│   └── billing.mdx
└── api/
    └── endpoints.mdx
```

## Quality Standards

### Function Documentation

Every documented function includes all of the following:

| Field | Required | Description |
|-------|----------|-------------|
| Signature | Yes | Full function signature with types |
| Description | Yes | What it does in one or two sentences |
| Parameters | Yes | Each parameter with type and description |
| Return type | Yes | What it returns and when |
| Example | Yes | Working usage example |

### Code Examples

- Must be real, extracted from actual source code — never fabricated
- Include imports when they are not obvious
- Show both usage and expected output where applicable
- Use the project's actual coding style (naming conventions, formatting)

### Cross-References

- Use relative links between doc files (e.g., `[Auth API](../api/auth.md)`)
- Never use absolute URLs for internal documentation links
- Verify links resolve to existing files

### Content Rules

- No placeholder text (`TODO`, `Lorem ipsum`, `TBD`)
- Frontmatter must be complete on every doc file — no missing required fields
- Getting-started guides must be testable: a reader following the steps should reach a working state
- Keep descriptions factual — no marketing language or superlatives

## File Naming Convention

- **Format:** kebab-case with `.md` or `.mdx` extension
- **Style:** Descriptive but concise
- **Match:** Name should correspond to the module or feature being documented

**Good:**
- `auth-module.md`
- `api-endpoints.md`
- `getting-started.md`
- `error-handling.md`

**Bad:**
- `Auth Module.md` (spaces, title case)
- `apiEndpoints.md` (camelCase)
- `docs.md` (too vague)
- `the-complete-guide-to-authentication-in-our-app.md` (too long)
