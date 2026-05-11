# Checklist: Domain Rules

Quick reference. Check each rule that applies to the current task.

---

## Academy Rules

- [ ] One owner → one academy (enforce before create)
- [ ] Invite code is unique across all academies (enforce at DB level)
- [ ] Student must provide a valid invite code to join (validate server-side)
- [ ] Invite code validation happens server-side, never trusted from client

## Role Rules

- [ ] Only owners can create or update membership plans
- [ ] Only owners and professors can approve or reject check-ins
- [ ] Only owners and professors can change student belts
- [ ] Role is validated server-side on every protected action

## Check-in Rules

- [ ] New check-in status = 'pending' (always — never trust client-provided status)
- [ ] Reviewer (approved_by / rejected_by) must not be the student themselves
- [ ] Reviewer must have role 'professor' or 'owner' in the same academy
- [ ] Duplicate check-in for same (student, class, date) is rejected
- [ ] Only 'approved' check-ins count toward belt progression
- [ ] 'rejected' and 'pending' check-ins do not count

## Belt Progression Rules

- [ ] Student cannot change their own belt or degree
- [ ] Belt changes must be performed by an owner or professor
- [ ] Belt changes must be recorded in BeltProgressionEvent (immutable audit log)
- [ ] Threshold: 24 approved classes per degree
- [ ] Degree advances 0 → 1 → 2 → 3 → 4
- [ ] Degree 4 + 24 more classes → advance to next belt, reset degree to 0
- [ ] approved_classes_at_level resets on any belt or degree advancement
- [ ] Belt order: white → blue → purple → brown → black → coral → red

## Membership Rules

- [ ] Only owners can create membership plans
- [ ] Membership plans belong to one academy

## Auditability Rules

- [ ] performed_by / reviewed_by / changed_by is recorded on all mutation events
- [ ] Timestamps recorded on all mutations
- [ ] BeltProgressionEvent records are never deleted or updated
