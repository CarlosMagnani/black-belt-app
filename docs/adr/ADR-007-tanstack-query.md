# ADR-007: TanStack Query for Server State

## Status
Accepted

## Date
2026-05-10

## Owner
CarlosMagnani

---

## Context

BlackBelt's frontend needs to fetch data from the API, handle loading and error states, trigger mutations (approve check-in, request check-in, promote student), and invalidate stale cache after changes. Without a server state library this requires significant custom plumbing.

## Problem

Choose between TanStack Query (React Query v5), SWR, or custom fetch hooks.

## Decision

Use TanStack Query (React Query v5).

## Alternatives Considered

| Option | Why Not Chosen |
|--------|----------------|
| SWR | Simpler API but weaker mutation handling and cache invalidation. TanStack Query is better for mutation-heavy flows like check-in approval. |
| Custom fetch hooks | No caching, no deduplication, no automatic refetch. Too much boilerplate for MVP. |
| Redux Toolkit Query | Brings Redux into the stack unnecessarily. Overkill. |

## Positive Consequences

- `useQuery` handles fetching, caching, loading, error states out of the box
- `useMutation` + `invalidateQueries` handles mutation → cache refresh cleanly
- Automatic background refetch keeps dashboard data fresh
- Devtools for debugging cache state during development
- No custom loading/error state management in components

## Negative Consequences

- One more library in the bundle (~13kb gzipped)
- Query key management must be consistent — use key factories per module

## Impact

All data fetching in the frontend. Every API call goes through TanStack Query.

## Rollback Plan

Replace `useQuery` / `useMutation` calls with custom `useState` + `useEffect` hooks. Contained to service/hook files if properly abstracted.

---

## Notes

Use query key factories to avoid key collisions:
```ts
export const checkInKeys = {
  all: ['check-ins'] as const,
  pending: (academyId: string) => ['check-ins', academyId, 'pending'] as const,
  byStudent: (studentId: string) => ['check-ins', 'student', studentId] as const,
}
```

After approving a check-in, invalidate:
- `checkInKeys.pending(academyId)`
- `beltKeys.progress(studentId)` (belt progress may have changed)
