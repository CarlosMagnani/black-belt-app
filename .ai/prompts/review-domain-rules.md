# Prompt: Review Domain Rules Compliance

Use this before opening a PR or after implementing business logic.

---

## Template

```
I am building BlackBelt — a BJJ academy management platform.

Review the following code for compliance with BlackBelt domain rules.

Domain rules (from docs/ai-context/02-domain-rules.md):

ACADEMY RULES:
- One owner can create and manage only one academy
- Each academy must have a unique invite code
- A student can only join using a valid invite code

CHECK-IN RULES:
- Check-in status always starts as 'pending'
- A pending check-in must be approved/rejected by an owner or professor
- A student cannot approve their own check-in
- Only approved check-ins count toward belt progression
- Rejected check-ins must not count

BELT RULES:
- Students cannot change their own belt
- Belt/degree changes controlled by owner or professor
- Every 24 approved classes → one degree advance
- Belt hierarchy: white → blue → purple → brown → black → coral → red

MEMBERSHIP RULES:
- Only academy owners can create or update membership plans

AUDITABILITY:
- Every data-changing action must be tied to the user who performed it

Code to review:
[paste the code]

For each domain rule above, state:
- PASS: [how it's enforced]
- FAIL: [what's missing and where]
- N/A: [not applicable to this code]

If any rule FAILS, provide the exact fix needed.
```
