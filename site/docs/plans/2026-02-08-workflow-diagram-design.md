# Workflow Diagram Design

## Problem Statement

The Arc site documents all 24 skills, 35 agents, and 18 rules thoroughly via the content browser (tabs → drawers). But it doesn't show the **workflow itself** — the path from idea to shipped code that gives Arc its name. A new visitor can see everything that exists but can't grasp: which skills form the main path, which are entry points, and which are utilities available anytime.

## Approach

A typographic workflow diagram inserted as a new section on the home page, between the Principles and Content Browser. The diagram is driven entirely by `workflow:` frontmatter in each skill's SKILL.md — no hardcoded workflow data in the site code.

### Aesthetic Direction

- **Tone**: Matches existing site — typographic, restrained, monospace labels
- **Memorable element**: The line-draw animation on page load. The spine draws left-to-right, then nodes fade in with stagger, then agent pips appear.
- **Typography**: Same as site — Inter for body, IBM Plex Mono for labels
- **Color**: Accent `#5A7B7B` for active/hover states, neutral palette otherwise
- **Motion**: Motion library (already installed) with apple easing curves (already used in animated-hero and unified-drawer)

## Data Model

### Frontmatter Addition

Each skill's `website:` section in SKILL.md gets an optional `workflow:` block:

```yaml
# Spine skills — the main left-to-right path
website:
  workflow:
    position: spine
    after: vision      # which skill precedes this one (linked list)

# Branch skills — connect into the spine at a specific point
website:
  workflow:
    position: branch
    joins: implement   # which spine skill they branch from

# Utility skills — standalone, shown in separate row
website:
  workflow:
    position: utility
```

The first spine skill (`go`) has no `after` — it's the start of the chain.

### Skill Classification

**Spine** (main workflow path, left-to-right):
| Skill | After |
|-------|-------|
| go | _(start)_ |
| vision | go |
| ideate | vision |
| review | ideate |
| implement | review |
| testing | implement |
| letsgo | testing |

**Branch** (connect to spine at specific points):
| Skill | Joins |
|-------|-------|
| design | implement |
| build | implement |
| legal | letsgo |

**Utility** (available anytime, no connections):
commit, audit, seo, suggest, deps, responsive, naming, rules, document, tidy

**Internal/hidden** (not shown in diagram):
detail, progress, ai

### Type Changes

```typescript
// In types.ts — add to Skill interface
interface SkillWorkflow {
  position: "spine" | "branch" | "utility";
  after?: string;   // spine only — preceding skill name
  joins?: string;   // branch only — which spine skill to connect to
}

// Skill interface addition
interface Skill {
  // ...existing fields
  workflow?: SkillWorkflow;
}
```

### Content.ts Changes

- Parse `workflow:` from each skill's `website:` frontmatter
- Add `getWorkflowData()` function that:
  1. Collects spine skills, sorts by following `after` chain
  2. Groups branches by their `joins` target
  3. Lists utilities separately
  4. Returns structured data for the component

```typescript
interface WorkflowData {
  spine: Skill[];           // Ordered left-to-right
  branches: Map<string, Skill[]>;  // spine skill name → branch skills
  utilities: Skill[];       // Unconnected skills
}
```

## UI Wireframes

### Desktop (horizontal flow)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  THE WORKFLOW                                                            │
│  (font-mono text-xs uppercase tracking-wider text-neutral-500)          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │   go ─────── vision ─────── ideate ─────── review ───────         │  │
│  │   ●                         ●●●             ●●●                   │  │
│  │                                                                    │  │
│  │   ─────── implement ─────── testing ─────── letsgo                │  │
│  │            ●●●●●●●●●●        ●●●●            ●●                  │  │
│  │              ↑                                  ↑                  │  │
│  │           design                             legal                │  │
│  │           build                                                   │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  AVAILABLE ANYTIME                                                       │
│  (font-mono text-xs uppercase tracking-wider text-neutral-500)          │
│                                                                          │
│  commit · audit · seo · suggest · deps · responsive                     │
│  naming · rules · document · tidy                                        │
│  (font-mono text-sm, clickable, hover accent color)                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Mobile (vertical flow)

```
┌──────────────────────┐
│                      │
│  THE WORKFLOW         │
│                      │
│  go                  │
│  │                   │
│  vision              │
│  │                   │
│  ideate  ●●●         │
│  │                   │
│  review  ●●●         │
│  │                   │
│  implement  ●●●●●●●  │
│  ├── design          │
│  ├── build           │
│  │                   │
│  testing  ●●●●       │
│  │                   │
│  letsgo  ●●          │
│  └── legal           │
│                      │
│  AVAILABLE ANYTIME    │
│                      │
│  commit · audit      │
│  seo · suggest       │
│  deps · responsive   │
│  naming · rules      │
│  document · tidy     │
│                      │
└──────────────────────┘
```

### Node Anatomy

Each workflow node is a `<button>`:

```
  ┌─────────────┐
  │  /arc:name  │  ← monospace, hover → accent color
  │   ●●●       │  ← agent pips (one dot per agent)
  └─────────────┘
```

- **Default**: `text-neutral-800`, `border-neutral-200`
- **Hover**: `text-[var(--color-accent)]`, `border-[var(--color-accent)]/40`, `bg-[var(--color-accent)]/8` (matches existing skill card hover)
- **Pips**: Small circles (4px), `bg-neutral-300`, one per agent declared in skill frontmatter
- **Click**: Opens unified drawer with skill content

### Connecting Lines

- **Spine lines**: Horizontal `border-b` or SVG line, `border-neutral-300`
- **Arrow heads**: CSS pseudo-element or SVG triangle at each connection point
- **Branch lines**: Vertical connector from branch skill up to spine node
- **Animation**: Lines draw on scroll-into-view using Motion's `useInView` + `pathLength` animation

### Hover Interaction

On hover, the skill's `desc` appears as a small text label below the node:

```
  [ideate] ─────→
   ●●●
   Idea → design doc     ← appears on hover, text-neutral-400 text-xs
```

## Component Structure

```
WorkflowDiagram (new component)
├── WorkflowSpine (horizontal on desktop, vertical on mobile)
│   ├── WorkflowNode (per spine skill)
│   │   ├── button with /arc:name label
│   │   ├── AgentPips (dots)
│   │   └── desc tooltip (hover)
│   ├── WorkflowConnector (line between nodes)
│   └── WorkflowBranch (vertical connector + branch node)
└── WorkflowUtilities (separate section)
    └── utility buttons in flex-wrap row
```

Single file: `src/app/workflow-diagram.tsx` — no need to split into separate files unless it gets large.

## Interactions

| Action | Result |
|--------|--------|
| Page load | Lines draw in L→R (or T→B on mobile), nodes stagger-fade, pips pop |
| Hover node | Accent color, desc text appears below |
| Click node | Opens unified drawer with full skill content |
| Click utility | Opens unified drawer with full skill content |
| Reduced motion | No draw animation, instant visibility |

## Integration

### Home page (page.tsx)

Insert between Principles section and Content Browser:

```tsx
{/* Principles */}
<section>...</section>

{/* Divider */}
<div>· · ·</div>

{/* NEW: Workflow Diagram */}
<section className="mb-[calc(var(--baseline)*4)]">
  <WorkflowDiagram
    skills={skills}
    onSkillClick={openSkill}  // needs to be lifted from ContentBrowser
  />
</section>

{/* Content Browser */}
<ContentBrowser ... />
```

**Note:** The `onSkillClick` callback currently lives inside `ContentBrowser`. It needs to be lifted to `page.tsx` so both the workflow diagram and content browser can share the same drawer. This means:
- Move drawer state (`drawerContent`, `drawerOpen`) up to page level
- Pass click handlers down to both `WorkflowDiagram` and `ContentBrowser`
- Or: make the page a client component wrapper

### Data loading

`getSkills()` already returns all skills. Add `workflow` to the `Skill` interface and parse it in `content.ts`. The `WorkflowDiagram` component processes the raw skills array into spine/branches/utilities using the frontmatter data.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Data in frontmatter, not hardcoded | Adding/removing skills from the workflow = editing one file, not site code |
| Linked list (after:) not index | Inserting a new spine skill only requires changing two files, not renumbering everything |
| No new dependencies | SVG + Motion (already installed) + CSS. Keeps bundle small. |
| Same drawer for clicks | Reuses existing infrastructure. Consistent interaction pattern. |
| Agent pips instead of labels | Shows density without noise. Implement's 12 pips vs vision's 0 tells a story. |
| Horizontal on desktop, vertical on mobile | Natural reading direction per viewport. Breakpoint at `md` (768px). |
| Skills-only (agents via pips) | Keeps diagram focused on the workflow. Full agent details are one click away. |

## Open Questions

- Should the workflow section have a brief intro paragraph (like the content browser tabs do), or just the diagram?
- Should branch labels show the skill's `desc` or just the name?
- Should the line-draw animation trigger on scroll-into-view or on page load?
