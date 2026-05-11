# Prompt: Create an ADR

Use this with ChatGPT when a significant technical decision is made.

---

## Template

```
I am building BlackBelt — a BJJ academy management platform. I need to document a technical decision as an Architecture Decision Record (ADR).

Decision made: [Describe the decision in one sentence]

Context:
- [Why was this decision needed?]
- [What constraints existed?]
- [What was the problem being solved?]

Options that were considered:
- [Option A]: [brief description]
- [Option B]: [brief description]
- [Option chosen]: [brief description]

Why this option was chosen:
- [Main reasons]

Downsides or tradeoffs accepted:
- [What we give up]

Using the ADR template at docs/adr/ADR-000-template.md, generate a complete ADR.

Number it as ADR-[NNN] (next available number in docs/adr/).

Be concise. This is an MVP — we don't need a 10-page decision document.
```

---

## When to Create an ADR

- Choosing a framework or major library
- Choosing the database or ORM
- Choosing the auth approach
- Choosing the deployment platform
- Making a non-obvious architecture choice
- Deciding to deviate from the planned architecture

## ADR Numbering

Check `docs/adr/` for existing ADRs and use the next available number.
Current template: `ADR-000-template.md`
First real ADR: `ADR-001-[short-title].md`
