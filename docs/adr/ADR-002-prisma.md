# ADR-002: Prisma as ORM

## Status
Accepted

## Date
2026-05-10

## Owner
CarlosMagnani

---

## Context

BlackBelt uses PostgreSQL. The ORM must provide TypeScript type safety, migration tooling, and a readable schema definition.

## Problem

Choose between Prisma (schema-first, rich tooling) and Drizzle (SQL-first, lighter, faster).

## Decision

Use Prisma.

## Alternatives Considered

| Option | Why Not Chosen |
|--------|----------------|
| Drizzle | Lighter and faster, but less mature migration tooling, less beginner-friendly for schema introspection |
| Raw SQL (pg / postgres.js) | Full control, but no type safety on query results without manual typing |

## Positive Consequences

- Auto-generated TypeScript types from schema — no manual type maintenance
- `prisma migrate dev` handles migration files cleanly
- Readable schema DSL that maps well to `docs/ai-context/04-data-model.md`
- Prisma Studio for visual DB inspection during development
- Strong PostgreSQL support

## Negative Consequences

- Slower query execution than Drizzle or raw SQL for complex queries (not a concern at MVP scale)
- `prisma generate` step required after schema changes
- Prisma Client can be heavy in cold starts (not a concern for Railway always-on server)

## Impact

All data access layer. All repository files. Migrations in `prisma/migrations/`.

## Rollback Plan

Drizzle or raw SQL can be introduced per-module if Prisma becomes a bottleneck. Repositories isolate data access so the migration would be contained.

---

## Notes

Railway Postgres uses direct connection (no pgBouncer). Single `DATABASE_URL` is sufficient.
