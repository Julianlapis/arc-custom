"use client";

import { useState } from "react";
import type { Agent, Rule, Skill, WorkflowData } from "@/lib/types";
import { ContentBrowser } from "./content-browser";
import { UnifiedDrawer } from "./unified-drawer";
import { WorkflowGraph } from "./workflow-graph";

type DrawerContent =
  | { type: "skill"; data: Skill }
  | { type: "agent"; data: Agent }
  | { type: "rule"; data: Rule };

interface PageContentProps {
  skills: Skill[];
  agents: Agent[];
  rules: Rule[];
  workflowData: WorkflowData;
  assetCounts: { references: number; disciplines: number };
}

export function PageContent({
  skills,
  agents,
  rules,
  workflowData,
  assetCounts,
}: PageContentProps) {
  const [drawerContent, setDrawerContent] = useState<DrawerContent | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openSkill = (skill: Skill) => {
    setDrawerContent({ type: "skill", data: skill });
    setDrawerOpen(true);
  };

  const openAgent = (agent: Agent) => {
    setDrawerContent({ type: "agent", data: agent });
    setDrawerOpen(true);
  };

  const openAgentByName = (name: string) => {
    const agent = agents.find((a) => a.name === name);
    if (agent) {
      setDrawerContent({ type: "agent", data: agent });
      setDrawerOpen(true);
    }
  };

  const openSkillByName = (name: string) => {
    const skill = skills.find((s) => s.name === name);
    if (skill) {
      setDrawerContent({ type: "skill", data: skill });
    }
  };

  const openRule = (rule: Rule) => {
    setDrawerContent({ type: "rule", data: rule });
    setDrawerOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      setTimeout(() => setDrawerContent(null), 300);
    }
  };

  return (
    <>
      {/* Workflow Diagram */}
      <WorkflowGraph
        agents={agents}
        assetCounts={assetCounts}
        onSkillClick={openSkill}
        workflowData={workflowData}
      />

      {/* Content Browser */}
      <ContentBrowser
        agents={agents}
        onAgentClick={openAgent}
        onRuleClick={openRule}
        onSkillClick={openSkill}
        rules={rules}
        skills={skills}
      />

      {/* Shared Drawer */}
      <UnifiedDrawer
        content={drawerContent}
        onAgentClick={openAgentByName}
        onOpenChange={handleOpenChange}
        onSkillClick={openSkillByName}
        open={drawerOpen}
      />
    </>
  );
}
