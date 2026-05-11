# ADR-008: Railway for Deployment

## Status
Accepted

## Date
2026-05-10

## Owner
CarlosMagnani

---

## Context

BlackBelt needs a hosting platform for the API server and PostgreSQL database. The platform must be simple to set up, require no infrastructure expertise, support environment variables, and provide logs for debugging.

## Problem

Choose between Railway, Render, Fly.io, or a VPS (DigitalOcean, Hetzner).

## Decision

Use Railway.

## Alternatives Considered

| Option | Why Not Chosen |
|--------|----------------|
| Render | Similar to Railway. Railway has slightly better DX and faster deploy pipeline for Node.js. |
| Fly.io | More powerful but more complex (Dockerfile required, Fly config). Not justified pre-validation. |
| VPS (DigitalOcean) | Full control but requires manual server setup, SSL config, process management. Too much ops for MVP. |

## Positive Consequences

- GitHub integration — push to main deploys automatically
- Managed Postgres available on the same platform (same dashboard)
- Environment variables managed in Railway dashboard
- Built-in log viewer for debugging production issues
- Free tier available for development/staging
- Zero Docker knowledge required to start

## Negative Consequences

- Railway pricing scales with usage — must monitor as traffic grows
- Less control over server configuration than a VPS
- Vendor dependency

## Impact

Deployment pipeline, CI/CD, database hosting, environment variable management.

## Rollback Plan

Fastify + Node.js runs on any platform. Migration to Render, Fly.io, or a VPS requires: (1) copy env vars, (2) export Postgres, (3) update DNS. No code changes.

---

## Notes

Railway services needed:
1. **API service** — Node.js, connected to GitHub `main` branch
2. **Postgres service** — Railway managed, same project

Environment variables to set in Railway dashboard:
```
DATABASE_URL         ← Railway provides this automatically from Postgres service
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_JWT_SECRET
NODE_ENV=production
PORT=3000
```

Migrations on deploy: add `prisma migrate deploy` to the Railway start command:
```
npx prisma migrate deploy && node dist/server.js
```
