# Subagent Statuses

Build agents should report one of these statuses so the controller can react consistently.

## Status Values

- `DONE` -> work completed, proceed to review
- `DONE_WITH_CONCERNS` -> work completed, but the agent has correctness or maintainability concerns that should be read before review
- `NEEDS_CONTEXT` -> the task is viable, but required context was missing
- `BLOCKED` -> the agent cannot complete the task without changing the task, approach, or model capability

## Controller Behavior

- `DONE` -> send to spec review, then code review
- `DONE_WITH_CONCERNS` -> inspect concerns first, then decide whether to clarify or review
- `NEEDS_CONTEXT` -> provide targeted context and re-dispatch
- `BLOCKED` -> either split the task, upgrade model capability, or escalate to the human

Never ignore `BLOCKED` or `NEEDS_CONTEXT`. Change something before retrying.
