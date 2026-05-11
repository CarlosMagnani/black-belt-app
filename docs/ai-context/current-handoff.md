# Current Handoff — BlackBelt

Use this file to pass context between AI sessions, tools, or team members.
Update it at the end of every working session.

---

## Current Goal

Stack fully confirmed. Ready to scaffold the project.

## Context

BlackBelt is a BJJ academy management platform (MVP). No application code exists yet. Harness Engineering complete. Tech stack locked. Next session starts the scaffold.

Design handoff: `design_handoff_black_belt/README.md` — high-fidelity, final.

## Current Status

- [x] Harness Engineering files created
- [x] Tech stack fully confirmed — no open questions
- [x] ADRs created for all major decisions
- [ ] Project scaffold: NOT STARTED
- [ ] Application code: NOT STARTED
- [ ] Backend: NOT STARTED
- [ ] Database schema / migrations: NOT STARTED
- [ ] Authentication: NOT STARTED

## Confirmed Stack

| Decision | Choice |
|----------|--------|
| Architecture | Modular Monolith |
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Router | React Router v7 |
| Server state | TanStack Query |
| Backend | Fastify + TypeScript |
| Database | PostgreSQL + Prisma |
| Auth | Supabase Auth |
| Deploy | Railway |
| Validation | Zod (frontend + backend) |
| Forms | React Hook Form |
| Tests | Vitest |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Tailwind CSS | Fastest way to implement design tokens as utilities, consistent dark surfaces, red accent, sharp geometry |
| React Router v7 | Simple, mature, enough for MVP PWA navigation |
| TanStack Query | Handles fetching, mutations, cache, loading/error states without custom plumbing |
| Railway | Fast setup for API + DB + env vars + logs. No infra complexity before product is validated |

## Files Changed

- `docs/ai-context/03-technical-stack.md` — all TBDs resolved
- `docs/ai-context/current-handoff.md` — this file
- `docs/ai-context/01-architecture.md` — updated to Modular Monolith
- `docs/adr/ADR-001-fastify.md` — created
- `docs/adr/ADR-002-prisma.md` — created
- `docs/adr/ADR-003-supabase-auth.md` — created
- `docs/adr/ADR-004-modular-monolith.md` — created
- `docs/adr/ADR-005-tailwind.md` — created
- `docs/adr/ADR-006-react-router-v7.md` — created
- `docs/adr/ADR-007-tanstack-query.md` — created
- `docs/adr/ADR-008-railway.md` — created
- Obsidian `008 - Tech Stack.md` — updated

## Next Steps

1. Initialize frontend: `npm create vite@latest blackbelt-web -- --template react-ts`
2. Initialize backend: `mkdir blackbelt-api && cd blackbelt-api && npm init -y`
3. Install frontend deps: `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`
4. Install backend deps: `fastify`, `@fastify/jwt`, `@fastify/cors`, `zod`, `prisma`, `@prisma/client`
5. Set up Tailwind in frontend project
6. Create Prisma schema from `docs/ai-context/04-data-model.md`
7. Set up Supabase project (get `SUPABASE_JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`)
8. Set up folder structure per `docs/ai-context/01-architecture.md`
9. Apply design tokens as Tailwind config (colors, fonts, spacing from design handoff)
10. Build first screen: Splash / Role Split (`ScreenSplash`)

## Open Questions

None. Stack is fully locked.

## Risks

- Supabase Auth + Fastify: JWT verification requires `@fastify/jwt` with `SUPABASE_JWT_SECRET`. Not plug-and-play.
- Prisma + Supabase Postgres: needs two connection URLs (`DATABASE_URL` pooler port 6543, `DIRECT_URL` port 5432)
- Tailwind + design tokens: configure `tailwind.config.ts` to extend theme with exact BlackBelt tokens — do not use Tailwind defaults for colors
- Design handoff uses Babel-in-browser — do not copy to production

## Tests Executed

- No tests yet (no application code)

## Commands Executed

```
# No application commands run yet
```

## Notes for the Next AI

- Read `design_handoff_black_belt/README.md` before touching any UI
- Tailwind must be configured with BlackBelt design tokens — see `docs/ai-context/04-design-rules.md`
- Do NOT use Tailwind color defaults (slate, gray, red-500) — use custom tokens only
- Auth flow: Supabase handles login UI or headless → returns JWT → Fastify validates
- Modular monolith: each feature module owns routes + controller + service + domain + repository
- Update this file at the end of every session
