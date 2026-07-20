# Owner Dashboard and Operations MVP

## Problem Statement

Academy owners can create an Academy and share its Invite Code, but their protected home is only a placeholder. They cannot yet operate their Academy: view the Roster, appoint Professors, manage recurring classes, review Check-ins, promote Students, manage Membership Plans, or understand current activity.

The MVP needs a mobile-first owner workspace that makes these daily operations reliable without adding payment processing, billing automation, real-time infrastructure, or a separate professor onboarding flow.

## Solution

Replace the owner placeholder with an authenticated owner workspace. The workspace uses five bottom-navigation destinations: Home, Roster, Schedule, Check-ins, and More. It is implemented as small vertical slices so Home progressively receives real operational data rather than placeholders.

An Owner manages the Academy's existing members, schedules, Check-ins, Student Belt progression, manual Membership Subscriptions, and the resulting audit trail. A Professor is an existing Student whose Academy Member role becomes `professor`; the Professor may review only Check-ins for classes they teach and never changes a Student Belt. Payment processing is not part of this feature.

## User Stories

1. As an Owner, I want to enter a protected owner workspace after onboarding, so that I can run my Academy.
2. As an Owner, I want a consistent five-tab mobile navigation, so that I can reach daily operational tools quickly.
3. As an Owner, I want Home to show Academy identity and the current operational pulse, so that I can understand the Academy at a glance.
4. As an Owner, I want Home to show the currently live Recurring Class or the next active class, so that I know what is happening today.
5. As an Owner, I want Home to show pending and approved Check-in counts for a live class, so that I can act on attendance promptly.
6. As an Owner, I want Home to show today's active schedule, so that I can plan the day.
7. As an Owner, I want Home to show average attendance for the prior 28 days, so that I can understand participation without managing capacity.
8. As an Owner, I want Home to show Belt distribution, so that I can understand the current Roster.
9. As an Owner, I want Home to show Students eligible for promotion, so that progression decisions are visible.
10. As an Owner, I want Home to show recent meaningful Academy activity, so that I can audit operations.
11. As an Owner, I want to refresh the dashboard explicitly, so that I can obtain current information without background polling.
12. As an Owner, I want to view the Academy Roster of Students and Professors, so that people are managed in one place.
13. As an Owner, I want to promote an existing Student to Professor, so that a trusted member can review attendance for classes they teach.
14. As an Owner, I want to revoke a Professor role, so that teaching authority can be removed when needed.
15. As an Owner, I want role revocation blocked while a Professor teaches active classes, so that active schedules never point to an unauthorized instructor.
16. As an Owner, I want to assign the Owner or a Professor as an active class instructor, so that every Recurring Class has an authorized instructor.
17. As an Owner, I want to create a Recurring Class with weekday, start time, duration, instructor, location, and level, so that the weekly schedule is clear.
18. As an Owner, I want to edit a Recurring Class, so that future weekly operation reflects changes.
19. As an Owner, I want to deactivate a Recurring Class, so that it stops accepting future Check-ins while its history is preserved.
20. As an Owner, I want to review all pending Check-ins in the Academy, so that attendance is validated.
21. As a Professor, I want to review Check-ins only for Recurring Classes I teach, so that my authority matches my teaching responsibility.
22. As a Student, I want to request one Check-in for an active class after it begins on the current São Paulo date, so that attendance can be reviewed.
23. As a Professor, I want to retain Student membership and request my own Check-ins, so that teaching does not erase my own participation history.
24. As a Student or Professor, I want to be unable to review my own Check-in, so that attendance approval remains independent.
25. As an Owner or assigned Professor, I want to approve a pending Check-in, so that it counts toward the Student's promotion eligibility.
26. As an Owner or assigned Professor, I want to reject a pending Check-in, so that invalid attendance does not count toward progression.
27. As a Student or Professor, I want a rejected Check-in to remain final for that class and date, so that attendance decisions are auditable and cannot be retried repeatedly.
28. As an Owner, I want to see approved-class progress at a Student's current level, so that I can assess promotion eligibility.
29. As an Owner, I want a Student to enter the promotion queue after 24 approved Check-ins at their current level, so that eligibility is visible without automatic rank changes.
30. As an Owner, I want to perform the only allowed forward Belt or Degree transition, so that rank changes follow the BJJ hierarchy.
31. As an Owner, I want an immutable Belt Progression history, so that every promotion has a trustworthy record.
32. As a Student or Professor, I want to be unable to change a Student Belt or Degree, so that rank authority stays with the Owner.
33. As an Owner, I want to create, update, and deactivate Membership Plans, so that the Academy's manual commercial offerings are organized.
34. As an Owner, I want to assign a Membership Plan and start date to a Student, so that their manual Subscription is tracked.
35. As an Owner, I want expiry calculated from the assigned plan's period, so that the Subscription record is consistent.
36. As an Owner, I want to manually mark a Subscription active, overdue, or cancelled, so that status does not depend on payment integrations.
37. As an Owner, I want to change a Student's plan by cancelling the active Subscription and creating a new one, so that history is retained and only one Subscription is active.
38. As an Owner, I want deactivating a Membership Plan to leave existing Subscriptions unchanged, so that cleanup never changes student records unexpectedly.
39. As an Owner, I want significant operational actions recorded with their actor and time, so that the recent activity feed is trustworthy.

## Implementation Decisions

- Deliver in this order: owner shell and Roster/Professor management; Recurring Class management; Check-in request and review; Belt progression and history; Membership Plans and manual Subscriptions; live Home metrics, promotion queue, and activity feed.
- The owner workspace has five mobile bottom-navigation destinations: Home, Roster, Schedule, Check-ins, and More. More contains Membership Plans and Invite Code access; Academy settings remain future work.
- Owner routes remain protected by the existing authentication flow. The feature must not disable, bypass, or weaken production login for automated validation.
- The primary backend seam is one owner-operations API/service boundary with repository dependencies beneath it. It owns Owner authorization and orchestrates each user action; repositories own database access.
- A Professor is promoted by changing an existing Academy Member's role from `student` to `professor`. No separate Professor account, invitation, or onboarding flow exists in the MVP.
- A promoted Professor keeps their Student Belt, Subscription, and ability to request Check-ins. Their additional authority is limited to approving or rejecting Check-ins for active Recurring Classes to which they are assigned.
- An Owner can review any Academy Check-in. A Professor cannot review a Check-in unless they are the assigned instructor for that class, and no actor can review their own Check-in.
- Professor revocation is rejected while the Professor is assigned to any active Recurring Class. The Owner must first reassign or deactivate those classes.
- Recurring Classes are the sole schedule model. One-off sessions and exception calendars are out of scope. Editing affects future operation; deactivation preserves existing Check-ins.
- All schedule and Check-in date calculations use `America/Sao_Paulo` in the MVP.
- A Check-in is available only once per person, class, and date, for an active class on its scheduled date after the class starts and before the local date ends. Rejection is final.
- Approved Check-ins increment the Student Belt's count at the current level. At 24, the Student becomes promotion-eligible; no automatic rank change occurs, and counts may exceed 24 while promotion is pending.
- Only the Owner can promote a Student. A promotion is exactly one forward transition: next Degree on the same Belt, or next Belt at Degree 0 after Degree 4. Skips, demotions, and rank corrections are excluded.
- Membership Plans are academy-scoped, owner-managed, and priced in cents. They may be deactivated but not assigned once inactive.
- A Subscription is manual: the Owner selects its start date, expiry is calculated from the plan period, and the Owner sets active, overdue, or cancelled status. No payment, reminder, or expiry automation is introduced.
- Changing plans cancels the existing active Subscription and creates a new active Subscription. Existing records remain history, and an Academy has at most one active Subscription per Student.
- Introduce immutable Activity Events, written in the same database transaction as meaningful operations. They carry Academy, actor, action, affected entity, and time, and power the activity feed without an event bus, queue, or asynchronous worker.
- Activity actions cover Professor role changes, Recurring Class changes, Check-in decisions, Belt promotions, Membership Plan changes, and Subscription changes.
- Home returns a fresh dashboard snapshot when opened or explicitly refreshed. It does not poll or use WebSockets. The client may update the live-class label using its local clock between snapshots.
- Average attendance is approved Check-ins divided by all scheduled class occurrences in the preceding 28 days, including occurrences with zero approved Check-ins. The product does not model capacity and does not call this metric occupancy.

## Testing Decisions

- Test behavior at the owner-operations service boundary with unit tests, using faked repositories and dependencies. Do not test private implementation details.
- Unit-test Owner authorization, role promotion/revocation, active-class revocation blocking, valid instructor assignment, Recurring Class edit/deactivation behavior, Check-in eligibility, reviewer scope, self-review prevention, final rejection, approved-count changes, promotion eligibility, owner-only forward promotion, Subscription lifecycle, and Activity Event transaction intent.
- Unit-test dashboard query behavior for average attendance, live/next class selection, belt distribution, promotion queue membership, activity ordering, and snapshot refresh semantics.
- Existing academy and membership tests demonstrate the preferred style: Node's built-in test runner and behavior-focused service tests with typed repository fakes.
- Browser end-to-end authentication flows and live Supabase dependencies are not required for this scope. Login stays real and independently protected.

## Out of Scope

- Payment processing, payment gateways, invoices, Academy billing automation, automatic subscription reminders, and automatic Subscription status changes.
- QR Check-in, push notifications, native mobile application work, WebSockets, polling, background jobs, queues, event buses, microservices, and a separate Professor onboarding or invite flow.
- One-off classes, schedule exceptions, class capacity management, automated or Professor-led Belt promotion, rank correction, rank demotion, rank skipping, custom per-Student promotion thresholds, and Academy timezone configuration.
- Full Academy settings editing, Professor-side schedule management, multi-Academy ownership, and Student dashboard expansion beyond the API support required by owner operations.

## Further Notes

- The terms Academy, Owner, Professor, Student, Roster, Recurring Class, Check-in, Belt, Degree, Promotion Eligibility, Membership Plan, Membership Subscription, Average Attendance, and Activity Event use the project glossary meanings.
- This spec follows the decisions in the Professor-promotion and Activity-Event ADRs.
- The design remains mobile-first and uses the existing BlackBelt design system. Every fetched screen needs loading, empty, and human-readable error states.
