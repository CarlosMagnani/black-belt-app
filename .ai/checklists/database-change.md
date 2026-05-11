# Checklist: Database Change

Run before writing or applying any database migration.

---

**Pre-Migration**
- [ ] Read `docs/ai-context/04-data-model.md` — does this change match the spec?
- [ ] Read `docs/ai-context/02-domain-rules.md` — what constraints must be enforced at DB level?
- [ ] Is this migration reversible? Planned the DOWN step.
- [ ] Is this migration additive? (Adding new tables/columns is safer than modifying existing ones)
- [ ] Will this migration require a data backfill? (If yes: plan and test the backfill separately)

**Migration Structure**
- [ ] New table has `id` (UUID primary key)
- [ ] New table has `created_at` timestamp (NOT NULL, DEFAULT now())
- [ ] New table has `updated_at` timestamp (NOT NULL, DEFAULT now())
- [ ] Audit-sensitive tables have `performed_by` / `changed_by` (UUID FK to users)
- [ ] All relationship columns have foreign key constraints
- [ ] All FK columns are indexed
- [ ] Status and role fields use enums (not unconstrained strings)
- [ ] Required fields are NOT NULL
- [ ] Optional fields allow NULL with a documented reason

**Uniqueness Constraints**
- [ ] `invite_code` on Academy is UNIQUE
- [ ] `email` on User is UNIQUE
- [ ] `(user_id, academy_id)` on AcademyMember is UNIQUE
- [ ] `(student_member_id, class_schedule_id, class_date)` on CheckIn is UNIQUE
- [ ] `owner_id` on Academy is UNIQUE (one owner → one academy)

**After Migration**
- [ ] Migration applied to development database successfully
- [ ] Schema matches `docs/ai-context/04-data-model.md`
- [ ] `docs/ai-context/04-data-model.md` updated if spec changed
- [ ] Repository methods updated or created for new columns/tables
- [ ] Tests written for new repository methods
