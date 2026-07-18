# CLAUDE.md — BlackBelt

Claude Code instructions for this repository.

## Before Starting Any Task

Read in this order:
1. `AGENTS.md` — engineering rules and principles
2. `docs/ai-context/00-project-overview.md` — project context
3. `docs/ai-context/02-domain-rules.md` — domain rules (never violate these)
4. `docs/ai-context/current-handoff.md` — what is currently in progress

For UI tasks, also read `docs/ai-context/04-design-rules.md`.
For database tasks, also read `docs/ai-context/04-data-model.md`.

## How to Work Here

- Small changes. One task at a time.
- Read existing code before writing new code.
- When in doubt, read the domain rules before implementing.
- Check `current-handoff.md` to understand what was just done and what comes next.
- After completing a task, update `docs/ai-context/current-handoff.md`.

## What Claude Code Does Here

- Reads and navigates the codebase
- Implements planned changes (features, fixes, refactors)
- Applies designs from `design_handoff_black_belt/` into real React components
- Runs and interprets tests
- Creates and updates files

## What Claude Code Does NOT Do Here

- Plan new features or make architecture decisions (that's ChatGPT's job)
- Create PRs without human review
- Change domain rules without explicit approval
- Deploy to any environment
- Make large sweeping refactors without a clear plan

## Design Reference

All UI must follow `design_handoff_black_belt/README.md`.

The design is high-fidelity and final. Do not invent new styles.

Design tokens are defined there. Use them exactly.

## Domain Rules Are Non-Negotiable

If an implementation would violate a rule in `docs/ai-context/02-domain-rules.md`, stop and surface the conflict to the human before proceeding.

## Style

- No unnecessary comments.
- No hallucinated abstractions.
- No premature optimization.
- TypeScript preferred over JavaScript for new files.
- Consistent naming with the existing codebase.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

This repository uses the five default canonical triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain documentation layout. See `docs/agents/domain.md`.
