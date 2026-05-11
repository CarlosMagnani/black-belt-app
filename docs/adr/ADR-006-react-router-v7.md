# ADR-006: React Router v7

## Status
Accepted

## Date
2026-05-10

## Owner
CarlosMagnani

---

## Context

BlackBelt is a React PWA with multiple screens and role-based navigation. Auth-protected routes must redirect unauthenticated users. Role-based routes must restrict access by user role (owner vs professor vs student).

## Problem

Choose a client-side routing library. Options: React Router v7, TanStack Router, or file-based routing via a meta-framework.

## Decision

Use React Router v7 (client-side mode, not framework mode).

## Alternatives Considered

| Option | Why Not Chosen |
|--------|----------------|
| TanStack Router | More complex type-safe route params. Good but overkill for MVP routes. |
| Next.js App Router | SSR framework overhead not needed for PWA. Added complexity without benefit. |
| Wouter | Minimal and lightweight, but lacks nested route support needed for auth guards. |

## Positive Consequences

- Simple, well-understood API (`<Route>`, `<Link>`, `useNavigate`, `useParams`)
- Nested routes support role-based layouts cleanly
- `<Navigate>` for auth guards is straightforward
- Excellent Vite PWA compatibility
- Mature ecosystem, well-documented

## Negative Consequences

- v7 API changes some v6 patterns (loaders, actions) — must not use framework-mode loaders to avoid confusion
- Data loading via loaders conflicts with TanStack Query — use Query exclusively for data fetching, Router for navigation only

## Impact

Frontend routing. `src/router.tsx` or `src/routes.tsx`. Auth guard components.

## Rollback Plan

TanStack Router can replace React Router. Route definitions would need rewriting but page components would not change.

---

## Notes

Use client-side mode only. Do not use React Router v7 loaders/actions — TanStack Query handles all data fetching.

Auth guard pattern:
```tsx
function ProtectedRoute({ role }: { role?: 'owner' | 'professor' | 'student' }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/home" replace />
  return <Outlet />
}
```
