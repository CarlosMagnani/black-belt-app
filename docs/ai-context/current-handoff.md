# Current Handoff — BlackBelt

Use this file to pass context between AI sessions, tools, or team members.
Update it at the end of every working session.

---

## Current Goal

Backend scaffold complete. Next: first screen (ScreenSplash) and then Supabase project setup + JWT auth plugin.

## Context

BlackBelt is a BJJ academy management platform (MVP). Frontend scaffold is done and builds clean. Tech stack locked. Design handoff: `design_handoff_black_belt/README.md` — high-fidelity, final.

## Current Status

- [x] Harness Engineering files created
- [x] Tech stack fully confirmed — no open questions
- [x] ADRs created for all major decisions
- [x] Frontend scaffold: COMPLETE (`frontend/` — Vite + React + TS + Tailwind v4 + BlackBelt tokens)
- [x] Backend scaffold: COMPLETE (`backend/` — Fastify + TS + Prisma 7 + all 8 models)
- [ ] Application code: NOT STARTED
- [ ] Database schema / migrations: NOT STARTED (schema written, no DB connected yet)
- [ ] Authentication: NOT STARTED

## Confirmed Stack

| Decision | Choice |
|----------|--------|
| Architecture | Modular Monolith |
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS v4 (via @tailwindcss/vite) |
| Router | React Router v7 |
| Server state | TanStack Query v5 |
| Backend | Fastify + TypeScript |
| Database | PostgreSQL + Prisma |
| Auth | Supabase Auth |
| Deploy | Railway |
| Validation | Zod (frontend + backend) |
| Forms | React Hook Form |
| Tests | Vitest |

## Frontend Scaffold Details

- **Location:** `C:\Projects\black-belt-app\frontend\`
- **Tailwind version:** v4, configured via `@tailwindcss/vite` plugin (NO tailwind.config.js, NO postcss.config.js)
- **Design tokens:** Defined in `src/index.css` under `@theme {}` — exact BlackBelt tokens
- **Token → Tailwind utility mapping:** `--color-bg` → `bg-bg`, `--color-text` → `text-text`, `--color-muted-2` → `text-muted-2`, `--font-mono` → `font-mono`, etc.
- **Google Fonts:** Loaded in `index.html` — Archivo Black, Anton, Inter, JetBrains Mono
- **vite-plugin-pwa:** Installed but NOT configured yet (scaffold only)
- **Build output:** `dist/assets/index-*.css` (6.65 kB), `dist/assets/index-*.js` (190.61 kB) — clean build

## Files Changed This Session

- `backend/` — entire backend scaffold created (Phase 0)
- `backend/package.json` — npm project with all deps + scripts
- `backend/tsconfig.json` — TS config (module: Node16, target: ES2022, strict mode)
- `backend/prisma/schema.prisma` — all 8 models (Prisma 7 compatible, no url in datasource)
- `backend/prisma.config.ts` — Prisma 7 config file (datasource URL, migration path)
- `backend/.env` — local dev env vars (not committed)
- `backend/.env.example` — env template (committed)
- `backend/src/config/env.ts` — Zod env validation
- `backend/src/lib/prisma.ts` — PrismaClient singleton
- `backend/src/app.ts` — Fastify app builder with cors + helmet + health route
- `backend/src/server.ts` — entry point
- `backend/src/modules/{auth,academy,membership,schedule,checkin,belt,users}/` — module folders with .gitkeep
- `backend/src/plugins/`, `middleware/`, `lib/`, `types/`, `config/` — scaffold folders
- `docs/ai-context/current-handoff.md` — this file

## Next Steps

1. Set up Supabase project (get `SUPABASE_JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`)
2. Set up Railway project — provision PostgreSQL, get `DATABASE_URL`
3. Run `prisma migrate dev --name init` once DB is connected
4. Implement `@fastify/jwt` plugin in `src/plugins/` for Supabase JWT validation
5. Build first screen: Splash / Role Split (`ScreenSplash`) — see `design_handoff_black_belt/README.md` §1

## Open Questions

None. Stack is fully locked.

## Risks

- Supabase Auth + Fastify: JWT verification requires `@fastify/jwt` with `SUPABASE_JWT_SECRET`. Not plug-and-play.
- Prisma + Supabase Postgres: needs two connection URLs (`DATABASE_URL` pooler port 6543, `DIRECT_URL` port 5432)
- Design handoff uses Babel-in-browser — do not copy to production

## Tests Executed

- Frontend: `npm run build` — succeeded (0 errors, 0 warnings)
- Frontend: `npm run dev` — server started at localhost:5173 in 256ms
- Backend: `npx prisma generate` — succeeded (Prisma Client v7.8.0 generated)
- Backend: `npx tsc --noEmit` — succeeded (0 errors)

## Commands Executed

```
# Session: frontend scaffold (Phase 0)
cd C:\Projects\black-belt-app\frontend
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom @tanstack/react-query react-hook-form zod
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
npm run build  # ✓ built in 111ms
npm run dev    # ✓ ready in 256ms

# Session: backend scaffold (Phase 0)
cd C:\Projects\black-belt-app\backend
npm init -y
npm install fastify @fastify/jwt @fastify/cors @fastify/helmet zod prisma @prisma/client dotenv
npm install -D typescript @types/node ts-node tsx nodemon
npx prisma init --datasource-provider postgresql
npx prisma generate  # ✓ Prisma Client v7.8.0 generated
npx tsc --noEmit     # ✓ 0 errors
```

## Notes for the Next AI

- Read `design_handoff_black_belt/README.md` before touching any UI
- Tailwind v4 — token syntax is `@theme {}` in CSS, NOT `tailwind.config.js`. Do NOT create a config file.
- Do NOT use Tailwind color defaults (slate, gray, red-500) — use custom token names only (bg, surface, red, muted, etc.)
- Auth flow: Supabase handles login UI or headless → returns JWT → Fastify validates
- Modular monolith: each feature module owns routes + controller + service + domain + repository
- Prisma version is 7.8.0 — breaking changes from 5/6: no `url` in schema.prisma datasource block; URL goes in `prisma.config.ts`; generator kept as `prisma-client-js` (deliberate — the new `prisma-client` generator targets `src/generated/prisma` and assumes ESM; `prisma-client-js` is correct for CommonJS Node backend)
- TypeScript version is 6.0.3 — use `"module": "Node16"` + `"moduleResolution": "node16"` (not CommonJS/node which is deprecated)
- Backend `.env` is protected by root `.gitignore` pattern `.env` — do NOT add a backend-specific .gitignore entry for it
- Update this file at the end of every session
