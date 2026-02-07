# Testing

## Strategy

- MUST: Write unit tests for core logic.
- SHOULD: Write integration tests for features that cross boundaries.
- MUST: Write E2E tests with Playwright for critical user flows.
- SHOULD: Co-locate test files with source or use `__tests__` directories consistently.
- SHOULD: Run `pnpm test` before merging.

## Commands

| Scope | Unit | E2E |
|-------|------|-----|
| Single app | `pnpm test` | `pnpm test:e2e` |
| Monorepo (all) | `pnpm test` | — |
| Monorepo (scoped) | `pnpm --filter <pkg> test` | `pnpm --filter <app> test:e2e` |

## Vitest

- MUST: Use Vitest for unit and integration tests.
- SHOULD: Use Browser Mode (`@vitest/browser-playwright`) for component tests that need a real DOM.
- SHOULD: Use `expect.element()` with `toBeInViewport()` for visibility assertions in browser mode.

## Playwright

- MUST: Use `data-testid` attributes for E2E selectors.
- MUST: Use kebab-case for test IDs, matching component filenames. See [react.md](react.md).
- NEVER: Select by text content, CSS classes, or DOM structure — these change frequently.
- SHOULD: Use semantic locators (`getByRole`, `getByLabel`) for accessible elements.
- SHOULD: Prefix child element test IDs with the parent component name.

## E2E with External APIs

Tests that hit real external APIs MUST run — don't skip them because "no live API". Use fail-fast patterns to control cost:

- MUST: Run E2E tests against real APIs for critical flows. Mocks hide real failures.
- MUST: Use aggressive timeouts (15s max for API calls, 30s max per test).
- MUST: Run AI/LLM-dependent tests serially (`test.describe.configure({ mode: "serial" })`).
- MUST: Set `retries: 0` for API-dependent tests — no burning credits on flaky upstream.
- SHOULD: Include an API health check as the first test to abort early if service is down.
- SHOULD: Centralize timeout constants (`TIMEOUT.API_RESPONSE`, `TIMEOUT.PAGE_LOAD`).

## Test Quality

- MUST: Test behavior, not implementation. Tests survive refactors.
- MUST: Each test has a single clear assertion. No "test everything" blocks.
- NEVER: Use `sleep`/`setTimeout` in tests. Wait for specific conditions.
- SHOULD: Use MSW for API mocking in integration tests, not manual fetch stubs.
