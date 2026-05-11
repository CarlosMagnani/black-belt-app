# Prompt: Implement a Small Step

Use this with Claude Code when implementing one piece of a planned feature.

---

## Template

```
I am building BlackBelt — a BJJ academy management platform. MVP. Read the context files before starting.

Files to read first:
- AGENTS.md
- docs/ai-context/02-domain-rules.md
- docs/ai-context/current-handoff.md

Task: [ONE SPECIFIC TASK — e.g. "Implement the RequestCheckIn use case"]

Specification:
[Paste the specific use case spec from the planning output]

Constraints:
- This is an MVP — keep it simple
- Business logic goes in the service/use case layer, not the controller
- Input validation at the API boundary
- Domain rules must be enforced — do not bypass them
- [Any additional constraints specific to this task]

Files that may be relevant:
- [list relevant existing files]

Expected output:
- List of files created or modified
- Brief explanation of each decision
- Domain rules checked and how they are enforced
- Tests written or needed
- Risks

Make ONE small change. Do not refactor surrounding code. Do not implement adjacent features.
```

---

## Notes

- Run one prompt per use case, not one prompt per feature
- If the task feels too big, split it
- Always update docs/ai-context/current-handoff.md after completing the step
