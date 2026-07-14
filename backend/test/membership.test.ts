import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Academy, AcademyMember, User } from '@prisma/client'
import { buildApp } from '../src/app'
import type {
  CreateStudentOnboardingInput,
  MembershipRepository,
} from '../src/modules/membership/membership.repository'
import {
  AlreadyMemberError,
  DefaultMembershipService,
  InvalidInviteCodeError,
  type MembershipService,
} from '../src/modules/membership/membership.service'
import type { ObjectStorage, StoreObjectInput } from '../src/modules/storage/object-storage'

const studentId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const academyId = 'd09f8321-6282-4928-bd15-7e04149ddf77'

const student: User = {
  id: studentId,
  email: 'aluno@example.com',
  passwordHash: null,
  fullName: 'Helio Gracie',
  nickname: 'Helio',
  avatarUrl: `users/${studentId}/avatar`,
  onboardingRole: 'student',
  belt: 'blue',
  degree: 1,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

const academy: Academy = {
  id: academyId,
  name: 'Black Belt SP',
  city: 'São Paulo, Brasil',
  logoUrl: null,
  inviteCode: 'BB-ABC123',
  ownerId: 'owner-id',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

const member: AcademyMember = {
  id: 'member-id',
  academyId,
  userId: studentId,
  role: 'student',
  status: 'active',
  joinedAt: new Date('2026-01-01T00:00:00Z'),
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

test('student onboarding stores media and persists the complete flow through the repository', async () => {
  const storedObjects: StoreObjectInput[] = []
  let persistedInput: CreateStudentOnboardingInput | undefined
  const repository: MembershipRepository = {
    async findAcademyByInviteCode() {
      return academy
    },
    async findMemberByUserId() {
      return null
    },
    async createStudentOnboarding(input) {
      persistedInput = input
      return { academy, student }
    },
  }
  const storage: ObjectStorage = {
    async store(input) {
      storedObjects.push(input)
      return { key: input.key }
    },
    async delete() {},
  }
  const service = new DefaultMembershipService(repository, storage)

  const result = await service.joinAcademy({
    userId: studentId,
    inviteCode: 'BB-ABC123',
    nickname: 'Helio',
    belt: 'blue',
    degree: 1,
    photo: { content: new Uint8Array([1]), contentType: 'image/png' },
  })

  assert.deepEqual(storedObjects.map(({ key }) => key), [`users/${studentId}/avatar`])
  assert.equal(persistedInput?.academyId, academyId)
  assert.equal(persistedInput?.avatarUrl, `users/${studentId}/avatar`)
  assert.equal(persistedInput?.belt, 'blue')
  assert.equal(persistedInput?.degree, 1)
  assert.equal(persistedInput?.nickname, 'Helio')
  assert.equal(result.academy.name, academy.name)
  assert.equal(result.student.nickname, student.nickname)

  await Promise.resolve()
})

test('student onboarding removes uploaded media when persistence fails', async () => {
  const deletedKeys: string[] = []
  const repository: MembershipRepository = {
    async findAcademyByInviteCode() {
      return academy
    },
    async findMemberByUserId() {
      return null
    },
    async createStudentOnboarding() {
      throw new Error('database unavailable')
    },
  }
  const storage: ObjectStorage = {
    async store(input) {
      return { key: input.key }
    },
    async delete(key) {
      deletedKeys.push(key)
    },
  }
  const service = new DefaultMembershipService(repository, storage)

  await assert.rejects(service.joinAcademy({
    userId: studentId,
    inviteCode: 'BB-ABC123',
    nickname: 'Helio',
    belt: 'blue',
    degree: 1,
    photo: { content: new Uint8Array([1]), contentType: 'image/png' },
  }))

  assert.deepEqual(deletedKeys, [`users/${studentId}/avatar`])
})

test('student onboarding rejects invalid invite code before calling storage or repository', async () => {
  const repository: MembershipRepository = {
    async findAcademyByInviteCode() {
      return null
    },
    async findMemberByUserId() {
      return null
    },
    async createStudentOnboarding() {
      throw new Error('should not be called')
    },
  }
  const storage: ObjectStorage = {
    async store() {
      throw new Error('should not be called')
    },
    async delete() {},
  }
  const service = new DefaultMembershipService(repository, storage)

  await assert.rejects(
    service.joinAcademy({
      userId: studentId,
      inviteCode: 'BB-INVALID',
      nickname: 'Helio',
      belt: 'blue',
      degree: 1,
    }),
    (error: Error) => error instanceof InvalidInviteCodeError
  )
})

test('student onboarding rejects user already in an academy', async () => {
  const repository: MembershipRepository = {
    async findAcademyByInviteCode() {
      return academy
    },
    async findMemberByUserId() {
      return member
    },
    async createStudentOnboarding() {
      throw new Error('should not be called')
    },
  }
  const storage: ObjectStorage = {
    async store() {
      throw new Error('should not be called')
    },
    async delete() {},
  }
  const service = new DefaultMembershipService(repository, storage)

  await assert.rejects(
    service.joinAcademy({
      userId: studentId,
      inviteCode: 'BB-ABC123',
      nickname: 'Helio',
      belt: 'blue',
      degree: 1,
    }),
    (error: Error) => error instanceof AlreadyMemberError
  )
})

test('POST /onboarding/student trims fields and returns the academy and student result', async () => {
  let receivedInput: Parameters<MembershipService['joinAcademy']>[0] | undefined
  const membershipService: MembershipService = {
    async joinAcademy(input) {
      receivedInput = input
      return {
        academy: { id: academy.id, name: academy.name, city: academy.city },
        student: {
          id: student.id,
          fullName: student.fullName,
          nickname: student.nickname,
          avatarUrl: student.avatarUrl,
          belt: student.belt,
          degree: student.degree,
        },
      }
    },
  }
  const app = createTestApp(membershipService)
  const response = await app.inject(multipartRequest({
    inviteCode: `  ${academy.inviteCode}  `,
    nickname: '  Helio  ',
    belt: 'blue',
    degree: '1',
  }))

  assert.equal(response.statusCode, 201)
  assert.equal(receivedInput?.inviteCode, academy.inviteCode)
  assert.equal(receivedInput?.nickname, 'Helio')
  assert.equal(response.json().data.academy.name, academy.name)
  assert.equal(response.json().data.student.nickname, student.nickname)

  await app.close()
})

test('POST /onboarding/student rejects missing fields before calling the service', async () => {
  let serviceWasCalled = false
  const membershipService: MembershipService = {
    async joinAcademy() {
      serviceWasCalled = true
      return {
        academy: { id: academy.id, name: academy.name, city: academy.city },
        student: {
          id: student.id,
          fullName: student.fullName,
          nickname: student.nickname,
          avatarUrl: student.avatarUrl,
          belt: student.belt,
          degree: student.degree,
        },
      }
    },
  }
  const app = createTestApp(membershipService)
  const response = await app.inject(multipartRequest({
    inviteCode: '',
    nickname: '',
    belt: '',
    degree: '',
  }))

  assert.equal(response.statusCode, 400)
  assert.equal(response.json().error.code, 'MISSING_FIELDS')
  assert.equal(serviceWasCalled, false)

  await app.close()
})

test('POST /onboarding/student reports invalid invite code with a stable error code', async () => {
  const membershipService: MembershipService = {
    async joinAcademy() {
      throw new InvalidInviteCodeError()
    },
  }
  const app = createTestApp(membershipService)
  const response = await app.inject(multipartRequest({
    inviteCode: 'BB-INVALID',
    nickname: 'Helio',
    belt: 'blue',
    degree: '1',
  }))

  assert.equal(response.statusCode, 404)
  assert.equal(response.json().error.code, 'INVALID_INVITE_CODE')

  await app.close()
})

test('POST /onboarding/student reports already-member with a stable error code', async () => {
  const membershipService: MembershipService = {
    async joinAcademy() {
      throw new AlreadyMemberError()
    },
  }
  const app = createTestApp(membershipService)
  const response = await app.inject(multipartRequest({
    inviteCode: 'BB-ABC123',
    nickname: 'Helio',
    belt: 'blue',
    degree: '1',
  }))

  assert.equal(response.statusCode, 409)
  assert.equal(response.json().error.code, 'ALREADY_MEMBER')

  await app.close()
})

test('POST /onboarding/student returns the API envelope for an oversized image', async () => {
  let serviceWasCalled = false
  const membershipService: MembershipService = {
    async joinAcademy() {
      serviceWasCalled = true
      return {
        academy: { id: academy.id, name: academy.name, city: academy.city },
        student: {
          id: student.id,
          fullName: student.fullName,
          nickname: student.nickname,
          avatarUrl: student.avatarUrl,
          belt: student.belt,
          degree: student.degree,
        },
      }
    },
  }
  const app = createTestApp(membershipService)
  const response = await app.inject(multipartRequest({
    inviteCode: 'BB-ABC123',
    nickname: 'Helio',
    belt: 'blue',
    degree: '1',
  }, {
    content: Buffer.alloc(5 * 1024 * 1024 + 1),
    contentType: 'image/png',
    fieldName: 'photo',
    filename: 'photo.png',
  }))

  assert.equal(response.statusCode, 400)
  assert.equal(response.json().error.code, 'FILE_TOO_LARGE')
  assert.equal(serviceWasCalled, false)

  await app.close()
})

test('POST /onboarding/student rejects a non-numeric degree before calling the service', async () => {
  let serviceWasCalled = false
  const membershipService: MembershipService = {
    async joinAcademy() {
      serviceWasCalled = true
      return {
        academy: { id: academy.id, name: academy.name, city: academy.city },
        student: {
          id: student.id,
          fullName: student.fullName,
          nickname: student.nickname,
          avatarUrl: student.avatarUrl,
          belt: student.belt,
          degree: student.degree,
        },
      }
    },
  }
  const app = createTestApp(membershipService)
  const response = await app.inject(multipartRequest({
    inviteCode: 'BB-ABC123',
    nickname: 'Helio',
    belt: 'blue',
    degree: 'not-a-number',
  }))

  assert.equal(response.statusCode, 400)
  assert.equal(response.json().error.code, 'INVALID_DEGREE')
  assert.equal(serviceWasCalled, false)

  await app.close()
})

test('POST /onboarding/student rejects an invalid belt before calling the service', async () => {
  let serviceWasCalled = false
  const membershipService: MembershipService = {
    async joinAcademy() {
      serviceWasCalled = true
      return {
        academy: { id: academy.id, name: academy.name, city: academy.city },
        student: {
          id: student.id,
          fullName: student.fullName,
          nickname: student.nickname,
          avatarUrl: student.avatarUrl,
          belt: student.belt,
          degree: student.degree,
        },
      }
    },
  }
  const app = createTestApp(membershipService)
  const response = await app.inject(multipartRequest({
    inviteCode: 'BB-ABC123',
    nickname: 'Helio',
    belt: 'gold',
    degree: '1',
  }))

  assert.equal(response.statusCode, 400)
  assert.equal(response.json().error.code, 'INVALID_BELT')
  assert.equal(serviceWasCalled, false)

  await app.close()
})

function createTestApp(membershipService: MembershipService) {
  return buildApp({
    membershipService,
    authService: {
      async syncAuthenticatedUser() {
        return student
      },
      async setOnboardingRole() {
        return student
      },
    },
    logger: false,
    supabaseUrl: 'https://blackbelt-test.supabase.co',
    verifyAccessToken: async () => ({
      sub: student.id,
      email: student.email,
      role: 'authenticated',
      aud: 'authenticated',
      iss: 'https://blackbelt-test.supabase.co/auth/v1',
      exp: Math.floor(Date.now() / 1000) + 60,
    }),
  })
}

function multipartRequest(
  fields: Record<string, string>,
  file?: { content: Buffer; contentType: string; fieldName: string; filename: string },
) {
  const boundary = 'blackbelt-test-boundary'
  const chunks = Object.entries(fields).map(([name, value]) => Buffer.from([
      `--${boundary}`,
      `Content-Disposition: form-data; name="${name}"`,
      '',
      value,
      '',
    ].join('\r\n')))

  if (file) {
    chunks.push(Buffer.from([
      `--${boundary}`,
      `Content-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"`,
      `Content-Type: ${file.contentType}`,
      '',
      '',
    ].join('\r\n')))
    chunks.push(file.content)
    chunks.push(Buffer.from('\r\n'))
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`))

  return {
    method: 'POST' as const,
    url: '/onboarding/student',
    headers: {
      authorization: 'Bearer test-token',
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
    payload: Buffer.concat(chunks),
  }
}
