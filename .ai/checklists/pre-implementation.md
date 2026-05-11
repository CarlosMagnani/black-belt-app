# Checklist: Pre-Implementation

Run before starting any implementation task.

---

- [ ] Read `AGENTS.md`
- [ ] Read `docs/ai-context/00-project-overview.md`
- [ ] Read `docs/ai-context/02-domain-rules.md`
- [ ] Read `docs/ai-context/current-handoff.md`
- [ ] Read relevant context file for this task (architecture / design rules / data model)

**Scope**
- [ ] The task is clearly defined — I know exactly what to build
- [ ] The task is scoped to ONE feature, one use case, or one bug fix
- [ ] I know which files I will modify
- [ ] I know which domain rules apply to this task
- [ ] This task is within the current MVP scope (see `docs/ai-context/06-current-roadmap.md`)

**Domain Rules**
- [ ] I can name the domain rules relevant to this task
- [ ] The implementation plan does not violate any domain rule
- [ ] If a rule conflict exists, I have escalated to the human and received a resolution

**Architecture**
- [ ] I know which layer owns this logic (UI / Controller / Service / Domain / Repository)
- [ ] I am not putting business logic in a controller or component
- [ ] I am not writing SQL in a service or use case

**Design (for UI tasks)**
- [ ] I have read `design_handoff_black_belt/README.md`
- [ ] I know which existing screen is the closest reference
- [ ] I know which existing components I will reuse
- [ ] I am not inventing new colors, fonts, or layout patterns

**Database (for schema tasks)**
- [ ] I have read `docs/ai-context/04-data-model.md`
- [ ] My migration includes `created_at` and `updated_at`
- [ ] My migration includes the required foreign keys
- [ ] My migration includes the required unique constraints
- [ ] My migration has a rollback (DOWN) step
