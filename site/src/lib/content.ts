import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { load as yamlLoad } from "js-yaml";

// Resolve repo root: site/ → arc/
// process.cwd() is the Next.js project root (site/), go up one level to arc/
const ROOT = resolve(process.cwd(), "..");

// Agent categories correspond to subdirectories under agents/
const AGENT_CATEGORIES = ["review", "research", "build", "workflow"] as const;
type AgentCategory = (typeof AGENT_CATEGORIES)[number];

// Regex patterns for custom YAML extraction (avoids issues with complex description fields)
const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;
const NAME_REGEX = /^name:\s*(.+)$/m;
const WEBSITE_REGEX = /^website:\n((?: {2}.+\n?)+)/m;

/**
 * Extract and parse only the website section from frontmatter.
 * This avoids YAML parsing issues with complex description fields
 * that contain unescaped colons, newlines, etc.
 */
function extractWebsiteSection(content: string): {
  name?: string;
  website?: Record<string, unknown>;
} | null {
  const match = content.match(FRONTMATTER_REGEX);
  if (!match) return null;

  const frontmatter = match[1];
  const nameMatch = frontmatter.match(NAME_REGEX);
  const name = nameMatch?.[1]?.trim();

  const websiteMatch = frontmatter.match(WEBSITE_REGEX);
  if (!websiteMatch) return { name };

  try {
    const websiteYaml = `website:\n${websiteMatch[1]}`;
    const parsed = yamlLoad(websiteYaml) as {
      website: Record<string, unknown>;
    };
    return { name, website: parsed.website };
  } catch {
    return { name };
  }
}

function readLocalFile(relativePath: string): string | null {
  const fullPath = resolve(ROOT, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, "utf-8");
}

/**
 * Get the set of skill names that have a command router in commands/.
 * These are user-invokable via /arc:<name>.
 */
function getInvokableSkills(): Set<string> {
  const commandsDir = resolve(ROOT, "commands");
  if (!existsSync(commandsDir)) return new Set();
  return new Set(
    readdirSync(commandsDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, "")),
  );
}

export interface Skill {
  name: string;
  order: number;
  invokable: boolean;
  desc: string;
  summary: string;
  what: string;
  why: string;
  decisions: string[];
  agents?: string[];
  content: string;
}

export interface Agent {
  name: string;
  category: AgentCategory;
  desc: string;
  summary: string;
  what: string;
  why: string;
  usedBy?: string[];
  content: string;
}

const RULE_CATEGORIES = ["core", "workflow", "interface"] as const;
export type RuleCategory = (typeof RULE_CATEGORIES)[number];

export interface Rule {
  slug: string;
  title: string;
  category: RuleCategory;
  content: string;
}

export const AGENT_CATEGORY_LABELS: Record<AgentCategory, string> = {
  review: "Review Agent",
  research: "Research Agent",
  build: "Build Agent",
  workflow: "Workflow Agent",
};

const CORE_RULES = new Set([
  "stack",
  "versions",
  "code-style",
  "typescript",
  "react",
  "nextjs",
  "tailwind",
]);

const WORKFLOW_RULES = new Set([
  "testing",
  "git",
  "env",
  "security",
  "auth",
  "error-handling",
  "database",
  "turborepo",
  "integrations",
  "api",
  "cloudflare-workers",
  "cli",
  "plan-mode",
  "ai-sdk",
  "seo",
  "tooling",
]);

interface SkillFrontmatter {
  name: string;
  website?: {
    order: number;
    desc: string;
    summary: string;
    what: string;
    why: string;
    decisions: string[];
    agents?: string[];
  };
}

interface AgentFrontmatter {
  website?: {
    desc: string;
    summary: string;
    what: string;
    why: string;
    usedBy?: string[];
  };
}

/**
 * Auto-discover all skills from the filesystem.
 * Scans skills/ for subdirectories containing SKILL.md with a website: section.
 * Checks commands/ to determine which skills are user-invokable.
 */
export function getSkills(): Skill[] {
  const skillsDir = resolve(ROOT, "skills");
  if (!existsSync(skillsDir)) return [];

  const invokable = getInvokableSkills();
  const skills: Skill[] = [];
  const entries = readdirSync(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const raw = readLocalFile(`skills/${entry.name}/SKILL.md`);
    if (!raw) continue;

    try {
      const { data, content: body } = matter(raw);
      const frontmatter = data as unknown as SkillFrontmatter;
      const website = frontmatter.website;

      if (website) {
        const name = frontmatter.name || entry.name;
        skills.push({
          name,
          order: website.order ?? 999,
          invokable: invokable.has(entry.name),
          desc: String(website.desc || ""),
          summary: String(website.summary || ""),
          what: String(website.what || ""),
          why: String(website.why || ""),
          decisions: (website.decisions || []).map((d) =>
            typeof d === "string" ? d : JSON.stringify(d),
          ),
          agents: website.agents,
          content: body.trim(),
        });
      }
    } catch {
      // Skip files with YAML parsing errors
    }
  }

  return skills.sort((a, b) => a.order - b.order);
}

/**
 * Auto-discover all agents from the filesystem.
 * Scans agents/{category}/ for .md files with a website: section.
 */
export function getAgents(): Agent[] {
  const agentsDir = resolve(ROOT, "agents");
  if (!existsSync(agentsDir)) return [];

  const agents: Agent[] = [];

  for (const category of AGENT_CATEGORIES) {
    const categoryDir = resolve(agentsDir, category);
    if (!existsSync(categoryDir)) continue;

    const files = readdirSync(categoryDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const raw = readLocalFile(`agents/${category}/${file}`);
      if (!raw) continue;

      try {
        const extracted = extractWebsiteSection(raw);
        const website = extracted?.website as AgentFrontmatter["website"];

        if (website) {
          // Extract body after frontmatter
          const fmMatch = raw.match(FRONTMATTER_REGEX);
          const body = fmMatch ? raw.slice(fmMatch[0].length).trim() : raw;

          agents.push({
            name: extracted?.name || file.replace(/\.md$/, ""),
            category,
            desc: website.desc,
            summary: website.summary,
            what: website.what,
            why: website.why,
            usedBy: website.usedBy,
            content: body,
          });
        }
      } catch {
        // Skip files with YAML parsing errors
      }
    }
  }

  return agents;
}

/**
 * Auto-discover all rules from the filesystem.
 * Reads rules/*.md (Core + Workflow) and rules/interface/*.md (Interface Guidelines).
 * Skips README.md and index.md. Extracts title from first # heading.
 */
export function getRules(): Rule[] {
  const rulesDir = resolve(ROOT, "rules");
  if (!existsSync(rulesDir)) return [];

  const rules: Rule[] = [];

  // Top-level rules (Core + Workflow)
  const topFiles = readdirSync(rulesDir).filter(
    (f) => f.endsWith(".md") && f !== "README.md",
  );

  for (const file of topFiles) {
    const content = readLocalFile(`rules/${file}`);
    if (!content) continue;

    const slug = file.replace(/\.md$/, "");
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch?.[1] ?? slug;
    const category: RuleCategory = CORE_RULES.has(slug) ? "core" : "workflow";

    rules.push({ slug, title, category, content });
  }

  // Interface rules
  const interfaceDir = resolve(rulesDir, "interface");
  if (existsSync(interfaceDir)) {
    const interfaceFiles = readdirSync(interfaceDir).filter(
      (f) => f.endsWith(".md") && f !== "index.md",
    );

    for (const file of interfaceFiles) {
      const content = readLocalFile(`rules/interface/${file}`);
      if (!content) continue;

      const slug = `interface/${file.replace(/\.md$/, "")}`;
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch?.[1] ?? file.replace(/\.md$/, "");

      rules.push({ slug, title, category: "interface", content });
    }
  }

  return rules;
}

export function getSkillNames(): string[] {
  return getSkills().map((s) => s.name);
}

export function getSkillByName(name: string): Skill | null {
  return getSkills().find((s) => s.name === name) ?? null;
}

export function getAgentByName(name: string): Agent | null {
  return getAgents().find((a) => a.name === name) ?? null;
}

export function getRuleBySlug(slug: string): Rule | null {
  return getRules().find((r) => r.slug === slug) ?? null;
}

export { sanitizeContent } from "./sanitize";

export function getVersion(): string | null {
  const content = readLocalFile(".claude-plugin/plugin.json");
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as { version?: string };
    return parsed.version ?? null;
  } catch {
    return null;
  }
}
