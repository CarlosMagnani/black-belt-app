# Technical Stack — BlackBelt

Stack fully confirmed. No open decisions.

---

## Frontend

**Framework:** React + TypeScript
**Build tool:** Vite

**Delivery:** PWA (Progressive Web App)
- No native mobile app for the MVP
- Service worker for installability
- Mobile-first layout decisions

**Styling:** Tailwind CSS
- Configured with BlackBelt design tokens (colors, fonts, spacing, border radius)
- Do NOT use Tailwind color defaults — only custom token names
- CSS variables defined in `design_handoff_black_belt/README.md` must map to Tailwind theme
- No CSS-in-JS, no component libraries

**Routing:** React Router v7
- Simple, file-based or config-based routes
- Route guards for auth protection
- Role-based route access (owner vs professor vs student screens)

**Server State:** TanStack Query (React Query v5)
- All API data fetching via `useQuery`
- Mutations via `useMutation`
- Cache invalidation after mutations
- Built-in loading/error state handling
- No custom fetch wrappers

**Forms:** React Hook Form + Zod
- Zod schema used for both form validation and API input validation
- Share Zod schemas between frontend and backend (`shared/` package or copy)

**State Management:**
- Local component state first
- React Context for auth session and user profile only
- TanStack Query handles all server state
- No Redux or Zustand for MVP

**PWA Requirements:**
- `vite-plugin-pwa` for service worker + manifest generation
- App icon set for mobile home screen
- Fast first load — keep bundle size small

**Fonts (from design handoff):**
- Archivo Black — display headings
- Anton — splash/logo wordmark only
- Inter — body text (300/400/500/600/700)
- JetBrains Mono — monospace accents, codes, eyebrows

---

## Backend

**Language:** TypeScript (Node.js)
**Framework:** Fastify

- High performance, low overhead
- Excellent TypeScript support (typed request/reply with generics)
- Plugin ecosystem: `@fastify/jwt`, `@fastify/cors`, `@fastify/helmet`
- No framework magic — explicit and readable

**API Style:** REST
- Not GraphQL for MVP
- Response envelope: `{ data, error }`
- JSON bodies

**Authentication:** Supabase Auth
- Managed auth — no custom password hashing or session storage
- Supabase issues JWTs; Fastify validates on each request via `@fastify/jwt`
- Required env var: `SUPABASE_JWT_SECRET`
- User sync: on first login, create a row in our `User` table if not exists

**Input Validation:** Zod
- Validate all request bodies and query params at the API boundary
- Share schemas with frontend where practical

**Folder structure:**
```
src/
  modules/
    auth/         routes, controller, service
    academy/      routes, controller, service, domain, repository
    membership/   routes, controller, service, domain, repository
    schedule/     routes, controller, service, repository
    checkin/      routes, controller, service, domain, repository
    belt/         routes, controller, service, domain, repository
    users/        routes, controller, service, repository
  plugins/        Fastify plugin registrations (jwt, cors, etc.)
  middleware/     Auth guard, error handler
  lib/            Prisma client singleton, shared utilities
  types/          TypeScript types shared across modules
  config/         Env validation (Zod), app config
  app.ts          Fastify instance setup
  server.ts       Entry point, start server
```

---

## Database

**Engine:** PostgreSQL
**ORM:** Prisma
**Hosting:** Railway (managed Postgres)

**Why Prisma:**
- Auto-generated TypeScript types from schema
- Migration tooling (`prisma migrate dev`)
- Readable schema DSL
- Strong PostgreSQL support

**Connection setup with Railway:**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
```
(Railway Postgres uses direct connection — no pooler needed for MVP scale)

**Principles:**
- Explicit relationships (foreign keys in schema)
- Soft deletes via status fields
- `createdAt` and `updatedAt` on every model
- `performedBy` on audit-sensitive models
- Migrations versioned and reversible

See `docs/ai-context/04-data-model.md` for entity definitions.

---

## Architecture

**Pattern:** Modular Monolith
- One deployable unit
- Modules split by domain feature
- Each module owns its own routes, controller, service, domain rules, repository
- No cross-module direct imports — communicate via service interfaces
- Clean layer separation within each module

---

## Testing

**Framework:** Vitest

**Unit tests:**
- Domain rule functions: high coverage
- Pure utility functions: cover edge cases

**Integration tests (Vitest + test database):**
- API routes (spin up Fastify app + test Postgres)
- Check-in approval flow end-to-end
- Belt progression calculation end-to-end
- Do NOT mock the database in integration tests

**E2E:** Not for MVP

---

## Deployment

**Platform:** Railway
- API server: Railway service (Node.js)
- Database: Railway managed Postgres
- Environment variables: Railway dashboard
- Logs: Railway built-in log viewer
- No Kubernetes, no Docker Compose complexity for MVP

**Environment Variables (required):**
```
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=
NODE_ENV=production
PORT=3000
```

**CI:** GitHub Actions
- On PR: lint + type check + unit tests
- On merge to main: deploy to Railway (via Railway GitHub integration)

---

## Future Technical Considerations

Explicitly deferred:

- Push notifications (Web Push / FCM)
- QR code check-in
- Payment processing (Stripe or local gateway)
- Native mobile app (React Native / Expo)
- Real-time WebSocket updates
- Background job queues
- CDN-level caching
- Analytics platform integration

---

## ADRs

All decisions documented in `docs/adr/`:
- ADR-001 — Fastify
- ADR-002 — Prisma
- ADR-003 — Supabase Auth
- ADR-004 — Modular Monolith
- ADR-005 — Tailwind CSS
- ADR-006 — React Router v7
- ADR-007 — TanStack Query
- ADR-008 — Railway
