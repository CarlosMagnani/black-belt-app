# ADR-010: Activity Events for the Owner Audit Feed

## Status
Accepted

## Date
2026-07-18

## Context

The owner dashboard requires a recent activity feed, while the MVP also requires meaningful data changes to identify who acted and when. Deriving activity from feature tables would omit operations and actors.

## Decision

Write a narrow, immutable `ActivityEvent` record in the same database transaction as each meaningful academy operation. Events are stored only for audit and the owner feed; they are not dispatched asynchronously and do not introduce an event-driven architecture.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Derive the feed from existing tables | Cannot consistently represent all actions or their actor. |
| Event bus or background worker | Adds operational complexity with no MVP need. |
