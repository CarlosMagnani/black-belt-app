# Workflow: Pre-PR Review

Run this before opening any pull request.

---

## Steps

### 1. Run the Pre-PR Checklist

`.ai/checklists/pre-pr.md` — all items must be checked.

### 2. Domain Rule Review

Use `.ai/prompts/review-domain-rules.md`.

Paste the diff and verify every domain rule is still enforced.

### 3. Architecture Review

Check layer boundaries:
- Is business logic in the service layer (not controller or component)?
- Are repositories the only place with database queries?
- Does the frontend call only API endpoints, not internal services?

### 4. Security Review

- All mutating endpoints protected by auth?
- Input validated at the API boundary?
- No secrets hardcoded?
- No stack traces or database errors returned to client?

### 5. Diff Review (OpenCode)

Use `.ai/prompts/review-diff.md` with OpenCode.

Get a second model's opinion on the changes.

### 6. Write the PR Description

Include:
- What was implemented
- Which domain rules it enforces (and how)
- How to test it manually
- Any edge cases that were intentionally deferred
- Any risks or follow-up needed

### 7. Open the PR

- Target branch: `main`
- Title: `[feature/fix/chore]: short description`
- Request human review before merging

---

## PR Size Rule

If the PR touches more than 5 files in meaningful ways, consider splitting it.
Small PRs get reviewed faster and catch bugs earlier.
