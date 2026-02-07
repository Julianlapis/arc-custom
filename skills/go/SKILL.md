---
name: go
description: |
  The main entry point. Understands your codebase and routes to the right workflow.
  Use when starting a session, saying "let's work on something", or unsure which
  Arc command to use. Gathers context and asks what you want to do.
license: MIT
metadata:
  author: howells
website:
  order: 1
  desc: Main entry point
  summary: The front door to Arc. Understands your codebase, checks Linear for active issues, and routes you to the right workflow.
  what: |
    Go explores your codebase to understand what you're working with, checks Linear for active issues (if MCP available), reads recent progress, and asks what you want to do. Based on your answer, it routes you to the appropriate Arc command—ideate for new features, implement for execution, suggest if you're unsure.
  why: |
    Starting is the hardest part. Go gives you context immediately and asks one focused question: what do you want to work on? No need to remember which Arc command does what.
  decisions:
    - Codebase exploration first. Knows your stack before asking questions.
    - Linear integration. Shows active issues if Linear MCP is available.
    - Routes, doesn't replace. Points you to the right command, then gets out of the way.
---

# /arc:go

The front door to Arc. Understands context, asks what you want to do, routes to the right workflow.

## Process

### Step 1: Gather Context (in parallel)

**Explore the codebase:**
```
Task Explore model: haiku: "Quick overview of this codebase:
- What is this project? (framework, language, purpose)
- Key directories and their purposes
- Any obvious patterns or conventions

Keep it brief — 5-10 bullet points max."
```

**Check for existing Arc artifacts:**
```bash
ls docs/vision.md docs/plans/*.md 2>/dev/null | head -10
```

**Check Linear (if MCP available):**
If `mcp__linear__*` tools exist, check for active issues.

**Read progress journal for recent work:**
```bash
head -50 docs/progress.md 2>/dev/null
```

### Step 2: Present Context

Briefly share what you found:
- Project type and key patterns
- Any existing plans or tasks
- Recent work from progress journal (if found)

### Step 3: Ask What They Want to Do

Present options based on context:

**If Linear has active issues:**
"You have [N] active issues in Linear. Want to:"
1. Work on one of those
2. Start something new
3. See suggestions (/arc:suggest)

**If recent plans exist:**
"I found a plan for [topic]. Want to:"
1. Continue that work
2. Start something different

**If fresh codebase:**
"What would you like to work on?"
- Describe a feature or change
- Fix a bug
- Explore what needs work (/arc:suggest)

### Step 4: Route to Workflow

Based on their answer:

| Intent | Route to |
|--------|----------|
| "I want to build [feature]" | /arc:ideate |
| "Quick fix/small change" | /arc:build |
| "Continue [existing plan]" | /arc:implement |
| "Not sure what to work on" | /arc:suggest |
| "Review/improve existing code" | /arc:audit or /arc:review |
| "Make it responsive/fix mobile" | /arc:responsive |
| "Ship to production" | /arc:letsgo |
| "Run tests" | /arc:testing |

**Invoke the skill:**
```
Skill arc:[chosen]: "[user's description]"
```

## What /arc:go is NOT

- Not a replacement for specific commands — it routes TO them
- Not for when you already know what command to use
- Not a status dashboard (use /arc:suggest for that)

## Interop

- Routes to all other /arc:* commands
- Reads Linear issues (if MCP available), /arc:vision, progress for context
- Uses /arc:suggest when user is unsure
