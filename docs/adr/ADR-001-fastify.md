# ADR-001: Fastify as HTTP Framework

## Status
Accepted

## Date
2026-05-10

## Owner
CarlosMagnani

---

## Context

BlackBelt needs an HTTP server framework for the Node.js + TypeScript backend. The framework must support typed request/response, plugin architecture, and fast performance.

## Problem

Choose between Express (most popular), Fastify (performance + TypeScript), or Supabase as all-in-one backend.

## Decision

Use Fastify.

## Alternatives Considered

| Option | Why Not Chosen |
|--------|----------------|
| Express | Weak TypeScript support out of the box, older middleware model, slower throughput |
| Supabase all-in-one | Locks business logic into Supabase edge functions. Hard to test, hard to migrate. Domain rules belong in our code, not a vendor. |

## Positive Consequences

- Excellent TypeScript support via generic request/reply typing
- Fast (benchmarks consistently faster than Express)
- Plugin system (`@fastify/jwt`, `@fastify/cors`, `@fastify/helmet`) is clean and composable
- Schema validation built-in (though we use Zod on top)
- Small surface area — no magic

## Negative Consequences

- Smaller ecosystem than Express
- Less StackOverflow coverage for obscure issues
- `@fastify/jwt` requires manual wiring with Supabase JWT secret

## Impact

Backend codebase entirely. All routes, plugins, middleware.

## Rollback Plan

Express is API-compatible enough that controllers and services would not change. Only route registration and plugin wiring would need rewriting.

---

## Notes

Use `@fastify/jwt` with `SUPABASE_JWT_SECRET` for Supabase Auth token verification.
