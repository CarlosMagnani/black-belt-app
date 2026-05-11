# Prompt: Create Tests

Use this with Claude Code to write tests for domain rules or use cases.

---

## Template

```
I am building BlackBelt — a BJJ academy management platform.

Write tests for: [domain rule / use case / API endpoint]

The code under test:
[paste the relevant function or module]

Domain rules that apply:
[paste from docs/ai-context/02-domain-rules.md]

Test the following scenarios:
[list the cases — or ask the AI to derive them from the domain rules]

Requirements:
- Test behavior, not implementation
- Do not mock the database in integration tests
- Do mock external services (email, storage)
- Test the happy path and the rejection cases
- Test every domain rule explicitly

Testing framework: [Vitest / Jest — whichever is confirmed in the stack]

Output:
- Test file with all test cases
- List of edge cases covered
- List of edge cases not covered (and why, if deferred)
```

---

## Priority Test Cases (for each domain area)

**Check-in:**
- Student cannot approve their own check-in
- Pending is the only valid initial status
- Rejected check-ins do not count toward belt progress
- Duplicate check-in for same student/class/date is rejected

**Belt:**
- 24 approved classes → degree advance
- Degree 4 + 24 classes → belt advance + degree reset
- Student cannot change their own belt
- Belt changes are recorded in BeltProgressionEvent

**Academy:**
- One owner → one academy
- Invite code required to join
- Duplicate membership in same academy is rejected
