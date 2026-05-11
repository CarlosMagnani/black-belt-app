# Checklist: Pre-PR

Run before opening any pull request. All items must be checked.

---

**Scope**
- [ ] The PR does exactly what it says — no hidden refactors or extra features
- [ ] The PR is small enough to review in under 10 minutes
- [ ] Each commit is focused on one change

**Domain Rules**
- [ ] All check-in rules enforced: status starts pending, self-approval prevented, reviewer role validated
- [ ] All belt rules enforced: student cannot change own belt, 24-class threshold correct
- [ ] All academy rules enforced: one owner one academy, invite code required for join
- [ ] No domain rule has been bypassed or weakened

**Architecture**
- [ ] Business logic is in the service/use case layer only
- [ ] Controllers are thin (validate input → call service → return response)
- [ ] Repositories are the only place with database queries
- [ ] No circular imports between layers

**Security**
- [ ] All mutating endpoints require authentication
- [ ] Role-based access checked on all owner/professor-only actions
- [ ] All user inputs validated at the API boundary
- [ ] No hardcoded secrets
- [ ] No stack traces or raw errors returned to the client
- [ ] No plaintext passwords logged or stored

**Tests**
- [ ] Domain rule functions have unit tests
- [ ] Use cases / services have integration tests
- [ ] New API routes have at least a happy path test and a rejection test
- [ ] Tests reflect behavior, not implementation

**Code Quality**
- [ ] No console.log or debug statements in production code
- [ ] TypeScript errors: zero
- [ ] Lint errors: zero
- [ ] No commented-out code committed

**Documentation**
- [ ] `docs/ai-context/current-handoff.md` updated
- [ ] `docs/ai-context/04-data-model.md` updated if schema changed
- [ ] ADR created if a significant architectural decision was made
