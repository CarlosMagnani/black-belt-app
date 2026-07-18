# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.

If any of these files do not exist, **proceed silently**. Do not flag their absence or suggest creating them upfront. The domain-modeling skill creates them lazily when terms or decisions actually get resolved.

## File structure

This is a single-context repository:

```
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, or a test name), use the term as defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids.

If the concept you need is not in the glossary, either reconsider whether the project already uses another term or note the gap for the domain-modeling skill.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding it.
