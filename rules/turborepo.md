# Turborepo

Scope: Monorepo tasks and package setup.

## Just-in-Time Packages

- MUST: Export source TypeScript from packages via `exports` (no `dist` builds).
- SHOULD: Use source-mapped imports for better DX.

```json
{
  "name": "@project/utils",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  }
}
```

## Task Configuration

- MUST: `dev` tasks are persistent and uncached.
- MUST: `build`, `typecheck`, `lint`, `test` depend on upstream (`^task`).
- SHOULD: Keep `turbo.json` minimal — only define tasks that need configuration.
