# Prompt: Plan a Feature

Use this with ChatGPT or any planning AI before implementation starts.

---

## Template

```
I am building BlackBelt, a management platform for Brazilian Jiu-Jitsu academies. This is an MVP.

Feature to plan: [FEATURE NAME]

Context:
- Project overview: [paste or summarize docs/ai-context/00-project-overview.md]
- Architecture: Simple layered monolith (UI → Controller → Use Case → Domain → Repository)
- Domain rules that apply: [paste relevant rules from docs/ai-context/02-domain-rules.md]
- Current roadmap position: [where this fits in docs/ai-context/06-current-roadmap.md]

Please provide:
1. A plain-language description of what this feature does and who uses it
2. The user flows involved (Owner / Professor / Student — which role does what)
3. The domain rules this feature must enforce
4. A list of use cases (one per user action) with inputs and outputs
5. The data model changes needed (new tables, new fields, new constraints)
6. The API endpoints needed (method, path, auth requirement, request/response shape)
7. The UI screens or components needed
8. A suggested implementation order (smallest first)
9. Risks or edge cases to watch for

Keep it MVP-scoped. Do not plan features beyond what is listed in the roadmap.
```

---

## Notes

- Use this BEFORE writing any code
- The output becomes the spec for Claude Code to implement
- Each use case from this plan should be a separate implementation step
