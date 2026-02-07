"use client";

import { ArrowRight, ChevronLeft, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sanitizeContent } from "@/lib/sanitize";
import type { Agent, Rule, Skill } from "./page";

type DrawerContent =
  | { type: "skill"; data: Skill }
  | { type: "agent"; data: Agent }
  | { type: "rule"; data: Rule };

interface UnifiedDrawerProps {
  content: DrawerContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkillClick?: (skillName: string) => void;
  onAgentClick?: (agentName: string) => void;
}

const categoryLabels: Record<Agent["category"], string> = {
  review: "Review Agent",
  research: "Research Agent",
  build: "Build Agent",
  workflow: "Workflow Agent",
};

const appleEase = {
  sheet: [0.32, 0.72, 0, 1] as const,
  out: [0, 0.55, 0.45, 1] as const,
  standard: [0.25, 0.1, 0.25, 1] as const,
};

export function UnifiedDrawer({
  content,
  open,
  onOpenChange,
  onSkillClick,
  onAgentClick,
}: UnifiedDrawerProps) {
  const [showSource, setShowSource] = useState(false);

  // Reset source view when content changes or drawer closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setShowSource(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setShowSource(false);
  }, [content]);

  const rawSource = content ? getSourceContent(content) : null;
  const sourceContent = useMemo(
    () => (rawSource ? sanitizeContent(rawSource) : null),
    [rawSource],
  );
  const contentUrl = content ? getContentUrl(content) : null;

  // Shallow URL update when source panel opens
  useEffect(() => {
    if (showSource && contentUrl) {
      window.history.pushState(null, "", contentUrl);
    }
  }, [showSource, contentUrl]);

  // Restore URL when drawer closes
  useEffect(() => {
    if (!open) {
      const path = window.location.pathname;
      if (
        path.startsWith("/skills/") ||
        path.startsWith("/agents/") ||
        path.startsWith("/rules/")
      ) {
        window.history.replaceState(null, "", "/");
      }
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && content && (
        <>
          {/* Backdrop */}
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-black/20"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            transition={{ duration: 0.3 }}
          />

          {/* Preview sheet (bottom of stack) */}
          <motion.div
            animate={{
              x: showSource ? -48 : 0,
              scale: showSource ? 0.95 : 1,
              borderRadius: showSource ? 20 : 0,
              opacity: showSource ? 0.85 : 1,
            }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-xl flex-col overflow-hidden bg-white shadow-[-16px_0_64px_-16px_rgba(0,0,0,0.15)]"
            exit={{ x: "105%", opacity: 0.6 }}
            initial={{ x: "100%" }}
            style={{ transformOrigin: "right center" }}
            transition={{
              x: { duration: 0.4, ease: appleEase.sheet },
              scale: { duration: 0.35, ease: appleEase.out },
              borderRadius: { duration: 0.3, ease: appleEase.standard },
              opacity: { duration: 0.25, ease: appleEase.out },
            }}
          >
            {/* Close button */}
            {!showSource && (
              <button
                aria-label="Close drawer"
                className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-neutral-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-neutral-900"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                <X className="size-5" />
              </button>
            )}

            <div className="flex-1 overflow-y-auto">
              <div className="px-8 py-8 md:px-10 md:py-10">
                {content.type === "skill" ? (
                  <SkillContent
                    onAgentClick={onAgentClick}
                    onViewSource={() => setShowSource(true)}
                    skill={content.data}
                  />
                ) : content.type === "agent" ? (
                  <AgentContent
                    agent={content.data}
                    onSkillClick={onSkillClick}
                    onViewSource={() => setShowSource(true)}
                  />
                ) : (
                  <RuleContent
                    onViewSource={() => setShowSource(true)}
                    rule={content.data}
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Source sheet (top of stack) */}
          <AnimatePresence>
            {showSource && sourceContent && (
              <motion.div
                animate={{ x: 0, opacity: 1 }}
                className="fixed top-0 right-0 bottom-0 z-[60] flex w-full max-w-xl flex-col overflow-hidden bg-white shadow-[-16px_0_64px_-16px_rgba(0,0,0,0.3)]"
                exit={{ x: "105%", opacity: 0.6 }}
                initial={{ x: "100%", opacity: 0.8 }}
                transition={{
                  x: { duration: 0.4, ease: appleEase.sheet },
                  opacity: { duration: 0.25, ease: appleEase.out },
                }}
              >
                {/* Close button — goes back to preview, not closes everything */}
                <button
                  aria-label="Back to preview"
                  className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-neutral-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-neutral-900"
                  onClick={() => setShowSource(false)}
                  type="button"
                >
                  <X className="size-5" />
                </button>

                <div className="flex-1 overflow-y-auto">
                  <div className="px-8 py-8 pr-14 md:px-10 md:py-10 md:pr-16">
                    <button
                      className="mb-[calc(var(--baseline)*1)] inline-flex items-center gap-1 font-mono text-neutral-400 text-xs transition-colors hover:text-[var(--color-accent)]"
                      onClick={() => setShowSource(false)}
                      type="button"
                    >
                      <ChevronLeft className="size-3" />
                      Back
                    </button>

                    <h2 className="mb-[calc(var(--baseline)*1)] font-mono text-neutral-400 text-xs uppercase tracking-wider">
                      Source document
                    </h2>

                    <div className="prose">
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {sourceContent}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

function getContentUrl(content: DrawerContent): string {
  switch (content.type) {
    case "skill":
      return `/skills/${content.data.name}`;
    case "agent":
      return `/agents/${content.data.name}`;
    case "rule":
      return `/rules/${content.data.slug}`;
  }
}

function getSourceContent(content: DrawerContent): string | null {
  switch (content.type) {
    case "skill":
      return content.data.content;
    case "agent":
      return content.data.content;
    case "rule":
      return content.data.content;
  }
}

function ViewSourceButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-[calc(var(--baseline)*2)] border-neutral-200 border-t pt-[calc(var(--baseline)*1)]">
      <button
        className="group inline-flex items-center gap-2 font-mono text-neutral-500 text-xs transition-colors hover:text-[var(--color-accent)]"
        onClick={onClick}
        type="button"
      >
        View source document
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

function SkillContent({
  skill,
  onAgentClick,
  onViewSource,
}: {
  skill: Skill;
  onAgentClick?: (name: string) => void;
  onViewSource: () => void;
}) {
  return (
    <>
      <header className="mb-[calc(var(--baseline)*1.5)] border-neutral-200 border-b pb-[calc(var(--baseline)*1)]">
        <h2 className="flex items-center gap-2 font-mono text-neutral-900 text-sm">
          {skill.invokable ? (
            <>
              /arc:
              <span className="text-[var(--color-accent)]">{skill.name}</span>
            </>
          ) : (
            <span className="text-[var(--color-accent)]">{skill.name}</span>
          )}
          {!skill.invokable && (
            <span className="rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-neutral-500 text-[10px] leading-none">
              internal
            </span>
          )}
        </h2>
        <p className="mt-2 text-neutral-500 text-sm">{skill.desc}</p>
      </header>

      <div className="space-y-[calc(var(--baseline)*1.5)]">
        <section>
          <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
            <span className="text-[var(--color-accent)]">—</span>
            <span className="text-neutral-900">What it does</span>
          </h3>
          <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
            {skill.what}
          </p>
        </section>

        <section>
          <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
            <span className="text-[var(--color-accent)]">—</span>
            <span className="text-neutral-900">Why it exists</span>
          </h3>
          <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
            {skill.why}
          </p>
        </section>

        {skill.decisions && skill.decisions.length > 0 && (
          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">—</span>
              <span className="text-neutral-900">Design decisions</span>
            </h3>
            <ul className="space-y-[calc(var(--baseline)*0.25)] pl-6">
              {skill.decisions.map((decision) => (
                <li
                  className="flex gap-3 text-neutral-600 text-sm leading-relaxed"
                  key={decision}
                >
                  <span className="select-none text-[var(--color-accent)]">
                    —
                  </span>
                  <span>{decision}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {skill.agents && skill.agents.length > 0 && (
          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">—</span>
              <span className="text-neutral-900">Agents</span>
            </h3>
            <div className="flex flex-wrap gap-2 pl-6">
              {skill.agents.map((agentName) => (
                <button
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-neutral-600 text-xs transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/8 hover:text-[var(--color-accent)]"
                  key={agentName}
                  onClick={() => onAgentClick?.(agentName)}
                  type="button"
                >
                  {agentName}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <ViewSourceButton onClick={onViewSource} />
    </>
  );
}

function AgentContent({
  agent,
  onSkillClick,
  onViewSource,
}: {
  agent: Agent;
  onSkillClick?: (name: string) => void;
  onViewSource: () => void;
}) {
  return (
    <>
      <header className="mb-[calc(var(--baseline)*1.5)] border-neutral-200 border-b pb-[calc(var(--baseline)*1)]">
        <h2 className="font-mono text-neutral-900 text-sm">
          <span className="text-[var(--color-accent)]">{agent.name}</span>
        </h2>
        <p className="mt-2 text-neutral-500 text-sm">
          {categoryLabels[agent.category]}
        </p>
      </header>

      <div className="space-y-[calc(var(--baseline)*1.5)]">
        <section>
          <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
            <span className="text-[var(--color-accent)]">—</span>
            <span className="text-neutral-900">What it does</span>
          </h3>
          <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
            {agent.what}
          </p>
        </section>

        <section>
          <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
            <span className="text-[var(--color-accent)]">—</span>
            <span className="text-neutral-900">Why it exists</span>
          </h3>
          <p className="pl-6 text-neutral-600 text-sm leading-relaxed">
            {agent.why}
          </p>
        </section>

        {agent.usedBy && agent.usedBy.length > 0 && (
          <section>
            <h3 className="mb-[calc(var(--baseline)*0.5)] flex items-center gap-3 text-sm">
              <span className="text-[var(--color-accent)]">—</span>
              <span className="text-neutral-900">Spawned by</span>
            </h3>
            <div className="flex flex-wrap gap-2 pl-6">
              {agent.usedBy.map((skillName) => (
                <button
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-mono text-neutral-600 text-xs transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/8 hover:text-[var(--color-accent)]"
                  key={skillName}
                  onClick={() => onSkillClick?.(skillName)}
                  type="button"
                >
                  /arc:{skillName}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <ViewSourceButton onClick={onViewSource} />
    </>
  );
}

function RuleContent({
  rule,
  onViewSource,
}: {
  rule: Rule;
  onViewSource: () => void;
}) {
  const body = rule.content.replace(/^#\s+.+\n+/, "");

  return (
    <>
      <header className="mb-[calc(var(--baseline)*1.5)] border-neutral-200 border-b pb-[calc(var(--baseline)*1)]">
        <h2 className="font-mono text-neutral-900 text-sm">
          <span className="text-[var(--color-accent)]">{rule.title}</span>
        </h2>
        <p className="mt-2 text-neutral-500 text-sm">Rule</p>
      </header>

      <div className="prose">
        <Markdown remarkPlugins={[remarkGfm]}>{body}</Markdown>
      </div>

      <ViewSourceButton onClick={onViewSource} />
    </>
  );
}
