# API Design

Rules for HTTP APIs, tRPC routers, and server actions.

## Design Principles

- MUST: Design APIs as contracts — consumers depend on stability.
- MUST: Use OpenAPI 3.1 specification for all HTTP APIs.
- MUST: Consistent error format across all endpoints (see Error Shape below).
- SHOULD: Version via URL prefix (`/v1/`) only when introducing breaking changes.
- SHOULD: Prefer cursor-based pagination over offset-based.
- NEVER: Sensitive data in query parameters (tokens, passwords, PII).
- NEVER: Expose internal IDs or database structure in responses.

## HTTP Conventions

| Method | Use | Idempotent |
|--------|-----|------------|
| GET | Read resources, queries | Yes |
| POST | Create resources, mutations, RPC actions | No |
| PUT | Full replacement of a resource | Yes |
| PATCH | Partial update | No |
| DELETE | Remove a resource | Yes |

### Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful read or update |
| 201 | Created | Successful creation |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Malformed input, validation failure |
| 401 | Unauthorized | Missing or invalid auth |
| 403 | Forbidden | Valid auth, insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate or state conflict |
| 422 | Unprocessable | Valid syntax but semantic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled failure |

## Error Shape

All API errors return the same structure:

```json
{
  "error": {
    "code": "auth/token-expired",
    "message": "Your session has expired. Please sign in again.",
    "details": {}
  }
}
```

- MUST: `code` is machine-readable, namespaced (`domain/error-name`).
- MUST: `message` is human-readable, safe to display.
- SHOULD: `details` provides structured context (field errors, limits, etc.).

## tRPC

When using tRPC as the typesafe client data layer:

- MUST: Use `@trpc/tanstack-react-query` with `queryOptions`/`mutationOptions`.
- MUST: Zod for all input validation.
- SHOULD: Organize routers by domain (`user`, `posts`, `billing`).
- SHOULD: Use `superjson` as transformer for Date/Map/Set serialization.
- See [integrations.md](integrations.md) for adapter error handling rules.

## OpenAPI Generation

- MUST: Generate OpenAPI specs from code — never hand-write them.
- SHOULD: Use `zod-openapi` when building Zod-first HTTP APIs.
- SHOULD: Use `trpc-openapi` when exposing tRPC routers as REST endpoints.
- SHOULD: Serve the spec at `/api/openapi.json` for tooling and agent consumption.

## Documentation

- MUST: Every public API has a machine-readable spec (OpenAPI or tRPC router type).
- SHOULD: Include example requests and responses in OpenAPI descriptions.
- SHOULD: Document rate limits, auth requirements, and pagination in the spec.

## CLI Surface

Every project with an API should ship a CLI that exposes it. See [cli.md](cli.md).
