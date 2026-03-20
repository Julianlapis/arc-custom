import type { Skill } from "@/lib/types";

export interface LayoutNode {
  agentCount: number;
  id: string;
  nodeType: "spine" | "branch" | "utility";
  skill: Skill;
  x: number;
  y: number;
}

export interface BranchEdge {
  /** Branch node position */
  bx: number;
  by: number;
  source: string;
  /** Spine target position */
  sx: number;
  sy: number;
  target: string;
}

export interface AgentLabel {
  /** Agent category name (e.g., "review", "build") */
  category: string;
  /** Number of agents in this category for this node */
  count: number;
  /** X position where dots start */
  dotStartX: number;
  /** X position for the category text label */
  x: number;
  /** Y position (same as parent node) */
  y: number;
}

export interface SectionSeparator {
  /** Label text (e.g., "available anytime", "knowledge") */
  label: string;
  /** Width of the separator line */
  width: number;
  /** Y position */
  y: number;
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
  /** Y of the last element in the spine/utility flow */
  endY: number;
  /** Y of the first spine node */
  startY: number;
  /** X position (SPINE_X) */
  x: number;
}

export interface GraphLayout {
  agentLabels: AgentLabel[];
  branchEdges: BranchEdge[];
  height: number;
  knowledgeItems: KnowledgeItem[];
  nodes: LayoutNode[];
  separators: SectionSeparator[];
  spineLine: SpineLine;
  width: number;
}
