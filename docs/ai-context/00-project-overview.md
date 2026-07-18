# BlackBelt — Project Overview

## What is BlackBelt?

BlackBelt is a management platform for martial arts academies, focused initially on Brazilian Jiu-Jitsu. It connects three groups of people — academy owners, instructors, and students — in a single system that handles the full operational lifecycle of a martial arts school.

---

## Who uses it?

### Academy Owner (Dono / Mestre)
The person responsible for running the academy. Uses BlackBelt to manage everything: students, instructors, class schedules, membership plans, and check-in validation. The owner creates the academy and shares an invite code so students can join.

### Professor (Instrutor)
The instructor. Validates student check-ins after class. Can see who attended and confirm or reject presence requests.

### Student (Aluno)
The academy member. Attends classes, requests check-ins, tracks their own belt progression, and manages their profile.

---

## What does it do?

### Academy Setup
Owners create an academy with a unique invite code. Students use that code to find and join the academy. This replaces informal group chats and manual spreadsheets as the entry point for membership.

### Class Schedule Management
Owners define the weekly class schedule: day, time, instructor, location, and level. Classes can be recurring. This is the source of truth for what happens at the academy each week.

### Check-in System
Students request check-ins after attending a class. Owners and professors review the pending list and approve or reject each one. Approved check-ins are the mechanism that drives belt progression — every approval counts.

### Belt Progression Tracking
Every approved check-in advances the student toward promotion eligibility. The system tracks how many classes a student has attended and shows their progress toward the next milestone. Belt changes are controlled only by the academy owner — neither students nor professors can change a student's belt.

The belt hierarchy follows the standard Brazilian Jiu-Jitsu progression:
White → Blue → Purple → Brown → Black → Coral → Red

Each belt has degrees (stripes). 24 approved classes advance one degree.

### Membership Plans
Owners define membership plans with pricing and periodicity. This is the commercial layer of the academy — what students pay and for how long.

### Student Onboarding
New users go through a guided setup: choose their role, fill in personal data, select their current belt and degree, and optionally upload a profile photo. Students then join an academy via invite code. Owners create their academy as part of the same flow.

---

## Core business rules

- One owner = one academy.
- Invite codes are unique per academy and required to join.
- Check-ins start as "pending" and must be validated by an owner or professor.
- Belt cannot be self-assigned by students.
- 24 approved classes = 1 degree advance.
- All user actions that change data are tied to the user who performed them.

---

## What it replaces

- WhatsApp groups for class announcements and schedule sharing.
- Manual spreadsheets for student attendance and belt tracking.
- Informal verbal agreements about who attended which class.
- Paper-based check-in lists.

---

## Current scope (v0.1.0)

Fully working: authentication, onboarding, academy creation, invite-based join flow, class schedule management, check-in request and validation, belt progression tracking, membership plan creation, student and professor management.

Not yet implemented: payment processing, academy billing, QR code check-in, push notifications, professor-side class management, full academy settings editing.
