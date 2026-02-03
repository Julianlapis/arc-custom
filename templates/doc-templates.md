# Documentation Templates

Templates for the `/arc:document` skill. Use these as starting structures — adapt based on audience, framework, and content.

## Reference Doc Template

For documenting a single file, module, or package.

```markdown
---
title: [Module Name]
description: [One-line description of what this module does]
---

# [Module Name]

[2-3 sentence overview: what this module does, when you'd use it, and what problem it solves.]

## Exports

### `functionName(params): ReturnType`

[Description of what it does and when to use it.]

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | `string` | Yes | [description] |
| param2 | `Options` | No | [description] |

**Returns:** `ReturnType` — [description of what's returned]

**Example:**

\`\`\`typescript
import { functionName } from './module'

const result = functionName('value', { option: true })
\`\`\`

## Types

### `TypeName`

[Description of what this type represents and when it's used.]

\`\`\`typescript
type TypeName = {
  field1: string
  field2: number
}
\`\`\`

## Dependencies

- `module-a` — [why this dependency exists]
- `module-b` — [why this dependency exists]

## Used By

- `consumer-a` — [how it uses this module]
- `consumer-b` — [how it uses this module]
```

## Feature Doc Template

For documenting a feature end-to-end across multiple files.

```markdown
---
title: [Feature Name]
description: [One-line description of what this feature does]
---

# [Feature Name]

## Overview

[What this feature does, who it's for, and why it exists. 2-3 sentences.]

## Getting Started

[Minimal steps to start using this feature.]

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Configuration

[All configurable options with defaults and descriptions.]

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| option1 | `string` | `"default"` | [description] |
| option2 | `boolean` | `false` | [description] |

**Environment variables:**

| Variable | Required | Description |
|----------|----------|-------------|
| `VAR_NAME` | Yes | [description] |

## How It Works

[Architecture and data flow — primarily for developer audience.]

### Data Flow

[Describe how data moves through the system for this feature.]

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/feature.ts` | Core logic |
| `src/app/feature/page.tsx` | UI route |
| `src/app/api/feature/route.ts` | API endpoint |

## API Reference

[Endpoints, functions, hooks related to this feature.]

### `POST /api/feature`

[Description]

**Request body:**
\`\`\`json
{
  "field": "value"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "123",
  "status": "created"
}
\`\`\`

## Edge Cases

- [Known limitation or gotcha #1]
- [Known limitation or gotcha #2]

## Troubleshooting

### [Common problem #1]

**Symptom:** [What you see]
**Solution:** [How to fix it]

### [Common problem #2]

**Symptom:** [What you see]
**Solution:** [How to fix it]
```

## Full-Site Index Template

For the README or index page that links to all documentation sections.

```markdown
# [Project Name] Documentation

[One paragraph overview of the project — what it does and who it's for.]

## Getting Started

- [Getting Started Guide](./getting-started.md)

## Features

- [Feature 1](./features/feature-1.md) — [one-line description]
- [Feature 2](./features/feature-2.md) — [one-line description]
- [Feature 3](./features/feature-3.md) — [one-line description]

## API Reference

- [API Overview](./api/overview.md)
- [Endpoints](./api/endpoints.md)

## Architecture

- [Architecture Overview](./architecture/overview.md)

## Reference

- [Components](./reference/components.md)
- [Utilities](./reference/utilities.md)
- [Configuration](./reference/config.md)
```

## Getting Started Template

For the getting-started guide included in full-site documentation.

```markdown
---
title: Getting Started
description: Get up and running with [Project Name]
---

# Getting Started

## Prerequisites

- [Requirement 1] (version X.X+)
- [Requirement 2]

## Installation

\`\`\`bash
[installation command]
\`\`\`

## Quick Start

1. [First step]
   \`\`\`bash
   [command]
   \`\`\`

2. [Second step]
   \`\`\`bash
   [command]
   \`\`\`

3. [Third step — should result in something visible/testable]

## Next Steps

- [Link to first feature guide](./features/feature-1.md)
- [Link to configuration guide](./reference/config.md)
```
