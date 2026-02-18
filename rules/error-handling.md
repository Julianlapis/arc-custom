# Error Handling

Rules for error handling across the stack. See [api.md](api.md) for API error format and [typescript.md](typescript.md) for type-level rules.

## Philosophy

- MUST: Let errors propagate unless you can recover, transform, or report.
- MUST: Distinguish between expected errors (validation, 404, auth) and unexpected crashes (null ref, network failure).
- NEVER: Swallow errors silently. No empty `catch {}` blocks.

## Server-Side

- MUST: API errors use the standard error shape. See [api.md](api.md).
- MUST: Log unexpected errors with stack traces and request context (user ID, route, timestamp).
- SHOULD: Use an error tracking service (Sentry) for production. Alert on new error patterns, not every occurrence.
- NEVER: Catch errors just to re-throw them unchanged.

## Client-Side

- MUST: Add React error boundaries at route-level to catch render crashes.
- SHOULD: Use toast notifications for recoverable errors (failed saves, network issues).
- SHOULD: Use full-page error states for unrecoverable errors (auth expired, 500).
- SHOULD: Provide a retry action where the operation is idempotent.

## Error Pages

- MUST: Custom 404 page with navigation back to a working state.
- SHOULD: Custom 500 page that doesn't depend on any data fetching.
- SHOULD: `error.tsx` (Next.js) or equivalent at the root layout level.

## Forms

- MUST: Show field-level validation errors inline, not in alerts or toasts.
- SHOULD: Validate on blur for individual fields, on submit for the full form.
