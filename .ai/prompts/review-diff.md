# Prompt: Review a Diff

Use this with OpenCode or any second-opinion AI after implementing a change.

---

## Template

```
I am building BlackBelt — a BJJ academy management platform. Please review this diff.

Domain rules to check (from docs/ai-context/02-domain-rules.md):
[paste relevant domain rules]

Architecture rules (from docs/ai-context/01-architecture.md):
- Business logic must be in the service/use case layer
- Controllers must be thin
- Repositories handle data access only
- No circular dependencies between layers

Diff:
[paste git diff here]

Review for:
1. Domain rule violations — flag any check-in, belt, or invite code rule that is not enforced
2. Layer boundary violations — business logic in the wrong layer
3. Missing auth guards on mutating endpoints
4. Missing input validation
5. Unnecessary complexity for an MVP
6. Security issues (SQL injection, trust of user input, exposed errors)
7. Missing tests for domain logic

Response format:
- Pass / Request Changes / Fail
- One bullet per issue found with file:line reference
- Summary of what's good
- Required changes before this can be merged
```

---

## Notes

- Use after Claude Code implements something
- Run with OpenCode for a different model perspective
- This is a cheap catch — run it before opening any PR
