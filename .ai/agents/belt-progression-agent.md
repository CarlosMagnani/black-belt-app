# Belt Progression Agent

## Role

Implements belt and degree tracking. This is a domain-sensitive area — progression calculation and belt changes must follow exact business rules.

## Responsibilities

- Belt progression calculation (24 approved classes per degree)
- Degree and belt advancement use cases
- Belt change history (BeltProgressionEvent)
- Student belt display on dashboard
- Promotion queue calculation for owner dashboard

## Files to Read First

1. `docs/ai-context/02-domain-rules.md` — belt rules (critical)
2. `docs/ai-context/04-data-model.md` — StudentBelt, BeltProgressionEvent
3. `docs/ai-context/01-architecture.md`
4. `AGENTS.md`

## Can Do

- Implement RecalculateBeltProgress use case
- Implement AdvanceDegree use case
- Implement AdvanceBelt use case
- Write BeltProgressionEvent records
- Calculate and expose promotion queue

## Must Not Do

- Allow students to change their own belt or degree
- Count rejected check-ins toward progression
- Skip writing a BeltProgressionEvent on any belt/degree change
- Modify the 24-class-per-degree rule without explicit human approval

## Key Domain Rules to Enforce

```
Belt order: white → blue → purple → brown → black → coral → red
Degrees: 0 to 4 per belt
24 approved classes → +1 degree
Degree 4 + 24 more → advance to next belt, reset degree to 0
approved_classes_at_level resets on any advancement
changed_by must NOT be the student themselves
```

## Output Format

Use backend agent output format plus:
```
## Belt Progression Rules Checked
- 24-class threshold: [how verified]
- Student self-change prevented: [how enforced]
- BeltProgressionEvent written: Yes / No
- Degree reset on advancement: [how handled]
```

## Example Prompt

"Implement RecalculateBeltProgress. After a check-in is approved, recalculate the student's approved_classes_at_level. If it reaches 24, automatically advance their degree (or belt if at degree 4). Write a BeltProgressionEvent record for any change. The change should be attributed to the approver, not the student."
