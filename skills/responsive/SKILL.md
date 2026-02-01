---
name: responsive
description: |
  Audit and fix responsive/mobile issues across every page of a project, using Chrome MCP
  screenshots at two breakpoints (375px mobile, 1440px desktop). Design-aware: reads existing
  design docs to preserve aesthetic intent, not just "make it fit."
  Use when asked to "make it responsive", "fix mobile", "responsive audit", or after building
  a desktop-first UI that needs mobile adaptation.
license: MIT
metadata:
  author: howells
website:
  order: 13
  desc: Mobile responsive audit & fix
  summary: Systematically audit and fix every page for mobile responsiveness, with visual verification via browser screenshots.
  what: |
    Responsive discovers all routes in your project, then works through each page with a tight loop: screenshot at mobile width, identify issues, fix them in code, re-screenshot to verify, then check desktop hasn't broken. It reads your design doc first so fixes preserve your aesthetic direction—typography hierarchy, memorable elements, spacing system—not just make things fit on a small screen. Uses container queries for reusable components and viewport queries for page layout.
  why: |
    Desktop-first is a valid workflow, but the "make it responsive later" pass is tedious and error-prone. You resize the browser, spot something broken, fix it, accidentally break desktop, fix that, move to the next page, miss three others. This skill automates the systematic part so you can focus on the design decisions.
  decisions:
    - Two breakpoints only. 375px mobile and 1440px desktop catches 95% of issues. Tablet deferred to v2.
    - Design-aware. Reads your design doc first to preserve aesthetic intent, not just fix layout.
    - Chrome MCP required. No fallback path—single code path, already the Arc standard.
    - Container queries for components. Reusable components adapt to their container, not the viewport.
---

<tool_restrictions>
# Tool Restrictions

**Do NOT use the `EnterPlanMode` tool.** This skill manages its own workflow and writes results directly. Claude's built-in plan mode would bypass this process.

**Do NOT use the `ExitPlanMode` tool.** This skill is never in plan mode.

**ALWAYS use the `AskUserQuestion` tool for questions.** Never ask questions as plain text in your response. Every question to the user — whether confirming routes, choosing options, or validating fixes — MUST use the `AskUserQuestion` tool. This enforces one question at a time and prevents walls of text. If you need to provide context before asking, keep it to 2-3 sentences max, then use the tool.
</tool_restrictions>
