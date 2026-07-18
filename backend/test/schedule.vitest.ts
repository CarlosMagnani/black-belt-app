import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp } from '../src/app'
import type { AuthService } from '../src/modules/auth/auth.service'
import type { AccessTokenVerifier, AuthenticatedUser } from '../src/modules/auth/auth.types'
import {
  cleanDatabase,
  seedOwnerWithAcademy,
  seedStudent,
  seedProfessor,
  prisma,
} from './setup'
import type { TestUser, TestAcademy, TestAcademyMember } from './setup'

// ─── Helpers ────────────────────────────────────────────────────────────────

type AppContext = {
  authService: AuthService
  verifyAccessToken: AccessTokenVerifier
}

function createAppCtx(user: AuthenticatedUser): AppContext {
  return {
    authService: {
      async syncAuthenticatedUser() {
        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          passwordHash: null,
          nickname: null,
          avatarUrl: null,
          onboardingRole: 'owner',
          belt: null,
          degree: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      },
      async setOnboardingRole() {
        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          passwordHash: null,
          nickname: null,
          avatarUrl: null,
          onboardingRole: 'owner',
          belt: null,
          degree: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      },
    },
    verifyAccessToken: async () => ({
      sub: user.id,
      email: user.email,
      role: 'authenticated',
      aud: 'authenticated',
      iss: 'https://test.supabase.co/auth/v1',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  }
}

function authHeaders(userId: string): Record<string, string> {
  return { authorization: 'Bearer test-token-' + userId }
}

// ─── Domain Unit Tests ──────────────────────────────────────────────────────

describe('Schedule domain rules', () => {
  it('isValidInstructor returns true for owner', async () => {
    const { isValidInstructor } = await import('../src/modules/schedule/schedule.domain')
    expect(isValidInstructor({ role: 'owner', status: 'active' })).toBe(true)
  })

  it('isValidInstructor returns true for professor', async () => {
    const { isValidInstructor } = await import('../src/modules/schedule/schedule.domain')
    expect(isValidInstructor({ role: 'professor', status: 'active' })).toBe(true)
  })

  it('isValidInstructor returns false for student', async () => {
    const { isValidInstructor } = await import('../src/modules/schedule/schedule.domain')
    expect(isValidInstructor({ role: 'student', status: 'active' })).toBe(false)
  })

  it('isValidInstructor returns false for null', async () => {
    const { isValidInstructor } = await import('../src/modules/schedule/schedule.domain')
    expect(isValidInstructor(null)).toBe(false)
  })
})

// ─── API Integration Tests ──────────────────────────────────────────────────

describe('Schedule API', () => {
  let owner: TestUser
  let academy: TestAcademy
  let ownerMember: TestAcademyMember

  beforeAll(async () => {
    await cleanDatabase()
    const seeded = await seedOwnerWithAcademy({ fullName: 'Mestre Teste' })
    owner = seeded.user
    academy = seeded.academy
    ownerMember = seeded.member
  })

  afterAll(async () => {
    await cleanDatabase()
  })

  beforeEach(async () => {
    // Clean schedule/activity tables while keeping owner and academy
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "activity_events" CASCADE;`)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "class_schedules" CASCADE;`)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "student_belts" CASCADE;`)
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "academy_members" CASCADE;`)

    // Re-create owner member
    await prisma.academyMember.create({
      data: {
        academyId: academy.id,
        userId: owner.id,
        role: 'owner',
        status: 'active',
      },
    })
  })

  // ─── GET /academy/classes — Auth ─────────────────────────────────────────

  describe('GET /academy/classes', () => {
    it('returns 401 without auth', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({ method: 'GET', url: '/academy/classes' })

      expect(response.statusCode).toBe(401)
      expect(response.json().error.code).toBe('UNAUTHORIZED')
      await app.close()
    })

    it('returns 200 with empty list for a fresh owner', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'GET',
        url: '/academy/classes',
        headers: authHeaders(owner.id),
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()
      expect(body.data.classes).toEqual([])
      await app.close()
    })

    it('returns 200 with seeded classes (instructor populated)', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      // Create a professor instructor
      const { user: profUser } = await seedProfessor(academy.id)
      // Update professor's fullName, nickname, avatarUrl
      await prisma.user.update({
        where: { id: profUser.id },
        data: { fullName: 'Professor Joao', nickname: 'Joao', avatarUrl: 'http://avatar.com/joao' },
      })

      // Create a class
      const cls = await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Fundamentos',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          location: 'Mat 1',
          level: 'iniciante',
          instructorId: profUser.id,
          isActive: true,
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/academy/classes',
        headers: authHeaders(owner.id),
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()
      expect(body.data.classes).toHaveLength(1)

      const c = body.data.classes[0]
      expect(c.id).toBe(cls.id)
      expect(c.title).toBe('Fundamentos')
      expect(c.dayOfWeek).toBe(1)
      expect(c.startTime).toBe('10:00')
      expect(c.durationMinutes).toBe(60)
      expect(c.location).toBe('Mat 1')
      expect(c.level).toBe('iniciante')
      expect(c.isActive).toBe(true)
      expect(c.instructor).toBeDefined()
      expect(c.instructor.fullName).toBe('Professor Joao')
      expect(c.instructor.nickname).toBe('Joao')
      expect(c.instructor.avatarUrl).toBe('http://avatar.com/joao')
      expect(c.createdAt).toBeDefined()
      expect(c.updatedAt).toBeDefined()

      await app.close()
    })

    it('returns 200 for a professor caller (member not owner)', async () => {
      const { user: profUser } = await seedProfessor(academy.id)
      const profCtx = createAppCtx({
        id: profUser.id,
        email: profUser.email,
        fullName: profUser.fullName,
      })
      const app = buildApp({ ...profCtx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      // Create a class
      await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Avancado',
          dayOfWeek: 3,
          startTime: '18:00',
          durationMinutes: 90,
          instructorId: owner.id,
          isActive: true,
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/academy/classes',
        headers: authHeaders(profUser.id),
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()
      expect(body.data.classes).toHaveLength(1)
      expect(body.data.classes[0].title).toBe('Avancado')

      await app.close()
    })

    it('returns 200 for a student caller (member not owner)', async () => {
      const { user: studentUser } = await seedStudent(academy.id)
      const studentCtx = createAppCtx({
        id: studentUser.id,
        email: studentUser.email,
        fullName: studentUser.fullName,
      })
      const app = buildApp({ ...studentCtx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Kids Class',
          dayOfWeek: 2,
          startTime: '09:00',
          durationMinutes: 45,
          instructorId: owner.id,
          isActive: true,
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/academy/classes',
        headers: authHeaders(studentUser.id),
      })

      expect(response.statusCode).toBe(200)
      expect(response.json().error).toBeNull()
      expect(response.json().data.classes).toHaveLength(1)

      await app.close()
    })

    it('returns 403 for a user with no academy membership', async () => {
      // Create a user with no academy membership
      const { createTestUser } = await import('./setup')
      const noMemberUser = await createTestUser()
      const noMemberCtx = createAppCtx({
        id: noMemberUser.id,
        email: noMemberUser.email,
        fullName: noMemberUser.fullName,
      })
      const app = buildApp({ ...noMemberCtx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'GET',
        url: '/academy/classes',
        headers: authHeaders(noMemberUser.id),
      })

      expect(response.statusCode).toBe(403)
      expect(response.json().error.code).toBe('FORBIDDEN')

      await app.close()
    })

    it('returns active classes by default, includes inactive with includeInactive=true', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      // Create one active and one inactive class
      await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Active Class',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: owner.id,
          isActive: true,
        },
      })

      await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Inactive Class',
          dayOfWeek: 2,
          startTime: '11:00',
          durationMinutes: 60,
          instructorId: owner.id,
          isActive: false,
        },
      })

      // Default (no query param) — only active
      const responseDefault = await app.inject({
        method: 'GET',
        url: '/academy/classes',
        headers: authHeaders(owner.id),
      })

      expect(responseDefault.statusCode).toBe(200)
      expect(responseDefault.json().data.classes).toHaveLength(1)
      expect(responseDefault.json().data.classes[0].title).toBe('Active Class')

      // With includeInactive=true
      const responseWithInactive = await app.inject({
        method: 'GET',
        url: '/academy/classes?includeInactive=true',
        headers: authHeaders(owner.id),
      })

      expect(responseWithInactive.statusCode).toBe(200)
      expect(responseWithInactive.json().data.classes).toHaveLength(2)

      await app.close()
    })
  })

  // ─── POST /academy/classes ───────────────────────────────────────────────

  describe('POST /academy/classes', () => {
    it('creates a class with valid input and writes class_created ActivityEvent', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const { user: profUser } = await seedProfessor(academy.id)
      await prisma.user.update({
        where: { id: profUser.id },
        data: { fullName: 'Prof A', nickname: 'A' },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/classes',
        headers: authHeaders(owner.id),
        payload: {
          title: 'Fundamentos',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          location: 'Mat 1',
          level: 'iniciante',
          instructorId: profUser.id,
        },
      })

      expect(response.statusCode).toBe(201)
      const body = response.json()
      expect(body.error).toBeNull()

      const { class: createdClass, activityEventId } = body.data
      expect(createdClass.id).toBeDefined()
      expect(createdClass.title).toBe('Fundamentos')
      expect(createdClass.dayOfWeek).toBe(1)
      expect(createdClass.startTime).toBe('10:00')
      expect(createdClass.durationMinutes).toBe(60)
      expect(createdClass.location).toBe('Mat 1')
      expect(createdClass.level).toBe('iniciante')
      expect(createdClass.isActive).toBe(true)
      expect(createdClass.instructor.fullName).toBe('Prof A')
      expect(createdClass.createdAt).toBeDefined()
      expect(createdClass.updatedAt).toBeDefined()
      expect(activityEventId).toBeDefined()

      // Verify ActivityEvent
      const event = await prisma.activityEvent.findUnique({
        where: { id: activityEventId },
      })
      expect(event).not.toBeNull()
      expect(event!.action).toBe('class_created')
      expect(event!.actorId).toBe(owner.id)
      expect(event!.subjectClassId).toBe(createdClass.id)
      expect(event!.academyId).toBe(academy.id)

      await app.close()
    })

    it('returns 400 invalid_input for missing title', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const { user: profUser } = await seedProfessor(academy.id)

      const response = await app.inject({
        method: 'POST',
        url: '/academy/classes',
        headers: authHeaders(owner.id),
        payload: {
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: profUser.id,
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('invalid_input')

      await app.close()
    })

    it('returns 400 invalid_input for malformed startTime', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const { user: profUser } = await seedProfessor(academy.id)

      const response = await app.inject({
        method: 'POST',
        url: '/academy/classes',
        headers: authHeaders(owner.id),
        payload: {
          title: 'Test',
          dayOfWeek: 1,
          startTime: '25:00',
          durationMinutes: 60,
          instructorId: profUser.id,
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('invalid_input')

      await app.close()
    })

    it('returns 400 invalid_instructor when instructorId is a student', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const { user: studentUser } = await seedStudent(academy.id)

      const response = await app.inject({
        method: 'POST',
        url: '/academy/classes',
        headers: authHeaders(owner.id),
        payload: {
          title: 'Test',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: studentUser.id,
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('invalid_instructor')

      await app.close()
    })

    it('returns 400 invalid_instructor when instructorId is from a different academy', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      // Create a second academy with its own owner
      const { user: otherOwner, academy: otherAcademy } = await seedOwnerWithAcademy()
      const { user: profInOtherAcademy } = await seedProfessor(otherAcademy.id)

      const response = await app.inject({
        method: 'POST',
        url: '/academy/classes',
        headers: authHeaders(owner.id),
        payload: {
          title: 'Test',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: profInOtherAcademy.id,
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('invalid_instructor')

      await app.close()
    })

    it('returns 403 for a professor caller (not owner)', async () => {
      const { user: profUser } = await seedProfessor(academy.id)
      const profCtx = createAppCtx({
        id: profUser.id,
        email: profUser.email,
        fullName: profUser.fullName,
      })
      const app = buildApp({ ...profCtx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/classes',
        headers: authHeaders(profUser.id),
        payload: {
          title: 'Test',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: profUser.id,
        },
      })

      expect(response.statusCode).toBe(403)

      await app.close()
    })
  })

  // ─── PATCH /academy/classes/:classId ─────────────────────────────────────

  describe('PATCH /academy/classes/:classId', () => {
    it('updates fields and writes class_updated ActivityEvent', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const { user: profUser } = await seedProfessor(academy.id)
      const { user: newProfUser } = await seedProfessor(academy.id)

      const cls = await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Original',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: profUser.id,
          isActive: true,
        },
      })

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/classes/${cls.id}`,
        headers: authHeaders(owner.id),
        payload: {
          title: 'Updated Title',
          dayOfWeek: 3,
          startTime: '14:00',
          durationMinutes: 90,
          instructorId: newProfUser.id,
        },
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()

      const { class: updatedClass, activityEventId } = body.data
      expect(updatedClass.title).toBe('Updated Title')
      expect(updatedClass.dayOfWeek).toBe(3)
      expect(updatedClass.startTime).toBe('14:00')
      expect(updatedClass.durationMinutes).toBe(90)
      expect(updatedClass.instructor.id).toBe(newProfUser.id)
      expect(activityEventId).toBeDefined()

      // Verify ActivityEvent
      const event = await prisma.activityEvent.findUnique({
        where: { id: activityEventId },
      })
      expect(event).not.toBeNull()
      expect(event!.action).toBe('class_updated')
      expect(event!.actorId).toBe(owner.id)
      expect(event!.subjectClassId).toBe(cls.id)

      await app.close()
    })

    it('returns 400 invalid_instructor when assigning a student as instructor', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const { user: profUser } = await seedProfessor(academy.id)
      const { user: studentUser } = await seedStudent(academy.id)

      const cls = await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Test',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: profUser.id,
          isActive: true,
        },
      })

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/classes/${cls.id}`,
        headers: authHeaders(owner.id),
        payload: { instructorId: studentUser.id },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('invalid_instructor')

      await app.close()
    })

    it('returns 404 for non-existent class', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const fakeId = '00000000-0000-0000-0000-000000000000'
      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/classes/${fakeId}`,
        headers: authHeaders(owner.id),
        payload: { title: 'Nope' },
      })

      expect(response.statusCode).toBe(404)

      await app.close()
    })

    it('returns 403 for non-owner caller', async () => {
      const { user: profUser } = await seedProfessor(academy.id)
      const profCtx = createAppCtx({
        id: profUser.id,
        email: profUser.email,
        fullName: profUser.fullName,
      })
      const app = buildApp({ ...profCtx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const cls = await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Test',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: owner.id,
          isActive: true,
        },
      })

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/classes/${cls.id}`,
        headers: authHeaders(profUser.id),
        payload: { title: 'Hacked' },
      })

      expect(response.statusCode).toBe(403)

      await app.close()
    })
  })

  // ─── DELETE /academy/classes/:classId ────────────────────────────────────

  describe('DELETE /academy/classes/:classId', () => {
    it('soft-deletes (isActive=false) and writes class_deactivated ActivityEvent', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const cls = await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'To Delete',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: owner.id,
          isActive: true,
        },
      })

      const response = await app.inject({
        method: 'DELETE',
        url: `/academy/classes/${cls.id}`,
        headers: authHeaders(owner.id),
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()

      const { class: deactivatedClass, activityEventId } = body.data
      expect(deactivatedClass.isActive).toBe(false)
      expect(activityEventId).toBeDefined()

      // Verify ActivityEvent
      const event = await prisma.activityEvent.findUnique({
        where: { id: activityEventId },
      })
      expect(event).not.toBeNull()
      expect(event!.action).toBe('class_deactivated')
      expect(event!.actorId).toBe(owner.id)
      expect(event!.subjectClassId).toBe(cls.id)

      // Verify DB state
      const dbClass = await prisma.classSchedule.findUnique({ where: { id: cls.id } })
      expect(dbClass!.isActive).toBe(false)

      await app.close()
    })

    it('returns 200 idempotent when already inactive (no new ActivityEvent)', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const cls = await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Already Inactive',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: owner.id,
          isActive: false,
        },
      })

      const response = await app.inject({
        method: 'DELETE',
        url: `/academy/classes/${cls.id}`,
        headers: authHeaders(owner.id),
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()
      // No new ActivityEvent was written — activityEventId is null
      expect(body.data.activityEventId).toBeNull()

      // Verify no new class_deactivated event
      const events = await prisma.activityEvent.findMany({
        where: { subjectClassId: cls.id },
      })
      expect(events).toHaveLength(0)

      await app.close()
    })

    it('returns 404 for non-existent class', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const fakeId = '00000000-0000-0000-0000-000000000000'
      const response = await app.inject({
        method: 'DELETE',
        url: `/academy/classes/${fakeId}`,
        headers: authHeaders(owner.id),
      })

      expect(response.statusCode).toBe(404)

      await app.close()
    })

    it('returns 403 for non-owner caller', async () => {
      const { user: profUser } = await seedProfessor(academy.id)
      const profCtx = createAppCtx({
        id: profUser.id,
        email: profUser.email,
        fullName: profUser.fullName,
      })
      const app = buildApp({ ...profCtx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const cls = await prisma.classSchedule.create({
        data: {
          academyId: academy.id,
          title: 'Test',
          dayOfWeek: 1,
          startTime: '10:00',
          durationMinutes: 60,
          instructorId: owner.id,
          isActive: true,
        },
      })

      const response = await app.inject({
        method: 'DELETE',
        url: `/academy/classes/${cls.id}`,
        headers: authHeaders(profUser.id),
      })

      expect(response.statusCode).toBe(403)

      await app.close()
    })
  })
})
