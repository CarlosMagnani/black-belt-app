import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Academy, User } from '@prisma/client'
import { buildApp } from '../src/app'
import type {
  AcademyRepository,
  CreateOwnerOnboardingInput,
} from '../src/modules/academy/academy.repository'
import {
  AcademyAlreadyExistsError,
  DefaultAcademyService,
  type AcademyService,
} from '../src/modules/academy/academy.service'
import type { ObjectStorage, StoreObjectInput } from '../src/modules/storage/object-storage'

const ownerId = '9ed20135-c115-42f0-9b4a-1bd3eb949613'

const owner: User = {
  id: ownerId,
  email: 'mestre@example.com',
  passwordHash: null,
  fullName: 'Carlos Gracie',
  nickname: 'Professor Carlos',
  avatarUrl: `users/${ownerId}/avatar`,
  onboardingRole: 'owner',
  belt: 'black',
  degree: 2,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

const academy: Academy = {
  id: 'd09f8321-6282-4928-bd15-7e04149ddf77',
  name: 'Black Belt SP',
  city: 'São Paulo, Brasil',
  logoUrl: `academies/${ownerId}/logo`,
  inviteCode: 'BB-ABC123',
  ownerId,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

test('owner onboarding stores media and persists the complete flow through the repository', async () => {
  const storedObjects: StoreObjectInput[] = []
  let persistedInput: CreateOwnerOnboardingInput | undefined
  const repository: AcademyRepository = {
    async findByOwnerId() {
      return null
    },
    async createOwnerOnboarding(input) {
      persistedInput = input
      return {
        academy: { ...academy, inviteCode: input.inviteCode },
        owner,
      }
    },
  }
  const storage: ObjectStorage = {
    async store(input) {
      storedObjects.push(input)
      return { key: input.key }
    },
    async delete() {},
  }
  const service = new DefaultAcademyService(repository, storage)

  const result = await service.createOwnerAcademy({
    userId: ownerId,
    academyName: academy.name,
    academyCity: academy.city,
    ownerNickname: owner.nickname!,
    ownerBelt: 'black',
    ownerDegree: 2,
    logo: { content: new Uint8Array([1]), contentType: 'image/png' },
    photo: { content: new Uint8Array([2]), contentType: 'image/jpeg' },
  })

  assert.deepEqual(storedObjects.map(({ key }) => key), [
    `academies/${ownerId}/logo`,
    `users/${ownerId}/avatar`,
  ])
  assert.match(persistedInput?.inviteCode ?? '', /^BB-[A-Z0-9]{6}$/)
  assert.equal(persistedInput?.logoUrl, `academies/${ownerId}/logo`)
  assert.equal(persistedInput?.avatarUrl, `users/${ownerId}/avatar`)
  assert.equal(result.academy.inviteCode, persistedInput?.inviteCode)
})

test('owner onboarding removes uploaded media when persistence fails', async () => {
  const deletedKeys: string[] = []
  const repository: AcademyRepository = {
    async findByOwnerId() {
      return null
    },
    async createOwnerOnboarding() {
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
  const service = new DefaultAcademyService(repository, storage)

  await assert.rejects(service.createOwnerAcademy({
    userId: ownerId,
    academyName: academy.name,
    academyCity: academy.city,
    ownerNickname: owner.nickname!,
    ownerBelt: 'black',
    ownerDegree: 2,
    logo: { content: new Uint8Array([1]), contentType: 'image/png' },
    photo: { content: new Uint8Array([2]), contentType: 'image/jpeg' },
  }))

  assert.deepEqual(deletedKeys, [
    `academies/${ownerId}/logo`,
    `users/${ownerId}/avatar`,
  ])
})

test('POST /onboarding/owner trims fields and returns the real academy result', async () => {
  let receivedInput: Parameters<AcademyService['createOwnerAcademy']>[0] | undefined
  const academyService: AcademyService = {
    async createOwnerAcademy(input) {
      receivedInput = input
      return { academy, owner }
    },
  }
  const app = createTestApp(academyService)
  const response = await app.inject(multipartRequest({
    academyName: `  ${academy.name}  `,
    academyCity: `  ${academy.city}  `,
    ownerNickname: '  Professor Carlos  ',
    ownerBelt: 'black',
    ownerDegree: '2',
  }))

  assert.equal(response.statusCode, 201)
  assert.equal(receivedInput?.academyName, academy.name)
  assert.equal(receivedInput?.academyCity, academy.city)
  assert.equal(receivedInput?.ownerNickname, 'Professor Carlos')
  assert.equal(response.json().data.academy.inviteCode, academy.inviteCode)

  await app.close()
})

test('POST /onboarding/owner rejects a non-numeric degree before calling the service', async () => {
  let serviceWasCalled = false
  const academyService: AcademyService = {
    async createOwnerAcademy() {
      serviceWasCalled = true
      return { academy, owner }
    },
  }
  const app = createTestApp(academyService)
  const response = await app.inject(multipartRequest({
    academyName: academy.name,
    academyCity: academy.city,
    ownerNickname: 'Professor Carlos',
    ownerBelt: 'black',
    ownerDegree: 'not-a-number',
  }))

  assert.equal(response.statusCode, 400)
  assert.equal(response.json().error.code, 'INVALID_DEGREE')
  assert.equal(serviceWasCalled, false)

  await app.close()
})

test('POST /onboarding/owner reports an existing academy with a stable error code', async () => {
  const academyService: AcademyService = {
    async createOwnerAcademy() {
      throw new AcademyAlreadyExistsError()
    },
  }
  const app = createTestApp(academyService)
  const response = await app.inject(multipartRequest({
    academyName: academy.name,
    academyCity: academy.city,
    ownerNickname: 'Professor Carlos',
    ownerBelt: 'black',
    ownerDegree: '2',
  }))

  assert.equal(response.statusCode, 409)
  assert.equal(response.json().error.code, 'ACADEMY_EXISTS')

  await app.close()
})

test('POST /onboarding/owner returns the API envelope for an oversized image', async () => {
  let serviceWasCalled = false
  const academyService: AcademyService = {
    async createOwnerAcademy() {
      serviceWasCalled = true
      return { academy, owner }
    },
  }
  const app = createTestApp(academyService)
  const response = await app.inject(multipartRequest({
    academyName: academy.name,
    academyCity: academy.city,
    ownerNickname: 'Professor Carlos',
    ownerBelt: 'black',
    ownerDegree: '2',
  }, {
    content: Buffer.alloc(5 * 1024 * 1024 + 1),
    contentType: 'image/png',
    fieldName: 'logo',
    filename: 'logo.png',
  }))

  assert.equal(response.statusCode, 400)
  assert.equal(response.json().error.code, 'FILE_TOO_LARGE')
  assert.equal(serviceWasCalled, false)

  await app.close()
})

function createTestApp(academyService: AcademyService) {
  return buildApp({
    academyService,
    authService: {
      async syncAuthenticatedUser() {
        return owner
      },
      async setOnboardingRole() {
        return owner
      },
    },
    logger: false,
    supabaseUrl: 'https://blackbelt-test.supabase.co',
    verifyAccessToken: async () => ({
      sub: owner.id,
      email: owner.email,
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
    url: '/onboarding/owner',
    headers: {
      authorization: 'Bearer test-token',
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
    payload: Buffer.concat(chunks),
  }
}
