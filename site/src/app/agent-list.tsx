"use client";

import type { Agent } from "./page";

interface AgentListProps {
  agents: Agent[];
  onAgentClick: (agent: Agent) => void;
}

const categoryLabels: Record<Agent["category"], string> = {
  review: "Review",
  research: "Research",
  build: "Build",
  workflow: "Workflow",
};

const categoryOrder: Agent["category"][] = [
  "review",
  "build",
  "research",
  "workflow",
];

export function AgentList({ agents, onAgentClick }: AgentListProps) {
  const grouped = categoryOrder.reduce(
    (acc, category) => {
      acc[category] = agents.filter((a) => a.category === category);
      return acc;
    },
    {} as Record<Agent["category"], Agent[]>
  );

  return (
    <div className="space-y-[calc(var(--baseline)*2)]">
      {categoryOrder.map((category) => {
        const categoryAgents = grouped[category];
        if (categoryAgents.length === 0) {
          return null;
        }

        return (
          <div key={category}>
            <h3 className="mb-[calc(var(--baseline)*1)] font-mono text-neutral-400 text-xs uppercase tracking-wider">
              {categoryLabels[category]}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryAgents.map((agent) => (
                <button
                  className="group rounded-lg border border-neutral-200 p-4 text-left transition-all duration-200 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/8"
                  key={agent.name}
                  onClick={() => onAgentClick(agent)}
                  type="button"
                >
                  <span className="block font-mono text-neutral-800 text-sm transition-colors group-hover:text-[var(--color-accent)]">
                    {agent.name}
                  </span>
                  <span className="mt-1 block text-neutral-500 text-sm leading-snug">
                    {agent.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
