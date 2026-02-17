"use client";

import { useMemo } from "react";
import type { Agent, Rule, Skill } from "@/lib/types";
import { ContentBrowser } from "./content-browser";
import {
  ArcSheetsProvider,
  type DrawerContent,
  getContentId,
  useArcSheets,
} from "./unified-drawer";

interface PageContentProps {
  skills: Skill[];
  agents: Agent[];
  rules: Rule[];
}

function PageContentInner({ skills, agents, rules }: PageContentProps) {
  const { open } = useArcSheets();

  const skillsByName = useMemo(
    () => Object.fromEntries(skills.map((skill) => [skill.name, skill])),
    [skills]
  );

  const agentsByName = useMemo(
    () => Object.fromEntries(agents.map((agent) => [agent.name, agent])),
    [agents]
  );

  const openContent = (content: DrawerContent) => {
    open("detail", getContentId(content), {
      agentsByName,
      content,
      skillsByName,
    });
  };

  const openSkill = (skill: Skill) => {
    openContent({ type: "skill", data: skill });
  };

  const openAgent = (agent: Agent) => {
    openContent({ type: "agent", data: agent });
  };

  const openRule = (rule: Rule) => {
    openContent({ type: "rule", data: rule });
  };

  return (
    <div className="mb-[calc(var(--baseline)*1.5)]">
      <ContentBrowser
        agents={agents}
        onAgentClick={openAgent}
        onRuleClick={openRule}
        onSkillClick={openSkill}
        rules={rules}
        skills={skills}
      />
    </div>
  );
}

export function PageContent({ skills, agents, rules }: PageContentProps) {
  return (
    <ArcSheetsProvider>
      <PageContentInner agents={agents} rules={rules} skills={skills} />
    </ArcSheetsProvider>
  );
}
