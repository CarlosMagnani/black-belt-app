# Architecture — BlackBelt

## Philosophy

This is an MVP. The architecture must serve one developer building one product fast.

The goal is not elegance. The goal is: clear structure, isolated business rules, survivable codebase.

Complexity is debt. Every abstraction added now must be maintained forever. Add only what serves the MVP.

---

## Why Modular Monolith (Not Microservices)

Microservices require:
- Multiple deployment pipelines
- Network boundaries to manage
- Distributed tracing
- Service discovery
- Contract testing between services

None of these are justified for a single-academy MVP with a small user base.

A modular monolith gives the benefits of clean module separation without the operational overhead. Modules are split by domain feature. One deployable unit. Module boundaries enforced by convention, not by network.

**Rule:** Do not introduce microservices until the product has proven scale demand.

---

## Target Architecture — Modular Monolith

```
┌──────────────────────────────────────────────┐
│  UI Layer (React PWA)                        │
│  Pages, components, forms, route guards      │
└──────────────────┬───────────────────────────┘
                   │ HTTP
┌──────────────────▼───────────────────────────┐
│  API / Controller Layer                      │
│  Receives requests, validates input,         │
│  calls use cases, returns responses          │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│  Application / Use Case Layer                │
│  Orchestrates business flows                 │
│  createAcademy, joinAcademy, requestCheckIn, │
│  approveCheckIn, advanceBelt, etc.           │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│  Domain Rules Layer                          │
│  Pure business rules, no infrastructure      │
│  validateCheckIn, canApproveBelt,            │
│  calculateBeltProgress, isInviteCodeValid    │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│  Data Access Layer                           │
│  Repositories, queries, transactions         │
│  UserRepository, CheckInRepository,          │
│  AcademyRepository, BeltRepository           │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│  Infrastructure Layer                        │
│  Auth provider, storage, email, env config   │
└──────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### UI Layer
- React components and pages
- Route guards (redirect unauthenticated users)
- Calls the API layer via HTTP
- Displays data returned from the API
- Has no direct knowledge of business rules
- Handles loading states, error states, empty states

### API / Controller Layer
- Receives HTTP requests
- Validates input shape and types
- Calls the appropriate use case
- Returns consistent response shapes
- Does not contain business logic
- Does not access the database directly

### Application / Use Case Layer
- One use case per meaningful user action
- Coordinates across repositories and domain rules
- Examples: `CreateAcademy`, `JoinAcademy`, `RequestCheckIn`, `ApproveCheckIn`, `AdvanceBelt`
- Returns result objects (success/failure with data)
- This is where most of the interesting code lives

### Domain Rules Layer
- Pure functions and rule definitions
- No database calls, no HTTP, no side effects
- Examples: `isBeltAdvancementEligible(approvedClasses)`, `isCheckInSelfApproval(studentId, approverId)`
- Easily testable in isolation
- This is where the business rules from `02-domain-rules.md` are encoded

### Data Access Layer
- Repository pattern
- Each repository handles one entity or closely related entities
- No business logic in repositories
- Handles SQL queries, transactions, and database-specific concerns
- If the database changes, only this layer changes

### Infrastructure Layer
- Authentication (JWT validation, session management)
- File storage (profile photos)
- Email sending (invite codes, notifications)
- Environment configuration
- External service clients

---

## Dependency Direction

Dependencies flow downward only:

```
UI → API → Use Cases → Domain Rules
                     → Data Access → Infrastructure
```

Upper layers call lower layers. Lower layers never import upper layers.

**Violation example (do not do this):**
- A repository calling a use case
- A domain rule importing a controller
- A component directly calling a repository

---

## Module Boundaries

The codebase should be organized into feature modules. Each module owns its controllers, use cases, and repositories for its domain.

Suggested top-level modules:
- `auth` — authentication, session, password
- `academy` — academy creation, settings, invite codes
- `membership` — joining academy, membership plans, student-academy link
- `schedule` — class schedule, recurring classes
- `checkin` — check-in requests, approval, rejection
- `belt` — belt progression, degree tracking, belt history
- `users` — user profiles, role management

Each module should be readable independently without needing to trace through other modules.

---

## What Not To Build Yet

These are explicitly out of scope until the core MVP is proven:

- Event-driven architecture (message queues, pub/sub)
- Background job queues (email queues, notification workers)
- CQRS (Command Query Responsibility Segregation)
- GraphQL (REST is fine for this scale)
- WebSocket real-time updates
- Caching layers (Redis, Memcached)
- Native mobile app architecture
- Multi-tenant support
- Multi-academy support per owner

---

## Frontend Architecture

```
src/
  pages/          # One file per route/screen
  components/     # Reusable UI components
  features/       # Feature-level components and logic
  hooks/          # Custom React hooks
  services/       # API call functions
  contexts/       # React contexts (auth, etc.)
  utils/          # Pure utility functions
  types/          # TypeScript type definitions
  styles/         # Global styles, design tokens
```

Keep components small. Extract logic to hooks when components get complex. Keep pages thin — they compose components, don't contain logic.

---

## Backend Architecture

```
src/
  routes/         # Express/Fastify route definitions
  controllers/    # Request handlers (thin)
  services/       # Use cases and business flows
  domain/         # Domain rules (pure functions)
  repositories/   # Data access
  infrastructure/ # Auth, storage, email clients
  middleware/     # Auth, error handling, validation
  types/          # TypeScript types
  config/         # Environment and app config
```

---

## ADR Policy

Any decision that significantly changes the architecture, adds a major dependency, or changes a domain rule must be recorded in `docs/adr/`.

Use `docs/adr/ADR-000-template.md` as the template.
