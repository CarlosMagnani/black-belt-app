# Prompt: Review Database Model Change

Use this before applying any migration or data model change.

---

## Template

```
I am building BlackBelt — a BJJ academy management platform with a relational database.

Review this database change (migration / schema update) against the data model and domain rules.

Data model reference: docs/ai-context/04-data-model.md
Domain rules reference: docs/ai-context/02-domain-rules.md

Change to review:
[paste migration SQL or schema definition]

Check for:
1. Foreign key constraints — are relationships correctly enforced?
2. Required audit fields — does the table have created_at, updated_at, and performed_by where needed?
3. Unique constraints — are domain uniqueness rules enforced at the database level?
4. Enum values — do status/role fields match the domain model?
5. Null constraints — are required fields NOT NULL?
6. Reversibility — can this migration be rolled back?
7. Naming consistency — does naming match the data model in 04-data-model.md?
8. Missing indexes — are FK columns indexed?

For each check: PASS / FAIL / WARN with specific field or constraint if failing.

Provide the corrected SQL if any changes are needed.
```
