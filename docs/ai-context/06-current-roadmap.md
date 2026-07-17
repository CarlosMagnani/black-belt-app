# Current Roadmap — BlackBelt

## Current MVP (v0.1.0) — Build This First

These are the features required to make BlackBelt minimally viable. Nothing else gets built until these work end-to-end.

### Authentication
- [x] User registration (email + password)
- [x] User login
- [x] Session persistence (JWT + refresh token)
- [x] Logout
- [ ] Password reset (basic email flow)

### Onboarding
- [x] Role selection screen (Owner vs Student)
- [x] Owner onboarding: academy name, city, professor profile, belt selection
- [x] Student onboarding: enter invite code, verify, profile setup, belt selection
- [x] Onboarding completion → redirect to correct home screen

### Academy Management (Owner)
- [x] Academy creation with generated invite code
- [x] Invite code display and sharing
- [ ] Student roster view
- [ ] Professor management (add/remove professor role)

### Class Schedule (Owner)
- [ ] Create recurring class (day, time, duration, instructor, location, level)
- [ ] Edit existing class
- [ ] Deactivate a class
- [ ] View weekly schedule

### Check-in Flow
- [ ] Student requests check-in for a class
- [ ] Owner/Professor sees pending check-in list
- [ ] Owner/Professor approves or rejects a check-in
- [ ] Approved check-in increments class count

### Belt Progression (Owner/Professor)
- [ ] View student progress (approved classes at current level)
- [ ] Manually promote student (degree or belt change)
- [ ] History of belt changes per student

### Student Dashboard
- [ ] Attendance streak display
- [ ] Belt progress bar (X/24 classes to next degree)
- [ ] Today's class schedule
- [ ] Check-in status for recent classes

### Owner Dashboard
- [ ] Academy pulse (average occupancy, live class status)
- [ ] Today's schedule
- [ ] Roster snapshot (belt distribution)
- [ ] Promotion queue (students ready to advance)
- [ ] Recent activity feed

### Membership Plans (Owner)
- [ ] Create a membership plan (name, price, period)
- [ ] Assign a plan to a student
- [ ] View student subscription status (manual — no payment processing)

---

## Next MVP Improvements (v0.2.0)

After v0.1.0 is stable and being used by at least one academy:

- [ ] Improved check-in UX (slide-to-confirm on mobile)
- [ ] Student monthly stats (classes attended, hours on the mat)
- [ ] Class occupancy tracking (spots available vs filled)
- [ ] Email notifications for check-in approval/rejection
- [ ] Academy settings editing (name, city, invite code rotation)
- [ ] Professor-side class management (professors manage their own classes)
- [x] Profile photo upload for students (delivered with onboarding)
- [ ] Class-level filtering on the student schedule view

---

## Post-MVP Features (v1.0.0+)

Only after the core product is proven and stable:

- [ ] Payment processing (Stripe or local gateway)
- [ ] Automatic subscription reminders
- [ ] Academy billing and financial dashboard
- [ ] QR code check-in (camera-based)
- [ ] Push notifications (PWA Web Push)
- [ ] Native mobile app (React Native / Expo)
- [ ] Multi-language support (EN/PT toggle)
- [ ] Attendance analytics and reports
- [ ] Belt ceremony tracking
- [ ] Competition results tracking
- [ ] Student notes and observation system

---

## Explicitly Out of Scope (Do Not Build)

These are not planned and should not be discussed as upcoming:

- Multi-academy support per owner
- Marketplace or academy discovery
- Social features (student-to-student interactions)
- Video content or lesson uploads
- Live streaming integration
- Open enrollment / self-sign-up without invite code
- Custom belt hierarchy (only BJJ standard for now)
- Tournament bracket management
