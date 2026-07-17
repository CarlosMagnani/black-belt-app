-- Enforce the MVP rule without restricting owners or professors in future slices.
CREATE UNIQUE INDEX "academy_members_one_student_academy"
ON "academy_members" ("user_id")
WHERE "role" = 'student';

-- Reversible with: DROP INDEX "academy_members_one_student_academy";
