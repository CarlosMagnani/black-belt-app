# Current AI Handoff — BlackBelt

## 1. Current Goal

Connect the React authentication flow to the completed Fastify/Supabase Auth backend boundary.

Backend authentication completed on 2026-07-10:

- Fastify validates Supabase HS256 access tokens using the configured secret.
- Verification enforces the Supabase project issuer, `authenticated` audience, required identity claims, and token expiration.
- `GET /auth/me` is the first protected endpoint and returns the local application user.
- The first protected request upserts the Supabase user into the Prisma `User` table.
- Authentication failures use the `{ data, error }` API envelope without exposing token or database details.
- The local `password_hash` field is nullable because Supabase Auth owns password storage.

Next implementation focus:

- Configure real `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_JWT_SECRET` values locally.
- Create/apply the initial Prisma migration against the development database.
- Add the frontend Supabase client for registration, login, refresh persistence, logout, and password reset.
- Send the Supabase access token to `GET /auth/me` and protected API routes.

Open risk: the accepted auth ADR uses the legacy shared JWT secret. Current Supabase guidance recommends migrating to asymmetric signing keys and JWKS verification. Changing that accepted auth flow requires owner approval.

Commands run:

```txt
npm run db:generate
npm run build
npm test
npx prisma validate
npx prisma format
git diff --check
```

---

## 2. Project Context

BlackBelt is a management platform for martial arts academies, focused initially on Brazilian Jiu-Jitsu.

It connects:

- Academy owners / masters
- Professors / instructors
- Students

The product handles:

- academy setup
- invite-code based academy joining
- onboarding
- class schedules
- check-in requests
- check-in approval/rejection
- belt progression
- membership plans
- student and professor management

The MVP should prioritize the core academy operation flow before advanced features.

---

## 3. Product Scope

### Current MVP Scope

The current MVP includes:

- authentication
- onboarding
- academy creation
- invite-based join flow
- class schedule management
- check-in request and validation
- belt progression tracking
- membership plan creation
- student management
- professor management

### Explicitly Out of Scope for Now

Do not implement these unless explicitly requested:

- payment processing
- academy billing automation
- QR code check-in
- push notifications
- native mobile app
- professor-side advanced class management
- full academy settings editing
- complex event-driven architecture
- microservices

---

## 4. Technical Direction

### Frontend

BlackBelt will be built first as a **React PWA**.

Rules:

- PWA first.
- Mobile-first UI.
- Responsive desktop support, but do not design desktop-first.
- Do not build a native mobile app for the MVP.
- Recreate the current design using production-ready React components.
- Do not ship the HTML/Babel prototype directly.

The uploaded prototype currently runs as browser React/Babel for fast visual iteration, but the README explicitly states that the design files are references and should not be copied directly as production code. The production app should recreate the screens in the target codebase and strip prototype-only elements like the iOS frame and tweaks panel. :contentReference[oaicite:0]{index=0}

### Backend

Keep backend architecture simple.

Preferred MVP architecture:

- simple layered architecture
- modular monolith
- use cases/services for business flows
- repositories/data access modules for persistence
- no premature microservices

### Database

Use a relational model focused on consistency around:

- users
- academies
- academy members
- roles
- class schedules
- check-ins
- student belts
- membership plans

---

## 5. Architecture Rules

This is an MVP. Simplicity is a core architectural requirement.

Agents must follow these rules:

- Do not introduce microservices.
- Do not introduce complex event-driven architecture.
- Do not create unnecessary abstractions.
- Do not build a generic framework inside the app.
- Do not create multiple layers unless they solve a real MVP problem.
- Keep domain logic outside controllers/routes.
- Keep UI logic outside domain/application rules.
- Keep data access isolated.
- Keep changes small and easy to review.

Preferred structure:

```txt
src/
  app/
  pages/
  components/
  features/
    academy/
    auth/
    onboarding/
    checkins/
    belts/
    schedules/
    memberships/
  services/
  repositories/
  lib/
  styles/
