# Current AI Handoff — BlackBelt

## 1. Current Goal

Build the student onboarding route and connect the owner onboarding frontend to the backend API.

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

Owner onboarding UI completed on 2026-07-10:

- `/onboarding/mestre` is now a mobile-first, three-step owner onboarding flow: academy details, owner profile/grade, and invite preview.
- Academy logo and owner-photo controls are optional local previews: JPEG, PNG, or WebP files up to 5 MB, with replace/remove actions and no crop editor.
- The flow uses local React state only. It validates required academy, city, name, and belt fields but does not create an academy, profile, invitation, or QR code in the backend.
- Invite copy/share controls operate only on the visibly labelled local preview. The final action explains that backend creation is still pending.
- Returning to the role screen from the first onboarding step can resume the owner flow in the same browser navigation session without attempting to save the already-selected role again.

Media storage foundation completed on 2026-07-10:

- Supabase project `lvwaruajmfwkajbkbbuq` now has a private `academy-media` bucket restricted to JPEG, PNG, and WebP files up to 5 MB.
- Storage object RLS is enabled and there are no browser-facing Storage policies. Future uploads must go through the backend using its server-only service-role key.
- Backend code uses an `ObjectStorage` port and factory; `SupabaseObjectStorage` is the current adapter. Academy use cases must depend on the port rather than Supabase directly, so a future provider only requires another adapter and one factory change.

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

- `POST /onboarding/owner` accepts multipart form data: `academyName`, `academyCity`, `ownerBelt`, `ownerDegree`, `logo` (file), `photo` (file).
- Creates `Academy`, `AcademyMember` (role: owner), uploads logo and photo via `ObjectStorage` port, updates `User.belt`, `User.degree`, and `User.avatarUrl`.
- Invite code generated server-side: `BB-XXXXXX` format, 6 random alphanumeric characters using `crypto.randomBytes`.
- Owner's belt and degree stored on `User` as static metadata (not tracked for progression — progression is for students and professors only via `StudentBelt`).
- Returns 409 Conflict if user already owns an academy (domain rule: one owner = one academy).
- File validation: 5 MB max, JPEG/PNG/WebP only, enforced server-side.
- `@fastify/multipart` registered with file size limit.
- `ObjectStorage` wired into `buildApp()` via factory with `SUPABASE_SERVICE_ROLE_KEY` and `STORAGE_BUCKET`.
- New fields added to Prisma schema: `User.belt` (nullable Belt enum), `User.degree` (Int, default 0), `Academy.logoUrl` (nullable text).
- Migration `20260714190000_add_owner_onboarding_fields` created and applied.
- New academy module: repository, service, controller, routes under `backend/src/modules/academy/`.

Next implementation focus:

- Configure `SUPABASE_SERVICE_ROLE_KEY` in the backend `.env` (get from Supabase dashboard → Settings → API).
- Connect the existing owner onboarding frontend to `POST /onboarding/owner` — replace the local preview flow with an actual API call using multipart form data.
- Build the student onboarding route and its invite-verification API slice.
- Implement password recovery as the next separate auth slice.

Open risk: live end-to-end signup and confirmation still need a disposable confirmed test account. The owner onboarding screen has not been manually exercised end-to-end with the new backend API.

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
