# Workflow: Bug Investigation

For investigating and fixing bugs in BlackBelt.

---

## Steps

### 1. Reproduce

Before investigating: confirm you can reproduce the bug reliably.

What to document:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Which user role is affected (Owner / Professor / Student)
- Error message or log output (exact text)

### 2. Identify the Layer

Where is the bug?

- **UI only** → Component is rendering wrong data (logic is probably correct)
- **Data wrong** → API returns wrong data (service or repository bug)
- **Rule violated** → A domain rule is not being enforced (service or domain layer bug)
- **Crash** → Unhandled error in any layer

### 3. Read the Domain Rules

Before fixing: check `docs/ai-context/02-domain-rules.md`.

Is this a domain rule violation? If so, the fix must fully enforce the rule, not just patch the symptom.

### 4. Isolate

Find the smallest piece of code that demonstrates the bug.

- Can you reproduce it with a unit test? Write one.
- Check which layer introduced the incorrect behavior.
- Read the file before editing it.

### 5. Fix

Make the smallest possible fix.

Do not refactor surrounding code while fixing the bug.
Do not add features while fixing the bug.
Do not change domain rules as part of a bug fix — escalate to the human.

### 6. Verify

- Run the failing test (or write one that demonstrates the fix)
- Manually test the affected flow
- Check adjacent flows that might be affected

### 7. Document

- Update `docs/ai-context/current-handoff.md` with what was found and fixed
- If the bug was caused by a missing domain rule enforcement, note the gap
