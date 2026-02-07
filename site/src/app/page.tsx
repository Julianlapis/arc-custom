import type { Metadata } from "next";
import Link from "next/link";
import { getAgents, getRules, getSkills, getVersion } from "@/lib/content";
import { AnimatedHero } from "./animated-hero";
import { ContentBrowser } from "./content-browser";
import { CopyButton } from "./copy-button";


export const metadata: Metadata = {
  title: "Arc – The full arc from idea to shipped code",
  description:
    "A full development workflow for Claude Code. Commands and agents that handle ideation, design, planning, implementation, review, and deployment.",
  alternates: { canonical: "/" },
};

export default function ArcPage() {
  const skills = getSkills();
  const agents = getAgents();
  const rules = getRules();
  const version = getVersion();
  const skillNames = skills.filter((s) => s.invokable).map((s) => s.name);
  return (
    <main className="min-h-screen p-[calc(var(--baseline)*1)] md:p-[calc(var(--baseline)*2)] lg:p-[calc(var(--baseline)*3)]">
      <div className="mx-auto max-w-3xl">
        <nav className="flex items-center justify-end gap-2">
          {version && (
            <span className="font-mono text-neutral-400 text-xs">
              v{version}
            </span>
          )}
          <Link
            aria-label="GitHub"
            className="text-neutral-400 transition-colors hover:text-neutral-600"
            href="https://github.com/howells/arc"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg
              aria-label="GitHub"
              className="size-5"
              fill="currentColor"
              role="img"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </Link>
        </nav>
        {/* Hero */}
        <section className="mt-[calc(var(--baseline)*2)] mb-[calc(var(--baseline)*2)]">
          <AnimatedHero commandNames={skillNames} />
          <p className="mt-[calc(var(--baseline)*1)] max-w-sm text-pretty text-neutral-500 text-sm leading-relaxed">
            The full arc from idea to shipped code.
          </p>
          <p className="mt-[calc(var(--baseline)*1)] max-w-lg text-pretty text-neutral-600 text-sm leading-relaxed">
            A{" "}
            <Link
              className="prose-link"
              href="https://docs.anthropic.com/en/docs/claude-code"
              rel="noopener noreferrer"
              target="_blank"
            >
              Claude Code
            </Link>{" "}
            plugin with {skills.length} skills and {agents.length} specialized
            agents. Skills orchestrate workflows: exploring your codebase,
            asking clarifying questions, spawning agents for parallel review.
            Agents are specialists: security auditors, performance analysts,
            architecture reviewers, each with deep domain expertise.
          </p>
          <p className="mt-[calc(var(--baseline)*1)] text-neutral-500 text-sm">
            Made by{" "}
            <Link
              className="prose-link"
              href="https://danielhowells.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Daniel Howells
            </Link>
          </p>
        </section>

        {/* Install */}
        <section className="mb-[calc(var(--baseline)*4)]">
          <div className="group max-w-md">
            <div className="flex items-center justify-between rounded bg-neutral-800 px-4 py-3 font-mono text-neutral-100 text-sm">
              <span className="flex items-center gap-2">
                <span className="text-neutral-500">$</span>
                <span>claude plugins install arc@howells-arc</span>
              </span>
              <CopyButton light text="claude plugins install arc@howells-arc" />
            </div>
          </div>
          <p className="mt-[calc(var(--baseline)*0.5)] max-w-md text-pretty text-neutral-500 text-xs leading-relaxed">
            Install from the{" "}
            <Link
              className="prose-link"
              href="https://docs.anthropic.com/en/docs/claude-code/plugins#plugin-marketplace"
              rel="noopener noreferrer"
              target="_blank"
            >
              Claude Code plugin marketplace
            </Link>
            . Requires{" "}
            <Link
              className="prose-link"
              href="https://docs.anthropic.com/en/docs/claude-code"
              rel="noopener noreferrer"
              target="_blank"
            >
              Claude Code
            </Link>{" "}
            2.1.16+ (uses Tasks, not Todos)
          </p>
        </section>

        {/* Primary command */}
        <section className="mb-[calc(var(--baseline)*4)]">
          <h2 className="mb-[calc(var(--baseline)*1)] font-mono text-neutral-500 text-xs uppercase leading-[var(--baseline)] tracking-wider">
            Start here
          </h2>
          <div className="group max-w-md">
            <div className="flex items-center justify-between border-neutral-300 border-b py-3 font-mono text-sm transition-colors">
              <span>/arc:start</span>
              <CopyButton text="/arc:start" />
            </div>
          </div>
          <p className="mt-[calc(var(--baseline)*1)] max-w-lg text-pretty text-neutral-600 text-sm leading-relaxed">
            Understands your codebase. Asks what you want to build. Guides you
            through design → plan → implementation with TDD.
          </p>
        </section>

        {/* Philosophy */}
        <section className="mb-[calc(var(--baseline)*4)]">
          <h2 className="mb-[calc(var(--baseline)*1)] font-mono text-neutral-500 text-xs uppercase leading-[var(--baseline)] tracking-wider">
            Why this exists
          </h2>
          <div className="max-w-lg space-y-[calc(var(--baseline)*1)] text-neutral-600 text-sm leading-relaxed">
            <p>
              If you've spent time teaching Claude how you like to work (tests
              first, one question at a time, review as you go) Arc is that
              knowledge already written down. You get to skip the setup
              conversations and start building.
            </p>
            <p>
              It's opinionated because good defaults save time. If something
              doesn't fit how you work, take what's useful and leave the rest.
            </p>
          </div>
        </section>

        {/* Principles */}
        <section className="mb-[calc(var(--baseline)*2)]">
          <h2 className="mb-[calc(var(--baseline)*1)] font-mono text-neutral-500 text-xs uppercase leading-[var(--baseline)] tracking-wider">
            Principles
          </h2>
          <ul className="max-w-lg space-y-[calc(var(--baseline)*1)]">
            <li className="flex gap-3 text-neutral-600 text-sm leading-relaxed">
              <span className="select-none text-[var(--color-accent)]">—</span>
              <span>
                <span className="text-neutral-900">Tests first.</span> Not
                negotiable.
              </span>
            </li>
            <li className="flex gap-3 text-neutral-600 text-sm leading-relaxed">
              <span className="select-none text-[var(--color-accent)]">—</span>
              <span>
                <span className="text-neutral-900">Review is continuous,</span>{" "}
                not a gate at the end.
              </span>
            </li>
            <li className="flex gap-3 text-neutral-600 text-sm leading-relaxed">
              <span className="select-none text-[var(--color-accent)]">—</span>
              <span>
                <span className="text-neutral-900">
                  Ask one question at a time.
                </span>{" "}
                Too many questions at once stalls progress.
              </span>
            </li>
            <li className="flex gap-3 text-neutral-600 text-sm leading-relaxed">
              <span className="select-none text-[var(--color-accent)]">—</span>
              <span>
                <span className="text-neutral-900">The user decides.</span>{" "}
                Agents advise, they don't dictate.
              </span>
            </li>
          </ul>
        </section>

        {/* Divider */}
        <div className="mb-[calc(var(--baseline)*2)] flex justify-center gap-2 text-neutral-300">
          <span>·</span>
          <span>·</span>
          <span>·</span>
        </div>

        <ContentBrowser agents={agents} rules={rules} skills={skills} />

        {/* Footer */}
        <footer className="border-neutral-200 border-t pt-[calc(var(--baseline)*1)] text-sm">
          <p className="text-neutral-400 text-xs">
            Made by{" "}
            <a
              className="prose-link"
              href="https://danielhowells.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Daniel Howells
            </a>
            {" · "}
            <a
              className="text-neutral-500 transition-colors hover:text-[var(--color-accent)]"
              href="https://twitter.com/howells"
              rel="noopener noreferrer"
              target="_blank"
            >
              @howells
            </a>
            {" · "}
            <a
              className="text-neutral-500 transition-colors hover:text-[var(--color-accent)]"
              href="https://github.com/howells/arc"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
