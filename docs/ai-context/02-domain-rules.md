# Domain Rules — BlackBelt

## Academy

- One owner can create and manage only one academy.
- Each academy must have a unique invite code.
- A student can only join an academy using a valid invite code.
- The academy owner can manage students, instructors, schedules, membership plans, and check-ins.

## Check-ins

- A check-in request always starts with status `pending`.
- A pending check-in must be approved or rejected by an owner or professor.
- A student cannot approve their own check-in.
- Only approved check-ins count toward belt progression.
- Rejected check-ins must not count toward progress.

## Belt Progression

- Students cannot change their own belt.
- Belt and degree changes must be controlled by an owner or professor.
- Every 24 approved classes advance the student by one degree.
- Belt hierarchy is:
  White → Blue → Purple → Brown → Black → Coral → Red

## Membership Plans

- Only academy owners can create or update membership plans.
- Membership plans belong to one academy.
- A student membership must be linked to an academy plan.

## Auditability

- Every data-changing action must be tied to the user who performed it.
- Important actions should store who performed the action and when.