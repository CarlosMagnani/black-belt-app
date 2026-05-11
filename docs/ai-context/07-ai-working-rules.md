# AI Working Rules — BlackBelt

Rules for how AI agents must work on this codebase. Read this before starting any session.

---

## Before Writing Any Code

1. Read `AGENTS.md`
2. Read `docs/ai-context/00-project-overview.md`
3. Read `docs/ai-context/02-domain-rules.md`
4. Read `docs/ai-context/current-handoff.md`
5. Read any additional context files relevant to the task

Do not skip this step. Working without context causes incorrect implementations.

---

## During Implementation

### Keep Changes Small

- One feature or fix per session
- One file changed at a time when possible
- If a task requires more than 3 files, ask: is this too much for one step?
- Prefer 5 small correct changes over 1 large uncertain one

### Read First, Write Second

- Always read existing files before modifying them
- Check existing components before creating new ones
- Check existing utilities before writing new ones
- Understand the existing pattern before adding to it

### Stay Scoped

- Do not refactor code that isn't related to the task
- Do not improve code you notice in passing unless explicitly asked
- Do not add features that weren't requested
- Do not clean up "while you're here" without asking

---

## Domain Rules Are Non-Negotiable

If an implementation would violate a rule in `docs/ai-context/02-domain-rules.md`:

1. Stop
2. State the conflict explicitly
3. Ask the human how to proceed

Do not implement a workaround. Do not make assumptions. Do not rationalize a violation.

Examples of violations to watch for:
- Allowing a student to approve their own check-in
- Counting rejected check-ins toward belt progress
- Allowing a student to change their own belt
- Accepting a join request without a valid invite code
- Creating more than one academy per owner

---

## Avoid These Patterns

- **Magic numbers** — use named constants
- **Nested ternaries** — use if/else or early returns
- **Inline business logic in controllers** — move to services
- **Fat components** — extract hooks or child components
- **Duplicated validation** — validate once at the boundary
- **Premature abstractions** — wait until you have two real use cases
- **Mock-everything tests** — integration tests must hit real dependencies

---

## Asking for Clarification

If a task is ambiguous:
- Ask one clear question
- Provide 2–3 options when helpful
- Wait for the answer before implementing

Do not guess and implement. Incorrect implementations waste more time than the clarification would take.

---

## Updating the Handoff

After completing a task, update `docs/ai-context/current-handoff.md` with:

- What was completed
- What files were changed
- What is the next step
- Any open questions or risks
- Commands that were run

This is mandatory. It enables the next AI session to continue without losing context.

---

## Testing Responsibility

- Write or update tests for any changed domain logic
- Write or update tests for any changed use case
- Do not mark a task complete if domain rules are untested
- If tests cannot be run in the current environment, document what should be tested

---

## Explaining Risks

After any non-trivial change, state:

- What could go wrong
- What edge cases were not handled
- What should be monitored after deployment

Do not pretend a change is risk-free when it isn't.

---

## Output Format

Every completed task must include this summary:

```
## Summary
What was done.

## Changes Made
- path/to/file.ts: what changed and why

## Domain Rules Checked
- Rule: how the implementation respects it

## Tests
- What was tested
- What still needs testing

## Risks
- Known risks or edge cases

## Next Steps
- What should happen next

## Handoff Updated
Yes / No
```

---

## Multi-AI Handoff Protocol

When handing off to another AI:

1. Update `docs/ai-context/current-handoff.md`
2. Be explicit about what is done and what is not
3. List open questions the next AI needs answered
4. List any commands the next AI needs to run to get started
5. Do not assume the next AI read this session's conversation
