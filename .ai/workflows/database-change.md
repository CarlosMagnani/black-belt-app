# Workflow: Database Change

For any schema change, migration, or data model update.

---

## Steps

### 1. Check the Data Model First

Read `docs/ai-context/04-data-model.md`.

Is this change already specified there? If not:
- Is this a new requirement?
- Does it require human approval?
- Does it require updating the data model doc?

### 2. Check Domain Rules

Read `docs/ai-context/02-domain-rules.md`.

Does the schema change need to enforce any domain constraint at the database level?

Examples:
- Unique constraint on (user_id, academy_id) in AcademyMember
- Status enum limited to defined values
- Not-null on performed_by for audit tables

### 3. Run Database Checklist

Run `.ai/checklists/database-change.md`.

### 4. Write the Migration

Requirements for every migration:
- `created_at` and `updated_at` on every new table
- Foreign key constraints for every relationship
- Indexes on all FK columns
- Unique constraints for uniqueness rules
- The migration must have a DOWN step (rollback)

### 5. Review the Migration

Use `.ai/prompts/review-database-model.md`.

Run through the checklist mentally before applying.

### 6. Update the Data Model Doc

If the migration adds or changes anything from what's in `docs/ai-context/04-data-model.md`, update the doc.

### 7. Write or Update Repository Methods

New columns or tables need corresponding repository methods.
Repository methods should be simple: one query per method.

### 8. Apply Migration (non-production)

Run the migration against the development database.
Verify the schema matches expectations.

### 9. Never Modify Applied Migrations

Once a migration is applied to production, it is immutable.
To change it, write a new migration.
