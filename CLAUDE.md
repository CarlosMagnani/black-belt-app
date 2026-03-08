# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web

# Type checking (no test suite exists)
npm run typecheck

# Build APK (requires EAS CLI and credentials)
npm run build:apk
```

There is no linting script configured. There are no automated tests.

## Architecture

**BlackBelt** is a BJJ (Brazilian Jiu-Jitsu) academy management app built with Expo 54, React Native, NativeWind (Tailwind CSS), Supabase, and Expo Router 6. All UI text is in **Brazilian Portuguese (pt-BR)**.

### Hexagonal (Ports & Adapters) Architecture

The codebase enforces a strict separation of concerns:

```
src/core/ports/blackbelt-ports.ts   ← All TypeScript interfaces (the contract)
src/infra/supabase/blackbelt-supabase.ts ← Supabase implementations of those interfaces
src/infra/supabase/adapters.ts      ← Single exported adapter instance: blackBeltAdapters
src/infra/supabase/client.ts        ← Singleton Supabase client
src/core/hooks/                     ← React hooks (use cases) that call adapters
src/core/belts/                     ← Belt hierarchy logic and progression rules
src/ui/                             ← Shared UI components (belt badges, theme)
```

**Critical rule:** Never create a second Supabase client. Always import `blackBeltAdapters` from `src/infra/supabase/adapters.ts` or `supabase` from `src/infra/supabase/client.ts`.

### Routing (Expo Router 6)

Role-based route groups with their own layouts:

- `app/(student)/` — Home, Schedule, Profile, Settings
- `app/(owner)/` — Dashboard, Students, Professors, Schedule, Plans, Check-ins, Billing, Settings
- `app/(professor)/` — Check-in validation only
- `app/index.tsx` — Central route resolver: reads auth session + profile, redirects to the correct role group
- `app/_layout.tsx` — Root layout: wraps everything with `ThemeProvider`, `AuthGate` (listens for `SIGNED_OUT`), and `Toast`

### Data Flow Pattern

Screens import from `blackBeltAdapters` (or custom hooks from `src/core/hooks/`) and call port methods directly. No global state management library — hooks use `useState` + `useEffect` with direct adapter calls.

### Three User Roles

| Role | Entry screen after routing |
|------|---------------------------|
| Student | `/home` (requires academy membership) |
| Owner | `/owner-home` (requires academy created) |
| Professor | `/professor-checkins` |

Role is determined by `profile.role`. Owners are also detected by `academy.ownerId === user.id`. A user without a complete profile (missing `firstName`, `role`, or `currentBelt`) is sent to `/onboarding`.

### NativeWind / Styling

- **Dark mode:** `darkMode: "class"` — the `ThemeProvider` toggles the `dark` class on the root view
- **Semantic color tokens** defined in `tailwind.config.js`: `bg-app-light`, `bg-app-dark`, `bg-surface-light`, `bg-surface-dark`, `text-text-primary-light`, etc.
- Belt colors: `bg-belt-white`, `bg-belt-blue`, `bg-belt-purple`, `bg-belt-brown`, `bg-belt-black`, `bg-belt-coral`, `bg-belt-red`
- Brand primary: `brand-500` (#6366F1, indigo)

### Supabase / Database

Migrations are in `supabase/migrations/` (plain SQL). Key tables:
- `profiles` — user profile data
- `academies` — one per owner
- `academy_members` — links users to academies with role + `approved_classes` counter
- `academy_classes` — class schedule entries (weekday 0-6)
- `class_checkins` — student check-in records (`pending` → `approved`/`rejected`)
- `academy_plans` — membership plans offered by an academy
- `academy_staff` — staff members (owners + professors)

All table access is protected by Supabase Row Level Security (RLS). Some operations use RPC functions (e.g., `set_member_belt`).

### Belt System

Belt progression is defined in `src/core/belts/belts.ts`. Rules:
- 24 approved classes per degree
- 200 total classes as the overall benchmark
- Degree ranges: White–Brown (0–4), Black (0–7), Coral (7–8), Red (9–10)
- Belt can only be changed by a professor or owner

### Key Shared Components

- `components/ui/` — Design system primitives (Button, Card, Modal, TextField, Badge, Avatar, Select, Skeleton, etc.) — exported via `components/ui/index.ts`
- `components/layout/AppShell.tsx` — Student tab navigation shell
- `components/owner/OwnerSidebar.tsx` — Owner sidebar (desktop)
- `src/ui/belts/` — Belt-specific UI: BeltBadge, BeltIcon, BeltPicker, BeltProgressCard

### Features Under Development

The following screens are stubs/placeholders:
- `/owner-billing` — Billing/checkout (placeholder, button disabled)
- `/owner-settings` — Academy editing (read-only with "coming soon" note)
- Academy address & logo persistence (UI exists but not saved to DB)
- Payment processing (Pix/Stripe) — DB schema exists, no UI
