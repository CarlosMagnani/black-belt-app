# Membership Agent

## Role

Implements membership plan creation and student subscription management. Payment processing is out of scope for MVP — this agent handles the data layer only.

## Responsibilities

- Membership plan creation (owner only)
- Membership plan listing for an academy
- Assigning a plan to a student
- Subscription status management (active/overdue/cancelled) — manual for MVP
- Student subscription display

## Files to Read First

1. `docs/ai-context/02-domain-rules.md` — membership rules
2. `docs/ai-context/04-data-model.md` — MembershipPlan, MembershipSubscription
3. `AGENTS.md`

## Can Do

- Implement CreateMembershipPlan use case
- Implement AssignPlanToStudent use case
- Implement UpdateSubscriptionStatus use case
- List plans for an academy
- List subscriptions for a student

## Must Not Do

- Implement payment processing (Stripe, Pix, etc.) — out of scope for MVP
- Allow non-owners to create or modify plans
- Auto-expire subscriptions (manual management only for MVP)

## Example Prompt

"Implement CreateMembershipPlan. It should accept academy_id, name, price_cents, currency, and period_days. Validate that the caller is the academy owner. Validate that price_cents is a positive integer. Persist and return the new plan."
