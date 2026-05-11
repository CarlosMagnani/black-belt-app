# Workflow: Domain Rule Change

Changing a domain rule is a high-risk operation. It affects correctness of the entire system.

---

## When This Applies

- Changing the belt progression threshold (currently 24 classes per degree)
- Changing the belt hierarchy
- Changing who can approve check-ins
- Changing invite code rules
- Changing who can modify a student's belt
- Adding a new constraint or removing an existing one

---

## Steps

### 1. Human Decision First

No domain rule changes without explicit human approval.

State clearly:
- Which rule is changing
- Why it is changing
- What the new rule is
- What existing data is affected

Get written confirmation before proceeding.

### 2. Create an ADR

Use `.ai/prompts/create-adr.md`.

Record:
- Old rule
- New rule
- Why the change was made
- Impact on existing data
- Rollback plan

### 3. Update the Domain Rules File

Update `docs/ai-context/02-domain-rules.md` with the new rule.

### 4. Update Domain Layer Code

Update the pure domain functions that encode this rule.

### 5. Update Use Cases

Find every use case that depends on this rule and update accordingly.

### 6. Update Tests

Update tests to reflect the new rule.
Add tests for the new behavior.
Confirm old behavior is no longer accepted.

### 7. Data Migration (if needed)

If existing data violates the new rule:
- Write a migration that corrects the data
- Document the migration in the ADR
- Get human approval before running in production

### 8. Update Documentation

- `docs/ai-context/02-domain-rules.md` — already updated in step 3
- `docs/ai-context/current-handoff.md`
- Any agent files that reference the changed rule
