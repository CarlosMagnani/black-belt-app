import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { buildApp } from '../src/app'
import type { AuthService } from '../src/modules/auth/auth.service'
import type { AccessTokenVerifier, AuthenticatedUser } from '../src/modules/auth/auth.types'
import { dayOfWeekInSaoPaulo, todayInSaoPaulo } from '../src/lib/brazil-time'
import {
  cleanDatabase,
  seedOwnerWithAcademy,
  seedStudent,
  seedProfessor,
  createActiveClassSchedule,
  createTestCheckIn,
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
          onboardingRole: 'student',
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
          onboardingRole: 'student',
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

// ─── Test Data ──────────────────────────────────────────────────────────────

const todayDow = dayOfWeekInSaoPaulo(new Date())

// ─── Domain Unit Tests ──────────────────────────────────────────────────────

describe('CheckIn domain rules', () => {
  it('isEligibleToday returns eligible for an active class on its scheduled day after start time', async () => {
    const { isEligibleToday } = await import('../src/modules/checkin/checkin.domain')
    const result = isEligibleToday(true, todayDow, todayDow, '00:01', '10:00')
    expect(result).toEqual({ eligible: true })
  })

  it('isEligibleToday returns class_not_today for a class on the wrong day', async () => {
    const { isEligibleToday } = await import('../src/modules/checkin/checkin.domain')
    const wrongDow = (todayDow + 1) % 7
    const result = isEligibleToday(true, wrongDow, todayDow, '00:01', '10:00')
    expect(result).toEqual({ eligible: false, reason: 'class_not_today' })
  })

  it('isEligibleToday returns not_yet_time for a class whose startTime is in the future', async () => {
    const { isEligibleToday } = await import('../src/modules/checkin/checkin.domain')
    const result = isEligibleToday(true, todayDow, todayDow, '23:59', '10:00')
    expect(result).toEqual({ eligible: false, reason: 'not_yet_time' })
  })

  it('isEligibleToday returns class_not_active for an inactive class', async () => {
    const { isEligibleToday } = await import('../src/modules/checkin/checkin.domain')
    const result = isEligibleToday(false, todayDow, todayDow, '00:01', '10:00')
    expect(result).toEqual({ eligible: false, reason: 'class_not_active' })
  })
})

// ─── API Integration Tests ──────────────────────────────────────────────────

describe('CheckIn API', () => {
  let owner: TestUser
  let academy: TestAcademy
  let ownerMember: TestAcademyMember
  let classTodayEarly: { id: string }
  let classTodayLate: { id: string }
  let classWrongDay: { id: string }

  beforeAll(async () => {
    await cleanDatabase()
    const seeded = await seedOwnerWithAcademy({ fullName: 'Mestre CheckIn' })
    owner = seeded.user
    academy = seeded.academy
    ownerMember = seeded.member

    // The owner can also be the instructor for test classes
    // Class today with early startTime (already started)
    classTodayEarly = await createActiveClassSchedule(
      academy.id,
      owner.id,
      {
        title: 'Aula Manha',
        dayOfWeek: todayDow,
        startTime: '00:01',
        durationMinutes: 60,
        isActive: true,
      }
    )

    // Class today with late startTime (in the future)
    classTodayLate = await createActiveClassSchedule(
      academy.id,
      owner.id,
      {
        title: 'Aula Noite',
        dayOfWeek: todayDow,
        startTime: '23:59',
        durationMinutes: 60,
        isActive: true,
      }
    )

    // Class on a different day
    const wrongDow = (todayDow + 1) % 7
    classWrongDay = await createActiveClassSchedule(
      academy.id,
      owner.id,
      {
        title: 'Aula Outro Dia',
        dayOfWeek: wrongDow,
        startTime: '10:00',
        durationMinutes: 60,
        isActive: true,
      }
    )
  })

  afterAll(async () => {
    await cleanDatabase()
  })

  beforeEach(async () => {
    // Clean check_ins and class_schedules while keeping users and academy
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "check_ins" CASCADE;`)
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

    // Re-create the 3 class variations
    classTodayEarly = await createActiveClassSchedule(
      academy.id,
      owner.id,
      { title: 'Aula Manha', dayOfWeek: todayDow, startTime: '00:01', durationMinutes: 60, isActive: true }
    )
    classTodayLate = await createActiveClassSchedule(
      academy.id,
      owner.id,
      { title: 'Aula Noite', dayOfWeek: todayDow, startTime: '23:59', durationMinutes: 60, isActive: true }
    )
    const wrongDow = (todayDow + 1) % 7
    classWrongDay = await createActiveClassSchedule(
      academy.id,
      owner.id,
      { title: 'Aula Outro Dia', dayOfWeek: wrongDow, startTime: '10:00', durationMinutes: 60, isActive: true }
    )
  })

  // ─── POST /academy/checkins ────────────────────────────────────────────

  describe('POST /academy/checkins', () => {
    it('returns 401 without auth', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        payload: { classScheduleId: classTodayEarly.id },
      })

      expect(response.statusCode).toBe(401)
      expect(response.json().error.code).toBe('UNAUTHORIZED')
      await app.close()
    })

    it('creates a pending check-in for an active class on its scheduled day after start time', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(owner.id),
        payload: { classScheduleId: classTodayEarly.id },
      })

      expect(response.statusCode).toBe(201)
      const body = response.json()
      expect(body.error).toBeNull()
      expect(body.data.isNew).toBe(true)
      expect(body.data.checkIn.status).toBe('pending')
      expect(body.data.checkIn.classScheduleId).toBe(classTodayEarly.id)
      expect(body.data.checkIn.classDate).toBe(todayInSaoPaulo())
      expect(body.data.checkIn.reviewedBy).toBeNull()
      expect(body.data.checkIn.reviewedAt).toBeNull()
      expect(body.data.checkIn.classSchedule).toBeDefined()
      expect(body.data.checkIn.classSchedule.title).toBe('Aula Manha')
      expect(body.data.checkIn.classSchedule.instructor).toBeDefined()
      expect(body.data.checkIn.classSchedule.instructor.id).toBe(owner.id)

      await app.close()
    })

    it('returns 400 class_not_active when the class is isActive=false', async () => {
      const inactiveClass = await createActiveClassSchedule(
        academy.id,
        owner.id,
        { title: 'Inactive', dayOfWeek: todayDow, startTime: '00:01', isActive: false }
      )

      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(owner.id),
        payload: { classScheduleId: inactiveClass.id },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('class_not_active')
      await app.close()
    })

    it('returns 400 class_not_today when the class dayOfWeek does not match today', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(owner.id),
        payload: { classScheduleId: classWrongDay.id },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('class_not_today')
      await app.close()
    })

    it('returns 400 not_yet_time when the class startTime is in the future today', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(owner.id),
        payload: { classScheduleId: classTodayLate.id },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('not_yet_time')
      await app.close()
    })

    it('returns 400 already_rejected when a previously rejected check-in exists', async () => {
      // Create a student
      const { user: student, member: studentMember } = await seedStudent(academy.id)
      const ctx = createAppCtx({ id: student.id, email: student.email, fullName: student.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      // Seed a rejected check-in
      await createTestCheckIn(
        academy.id,
        studentMember.id,
        classTodayEarly.id,
        'rejected',
        { classDate: new Date(todayInSaoPaulo() + 'T00:00:00.000Z') }
      )

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(student.id),
        payload: { classScheduleId: classTodayEarly.id },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error.code).toBe('already_rejected')
      await app.close()
    })

    it('returns 409 already_requested when a pending check-in exists', async () => {
      const { user: student, member: studentMember } = await seedStudent(academy.id)
      const ctx = createAppCtx({ id: student.id, email: student.email, fullName: student.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      await createTestCheckIn(
        academy.id,
        studentMember.id,
        classTodayEarly.id,
        'pending',
        { classDate: new Date(todayInSaoPaulo() + 'T00:00:00.000Z') }
      )

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(student.id),
        payload: { classScheduleId: classTodayEarly.id },
      })

      expect(response.statusCode).toBe(409)
      expect(response.json().error.code).toBe('already_requested')
      await app.close()
    })

    it('returns 409 already_requested when an approved check-in exists', async () => {
      const { user: student, member: studentMember } = await seedStudent(academy.id)
      const ctx = createAppCtx({ id: student.id, email: student.email, fullName: student.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      await createTestCheckIn(
        academy.id,
        studentMember.id,
        classTodayEarly.id,
        'approved',
        { classDate: new Date(todayInSaoPaulo() + 'T00:00:00.000Z') }
      )

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(student.id),
        payload: { classScheduleId: classTodayEarly.id },
      })

      expect(response.statusCode).toBe(409)
      expect(response.json().error.code).toBe('already_requested')
      await app.close()
    })

    it('returns 404 class_not_found for a non-existent class', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(owner.id),
        payload: { classScheduleId: fakeId },
      })

      expect(response.statusCode).toBe(404)
      expect(response.json().error.code).toBe('class_not_found')
      await app.close()
    })

    it('returns 403 forbidden for a user not in the class\'s academy', async () => {
      // Create a separate academy with its own owner
      const { user: otherOwner, academy: otherAcademy } = await seedOwnerWithAcademy()
      const ctx = createAppCtx({ id: otherOwner.id, email: otherOwner.email, fullName: otherOwner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      // The class is in the original academy, the caller is in the other academy
      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(otherOwner.id),
        payload: { classScheduleId: classTodayEarly.id },
      })

      expect(response.statusCode).toBe(403)
      expect(response.json().error.code).toBe('forbidden')
      await app.close()
    })

    it('works for a student caller', async () => {
      const { user: student, member: studentMember } = await seedStudent(academy.id)
      const ctx = createAppCtx({ id: student.id, email: student.email, fullName: student.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(student.id),
        payload: { classScheduleId: classTodayEarly.id },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json().error).toBeNull()
      expect(response.json().data.checkIn.status).toBe('pending')
      await app.close()
    })

    it('works for a professor caller (the instructor themselves)', async () => {
      const { user: professor } = await seedProfessor(academy.id)
      const ctx = createAppCtx({ id: professor.id, email: professor.email, fullName: professor.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const professorClass = await createActiveClassSchedule(
        academy.id,
        professor.id,
        { title: 'Prof Class', dayOfWeek: todayDow, startTime: '00:01', isActive: true }
      )

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(professor.id),
        payload: { classScheduleId: professorClass.id },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json().error).toBeNull()
      expect(response.json().data.checkIn.status).toBe('pending')
      await app.close()
    })

    it('works for an owner caller', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'POST',
        url: '/academy/checkins',
        headers: authHeaders(owner.id),
        payload: { classScheduleId: classTodayEarly.id },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json().error).toBeNull()
      expect(response.json().data.checkIn.status).toBe('pending')
      await app.close()
    })
  })

  // ─── GET /academy/checkins/today ───────────────────────────────────────

  describe('GET /academy/checkins/today', () => {
    it('returns 401 without auth', async () => {
      const ctx = createAppCtx({ id: owner.id, email: owner.email, fullName: owner.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({ method: 'GET', url: '/academy/checkins/today' })

      expect(response.statusCode).toBe(401)
      expect(response.json().error.code).toBe('UNAUTHORIZED')
      await app.close()
    })

    it('returns 200 with the current user\'s check-ins for today, with classSchedule and instructor', async () => {
      const { user: student, member: studentMember } = await seedStudent(academy.id)
      const ctx = createAppCtx({ id: student.id, email: student.email, fullName: student.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      // Create a check-in for today
      const todayDate = new Date(todayInSaoPaulo() + 'T00:00:00.000Z')
      await createTestCheckIn(
        academy.id,
        studentMember.id,
        classTodayEarly.id,
        'pending',
        { classDate: todayDate }
      )

      const response = await app.inject({
        method: 'GET',
        url: '/academy/checkins/today',
        headers: authHeaders(student.id),
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()
      expect(body.data.checkIns).toHaveLength(1)

      const ci = body.data.checkIns[0]
      expect(ci.classScheduleId).toBe(classTodayEarly.id)
      expect(ci.status).toBe('pending')
      expect(ci.classDate).toBe(todayInSaoPaulo())
      expect(ci.classSchedule).toBeDefined()
      expect(ci.classSchedule.title).toBe('Aula Manha')
      expect(ci.classSchedule.instructor.id).toBe(owner.id)
      expect(ci.classSchedule.dayOfWeek).toBe(todayDow)
      expect(ci.classSchedule.startTime).toBe('00:01')
      expect(ci.classSchedule.durationMinutes).toBe(60)

      await app.close()
    })

    it('returns 200 with empty list when no check-ins', async () => {
      const { user: student } = await seedStudent(academy.id)
      const ctx = createAppCtx({ id: student.id, email: student.email, fullName: student.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const response = await app.inject({
        method: 'GET',
        url: '/academy/checkins/today',
        headers: authHeaders(student.id),
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()
      expect(body.data.checkIns).toEqual([])
      await app.close()
    })

    it('returns 200 with only today\'s check-ins, not other dates', async () => {
      const { user: student, member: studentMember } = await seedStudent(academy.id)
      const ctx = createAppCtx({ id: student.id, email: student.email, fullName: student.fullName })
      const app = buildApp({ ...ctx, logger: false, supabaseUrl: 'https://test.supabase.co' })

      const todayDate = new Date(todayInSaoPaulo() + 'T00:00:00.000Z')
      // Yesterday
      const yesterdayDate = new Date(todayDate)
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)

      // Create check-in for today
      await createTestCheckIn(
        academy.id,
        studentMember.id,
        classTodayEarly.id,
        'pending',
        { classDate: todayDate }
      )

      // Create check-in for yesterday
      await createTestCheckIn(
        academy.id,
        studentMember.id,
        classWrongDay.id,
        'approved',
        { classDate: yesterdayDate }
      )

      const response = await app.inject({
        method: 'GET',
        url: '/academy/checkins/today',
        headers: authHeaders(student.id),
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.error).toBeNull()
      expect(body.data.checkIns).toHaveLength(1)
      expect(body.data.checkIns[0].classScheduleId).toBe(classTodayEarly.id)
      expect(body.data.checkIns[0].status).toBe('pending')

      await app.close()
    })
  })
})
