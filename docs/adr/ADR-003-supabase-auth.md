# ADR-003: Supabase Auth for Authentication

## Status
Accepted

## Date
2026-05-10

## Owner
CarlosMagnani

---

## Context

BlackBelt needs user authentication with email/password, JWT session tokens, and secure token refresh. Building this from scratch adds significant complexity and security risk.

## Problem

Choose between building custom JWT auth (bcrypt + JWT + refresh token rotation) or using a managed auth provider.

## Decision

Use Supabase Auth.

## Alternatives Considered

| Option | Why Not Chosen |
|--------|----------------|
| Custom JWT (bcrypt + @fastify/jwt) | Must implement token rotation, refresh logic, password reset emails, and brute force protection. High risk of security bugs. |
| Auth.js (NextAuth) | Designed for Next.js. Complex adapter pattern for Fastify. |
| Firebase Auth | Google vendor lock-in. Extra dependency without meaningful benefit over Supabase. |

## Positive Consequences

- No custom password hashing or refresh token rotation
- Email/password, magic link, and OAuth built-in
- Password reset email handled automatically
- JWTs are standard — Fastify verifies them with `@fastify/jwt` + `SUPABASE_JWT_SECRET`
- Supabase dashboard for user management during development

## Negative Consequences

- Vendor dependency on Supabase
- Supabase Auth is not plug-and-play with Fastify — requires manual JWT verification middleware
- User table in our DB must be kept in sync with Supabase auth.users (via webhook or on first API call)

## Impact

Auth module, all protected routes, Fastify JWT plugin setup.

## Rollback Plan

JWTs are standard. Switching auth providers means changing token issuance only. Our `User` table already exists independently. Fastify verification middleware would need updating, not the business logic.

---

## Notes

Integration pattern:
1. Frontend calls Supabase Auth SDK to login → receives JWT
2. Frontend sends JWT in `Authorization: Bearer <token>` header
3. Fastify middleware verifies JWT using `SUPABASE_JWT_SECRET`
4. Middleware extracts `sub` (user UUID) and attaches to request
5. On first call from a new user, create row in our `User` table

Required env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`
