// Agent categories correspond to subdirectories under agents/
export const AGENT_CATEGORIES = [
  "review",
  "research",
  "build",
  "workflow",
] as const;
export type AgentCategory = (typeof AGENT_CATEGORIES)[number];

export const WORKFLOW_POSITIONS = ["spine", "branch", "utility"] as const;
export type WorkflowPosition = (typeof WORKFLOW_POSITIONS)[number];

export interface SkillWorkflow {
  position: WorkflowPosition;
  after?: string; // spine only — preceding skill name
  joins?: string; // branch only — which spine skill to connect to
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
  workflow?: SkillWorkflow;
  content: string;
}

export interface WorkflowData {
  spine: Skill[]; // Ordered left-to-right
  branches: Record<string, Skill[]>; // spine skill name → branch skills
  utilities: Skill[]; // Unconnected skills
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

export const RULE_CATEGORIES = ["core", "workflow", "interface"] as const;
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
