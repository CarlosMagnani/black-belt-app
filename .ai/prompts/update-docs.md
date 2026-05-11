# Prompt: Update Documentation

Use this with ChatGPT or Claude Code to keep docs current after a change.

---

## Template

```
I am building BlackBelt — a BJJ academy management platform.

This session I completed: [what was done]

Files changed:
[list]

Please update the following documentation:

1. docs/ai-context/current-handoff.md
   - Update "Current Status" section
   - Update "Files Changed" section
   - Update "Next Steps" section
   - Clear any open questions that were resolved
   - Add any new open questions

2. [Other file if needed — e.g., docs/ai-context/04-data-model.md if schema changed]

Do not change domain rules or architecture docs unless those specifically changed.
Do not add speculation about future features.
Only update what actually changed.

Output: the updated content of each file that was changed.
```
