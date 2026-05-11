# Workflow: Feature Development

For adding any new feature to BlackBelt. Keep steps small.

---

## Steps

### 1. Plan 

Use `.ai/prompts/plan-feature.md`.

Output: use cases, API endpoints, data model changes, UI screens, implementation order.

### 2. Check Domain Rules

Before touching code, verify the planned feature doesn't conflict with `docs/ai-context/02-domain-rules.md`.

If a conflict exists: resolve it with the human before proceeding.

### 3. Pre-implementation Checklist

Run `.ai/checklists/pre-implementation.md`. All items must pass.

### 4. Implement — One Step at a Time 

Use `.ai/prompts/implement-step.md` for each use case.

Order:
1. Database migration (if schema changes needed)
2. Domain rule functions (pure, testable)
3. Repository methods (data access)
4. Use case / service (business flow)
5. API route + controller (thin layer)
6. Frontend screen / component (follow design handoff)

Never skip ahead. Each step should work before the next starts.

### 5. Test

After each step, write or verify tests using `.ai/prompts/create-tests.md`.

Priority: domain rules > use cases > API routes.

### 6. Review 

Use `.ai/prompts/review-diff.md`. Run against the diff for each step.

### 7. Pre-PR Checklist

Run `.ai/checklists/pre-pr.md`. All items must pass before opening a PR.

### 8. Update Documentation

Use `.ai/prompts/update-docs.md` and `.ai/prompts/create-handoff.md`.

Update `docs/ai-context/current-handoff.md`.

If a significant decision was made, create an ADR using `.ai/prompts/create-adr.md`.

---

## Time Budget (MVP)

Each feature should be completable in 1–3 working sessions.
If it takes longer, split the feature into smaller deliverable steps.
