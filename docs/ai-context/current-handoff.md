# Current AI Handoff — BlackBelt

## 1. Current Goal

Build the student onboarding route and its invite-verification API slice. The owner onboarding UI and API are now connected end to end.

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
- Public API roles can no longer execute the privileged `public.rls_auto_enable()` event-trigger function. The current Supabase security advisor only warns that leaked-password protection is disabled.

Frontend authentication completed on 2026-07-10:

- Login and registration pages follow the existing BlackBelt mobile-first design system in Brazilian Portuguese.
- Registration uses email/password only, requires a matching 8-character password, and sends users to a confirmation-email screen.
- The confirmation screen can resend the signup email; its redirect restores the Supabase session and opens the existing role-selection handoff.
- Session restoration, route guards, and logout are implemented with `@supabase/supabase-js`.
- Existing owner/student role cards are recreated as the post-login destination; their full onboarding routes are intentionally deferred.

Owner onboarding UI completed on 2026-07-14:

- `/onboarding/mestre` is a mobile-first, three-step owner onboarding flow: academy details, owner profile/grade, and successful invite reveal.
- Academy logo and owner-photo controls remain optional local previews before submission: JPEG, PNG, or WebP files up to 5 MB, with replace/remove actions and no crop editor.
- Step 2 submits multipart data to `POST /onboarding/owner`. Failures keep all fields and selected files in place for retry; a duplicate academy redirects safely to `/mestre`.
- Step 3 is only shown after a successful API response and uses the real server-generated invite code for copy/share actions.
- The owner profile field is labelled `Nome no tatame` and maps to `ownerNickname`; it does not overwrite the authenticated full name.
- `/mestre` is a protected minimal destination. The full owner dashboard is intentionally deferred.
- Returning to the role screen from the first onboarding step can resume the owner flow in the same browser navigation session without attempting to save the already-selected role again.

Media storage foundation completed on 2026-07-10:

- Supabase project `lvwaruajmfwkajbkbbuq` now has a private `academy-media` bucket restricted to JPEG, PNG, and WebP files up to 5 MB.
- Storage object RLS is enabled and there are no browser-facing Storage policies. Uploads go through the backend using its server-only modern `sb_secret_...` key.
- Backend code uses an `ObjectStorage` port and factory; `SupabaseObjectStorage` is the current adapter. Academy use cases must depend on the port rather than Supabase directly, so a future provider only requires another adapter and one factory change.
- The live adapter upload/delete smoke test passed, and verification confirmed no test object remained in the bucket.

Docker containerization for local development completed on 2026-07-14:

- `docker-compose.yml` at project root runs Postgres 16 (Alpine) and backend (Node 20 Alpine) containers.
- Backend uses bind mount + `tsx watch` for hot-reload on code changes.
- `entrypoint.sh` generates Prisma client, runs `prisma migrate deploy`, then starts the dev server.
- Resource limits: 256M RAM / 0.5 CPU for Postgres, 512M RAM / 1.0 CPU for backend.
- Postgres tuned for dev: `shared_buffers=64MB`, `effective_cache_size=128MB`, `work_mem=4MB`, `max_connections=20`.
- Named volume `postgres_data` for persistence across container restarts.
- Frontend runs natively (not containerized) — Vite dev server with HMR.
- Root `.env` holds Docker/Postgres credentials and Supabase vars. Backend `.env` holds app-specific vars with `DATABASE_URL` pointing to Docker Postgres.

Role assignment API slice completed on 2026-07-14:

- `POST /auth/onboarding` accepts `{ role: 'owner' | 'student' }` and persists the selection.
- `OnboardingRole` enum (owner/student) added to Prisma schema; `onboardingRole` nullable field on `User`.
- Role selection is one-time: 409 Conflict if `onboardingRole` is already set.
- Auth middleware attaches `userOnboardingRole` to request for downstream authorization checks.
- Frontend `RoleChoicePage` calls the endpoint on card click and navigates to `/onboarding/mestre` or `/onboarding/aluno`.
- Professor role is not selectable during onboarding — it is an academy-level assignment, not a self-selection.

Owner onboarding API slice completed on 2026-07-14:

- `POST /onboarding/owner` accepts multipart form data: `academyName`, `academyCity`, `ownerNickname`, `ownerBelt`, `ownerDegree`, `logo` (file), `photo` (file).
- Uploads logo and photo via the `ObjectStorage` port, then atomically creates `Academy` and `AcademyMember` (role: owner) and updates `User.nickname`, `User.belt`, `User.degree`, and `User.avatarUrl`.
- Invite code generated server-side: `BB-XXXXXX` format, 6 random alphanumeric characters using `crypto.randomBytes`.
- Owner's belt and degree stored on `User` as static metadata (not tracked for progression — progression is for students and professors only via `StudentBelt`).
- Returns 409 Conflict if user already owns an academy (domain rule: one owner = one academy).
- File validation: 5 MB max, JPEG/PNG/WebP only, enforced server-side.
- `@fastify/multipart` registered with file size limit.
- The Prisma transaction lives in `PrismaAcademyRepository`; the academy service has no direct Prisma dependency.
- `ObjectStorage` is wired into `buildApp()` via the factory with `SUPABASE_SECRET_KEY` and `STORAGE_BUCKET`. The Supabase adapter sends the modern secret through `apikey` and does not use it as a Bearer JWT.
- New fields added to Prisma schema: `User.belt` (nullable Belt enum), `User.degree` (Int, default 0), `Academy.logoUrl` (nullable text).
- Migration `20260714190000_add_owner_onboarding_fields` created and applied.
- New academy module: repository, service, controller, routes under `backend/src/modules/academy/`.

Next implementation focus:

- Build the student onboarding route and its invite-verification API slice.
- Implement password recovery as the next separate auth slice.

Open risks:

- Live end-to-end signup and confirmation still need a disposable confirmed test account.
- The full browser flow has not yet been submitted with a disposable owner because that would create real academy records; backend HTTP tests and the reversible live Storage smoke test pass.
- Supabase leaked-password protection remains disabled and should be enabled separately in Auth settings.

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
Live Supabase Storage upload/delete smoke test
docker-compose build
docker-compose up
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
