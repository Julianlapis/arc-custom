#!/usr/bin/env node
/**
 * Generate AGENTS.md for Codex compatibility.
 *
 * This repo is primarily a Claude Code plugin, but Codex relies on AGENTS.md
 * for in-repo agent instructions. We derive the "Available skills" list from
 * `skills/<skill>/SKILL.md` frontmatter.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const OUT_PATH = path.join(ROOT, "AGENTS.md");

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function parseFrontmatter(md) {
  if (!md.startsWith("---\n")) return null;
  const end = md.indexOf("\n---\n", 4);
  if (end === -1) return null;

  const fm = md.slice(4, end).split("\n");
  let name = null;
  let description = null;

  for (let i = 0; i < fm.length; i++) {
    const line = fm[i];

    const nameMatch = line.match(/^name:\s*(.+)\s*$/);
    if (nameMatch) {
      name = nameMatch[1].trim();
      continue;
    }

    const descBlock = line.match(/^description:\s*\|\s*$/);
    if (descBlock) {
      const lines = [];
      for (let j = i + 1; j < fm.length; j++) {
        const l = fm[j];
        // Next top-level key starts when indentation ends.
        if (/^[^\s]/.test(l)) break;
        lines.push(l.replace(/^\s{2}/, ""));
        i = j;
      }
      description = lines.join("\n").trim();
      continue;
    }

    const descInline = line.match(/^description:\s*(.+)\s*$/);
    if (descInline) {
      description = descInline[1].trim();
      continue;
    }
  }

  if (!name && !description) return null;
  return { name, description };
}

function listSkills() {
  const entries = fs.readdirSync(SKILLS_DIR);
  const skills = [];

  for (const entry of entries) {
    const dir = path.join(SKILLS_DIR, entry);
    if (!isDir(dir)) continue;

    const skillFile = path.join(dir, "SKILL.md");
    if (!fs.existsSync(skillFile)) continue;

    const md = readText(skillFile);
    const fm = parseFrontmatter(md) || {};
    const name = fm.name || entry;
    const description = (fm.description || "").replace(/\s+/g, " ").trim();

    skills.push({
      key: entry,
      name,
      description,
      file: `skills/${entry}/SKILL.md`,
    });
  }

  skills.sort((a, b) => a.key.localeCompare(b.key));
  return skills;
}

function render(skills) {
  const lines = [];

  lines.push("# AGENTS.md (Codex Compatibility)");
  lines.push("");
  lines.push(
    "This repository is distributed primarily as a **Claude Code** plugin, but the same `skills/*/SKILL.md` documents are also intended to be executable in **Codex**."
  );
  lines.push("");
  lines.push("## How To Use In Codex");
  lines.push("");
  lines.push(
    "- If the user types a Claude-style command like `/arc:<skill> ...`, treat it as selecting that skill."
  );
  lines.push(
    "- If the user mentions a skill name (e.g. `audit`, `worktree`, `ideate`) or asks for the behavior described by a skill, open that skill's `SKILL.md` and follow it."
  );
  lines.push(
    "- If the user starts generally (\"let's work on something\"), default to `skills/start/SKILL.md`."
  );
  lines.push("");
  lines.push("## Interop Notes (Claude Code -> Codex)");
  lines.push("");
  lines.push(
    "- Treat `${CLAUDE_PLUGIN_ROOT}` as \"the repository root\" when resolving paths."
  );
  lines.push(
    "- `Task ...` blocks in skills are Claude Code parallel subtasks. In Codex, do the equivalent exploration using terminal commands and repo reads (parallelize where possible)."
  );
  lines.push(
    "- `TaskList` is Claude-specific; in Codex, approximate by scanning for existing issues/plans (`docs/plans/`), TODOs, or by asking the user."
  );
  lines.push(
    "- `mcp__claude-in-chrome__*` is Claude-in-Chrome MCP. In Codex, prefer Playwright or ask the user for screenshots/URLs when visual verification is required."
  );
  lines.push("");
  lines.push("## Available Skills");
  lines.push("");

  for (const s of skills) {
    // Keep entries single-line and grep-friendly.
    const desc = s.description ? ` - ${s.description}` : "";
    lines.push(`- ${s.key}${desc} (file: ${s.file})`);
  }

  lines.push("");
  lines.push("## Repo Layout");
  lines.push("");
  lines.push("- `skills/`: primary workflows (source of truth)");
  lines.push("- `commands/`: Claude Code command stubs (thin wrappers)");
  lines.push("- `.claude-plugin/`: Claude Code plugin metadata");
  lines.push("");

  return lines.join("\n");
}

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`Missing skills directory: ${SKILLS_DIR}`);
    process.exit(1);
  }

  const skills = listSkills();
  const out = render(skills);

  fs.writeFileSync(OUT_PATH, out, "utf8");
  process.stdout.write(`Wrote ${path.relative(ROOT, OUT_PATH)} (${skills.length} skills)\n`);
}

main();
