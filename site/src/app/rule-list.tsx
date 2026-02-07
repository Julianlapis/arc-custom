"use client";

import { ChevronRight } from "lucide-react";
import type { Rule, RuleCategory } from "@/lib/types";

interface RuleListProps {
  rules: Rule[];
  onRuleClick: (rule: Rule) => void;
}

const categoryLabels: Record<RuleCategory, string> = {
  core: "Core",
  workflow: "Workflow",
  interface: "Interface",
};

const categoryOrder: RuleCategory[] = ["core", "workflow", "interface"];

export function RuleList({ rules, onRuleClick }: RuleListProps) {
  const grouped = categoryOrder.reduce(
    (acc, category) => {
      acc[category] = rules.filter((r) => r.category === category);
      return acc;
    },
    {} as Record<RuleCategory, Rule[]>,
  );

  return (
    <div className="space-y-[calc(var(--baseline)*1.5)]">
      {categoryOrder.map((category) => {
        const categoryRules = grouped[category];
        if (categoryRules.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="mb-1 font-mono text-neutral-400 text-xs uppercase tracking-wider">
              {categoryLabels[category]}
            </h3>
            <div className="divide-y divide-neutral-100">
              {categoryRules.map((rule) => (
                <button
                  className="group flex w-full items-center gap-2 py-2 text-left transition-colors hover:text-[var(--color-accent)]"
                  key={rule.slug}
                  onClick={() => onRuleClick(rule)}
                  type="button"
                >
                  <ChevronRight
                    className="size-3.5 shrink-0 text-neutral-300 transition-transform duration-200 group-hover:text-[var(--color-accent)]"
                  />
                  <span className="font-mono text-neutral-700 text-sm">
                    {rule.title}
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
