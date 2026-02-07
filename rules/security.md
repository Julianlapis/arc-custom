# Security

Rules for application security. The `security-engineer` agent reviews for OWASP compliance; these rules codify the baseline.

## Authentication & Sessions

For Clerk, WorkOS, and provider-specific rules, see [auth.md](auth.md).

- MUST: Store auth tokens in httpOnly cookies, not localStorage or sessionStorage.
- MUST: Set `Secure`, `SameSite=Lax` (or `Strict`) on auth cookies.
- MUST: Invalidate sessions server-side on logout — don't just delete the client cookie.
- MUST: Verify webhook signatures before processing payloads. Use the provider's SDK verification, not manual HMAC.
- MUST: Enforce RBAC at the data layer (queries/mutations), not just at route or middleware level.
- NEVER: Store secrets, tokens, or API keys in client-accessible code or bundles.
- SHOULD: Use short-lived access tokens with refresh token rotation.
- SHOULD: Rotate refresh tokens on each use (one-time use tokens).

## Input & Output

- MUST: Validate and sanitize all user input at system boundaries (API routes, server actions, form handlers).
- MUST: Use parameterized queries or ORM methods — never interpolate user input into SQL.
- MUST: Escape output in HTML contexts. React handles this by default; raw `dangerouslySetInnerHTML` requires manual sanitization.
- NEVER: Trust client-side validation alone. Always re-validate server-side.
- SHOULD: Use Zod schemas at every API boundary. See [api.md](api.md).

## Headers & Transport

- MUST: Set `Content-Security-Policy` headers on all pages.
- MUST: Set `X-Content-Type-Options: nosniff`.
- MUST: Set `Strict-Transport-Security` with `max-age` >= 1 year.
- SHOULD: Set `X-Frame-Options: DENY` unless embedding is required.
- SHOULD: Set `Referrer-Policy: strict-origin-when-cross-origin`.

## CSRF & CORS

- MUST: Use `SameSite` cookies or CSRF tokens for state-changing requests.
- MUST: Configure CORS allowlists explicitly — never use `Access-Control-Allow-Origin: *` with credentials.
- SHOULD: Prefer server actions or `SameSite=Lax` cookies over manual CSRF tokens in Next.js.

## Secrets

- MUST: All secrets live in environment variables, never in source code. See [env.md](env.md).
- MUST: Rotate compromised secrets immediately.
- NEVER: Log secrets, tokens, or credentials.
- NEVER: Commit `.env` files or secret values to version control.

## Rate Limiting

- SHOULD: Rate-limit authentication endpoints (login, signup, password reset).
- SHOULD: Rate-limit expensive operations (file uploads, AI calls, email sends).
- SHOULD: Return `429 Too Many Requests` with `Retry-After` header.

## Dependencies

- SHOULD: Run `pnpm audit` regularly. See [stack.md](stack.md) for approved packages.
- NEVER: Install packages from unknown or unverified sources.
