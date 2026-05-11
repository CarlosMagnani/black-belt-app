# AGENTS.md — BlackBelt

AI agent instruction file. Read this before touching any code.

---

## Project Identity

BlackBelt is a management platform for Brazilian Jiu-Jitsu academies. MVP product. Three user roles: Owner, Professor, Student. Core flows: academy creation, invite-based join, class schedule, check-in request/validation, belt progression, membership plans.

This is a real MVP being built by a solo developer. Simplicity beats cleverness.

---

## Required Reading Before Making Any Changes

Read these files before starting any task. Do not skip.

1. `AGENTS.md` — this file
2. `docs/ai-context/00-project-overview.md` — what BlackBelt is
3. `docs/ai-context/01-architecture.md` — how the system is structured
4. `docs/ai-context/02-domain-rules.md` — business rules that cannot be violated
5. `docs/ai-context/03-technical-stack.md` — the tech stack
6. `docs/ai-context/04-design-rules.md` — visual and UX rules (for UI changes)
7. `docs/ai-context/current-handoff.md` — current status and context

If you are changing a database structure, also read `docs/ai-context/04-data-model.md`.
If you are implementing a feature, also read `docs/ai-context/05-current-roadmap.md`.

---

## Engineering Principles

- Boring code beats clever code.
- One thing at a time. Small changes. Small PRs.
- Never bypass a domain rule without explicit human approval.
- If unsure, ask. Do not guess.
- Leave the codebase cleaner than you found it, but don't refactor beyond the task.
- No premature abstractions. If something only appears once, don't abstract it.
- Comments explain WHY, not WHAT. If the name explains it, no comment needed.

---

## MVP Simplicity Rules

These rules exist to keep the project survivable for a solo developer:

- Do not introduce microservices.
- Do not create complex event-driven or message-queue architecture.
- Do not add abstractions that don't serve the current task.
- Do not write giant PRs. Each change must be reviewable in under 10 minutes.
- Do not optimize prematurely. Get it working first.
- Do not implement features outside the current MVP scope without explicit approval.
- Do not add payment, QR code check-in, or push notifications until the base flows are stable.
- Do not add a native mobile app layer. This is a PWA.
- Prefer boring, explicit, readable code over elegant, abstract, or "clever" code.

---

## Architecture Rules

See `docs/ai-context/01-architecture.md` for full details.

Short version:
- Layered architecture: UI → API/Controller → Use Cases → Domain Rules → Data Access → Infrastructure
- Business logic lives in the Use Case / Application layer. Not in controllers. Not in components.
- Domain rules live in the Domain layer. They are not negotiable.
- No circular dependencies between layers.
- Data access is isolated. Components and use cases do not write SQL directly.
- Infrastructure (auth, storage, email) is kept behind adapters so it can be swapped.

---

## React / PWA Rules

- Mobile-first. Design for 375px screens first.
- The design system is defined in `design_handoff_black_belt/`. Follow it exactly.
- Do not invent new colors, typography, or component patterns.
- Reuse existing components before creating new ones.
- Touch targets must be at least 44px tall.
- Avoid heavy client-side computation. Keep components focused.
- Route guards must check authentication before rendering protected screens.
- Offline capability comes later. Do not build it now unless explicitly asked.
- Progressive enhancement: the app must work on low-end Android devices.
- Use semantic HTML. Avoid div soup.

---

## Backend Rules

- Keep the backend simple and modular.
- Use a clear folder structure: routes → controllers → services → repositories.
- Business logic belongs in services (use cases), not in routes or controllers.
- Controllers are thin. They validate input, call a service, and return the result.
- Services are the source of truth for what the app can do.
- Repositories handle all database access. Services do not write SQL.
- Validate inputs at the API boundary. Trust internal layers.
- Return consistent error shapes. Do not leak stack traces to the client.
- Do not implement background job queues or message brokers for MVP.

---

## Database Rules

- Use a relational database. Relationships are explicit.
- Every table that changes over time must have `created_at` and `updated_at`.
- Every action that changes data must record `performed_by` (user ID).
- Use foreign key constraints. Do not store orphaned records.
- Do not delete records that are referenced by other records. Use soft deletes or status fields.
- Migrations must be reversible when possible.
- Never modify a migration that has already been applied to production.
- Check `docs/ai-context/04-data-model.md` before changing schema.

---

## Testing Rules

- Write tests for domain rules first. They are the highest-value tests.
- Write tests for use cases (services). They cover the business logic.
- Write integration tests for API routes that touch the database.
- Do not test implementation details. Test behavior.
- A passing test suite does not mean the feature is correct. Test the actual behavior manually too.
- Keep tests fast. Avoid slow database roundtrips in unit tests.
- Mock only external dependencies (email, storage). Do not mock the database in integration tests.

---

## Security Rules

- Never expose raw database errors to the client.
- Never trust user input. Validate and sanitize at every API boundary.
- Invite codes must be validated server-side before accepting a join request.
- Students cannot approve their own check-ins. Enforce this server-side.
- Students cannot change their own belt. Enforce this server-side.
- Role-based access control must be enforced in the API layer, not only in the UI.
- Passwords must be hashed. Never store or log plaintext passwords.
- Tokens must be validated on every protected request.
- Do not hardcode secrets in code. Use environment variables.
- Do not commit `.env` files.

---

## Observability and Logging Rules

- Log meaningful events: auth failures, check-in approvals, belt changes, invite code usage.
- Do not log sensitive data: passwords, tokens, personal information.
- Log who performed what action and when for all data-changing events.
- Use structured logging (JSON format preferred for production).
- Do not add verbose debug logging to production code.
- Keep logs actionable: log events you would actually investigate.

---

## Forbidden Actions Without Human Approval

Never do these without explicit confirmation from the project owner:

- Change any domain rule in `docs/ai-context/02-domain-rules.md`.
- Change the database schema in a way that drops or renames columns.
- Delete files from the repository.
- Change the authentication flow.
- Add a new third-party service or library.
- Change the belt progression algorithm (24 classes per degree).
- Change invite code generation logic.
- Modify the data model for check-ins or belt progression.
- Deploy to production.
- Create a PR that merges to main without review.

---

## Expected Response Format for Agents

When completing a task, your response must include:

```
## Summary
One or two sentences describing what was done.

## Changes Made
- File path: what changed and why
- File path: what changed and why

## Domain Rules Checked
- List which domain rules from 02-domain-rules.md are relevant and how the change respects them.

## Tests
- What was tested (manually or automated)
- Any tests that should be added

## Risks
- Any risks introduced by this change
- Any edge cases that were not handled

## Next Steps
- What should happen next
- Any open questions for the human

## Handoff Updated
- Yes / No
```

---

## Multi-AI Usage

**ChatGPT / OpenAI:** architecture thinking, product decisions, domain modeling, ADRs, PR descriptions, documentation, planning.

**Claude Code:** codebase reading, implementation, refactoring, applying planned changes to existing files.

**OpenCode:** second opinion, diff review, alternative implementation suggestions.

**Workflow:**
1. ChatGPT plans the feature.
2. Claude Code implements one small scoped step.
3. OpenCode reviews the diff.
4. ChatGPT generates documentation, ADR, handoff, PR description.
5. Human reviews and approves.

## Obsidian Memory

This project uses an external Obsidian vault as long-term human memory.

Vault path:

```txt
C:\obsidian-vault