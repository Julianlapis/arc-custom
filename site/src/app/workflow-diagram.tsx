"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Skill, WorkflowData } from "@/lib/types";

interface WorkflowDiagramProps {
  workflowData: WorkflowData;
  onSkillClick: (skill: Skill) => void;
}

function AgentPips({ count }: { count: number }) {
  if (count === 0) {
    return null;
  }
  return (
    <span
      aria-label={`${count} agent${count === 1 ? "" : "s"}`}
      className="mt-1 flex gap-0.5"
      role="img"
    >
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static identical pips never reorder
        <span className="block size-1 rounded-full bg-neutral-300" key={i} />
      ))}
    </span>
  );
}

function WorkflowNode({
  skill,
  onClick,
  delay,
}: {
  skill: Skill;
  onClick: () => void;
  delay: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.button
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col items-start"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
      onClick={onClick}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      type="button"
    >
      <span className="font-mono text-neutral-800 text-sm transition-colors group-hover:text-[var(--color-accent)]">
        {skill.invokable ? `/arc:${skill.name}` : skill.name}
      </span>
      <AgentPips count={skill.agents?.length ?? 0} />
      <span className="mt-0.5 max-w-[140px] text-left text-[11px] text-neutral-400 leading-tight opacity-0 transition-opacity group-hover:opacity-100">
        {skill.desc}
      </span>
    </motion.button>
  );
}

function SpineConnector({ delay }: { delay: number }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.span
      animate={{ scaleX: 1, opacity: 1 }}
      className="hidden items-center md:flex"
      initial={
        prefersReducedMotion ? { opacity: 1 } : { scaleX: 0, opacity: 0 }
      }
      style={{ originX: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <span className="block h-px w-8 bg-neutral-300 lg:w-12" />
      <span className="block size-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-neutral-300" />
    </motion.span>
  );
}

function SpineConnectorVertical({ delay }: { delay: number }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.span
      animate={{ scaleY: 1, opacity: 1 }}
      className="flex justify-start pl-4 md:hidden"
      initial={
        prefersReducedMotion ? { opacity: 1 } : { scaleY: 0, opacity: 0 }
      }
      style={{ originY: 0 }}
      transition={{ duration: 0.2, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <span className="block h-6 w-px bg-neutral-300" />
    </motion.span>
  );
}

function BranchGroup({
  branches,
  onSkillClick,
  baseDelay,
}: {
  branches: Skill[];
  onSkillClick: (skill: Skill) => void;
  baseDelay: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="flex flex-col gap-1"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3, delay: baseDelay + 0.2 }}
    >
      {branches.map((branch) => (
        <div className="flex items-center gap-1.5" key={branch.name}>
          {/* Branch connector tick */}
          <span className="hidden h-px w-3 bg-neutral-200 md:block" />
          <span className="block h-3 w-px bg-neutral-200 md:hidden" />
          <button
            className="font-mono text-neutral-500 text-xs transition-colors hover:text-[var(--color-accent)]"
            onClick={() => onSkillClick(branch)}
            type="button"
          >
            {branch.invokable ? `/arc:${branch.name}` : branch.name}
          </button>
        </div>
      ))}
    </motion.div>
  );
}

export function WorkflowDiagram({
  workflowData,
  onSkillClick,
}: WorkflowDiagramProps) {
  const { spine, branches, utilities } = workflowData;

  return (
    <section className="mb-[calc(var(--baseline)*4)]">
      <h2 className="mb-[calc(var(--baseline)*1)] font-mono text-neutral-500 text-xs uppercase leading-[var(--baseline)] tracking-wider">
        The workflow
      </h2>

      {/* Spine — horizontal on md+, vertical on mobile */}
      <div className="mb-[calc(var(--baseline)*2)]">
        {/* Desktop: horizontal flow */}
        <div className="hidden flex-wrap items-start gap-y-6 md:flex">
          {spine.map((skill, i) => {
            const baseDelay = i * 0.12;
            const skillBranches = branches[skill.name];
            return (
              <div className="flex items-start" key={skill.name}>
                {i > 0 && <SpineConnector delay={baseDelay - 0.06} />}
                <div className="flex flex-col gap-1">
                  <WorkflowNode
                    delay={baseDelay}
                    onClick={() => onSkillClick(skill)}
                    skill={skill}
                  />
                  {skillBranches && (
                    <BranchGroup
                      baseDelay={baseDelay}
                      branches={skillBranches}
                      onSkillClick={onSkillClick}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical flow */}
        <div className="flex flex-col md:hidden">
          {spine.map((skill, i) => {
            const baseDelay = i * 0.1;
            const skillBranches = branches[skill.name];
            return (
              <div key={skill.name}>
                {i > 0 && <SpineConnectorVertical delay={baseDelay - 0.05} />}
                <WorkflowNode
                  delay={baseDelay}
                  onClick={() => onSkillClick(skill)}
                  skill={skill}
                />
                {skillBranches && (
                  <div className="mt-1 mb-1 ml-4">
                    <BranchGroup
                      baseDelay={baseDelay}
                      branches={skillBranches}
                      onSkillClick={onSkillClick}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Utilities — separate row */}
      {utilities.length > 0 && (
        <div>
          <h3 className="mb-[calc(var(--baseline)*0.5)] font-mono text-neutral-400 text-xs uppercase tracking-wider">
            Available anytime
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {utilities.map((skill) => (
              <button
                className="font-mono text-neutral-500 text-sm transition-colors hover:text-[var(--color-accent)]"
                key={skill.name}
                onClick={() => onSkillClick(skill)}
                type="button"
              >
                {skill.invokable ? `/arc:${skill.name}` : skill.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
