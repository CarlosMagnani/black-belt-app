# ADR-009: Professors Are Promoted Existing Students

## Status
Accepted

## Date
2026-07-18

## Context

The MVP needs professors to validate check-ins for their classes and act as class instructors. Account onboarding intentionally offers only Owner and Student roles.

## Decision

An owner grants or revokes the Professor role for an existing student in that academy by changing their `AcademyMember.role`. The MVP does not provide a separate professor invite or onboarding path.

## Alternatives Considered

| Option | Why Not Chosen |
|---|---|
| Separate professor onboarding | Adds an account path and invite flow before the academy's core operations are proven. |
| Owner-created professor accounts | Would require the owner to handle another person's identity and credentials. |

## Consequences

- Professor management starts from the academy roster.
- A professor retains their student membership, rank history, and subscription; their role adds the authority to review check-ins for their assigned classes only, never authority to change student rank.
- A professor remains an academy member after the role is revoked and returns to the Student role.
- Any future dedicated professor invitation must supersede this decision explicitly.
