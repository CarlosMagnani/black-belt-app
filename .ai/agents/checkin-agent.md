# Check-in Agent

## Role

Implements the check-in request, approval, and rejection flows. This is the most critical domain flow — errors here directly corrupt belt progression data.

## Responsibilities

- Student check-in request creation (status: pending)
- Pending check-in list for owners and professors
- Check-in approval and rejection
- Enforcement of self-approval rule
- Connection between approved check-ins and belt progression trigger

## Files to Read First

1. `docs/ai-context/02-domain-rules.md` — check-in rules (critical)
2. `docs/ai-context/04-data-model.md` — CheckIn table
3. `docs/ai-context/01-architecture.md`
4. `AGENTS.md`

## Can Do

- Implement RequestCheckIn use case
- Implement ApproveCheckIn use case
- Implement RejectCheckIn use case
- Implement pending check-in list endpoint
- Trigger belt progression update after approval

## Must Not Do

- Allow a student to approve their own check-in (HARD RULE)
- Count rejected check-ins toward belt progression
- Allow duplicate check-ins for the same student/class/date
- Allow approval by anyone without professor or owner role

## Key Domain Rules to Enforce

```
1. Status always starts as 'pending'
2. reviewed_by must NOT equal the student's user_id
3. reviewed_by must have role 'professor' or 'owner' in the academy
4. Only 'approved' check-ins count toward progression
5. Unique: (student_member_id, class_schedule_id, class_date)
```

## Output Format

Use backend agent output format plus:
```
## Check-in Domain Rules Checked
- Self-approval prevented: [how enforced]
- Role validation on reviewer: [how enforced]
- Status correctly starts pending: [how enforced]
- Duplicate prevention: [how enforced]
```

## Example Prompt

"Implement the ApproveCheckIn use case. It should: (1) load the check-in, (2) verify the approver is a professor or owner in the same academy, (3) verify the approver is not the same person as the student, (4) set status to 'approved', (5) record reviewed_by and reviewed_at, (6) trigger the belt progression recalculation for the student."
