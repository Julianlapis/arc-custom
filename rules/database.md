# Database

Rules for database design and operations. The `data-engineer` agent reviews for migration safety and data integrity; these rules codify the baseline. See [stack.md](stack.md) for approved tools (Neon + Drizzle).

## Schema Design

- MUST: Every table has a primary key. Prefer `cuid2` or `uuid` over auto-increment for distributed/serverless.
- MUST: Use `NOT NULL` by default. Only allow `NULL` when absence is semantically meaningful.
- MUST: Add foreign key constraints for all relationships. No orphaned references.
- SHOULD: Add `created_at` and `updated_at` timestamps to all tables.
- SHOULD: Use `text` over `varchar` in PostgreSQL — there is no performance difference.
- NEVER: Store derived data that can be computed from existing columns.

## Migrations

- MUST: Migrations are additive in production — add columns, don't drop them.
- MUST: New columns on existing tables MUST be nullable or have a default value.
- MUST: Test migrations against a copy of production data before deploying.
- NEVER: Drop columns, tables, or indexes in the same deployment as the code change. Remove the code reference first, deploy, then drop.
- SHOULD: Use `db:push` for development, migrations for production.
- SHOULD: Keep migrations small and focused — one concern per migration.

## Queries

- MUST: Use parameterized queries or ORM methods. Never interpolate user input. See [security.md](security.md).
- MUST: Add indexes for columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses.
- SHOULD: Use `select()` to fetch only needed columns — avoid `SELECT *`.
- SHOULD: Use transactions for operations that must be atomic (multi-table writes, balance transfers).
- NEVER: Run unbounded queries. Always paginate or limit results.

## Connection Management

- MUST: Use connection pooling in serverless environments (Neon's pooler, PgBouncer).
- SHOULD: Set reasonable connection limits per environment (dev: 5, production: 25+).
- NEVER: Open database connections in client-side code.

## Soft Deletes

- SHOULD: Use soft deletes (`deleted_at` timestamp) for user-facing data that may need recovery.
- MUST: If using soft deletes, filter deleted records in all default queries.
- MAY: Use hard deletes for ephemeral data (logs, sessions, temporary tokens).
