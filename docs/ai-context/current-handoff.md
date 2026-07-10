# Current AI Handoff — BlackBelt

## 1. Current Goal

Configure the development database, then build the role-specific onboarding flow.

Backend authentication and Supabase project configuration completed on 2026-07-10:

- Fastify validates Supabase ES256 access tokens with `jose` and the project's public JWKS endpoint.
- Verification enforces ES256, the Supabase project issuer, `authenticated` audience, required identity claims, and token expiration.
- `GET /auth/me` is the first protected endpoint and returns the local application user.
- The first protected request upserts the Supabase user into the Prisma `User` table.
- Authentication failures use the `{ data, error }` API envelope without exposing token or database details.
- The local `password_hash` field is nullable because Supabase Auth owns password storage.
- Supabase project `black-belt-app` (`lvwaruajmfwkajbkbbuq`) is active and healthy.
- Development Site URL is `http://localhost:5173`; `http://localhost:5173/**` is allowed for redirects.
- Email/password signup is enabled with confirmation required, anonymous signup disabled, and an 8-character minimum password.
- Public API roles can no longer execute the privileged `public.rls_auto_enable()` event-trigger function; the security advisor reports no findings.

Frontend authentication completed on 2026-07-10:

- Login and registration pages follow the existing BlackBelt mobile-first design system in Brazilian Portuguese.
- Registration uses email/password only, requires a matching 8-character password, and sends users to a confirmation-email screen.
- The confirmation screen can resend the signup email; its redirect restores the Supabase session and opens the existing role-selection handoff.
- Session restoration, route guards, and logout are implemented with `@supabase/supabase-js`.
- Existing owner/student role cards are recreated as the post-login destination; their full onboarding routes are intentionally deferred.

Next implementation focus:

- Configure a real `DATABASE_URL` locally. `SUPABASE_URL` is already configured for development.
- Create/apply the initial Prisma migration against the development database.
- Build the owner and student onboarding routes behind the role-selection cards.
- Send the Supabase access token to `GET /auth/me` and protected API routes after the local database is ready.
- Implement password recovery as the next separate auth slice.

Open risk: live end-to-end signup and confirmation still need a disposable confirmed test account. The frontend deliberately does not call `/auth/me` until the application database and its first migration exist.

Commands run:

```txt
npm run db:generate
npm run build
npm test
npm audit --omit=dev
npx prisma validate
npx prisma format
git diff --check
npm run build
npm run lint
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
