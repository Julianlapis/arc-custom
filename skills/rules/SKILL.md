---
name: rules
description: |
  Apply Arc's coding rules to the current project. Copies rules to .ruler/ directory.
  Use when asked to "set up coding rules", "apply standards", "configure rules",
  or when starting a project that should follow Arc's conventions.
license: MIT
metadata:
  author: howells
---

```

───────────────────────────────────────────────────────────
```

Apply Arc's coding standards to the current project.

<process>

## Step 1: Check for existing rules

**Use Glob tool:** `.ruler/*.md`

**If `.ruler/` does not exist:** Go to Step 2 (Fresh Install)

**If `.ruler/` exists:** Go to Step 3 (Update Flow)

## Step 2: Fresh Install

Copy all rules from Arc to the project:

```bash
cp -r ${CLAUDE_PLUGIN_ROOT}/rules/ .ruler/
```

Tell the user:
```
Rules copied to .ruler/

Files added:
- code-style.md, env.md, git.md, integrations.md, tooling.md
- nextjs.md, react.md, tailwind.md, testing.md
- turborepo.md, typescript.md, versions.md
- interface/ (animation, design, forms, interactions, layout, performance, typography)
```

Go to Step 4 (Offer Ruler)

## Step 3: Update Flow

Existing `.ruler/` found. Ask the user:

```
Found existing .ruler/ in this project.

Update with Arc's latest rules? This will:
1. Backup current rules to .ruler.backup-TIMESTAMP/
2. Overwrite with Arc's rules

You can review changes with `git diff .ruler/` after.

Update rules? (y/n)
```

**If yes:**
```bash
# Create backup
cp -r .ruler/ ".ruler.backup-$(date +%Y%m%d-%H%M%S)/"

# Copy fresh rules
rm -rf .ruler/
cp -r ${CLAUDE_PLUGIN_ROOT}/rules/ .ruler/
```

Tell the user:
```
Rules updated. Backup saved to .ruler.backup-YYYYMMDD-HHMMSS/

Review changes with: git diff .ruler/
```

Go to Step 4 (Offer Ruler)

**If no:**
```
Keeping existing rules. You can manually compare with Arc's rules at:
${CLAUDE_PLUGIN_ROOT}/rules/
```

Done.

## Step 4: Offer Ruler

Ask the user:

```
Want me to run `npx ruler apply` to distribute rules to other AI agents (Copilot, Cursor, etc.)?
```

**If yes:**
```bash
npx ruler apply
```

If ruler is not installed (command fails):
```
Ruler not found. Rules are in .ruler/ and ready for use.

To distribute to other AI agents, install ruler:
  npm install -g ruler

Then run:
  npx ruler apply
```

**If no:**
```
Rules are ready in .ruler/. Run `npx ruler apply` later if you want to distribute to other agents.
```

## Step 5: Suggest Linear (for complex projects)

After rules are set up, check project complexity:

```bash
# Count source files
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | grep -v node_modules | wc -l
```

**If >50 files or monorepo detected:**
```
This looks like a complex project. Consider setting up Linear MCP for issue tracking:

1. Add to .mcp.json:
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["-y", "@anthropic/linear-mcp"]
       }
     }
   }

2. Arc will then:
   - Query active issues in /arc:suggest
   - Create issues from /arc:audit findings
   - Link work to issues for context

See .ruler/tooling.md for details.
```

**If small project:** Skip this suggestion.

Done.

</process>

<notes>
- Rules are copied, not symlinked, so projects can customize
- Backup ensures user customizations are never lost
- Ruler is optional — Arc works without it
- After copying, rules are immediately available to Arc skills that read from `.ruler/`
</notes>
