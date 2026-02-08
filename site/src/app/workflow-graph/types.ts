import type { Skill } from "@/lib/types";

export interface LayoutNode {
  id: string;
  skill: Skill;
  x: number;
  y: number;
  nodeType: "spine" | "branch" | "utility";
  agentCount: number;
}

export interface BranchEdge {
  source: string;
  target: string;
  /** Branch node position */
  bx: number;
  by: number;
  /** Spine target position */
  sx: number;
  sy: number;
}

export interface AgentLabel {
  /** Agent category name (e.g., "review", "build") */
  category: string;
  /** Number of agents in this category for this node */
  count: number;
  /** X position for the category text label */
  x: number;
  /** Y position (same as parent node) */
  y: number;
  /** X position where dots start */
  dotStartX: number;
}

export interface SectionSeparator {
  /** Label text (e.g., "available anytime", "knowledge") */
  label: string;
  /** Y position */
  y: number;
  /** Width of the separator line */
  width: number;
}

export interface KnowledgeItem {
  /** Display label (e.g., "22 references") */
  label: string;
  /** X position */
  x: number;
  /** Y position */
  y: number;
}

export interface SpineLine {
  /** Y of the first spine node */
  startY: number;
  /** Y of the last element in the spine/utility flow */
  endY: number;
  /** X position (SPINE_X) */
  x: number;
}

export interface GraphLayout {
  nodes: LayoutNode[];
  branchEdges: BranchEdge[];
  spineLine: SpineLine;
  agentLabels: AgentLabel[];
  separators: SectionSeparator[];
  knowledgeItems: KnowledgeItem[];
  width: number;
  height: number;
}
