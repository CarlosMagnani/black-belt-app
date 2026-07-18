# Domain Rules — BlackBelt

## Academy

- One owner can create and manage only one academy.
- Each academy must have a unique invite code.
- All academy schedules and check-in dates use `America/Sao_Paulo` during the MVP.
- A student can only join an academy using a valid invite code.
- A student can belong to only one academy during the MVP.
- The academy owner can manage students, instructors, schedules, membership plans, and check-ins.
- An owner may grant or revoke the professor role for an existing student in their academy; professors do not use a separate onboarding flow in the MVP.
- A professor cannot be returned to the student role while assigned to an active class; the owner must first reassign or deactivate those classes.

## Check-ins

- A check-in request always starts with status `pending`.
- A pending check-in may be approved or rejected by the academy owner, or by the professor assigned to that class.
- A student cannot approve their own check-in.
- A professor cannot approve their own check-in.
- A check-in may be requested once per person and class on the current academy-local date, after the scheduled start time and before that date ends.
- A rejected check-in is final; the student cannot submit another check-in for that class and date.
- Only approved check-ins count toward belt progression.
- Rejected check-ins must not count toward progress.

## Belt Progression

- A student may declare their initial belt and degree once while joining their first academy.
- After the student membership is created, students and professors cannot change a student's belt or degree; changes are controlled only by the academy owner.
- Initial rank declaration creates the starting `StudentBelt`; it is not a promotion and does not create a `BeltProgressionEvent`.
- Every 24 approved classes at the current level make the student eligible for promotion; the system never changes belt or degree automatically.
- Promotion eligibility always uses the same 24-class threshold. Approved classes may continue accumulating after eligibility while the owner delays promotion; the MVP has no student-specific threshold.
- The academy owner may promote only to the next valid degree or, after degree 4, to the next belt at degree 0. Skips, demotions, and arbitrary rank corrections are out of scope for the MVP.
- Belt hierarchy is:
  White → Blue → Purple → Brown → Black → Coral → Red

## Membership Plans

- Only academy owners can create or update membership plans.
- Membership plans belong to one academy.
- A student can join an academy before a membership plan is assigned.
- When a student subscription is created, it must reference a valid plan from that academy.
- An owner assigns one active plan to a student, choosing its start date; the subscription expiry is calculated from the plan period.
- Subscription status (`active`, `overdue`, or `cancelled`) is changed manually by the owner. Expiry does not automatically change status or send reminders in the MVP.
- Changing a student's plan cancels their current active subscription and creates a new active subscription. Subscription history is retained.

## Auditability

- Every data-changing action must be tied to the user who performed it.
- Important actions should store who performed the action and when.
- Meaningful academy operations create an immutable activity event in the same transaction. The owner dashboard uses these records for its recent activity feed; they do not trigger asynchronous processing.
