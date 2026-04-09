# Observation Rules

## Scoring Dimensions

Arc's output is evaluated on 5 dimensions, scored 1-10:

| Dimension | What it measures | What 10 looks like |
|-----------|-----------------|-------------------|
| **Vision Alignment** | Does the output serve the project vision? | Every decision traces back to docs/vision.md. Nothing was built outside scope. Non-goals were respected. |
| **Craft Quality** | Is the output well-built, not junior? | A senior professional would sign their name to this. No template-tier work. Distinctive point of view. |
| **Process Adherence** | Were the right skills, tools, and agents used? | The correct /arc: skill was invoked. Lead agent was consulted. Design review scoring was run. Feedback logs were read. |
| **User Satisfaction** | Did Julian accept or correct? | First draft accepted without corrections. Or corrections were minor/expected refinements, not fundamental redirects. |
| **Knowledge Capture** | Were learnings logged for future sessions? | Feedback log updated with specific corrections. Per-agent logs updated. Memory files updated. Nothing lost. |

**Below 35/50: the run failed. Diagnose what went wrong before the next run.**

## When to Log

- After EVERY run of any skill. No exceptions.
- Log AFTER internal quality checks but BEFORE presenting to Julian (score the output you're about to show).
- Update the "User Feedback" section AFTER Julian responds (capture corrections, acceptances, redirects).

## How to Use the Log

The log serves three purposes:

1. **Pattern detection**: After 5+ runs, look for recurring weak dimensions.
   If a dimension is consistently below 7, that's a systemic issue that needs a rule change or skill mutation.

2. **Self-improvement input**: Feed patterns into the sharpen mechanism.
   If Craft Quality is consistently 6, the skills need stronger anti-pattern enforcement.

3. **Skill comparison**: Track which skills score highest/lowest over time.
   If /arc:design consistently underperforms, its references or phases need work.

## Log Maintenance

- Keep the most recent 20 entries in `logs/execution-log.md`
- Archive older entries to `logs/archive/YYYY-MM.md` monthly
- Reference recent log entries when advising on next steps

## Drift Prevention

- **Every invocation**: Read `feedback-log.md` first. Always.
- **Every quality gate**: Check output against all rules files.
- **Every 3rd run** (tracked via execution log): Re-read the feedback log
  AND scan recent execution log entries for recurring weak dimensions.
  If any dimension has scored below 7 three or more times in the last
  10 runs, flag it to Julian as a systemic issue.

## Observation Entry Format

```markdown
---
run_id: YYYY-MM-DD-NNN
date: YYYY-MM-DD
skill: [which /arc: skill was invoked]
project: [project name]
brief_summary: [1-2 sentence summary of what was done]
---

### Scores
| Dimension | Score |
|-----------|-------|
| Vision Alignment | /10 |
| Craft Quality | /10 |
| Process Adherence | /10 |
| User Satisfaction | /10 |
| Knowledge Capture | /10 |
| **Total** | **/50** |

### Weak Dimensions
[List any dimension below 7 with the specific issue]

### Failure Patterns
[What went wrong. Which quality checks failed. Which anti-patterns appeared.]

### Self-Corrections
[What was caught and fixed internally before presenting to Julian.]

### User Feedback
[Julian's reaction, corrections, or redirects. Updated after the run.]
```
