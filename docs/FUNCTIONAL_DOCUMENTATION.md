# BlackBelt - Functional Documentation

> Management platform for Brazilian Jiu-Jitsu and Muay Thai academies.
> Version 0.1.0 | Expo 54 | React Native + Web

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Roles](#2-user-roles)
3. [Authentication Flow](#3-authentication-flow)
4. [Onboarding Flow](#4-onboarding-flow)
5. [Student Module](#5-student-module)
6. [Owner Module](#6-owner-module)
7. [Professor Module](#7-professor-module)
8. [Belt System](#8-belt-system)
9. [Navigation Map](#9-navigation-map)
10. [Business Rules](#10-business-rules)
11. [Data Model Summary](#11-data-model-summary)
12. [Features Under Development](#12-features-under-development)

---

## 1. Overview

BlackBelt is a multi-role mobile and web application designed for martial arts academies. It enables academy owners to manage students, professors, class schedules, check-ins, membership plans, and billing. Students can track their belt progression, view schedules, and check in to classes. Professors can validate student check-ins.

**Supported Platforms:** iOS, Android (via Expo), Web (via React Native Web)

**Language:** All UI text is in Brazilian Portuguese (pt-BR).

**Backend:** Supabase (PostgreSQL + Auth + Storage + Row Level Security)

---

## 2. User Roles

The application supports three distinct roles, each with its own set of screens and permissions:

| Role | Description | Entry Point |
|------|-------------|-------------|
| **Student** (Aluno) | Academy member who attends classes | `/home` |
| **Owner** (Dono/Mestre) | Academy administrator who manages everything | `/owner-home` |
| **Professor** (Instrutor) | Instructor who validates student check-ins | `/professor-checkins` |

Role is determined during onboarding and stored in the user profile. Owners are also detected by academy ownership (if a user owns an academy, they are treated as an owner regardless of profile role).

---

## 3. Authentication Flow

### 3.1 Sign In / Sign Up (`/auth`)

**Screen:** Single screen with tab toggle between "Entrar" (Sign In) and "Criar Conta" (Sign Up).

**Sign In mode:**
- Fields: Email, Password
- Action: Authenticates via Supabase Auth
- On success: Redirects to `/` (route resolver)
- Additional: "Esqueci minha senha" link shows an alert with support contact

**Sign Up mode:**
- Fields: Email, Password, Confirm Password
- Validation:
  - Email is required
  - Password must be 6+ characters
  - Passwords must match
- On success: Redirects to `/onboarding` (or shows pending email confirmation if email is not yet verified)

**Error handling:** Displays error card below the form with the error message.

### 3.2 Email Confirmation Callback (`/auth-callback`)

**Purpose:** Processes OAuth/magic link callback URLs from Supabase.

**Flow:**
1. Parses URL fragment for `access_token` and `refresh_token`, or query for `code`
2. Calls `supabase.auth.setSession()` or `exchangeCodeForSession()`
3. On success: Redirects to `/onboarding`
4. On error: Shows error card with "Voltar para login" button
5. On web: Cleans URL history to prevent token leakage

### 3.3 Auth Gate (Root Layout `/_layout`)

**Purpose:** Global authentication state monitor.

**Behavior:**
- Listens for Supabase auth state changes
- On `SIGNED_OUT` event: Automatically redirects to `/auth`
- Wraps all routes with theme provider (dark/light mode)

### 3.4 Route Resolver (`/index`)

**Purpose:** Central routing logic that determines where to send the user based on their state.

**Decision tree:**

```
User arrives at /
  |
  +-- No session? --> /auth
  |
  +-- Profile incomplete (missing role, belt, or name)? --> /onboarding
  |
  +-- Role = Student?
  |     +-- No academy membership? --> /join-academy
  |     +-- Has membership? --> /home
  |
  +-- Role = Owner?
  |     +-- No academy created? --> /create-academy
  |     +-- Has academy? --> /owner-home
  |
  +-- Role = Professor? --> /professor-checkins
```

---

## 4. Onboarding Flow

### 4.1 Profile Setup (`/onboarding`)

**Purpose:** 4-step wizard to complete the user profile after registration.

**Step 1 - Role Selection:**
- Choose between "Aluno" (Student) or "Dono de academia" (Owner)
- Displayed as interactive role cards
- Required to proceed

**Step 2 - Personal Data:**
- Fields: First Name, Last Name, Birth Date, Sex
- Sex options: Masculino (M), Feminino (F), Outro (O), Prefiro nao informar (N)
- All fields are required

**Step 3 - Belt & Degree:**
- Belt selector dropdown with 7 belt options (Branca through Vermelha)
- Degree selector (range depends on selected belt)
- Belt is required, degree is optional

**Step 4 - Avatar (Optional):**
- Image picker for profile photo
- Uploads to Supabase Storage
- Can be skipped

**On completion:**
- Saves profile via `upsertProfile()`
- Redirects based on role:
  - Student --> `/join-academy`
  - Owner --> `/create-academy`
  - Professor --> `/professor-checkins`

**Email confirmation:**
- If email is not yet confirmed, shows a pending confirmation screen
- Provides "Reenviar email" (resend) and "Verificar novamente" (check again) buttons

### 4.2 Create Academy (`/create-academy`)

**Purpose:** 3-step wizard for owners to create their academy.

**Step 1 - Academy Name:**
- Text input for academy name
- Validation: minimum 3 characters

**Step 2 - Address:**
- Fields: CEP (ZIP), Street, Neighborhood, Number, City, State, Complement
- CEP auto-formats to 8 digits
- State must be 2 letters
- Note: Address fields are UI-only and not yet persisted to the database

**Step 3 - Logo Upload:**
- Optional logo image upload
- Note: Logo is UI-only and not yet persisted to the database

**On completion:**
- Generates a unique invite code in `ABC-1234` format (up to 5 retries for uniqueness)
- Calls `createAcademy()` with ownerId, name, city, and inviteCode
- Shows success screen with the invite code and a "Copiar codigo" (copy) button
- "Ir para Dashboard" button redirects to `/owner-home`

**Guard:** If the owner already has an academy, shows the success screen with the existing academy code.

### 4.3 Join Academy (`/join-academy`)

**Purpose:** Students join an existing academy using an invite code.

**Flow:**
1. Student types the 7-character invite code (auto-formatted as `XXX-1234`)
2. After code is complete, a debounced search (300ms) looks up the academy
3. If found, an academy preview card appears showing name and city
4. Student taps "Confirmar Entrada" to join
5. On success: Redirects to `/home`

**Validation:**
- Code must be exactly 7 alphanumeric characters
- Auto-uppercased, non-alphanumeric characters stripped

**Error states:**
- "Codigo nao encontrado" -- code doesn't match any academy
- "Erro ao buscar academia" -- search request failed
- "Nao foi possivel entrar na academia" -- join request failed

**Guard:** If student already has a membership, auto-redirects to `/home`.

---

## 5. Student Module

All student screens are wrapped in the `AppShell` layout component that provides responsive navigation.

### 5.1 Home Dashboard (`/home`)

**Purpose:** Main student dashboard showing personalized overview.

**Sections:**

**Header:**
- Avatar cluster showing student avatar + academy logo
- Student name, belt, and degree
- Academy name

**Belt Progress Cards (x2):**
- "Proximo grau" (Next Degree): Shows `classesThisGrade / 24` progress with bar
- "Rumo a faixa [NextBelt]" (Path to Next Belt): Shows `totalClasses / 200` progress

**Check-in Button:**
- "Fazer check-in no tatame" -- navigates to `/schedule`

**Weekly Schedule Preview:**
- Day-of-week selector chips (Dom, Seg, Ter, Qua, Qui, Sex, Sab)
- Shows up to 4 classes for the selected day
- Each class shows title, time, instructor, location
- "Ver agenda completa" link navigates to `/schedule`

**Data sources:**
- `useStudentAcademy()` -- profile, academy, membership
- `useStudentProgress()` -- belt progression calculations
- `schedules.getWeeklySchedule()` -- class schedule for current week

### 5.2 Schedule (`/schedule`)

**Purpose:** Full weekly calendar with check-in functionality.

**Features:**
- Week navigation (previous/next week arrows)
- Week date range display (e.g., "03 fev - 09 fev")
- 7-day grid showing all classes grouped by day
- Each class block shows: title, time range, instructor name, location, level
- Check-in button per class

**Check-in flow:**
1. Student taps "Fazer check-in" on a class
2. Creates a check-in record with status "pending"
3. Shows success message: "Check-in enviado para validacao"
4. Button replaced by badge showing check-in status (pending/approved/rejected)

**States:**
- Loading: "Carregando agenda da semana..."
- Empty: "Nenhuma aula cadastrada para esta semana"
- Per-day empty: "Sem aulas neste dia"

### 5.3 Profile (`/profile`)

**Purpose:** View and edit personal information.

**Editable fields:**
- Avatar (tap to upload new photo)
- First Name, Last Name
- Birth Date (date picker)
- Sex (dropdown: Masculino, Feminino, Outro, Prefiro nao informar)
- Federation Number

**Read-only fields:**
- Email address
- Current belt and degree (displayed via BeltBadge)
- Academy name, city, and invite code

**Note on belt:** "Alterada apenas pelo professor" (Changed only by the instructor)

**Actions:**
- "Salvar alteracoes" -- saves profile changes
- "Sair da conta" -- signs out (AuthGate handles redirect)

**Feedback:**
- Success: "Foto atualizada!" or "Perfil atualizado com sucesso!" (shown 3 seconds)
- Error: Displayed in red card

### 5.4 Settings (`/settings`)

**Purpose:** App theme customization.

**Options:**
| Option | Description |
|--------|-------------|
| Sistema | Follows device theme |
| Claro | Light mode for daytime training |
| Escuro | Dark mode for nighttime environments |

**Behavior:**
- Shows current active theme (Modo escuro / Modo claro)
- Shows preference source ("Ajustado automaticamente pelo sistema" vs "Configurado manualmente por voce")
- Selection takes effect immediately

---

## 6. Owner Module

All owner screens share a responsive layout with a sidebar on desktop and a simplified layout on mobile/tablet.

### 6.1 Owner Dashboard (`/owner-home`)

**Purpose:** Academy management overview with KPIs and quick access to key functions.

**Sections:**

**Academy Card:**
- `InviteCodeCard` component showing academy name, city, logo, and invite code
- "Copiar codigo" button copies invite code to clipboard

**KPI Cards (3):**
| KPI | Data Source |
|-----|-------------|
| Alunos ativos (Active students) | Count of academy members |
| Total de aulas (Total classes) | Count of scheduled classes |
| Check-ins pendentes (Pending check-ins) | Count of pending check-in requests |

**Data sources:**
- `useOwnerAcademy()` -- academy, profile
- `memberships.listMembersWithProfiles()` -- member count
- `classes.listByAcademy()` -- class count
- `checkins.listPendingByAcademy()` -- pending check-in count

### 6.2 Students Management (`/owner-students`)

**Purpose:** View and manage academy students/members.

**Features:**
- List of all academy members with profiles
- Each member shows: avatar (or initials), full name or email, role badge, belt badge
- KPI card showing total member count
- Loading state: "Carregando membros..."
- Empty state: "Nenhum membro encontrado"

**Data source:** `memberships.listMembersWithProfiles(academyId)`

### 6.3 Professors Management (`/owner-professors`)

**Purpose:** View and manage academy instructors.

**Features:**
- List of staff members (owners and professors) from the `academy_staff` table
- Each entry shows: avatar (or initials), name or email, role label ("Mestre" for owner, "Professor" for professor)
- KPI card showing total professor count
- Loading state: "Carregando professores..."
- Empty state: "Nenhum professor encontrado"

**Data source:** Direct Supabase query on `academy_staff` table with joined profiles.

### 6.4 Class Schedule Management (`/owner-schedule`)

**Purpose:** Full CRUD management for academy class schedules.

**Features:**

**Quick stats:** Total classes count, Professors count

**Class list:** `ClassList` component grouping classes by weekday
- Each class shows: title, time range, instructor, location, level
- Edit and delete buttons per class

**Create Class (Modal):**
- Fields: Title, Weekday (dropdown), Start Time, End Time, Instructor (dropdown from staff), Location, Level, Notes, Is Recurring, Start Date
- Instructor dropdown populated from `academy_staff` table
- Default instructor: current user

**Edit Class (Modal):**
- Same fields as create, pre-populated with existing data
- "Excluir aula" (Delete class) button with confirmation
- Updates class via `classes.updateClass()`

**Delete Class:**
- Called from edit modal
- Removes class via `classes.deleteClass()`

### 6.5 Membership Plans (`/owner-plans`)

**Purpose:** Create and manage academy membership plans.

**Features:**

**Plan list:** Cards showing existing plans
- Each plan shows: name, price (formatted as BRL currency), periodicity, description
- Loading state: "Carregando planos..."
- Empty state: "Nenhum plano cadastrado"

**Create Plan (Modal):**
- Fields: Name, Price (BRL), Periodicity (dropdown), Description
- Periodicity options: Mensal (monthly), Trimestral (quarterly), Semestral (semiannual), Anual (annual)

**Data source:** `academyPlans.listByAcademy(academyId)`, `academyPlans.createPlan()`

### 6.6 Check-in Validation (`/owner-checkins`)

**Purpose:** Review and approve/reject pending student check-ins.

**Features:**

**Pending check-in list:**
- Each card shows: student avatar/initials, student name, class title, weekday, start time
- Two action buttons: "Aprovar" (Approve) and "Rejeitar" (Reject)
- Processing state: "Processando..." while updating

**Flow:**
1. Owner views list of all pending check-ins for their academy
2. Taps "Aprovar" or "Rejeitar" on each
3. Calls `checkins.updateStatus()` with the decision and validator ID
4. Card is removed from the list after processing

**States:**
- Loading: "Carregando check-ins..."
- Empty: "Nenhum check-in pendente"

### 6.7 Billing (`/owner-billing`)

**Purpose:** Academy subscription and payment management.

**Current state:** Placeholder screen with message "Em breve voce podera acessar o checkout web para atualizar sua assinatura" (Coming soon).

**Contains:** Disabled "Abrir checkout" button.

### 6.8 Academy Settings (`/owner-settings`)

**Purpose:** View academy basic information and sign out.

**Features:**
- Displays academy name and city (read-only)
- Note: "Edicao completa sera adicionada nesta fase" (Full editing will be added)
- "Sair da conta" (Sign out) button in red

---

## 7. Professor Module

### 7.1 Check-in Validation (`/professor-checkins`)

**Purpose:** Professors can approve or reject pending student check-ins, identical in functionality to the owner's check-in screen.

**Features:**
- Lists all pending check-ins for the academy
- Each check-in card shows: student info, class info, weekday, time
- Approve/Reject buttons
- Same approval flow as owner module

**Data source:** `checkins.listPendingByAcademy(academyId)`

---

## 8. Belt System

### 8.1 Belt Hierarchy

BlackBelt implements the standard Brazilian Jiu-Jitsu belt progression:

| Order | Belt (Portuguese) | Degree Range | English |
|-------|-------------------|-------------|---------|
| 1 | Branca | 0 - 4 | White |
| 2 | Azul | 0 - 4 | Blue |
| 3 | Roxa | 0 - 4 | Purple |
| 4 | Marrom | 0 - 4 | Brown |
| 5 | Preta | 0 - 7 | Black |
| 6 | Coral | 7 - 8 | Coral |
| 7 | Vermelha | 9 - 10 | Red |

Coral belt has a variant property: `red-black` or `red-white`.

### 8.2 Progression Rules

- **Classes per degree:** 24 approved classes to advance one degree
- **Total classes target:** 200 classes as the overall progression benchmark
- **Grade progress:** `classesThisGrade / 24` (percentage toward next degree)
- **Total progress:** `totalClasses / 200` (capped at 100%)
- **Approved classes** are read from the `AcademyMember` record (not a separate table)

### 8.3 Belt Selection

- During onboarding (Step 3), students select their current belt and degree
- Belt can only be changed by a professor/owner (read-only on the student profile)
- The degree selector dynamically adjusts its range based on the selected belt

---

## 9. Navigation Map

```
/ (Route Resolver)
|
+-- /auth (Sign In / Sign Up)
|   +-- /auth-callback (Email/OAuth confirmation)
|
+-- /onboarding (4-step profile setup)
|
+-- /create-academy (Owner: 3-step academy creation)
|
+-- /join-academy (Student: join with invite code)
|
+-- (student)/
|   +-- /home (Dashboard)
|   +-- /schedule (Weekly calendar + check-in)
|   +-- /profile (Edit personal info)
|   +-- /settings (Theme preferences)
|
+-- (owner)/
|   +-- /owner-home (Dashboard + KPIs)
|   +-- /owner-students (Manage members)
|   +-- /owner-professors (Manage instructors)
|   +-- /owner-schedule (Manage class schedule)
|   +-- /owner-plans (Manage membership plans)
|   +-- /owner-checkins (Approve/reject check-ins)
|   +-- /owner-billing (Subscription - placeholder)
|   +-- /owner-settings (Academy info + sign out)
|
+-- (professor)/
    +-- /professor-checkins (Approve/reject check-ins)
```

### Sidebar Navigation (Owner - Desktop)

The owner sidebar provides quick access to all owner screens:
- Dashboard (Home)
- Alunos (Students)
- Professores (Professors)
- Agenda (Schedule)
- Planos (Plans)
- Check-ins
- Assinatura (Billing)
- Configuracoes (Settings)

### Bottom/Tab Navigation (Student)

The student `AppShell` provides navigation between:
- Home
- Agenda (Schedule)
- Perfil (Profile)
- Ajustes (Settings)

---

## 10. Business Rules

### Authentication & Authorization

| Rule | Description |
|------|-------------|
| BR-AUTH-01 | Users must have a confirmed email to complete onboarding |
| BR-AUTH-02 | Profile must have firstName/fullName, role, and currentBelt to be considered complete |
| BR-AUTH-03 | Students can only access student routes; owners can only access owner routes |
| BR-AUTH-04 | Sign-out clears all local state and redirects to `/auth` |
| BR-AUTH-05 | All data access is protected by Supabase Row Level Security (RLS) |

### Academy Management

| Rule | Description |
|------|-------------|
| BR-ACAD-01 | Each owner can have one academy |
| BR-ACAD-02 | Invite codes are 7 characters formatted as `XXX-1234` |
| BR-ACAD-03 | Invite codes must be unique (up to 5 generation retries) |
| BR-ACAD-04 | Students join academies using invite codes |
| BR-ACAD-05 | A student with an existing membership is redirected to `/home` automatically |

### Check-in System

| Rule | Description |
|------|-------------|
| BR-CHK-01 | Students create check-ins with status "pending" |
| BR-CHK-02 | Owners and professors can approve or reject pending check-ins |
| BR-CHK-03 | Check-in validation records who approved/rejected (`validatedBy`) |
| BR-CHK-04 | Approved check-ins increment the student's `approved_classes` counter |
| BR-CHK-05 | Once processed, check-ins are removed from the pending list |

### Class Schedule

| Rule | Description |
|------|-------------|
| BR-CLS-01 | Classes are assigned to a specific weekday (0=Sunday through 6=Saturday) |
| BR-CLS-02 | Classes have a start time and end time |
| BR-CLS-03 | Classes can be recurring or one-time |
| BR-CLS-04 | Classes can be assigned to a specific instructor |
| BR-CLS-05 | Default instructor for new classes is the currently logged-in owner |

### Belt Progression

| Rule | Description |
|------|-------------|
| BR-BELT-01 | 24 approved classes are needed to advance one degree |
| BR-BELT-02 | Progress is calculated as `approved_classes % 24` |
| BR-BELT-03 | Degree range is enforced per belt (e.g., Preta allows 0-7) |
| BR-BELT-04 | Belt changes can only be made by professors/owners |
| BR-BELT-05 | The `getNextBelt()` function determines the next belt in the hierarchy |

### Membership Plans

| Rule | Description |
|------|-------------|
| BR-PLAN-01 | Plans have a name, price (BRL), periodicity, and optional description |
| BR-PLAN-02 | Supported periodicities: monthly, quarterly, semiannual, annual |
| BR-PLAN-03 | Payment gateways supported: Pix, Stripe (schema-level, not yet in UI) |

---

## 11. Data Model Summary

### Core Entities

| Entity | Key Fields | Description |
|--------|-----------|-------------|
| **Profile** | id, email, fullName, firstName, lastName, currentBelt, beltDegree, role, avatarUrl, birthDate, sex, federationNumber | User profile data |
| **Academy** | id, name, city, ownerId, inviteCode, logoUrl | Academy information |
| **AcademyMember** | id, academyId, userId, role, approvedClasses, joinedAt | Membership record linking users to academies |
| **AcademyClass** | id, academyId, title, weekday, startTime, endTime, instructorId, instructorName, location, level, notes, isRecurring, startDate | Class schedule entry |
| **ClassCheckin** | id, academyId, classId, studentId, status, validatedBy, createdAt | Student check-in record |
| **AcademyPlan** | id, academyId, name, priceCents, periodicity, description | Membership plan |
| **AcademySubscription** | id, academyId, status, currentPeriodStart, currentPeriodEnd | Academy subscription record |
| **PaymentAttempt** | id, academyId, amount, status, gateway | Payment transaction record |

### Key Enums

| Enum | Values |
|------|--------|
| MemberRole | `student`, `instructor`, `owner` |
| CheckinStatus | `pending`, `approved`, `rejected` |
| SubscriptionStatus | `trialing`, `active`, `past_due`, `canceled`, `expired` |
| PaymentGateway | `pix`, `stripe` |
| PlanPeriodicity | `monthly`, `quarterly`, `semiannual`, `annual` |

### Port Interfaces (API Layer)

| Port | Operations |
|------|-----------|
| **AuthPort** | getSession, signIn, signUp, signOut, onAuthStateChange |
| **ProfilesPort** | getProfile, upsertProfile |
| **AcademiesPort** | createAcademy, getById, getByInviteCode, getByOwnerId |
| **MembershipsPort** | addMember, getMember, listByAcademy, listByUser, listMembersWithProfiles |
| **ClassesPort** | listByAcademy, createClass, updateClass, deleteClass |
| **CheckinsPort** | createCheckin, listPendingByAcademy, listPendingMine, updateStatus |
| **SchedulesPort** | getWeeklySchedule |
| **StoragePort** | uploadAvatar |
| **AcademyPlansPort** | listByAcademy, createPlan, updatePlan |
| **AcademySubscriptionsPort** | getByAcademyId |
| **PaymentAttemptsPort** | listByAcademy |

---

## 12. Features Under Development

The following features exist at the schema/UI level but are not yet fully implemented:

| Feature | Status | Notes |
|---------|--------|-------|
| Academy address persistence | UI only | Address fields are rendered but not saved to database |
| Academy logo upload | UI only | Logo picker exists but URL is not persisted |
| Academy settings editing | Placeholder | Shows data read-only with "coming soon" note |
| Billing/Checkout | Placeholder | Screen exists with disabled "Abrir checkout" button |
| Payment processing (Pix/Stripe) | Schema only | Database tables exist but no UI integration |
| Subscription management | Schema only | Database tables and types defined, no UI |
| Academy plan editing | Partial | Create exists, update/delete not in UI |
| Forgot password flow | Alert only | Shows alert with support contact instead of reset flow |
| Professor class management | Not started | Professors only have check-in validation |
| Push notifications | Not started | No notification system for check-in updates |
| QR code check-in | Not started | Check-in button exists but QR scanning not implemented |

---

*Document generated on 2026-02-21 based on codebase analysis of BlackBelt v0.1.0.*
