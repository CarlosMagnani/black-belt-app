import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

export { prisma }

/**
 * Truncate all tables we use for roster tests, in FK-safe order.
 * Safe to call multiple times; skips empty database gracefully.
 */
export async function cleanDatabase(): Promise<void> {
  const tables = [
    'activity_events',
    'belt_progression_events',
    'student_belts',
    'check_ins',
    'class_schedules',
    'membership_subscriptions',
    'membership_plans',
    'academy_members',
    'academies',
    'users',
  ]

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`)
    } catch {
      // Table doesn't exist or other transient error — do not fail setup
    }
  }
}

export type TestUser = {
  id: string
  email: string
  fullName: string
  nickname: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a test user (no Supabase dependency).
 */
export async function createTestUser(overrides?: Partial<TestUser>): Promise<TestUser> {
  const user = await prisma.user.create({
    data: {
      id: overrides?.id ?? crypto.randomUUID(),
      email: overrides?.email ?? `test-${Date.now()}@example.com`,
      fullName: overrides?.fullName ?? 'Test User',
      nickname: overrides?.nickname ?? null,
      avatarUrl: overrides?.avatarUrl ?? null,
    },
  })
  return user
}

export type TestAcademy = {
  id: string
  name: string
  city: string
  inviteCode: string
  logoUrl: string | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export type TestAcademyMember = {
  id: string
  academyId: string
  userId: string
  role: string
  status: string
  joinedAt: Date
}

/**
 * Create an academy owned by the given user, with the user as an AcademyMember (owner).
 */
export async function createAcademy(ownerId: string, overrides?: Partial<TestAcademy>): Promise<{
  academy: TestAcademy
  member: TestAcademyMember
}> {
  const inviteCode = overrides?.inviteCode ?? `BB-TEST${Date.now().toString(36).toUpperCase()}`
  const academy = await prisma.academy.create({
    data: {
      id: overrides?.id ?? crypto.randomUUID(),
      name: overrides?.name ?? 'Test Academy',
      city: overrides?.city ?? 'Test City',
      inviteCode,
      ownerId,
      logoUrl: overrides?.logoUrl ?? null,
    },
  })

  const member = await prisma.academyMember.create({
    data: {
      academyId: academy.id,
      userId: ownerId,
      role: 'owner',
      status: 'active',
    },
  })

  return { academy, member }
}

/**
 * Seed a complete owner with academy. Returns the user, academy, and owner membership.
 */
export async function seedOwnerWithAcademy(userOverrides?: Partial<TestUser>): Promise<{
  user: TestUser
  academy: TestAcademy
  member: TestAcademyMember
}> {
  const user = await createTestUser(userOverrides)
  const { academy, member } = await createAcademy(user.id)
  return { user, academy, member }
}

/**
 * Seed a student member in an existing academy, with optional belt/degree.
 * Returns the user and the AcademyMember.
 */
export async function seedStudent(
  academyId: string,
  overrides?: { belt?: string; degree?: number; userId?: string }
): Promise<{
  user: TestUser
  member: TestAcademyMember
}> {
  const user = await createTestUser({
    id: overrides?.userId,
    email: `student-${Date.now()}@example.com`,
    fullName: 'Student User',
  })

  const member = await prisma.academyMember.create({
    data: {
      academyId,
      userId: user.id,
      role: 'student',
      status: 'active',
    },
  })

  await prisma.studentBelt.create({
    data: {
      academyMemberId: member.id,
      belt: (overrides?.belt as any) ?? 'white',
      degree: overrides?.degree ?? 0,
      approvedClassesAtLevel: 0,
      changedBy: user.id,
    },
  })

  return { user, member }
}

/**
 * Seed a professor member in an existing academy.
 * Returns the user and the AcademyMember.
 */
export async function seedProfessor(
  academyId: string,
  overrides?: { userId?: string }
): Promise<{
  user: TestUser
  member: TestAcademyMember
}> {
  const user = await createTestUser({
    id: overrides?.userId,
    email: `professor-${Date.now()}@example.com`,
    fullName: 'Professor User',
  })

  const member = await prisma.academyMember.create({
    data: {
      academyId,
      userId: user.id,
      role: 'professor',
      status: 'active',
    },
  })

  return { user, member }
}

/**
 * Create an active ClassSchedule for a given instructor in the academy.
 * Only sets the minimal fields needed for the active-class check.
 */
export async function createActiveClassSchedule(
  academyId: string,
  instructorId: string,
  overrides?: { title?: string }
): Promise<{ id: string }> {
  const cls = await prisma.classSchedule.create({
    data: {
      academyId,
      instructorId,
      title: overrides?.title ?? 'Aula',
      dayOfWeek: 1,
      startTime: '10:00',
      durationMinutes: 60,
      isActive: true,
    },
  })
  return { id: cls.id }
}
