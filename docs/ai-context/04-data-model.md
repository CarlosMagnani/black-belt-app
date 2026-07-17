# Data Model — BlackBelt MVP

Simple relational model. Every table gets `created_at`, `updated_at`. Audit-sensitive tables get `performed_by`.

---

## User

**Purpose:** Represents any authenticated person in the system. Role is determined by their membership in an academy.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| email | string | Unique, used for auth |
| password_hash | string | Nullable and unused while Supabase Auth owns passwords; never store plaintext |
| full_name | string | Required |
| nickname | string | Optional (apelido) |
| avatar_url | string | Optional, profile photo |
| onboarding_role | enum | Nullable one-time choice: `owner` or `student` |
| belt | enum | Optional static rank metadata for owner/professor profiles; not the student rank source |
| degree | integer | Static owner/professor profile degree; defaults to 0 |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relationships:**
- Has one `AcademyMember` per academy they belong to
- May own one `Academy` (if owner)

**Constraints:**
- Email must be unique across all users
- Password hash is managed by Supabase Auth, remains unset in the application database, and is never exposed via API
- A student's current rank is read from `StudentBelt`, never from `User.belt` or `User.degree`

---

## Academy

**Purpose:** Represents a martial arts academy. Each owner creates exactly one.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | string | Required |
| city | string | Required |
| invite_code | string | Unique, required to join |
| owner_id | UUID | FK → User.id |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relationships:**
- Belongs to one `User` (owner)
- Has many `AcademyMember`
- Has many `ClassSchedule`
- Has many `MembershipPlan`

**Constraints:**
- One owner → one academy (owner_id is unique)
- invite_code must be unique across all academies
- invite_code is required and generated on academy creation

---

## AcademyMember

**Purpose:** Links a User to an Academy with a specific role. This is the join table that defines membership and role.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| academy_id | UUID | FK → Academy.id |
| user_id | UUID | FK → User.id |
| role | enum | `owner`, `professor`, `student` |
| status | enum | `active`, `inactive`, `suspended` |
| joined_at | timestamp | When the user joined this academy |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relationships:**
- Belongs to one `Academy`
- Belongs to one `User`
- If role = `student`, has one `StudentBelt`
- If role = `student`, may have one `MembershipSubscription`

**Constraints:**
- One user can only have one membership per academy
- (user_id, academy_id) must be unique
- During the MVP, a student may have only one academy membership; the join use case and a partial unique database index enforce this across academies
- Owner cannot also be a student in the same academy

---

## StudentBelt

**Purpose:** Tracks the current belt and degree (stripes) of a student within an academy.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| academy_member_id | UUID | FK → AcademyMember.id |
| belt | enum | `white`, `blue`, `purple`, `brown`, `black`, `coral`, `red` |
| degree | integer | 0–4 (stripes on the belt) |
| approved_classes_at_level | integer | Count toward next degree |
| last_changed_at | timestamp | When belt/degree last changed |
| changed_by | UUID | FK → User.id — who made the change |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relationships:**
- Belongs to one `AcademyMember`
- Has many `BeltProgressionEvent` (history log)

**Constraints:**
- During first academy join only, the student may create their initial belt and degree and `changed_by` records that student
- After initial creation, students cannot modify their own belt — `changed_by` must be an owner or professor
- Initial `StudentBelt` creation is not a progression event; later belt or degree changes must create a `BeltProgressionEvent`
- degree is 0–4
- Belt order: white → blue → purple → brown → black → coral → red
- `approved_classes_at_level` resets to 0 on belt or degree advance

---

## BeltProgressionEvent

**Purpose:** Audit log of every belt or degree change. Immutable history.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| student_belt_id | UUID | FK → StudentBelt.id |
| academy_member_id | UUID | FK → AcademyMember.id (the student) |
| previous_belt | enum | Belt before this change |
| previous_degree | integer | Degree before this change |
| new_belt | enum | Belt after this change |
| new_degree | integer | Degree after this change |
| reason | string | Optional note |
| performed_by | UUID | FK → User.id |
| created_at | timestamp | |

**Constraints:**
- Immutable — never update or delete these records
- `performed_by` must not equal the student's user_id

---

## ClassSchedule

**Purpose:** Defines recurring or one-off classes at the academy.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| academy_id | UUID | FK → Academy.id |
| title | string | Class name (e.g. "Fundamentos") |
| day_of_week | integer | 0=Sunday, 6=Saturday |
| start_time | time | |
| duration_minutes | integer | |
| location | string | Optional (e.g. "Mat 1") |
| level | string | Optional (e.g. "All Levels", "Advanced") |
| instructor_id | UUID | FK → User.id (a professor or owner) |
| is_active | boolean | Soft delete / pause |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relationships:**
- Belongs to one `Academy`
- Has many `CheckIn`

**Constraints:**
- instructor_id must be a member of the academy with role `professor` or `owner`

---

## CheckIn

**Purpose:** A student's attendance record for a specific class. Always starts pending.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| academy_id | UUID | FK → Academy.id |
| student_member_id | UUID | FK → AcademyMember.id |
| class_schedule_id | UUID | FK → ClassSchedule.id |
| class_date | date | The specific date of attendance |
| status | enum | `pending`, `approved`, `rejected` |
| reviewed_by | UUID | FK → User.id — who approved/rejected |
| reviewed_at | timestamp | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relationships:**
- Belongs to one `Academy`
- Belongs to one `AcademyMember` (the student)
- Belongs to one `ClassSchedule`

**Constraints:**
- Status starts as `pending` — always
- `reviewed_by` must not be the same user as the student — enforced server-side
- `reviewed_by` must have role `professor` or `owner` in the academy
- One check-in per student per class per date (unique constraint)
- Only `approved` check-ins count toward belt progression
- `rejected` check-ins must not count

---

## MembershipPlan

**Purpose:** Defines a payment plan offered by the academy (price, period). Not the subscription itself.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| academy_id | UUID | FK → Academy.id |
| name | string | e.g. "Monthly", "Quarterly" |
| price_cents | integer | Stored in smallest currency unit |
| currency | string | e.g. "BRL" |
| period_days | integer | e.g. 30, 90, 365 |
| is_active | boolean | Owner can deactivate plans |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relationships:**
- Belongs to one `Academy`
- Has many `MembershipSubscription`

**Constraints:**
- Only academy owners can create or update plans
- price_cents must be a positive integer

---

## MembershipSubscription

**Purpose:** Links a student to a specific plan. Tracks their subscription status.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| academy_member_id | UUID | FK → AcademyMember.id |
| plan_id | UUID | FK → MembershipPlan.id |
| status | enum | `active`, `overdue`, `cancelled` |
| started_at | date | |
| expires_at | date | |
| created_at | timestamp | |
| updated_at | timestamp | |

**Relationships:**
- Belongs to one `AcademyMember`
- Belongs to one `MembershipPlan`

**Constraints:**
- Payment processing is out of scope for MVP — status is managed manually by the owner
- One active subscription per student per academy (enforce in application logic)

---

## Belt Progression Algorithm

This is the business rule encoded in the data model:

```
approvedClasses = COUNT(CheckIn WHERE student_member_id = X AND status = 'approved')
approvedClassesAtCurrentLevel = approved_classes_at_level on StudentBelt

Every 24 approved classes at the current level → advance one degree
When degree reaches 4 → advance to next belt with degree = 0

Belt order: white(0) → blue(1) → purple(2) → brown(3) → black(4) → coral(5) → red(6)
```

The `approved_classes_at_level` field resets to 0 on each degree or belt advancement.

This calculation happens in the use case layer, not in the database.
