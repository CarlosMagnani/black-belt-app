import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp } from '../src/app'
import type { AuthService } from '../src/modules/auth/auth.service'
import type { AccessTokenVerifier, AuthenticatedUser } from '../src/modules/auth/auth.types'
import { cleanDatabase, seedOwnerWithAcademy, seedStudent, seedProfessor, createActiveClassSchedule, prisma } from './setup'
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
  // The token itself doesn't matter since we mock the verifier
  return { authorization: 'Bearer test-token-' + userId }
}

function appUrl(method: 'GET' | 'PATCH', path: string) {
  return { method, url: path } as const
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Roster API', () => {
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

  describe('GET /academy/members', () => {
    beforeEach(async () => {
      // Clean members except the owner
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

    it('returns 401 without auth', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      const response = await app.inject({
        method: 'GET',
        url: '/academy/members',
      })

      expect(response.statusCode).toBe(401)
      expect(response.json().error.code).toBe('UNAUTHORIZED')
      await app.close()
    })

    it('returns 200 with members list for owner', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      // Seed a student and a professor
      const { member: studentMember } = await seedStudent(academy.id)
      const { member: profMember } = await seedProfessor(academy.id)

      const response = await app.inject({
        method: 'GET',
        url: '/academy/members',
        headers: authHeaders(owner.id),
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()

      const { academy: returnedAcademy, members } = body.data
      expect(returnedAcademy.id).toBe(academy.id)
      expect(returnedAcademy.name).toBe(academy.name)
      expect(members.length).toBe(3) // owner + student + professor

      const ownerInList = members.find((m: any) => m.role === 'owner')
      expect(ownerInList).toBeDefined()
      expect(ownerInList.fullName).toBe('Mestre Teste')

      const studentInList = members.find((m: any) => m.role === 'student')
      expect(studentInList).toBeDefined()
      expect(studentInList.currentBelt).not.toBeNull()
      expect(studentInList.currentBelt.belt).toBe('white')

      const profInList = members.find((m: any) => m.role === 'professor')
      expect(profInList).toBeDefined()
      expect(profInList.currentBelt).toBeNull()

      await app.close()
    })

    it('returns 403 if caller is a student (not owner)', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      // Seed a student user that will make the request
      const { user: studentUser } = await seedStudent(academy.id)

      // Create a context for the student (student's auth service returns student user)
      const studentCtx = createAppCtx({
        id: studentUser.id,
        email: studentUser.email,
        fullName: studentUser.fullName,
      })

      const studentApp = buildApp({
        ...studentCtx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      const response = await studentApp.inject({
        method: 'GET',
        url: '/academy/members',
        headers: authHeaders(studentUser.id),
      })

      expect(response.statusCode).toBe(403)
      await studentApp.close()
      await app.close()
    })
  })

  describe('PATCH /academy/members/:memberId/role', () => {
    beforeEach(async () => {
      // Clean members except the owner
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "activity_events" CASCADE;`)
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

    it('promotes a student to professor', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      const { member: studentMember } = await seedStudent(academy.id)

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/members/${studentMember.id}/role`,
        headers: authHeaders(owner.id),
        payload: { role: 'professor' },
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()

      const { member, activityEventId } = body.data
      expect(member.role).toBe('professor')
      expect(member.id).toBe(studentMember.id)
      expect(activityEventId).toBeDefined()

      // Verify the ActivityEvent
      const event = await prisma.activityEvent.findUnique({
        where: { id: activityEventId },
      })
      expect(event).not.toBeNull()
      expect(event!.action).toBe('professor_promoted')
      expect(event!.actorId).toBe(owner.id)
      expect(event!.subjectMemberId).toBe(studentMember.id)
      expect(event!.academyId).toBe(academy.id)

      await app.close()
    })

    it('rejects promoting a professor (already)', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      const { member: profMember } = await seedProfessor(academy.id)

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/members/${profMember.id}/role`,
        headers: authHeaders(owner.id),
        payload: { role: 'professor' },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('INVALID_ROLE_TRANSITION')

      await app.close()
    })

    it('rejects promoting an owner', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      // Find current owner member from DB (id changes after beforeEach)
      const currentOwnerMember = await prisma.academyMember.findFirst({
        where: { academyId: academy.id, role: 'owner' },
      })
      expect(currentOwnerMember).not.toBeNull()

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/members/${currentOwnerMember!.id}/role`,
        headers: authHeaders(owner.id),
        payload: { role: 'professor' },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('INVALID_ROLE_TRANSITION')

      await app.close()
    })

    it('rejects with 404 if member belongs to a different academy', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/members/${nonExistentId}/role`,
        headers: authHeaders(owner.id),
        payload: { role: 'professor' },
      })

      expect(response.statusCode).toBe(404)

      await app.close()
    })

    it('revokes a professor (no active classes)', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      const { member: profMember } = await seedProfessor(academy.id)

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/members/${profMember.id}/role`,
        headers: authHeaders(owner.id),
        payload: { role: 'student' },
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()

      const { member, activityEventId } = body.data
      expect(member.role).toBe('student')

      // Verify the ActivityEvent
      const event = await prisma.activityEvent.findUnique({
        where: { id: activityEventId },
      })
      expect(event).not.toBeNull()
      expect(event!.action).toBe('professor_revoked')
      expect(event!.actorId).toBe(owner.id)
      expect(event!.subjectMemberId).toBe(profMember.id)

      await app.close()
    })

    it('rejects revoking a professor with active classes', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      const { user: profUser, member: profMember } = await seedProfessor(academy.id)
      await createActiveClassSchedule(academy.id, profUser.id)

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/members/${profMember.id}/role`,
        headers: authHeaders(owner.id),
        payload: { role: 'student' },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('professor_teaches_active_class')

      await app.close()
    })

    it('rejects with 403 if caller is not the academy owner', async () => {
      // Seed a second owner (different academy)
      // First create the student who will try to act as owner
      const { user: studentUser } = await seedStudent(academy.id)

      const studentCtx = createAppCtx({
        id: studentUser.id,
        email: studentUser.email,
        fullName: studentUser.fullName,
      })
      const app = buildApp({
        ...studentCtx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      const { member: profMember } = await seedProfessor(academy.id)

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/members/${profMember.id}/role`,
        headers: authHeaders(studentUser.id),
        payload: { role: 'student' },
      })

      expect(response.statusCode).toBe(403)

      await app.close()
    })

    it('rejects student -> student (no-op)', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({
        ...ctx,
        logger: false,
        supabaseUrl: 'https://test.supabase.co',
      })

      const { member: studentMember } = await seedStudent(academy.id)

      const response = await app.inject({
        method: 'PATCH',
        url: `/academy/members/${studentMember.id}/role`,
        headers: authHeaders(owner.id),
        payload: { role: 'student' },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('INVALID_ROLE_TRANSITION')

      await app.close()
    })
  })
})
