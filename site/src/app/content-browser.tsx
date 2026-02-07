"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { AgentList } from "./agent-list";
import type { Agent, Rule, Skill } from "@/lib/types";
import { RuleList } from "./rule-list";
import { SkillList } from "./skill-list";
import { UnifiedDrawer } from "./unified-drawer";

type DrawerContent =
  | { type: "skill"; data: Skill }
  | { type: "agent"; data: Agent }
  | { type: "rule"; data: Rule };

interface ContentBrowserProps {
  skills: Skill[];
  agents: Agent[];
  rules: Rule[];
}

export function ContentBrowser({
  skills,
  agents,
  rules,
}: ContentBrowserProps) {
  const [drawerContent, setDrawerContent] = useState<DrawerContent | null>(
    null,
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
      <Tabs.Root defaultValue="skills">
        <Tabs.List className="mb-[calc(var(--baseline)*1.5)] flex gap-1 border-neutral-200 border-b">
          <Tabs.Trigger
            className="border-transparent border-b-2 px-3 pb-2 font-mono text-neutral-400 text-xs uppercase tracking-wider transition-colors data-[state=active]:border-[var(--color-accent)] data-[state=active]:text-neutral-900 hover:text-neutral-600"
            value="skills"
          >
            {skills.length} Skills
          </Tabs.Trigger>
          <Tabs.Trigger
            className="border-transparent border-b-2 px-3 pb-2 font-mono text-neutral-400 text-xs uppercase tracking-wider transition-colors data-[state=active]:border-[var(--color-accent)] data-[state=active]:text-neutral-900 hover:text-neutral-600"
            value="agents"
          >
            {agents.length} Agents
          </Tabs.Trigger>
          <Tabs.Trigger
            className="border-transparent border-b-2 px-3 pb-2 font-mono text-neutral-400 text-xs uppercase tracking-wider transition-colors data-[state=active]:border-[var(--color-accent)] data-[state=active]:text-neutral-900 hover:text-neutral-600"
            value="rules"
          >
            {rules.length} Rules
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="skills">
          <p className="mb-[calc(var(--baseline)*1)] max-w-lg text-pretty text-neutral-600 text-sm leading-relaxed">
            Skills are workflows and capabilities. Most are user-invokable via{" "}
            <span className="font-mono text-neutral-800">/arc:name</span>
            —they orchestrate the development process: gathering context, asking
            questions, spawning agents, and guiding implementation.
          </p>
          <SkillList onSkillClick={openSkill} skills={skills} />
        </Tabs.Content>

        <Tabs.Content value="agents">
          <p className="mb-[calc(var(--baseline)*1)] max-w-lg text-pretty text-neutral-600 text-sm leading-relaxed">
            Agents are specialists spawned by skills. Each has deep expertise in
            one domain: security, performance, architecture, or workflow
            automation. They run in parallel to maximize coverage while
            minimizing time.
          </p>
          <AgentList agents={agents} onAgentClick={openAgent} />
        </Tabs.Content>

        <Tabs.Content value="rules">
          <p className="mb-[calc(var(--baseline)*1)] max-w-lg text-pretty text-neutral-600 text-sm leading-relaxed">
            Opinionated coding rules using RFC 2119 terms (MUST/SHOULD/NEVER).
            Apply to any project via{" "}
            <span className="font-mono text-neutral-800">/arc:rules</span>
            —designed for{" "}
            <a
              className="prose-link"
              href="https://github.com/intellectronica/ruler"
              rel="noopener noreferrer"
              target="_blank"
            >
              Ruler
            </a>{" "}
            to distribute to any AI coding agent.
          </p>
          <RuleList onRuleClick={openRule} rules={rules} />
        </Tabs.Content>
      </Tabs.Root>

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
