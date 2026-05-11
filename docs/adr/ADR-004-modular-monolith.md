# ADR-004: Modular Monolith Architecture

## Status
Accepted

## Date
2026-05-10

## Owner
CarlosMagnani

---

## Context

BlackBelt is an MVP built by a solo developer. The architecture must allow fast iteration while keeping business logic organized and testable. Long-term, modules may need to scale independently.

## Problem

Choose between a microservices architecture, a simple layered monolith, or a modular monolith.

## Decision

Use a modular monolith.

## Alternatives Considered

| Option | Why Not Chosen |
|--------|----------------|
| Microservices | Requires distributed tracing, service discovery, multiple pipelines. Not justified for MVP. |
| Simple layered monolith (by layer) | All routes in one folder, all services in one folder — becomes hard to navigate as features grow |

## Positive Consequences

- One deployable unit — simple CI/CD
- Modules split by domain feature (checkin, belt, academy) — easy to find code
- Each module is independently testable
- Clear boundaries enforce separation of concerns
- Can extract a module into a microservice later if truly needed

## Negative Consequences

- Module boundaries enforced by convention, not by network — requires discipline
- All modules share one database — can't scale DB per module independently

## Impact

Full codebase structure. Every file lives inside a feature module.

## Rollback Plan

N/A — architectural pattern, not a library.

---

## Notes

Module structure:
```
src/modules/<feature>/
  routes.ts       # Fastify route registration
  controller.ts   # Thin request handler
  service.ts      # Use case / business flow
  domain.ts       # Pure domain rule functions
  repository.ts   # Prisma queries only
  types.ts        # Module-local types
```

Modules may only communicate via exported service interfaces — never by directly importing another module's repository or domain.
