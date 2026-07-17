# Domain Rules — BlackBelt

## Academy

- One owner can create and manage only one academy.
- Each academy must have a unique invite code.
- A student can only join an academy using a valid invite code.
- A student can belong to only one academy during the MVP.
- The academy owner can manage students, instructors, schedules, membership plans, and check-ins.

## Check-ins

- A check-in request always starts with status `pending`.
- A pending check-in must be approved or rejected by an owner or professor.
- A student cannot approve their own check-in.
- Only approved check-ins count toward belt progression.
- Rejected check-ins must not count toward progress.

## Belt Progression

- A student may declare their initial belt and degree once while joining their first academy.
- After the student membership is created, students cannot change their own belt or degree; changes must be controlled by an owner or professor.
- Initial rank declaration creates the starting `StudentBelt`; it is not a promotion and does not create a `BeltProgressionEvent`.
- Every 24 approved classes advance the student by one degree.
- Belt hierarchy is:
  White → Blue → Purple → Brown → Black → Coral → Red

## Membership Plans

- Only academy owners can create or update membership plans.
- Membership plans belong to one academy.
- A student can join an academy before a membership plan is assigned.
- When a student subscription is created, it must reference a valid plan from that academy.

## Auditability

- Every data-changing action must be tied to the user who performed it.
- Important actions should store who performed the action and when.
