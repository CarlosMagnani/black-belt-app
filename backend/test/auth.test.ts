import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { test } from 'node:test'
import type { User } from '@prisma/client'
import { buildApp } from '../src/app'
import { DefaultAuthService } from '../src/modules/auth/auth.service'
import type { SyncUserInput, UserRepository } from '../src/modules/users/user.repository'

const supabaseUrl = 'https://blackbelt-test.supabase.co'
const jwtSecret = 'test-secret-that-is-long-enough'

const testUser: User = {
  id: '9ed20135-c115-42f0-9b4a-1bd3eb949613',
  email: 'aluno@example.com',
  passwordHash: null,
  fullName: 'Aluno Teste',
  nickname: null,
  avatarUrl: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

function createTestApp(syncAuthenticatedUser = async () => testUser) {
  return buildApp({
    authService: { syncAuthenticatedUser },
    jwtSecret,
    supabaseUrl,
    logger: false,
  })
}

function signUserToken(overrides: Record<string, unknown> = {}) {
  const header = encode({ alg: 'HS256', typ: 'JWT' })
  const payload = encode({
    sub: testUser.id,
    email: testUser.email,
    role: 'authenticated',
    aud: 'authenticated',
    iss: `${supabaseUrl}/auth/v1`,
    exp: Math.floor(Date.now() / 1000) + 60,
    ...overrides,
  })
  const signature = createHmac('sha256', jwtSecret).update(`${header}.${payload}`).digest('base64url')

  return `${header}.${payload}.${signature}`
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

test('auth service creates the local profile from non-authorization metadata', async () => {
  let syncedInput: SyncUserInput | undefined
  const repository: UserRepository = {
    async sync(input) {
      syncedInput = input
      return { ...testUser, fullName: input.fullName }
    },
  }
  const service = new DefaultAuthService(repository)

  await service.syncAuthenticatedUser({
    sub: testUser.id,
    email: testUser.email,
    role: 'authenticated',
    aud: 'authenticated',
    iss: `${supabaseUrl}/auth/v1`,
    exp: Math.floor(Date.now() / 1000) + 60,
    user_metadata: { full_name: '  Carlos Gracie  ' },
  })

  assert.deepEqual(syncedInput, {
    id: testUser.id,
    email: testUser.email,
    fullName: 'Carlos Gracie',
  })
})

test('GET /auth/me rejects requests without a bearer token', async () => {
  const app = createTestApp()
  const response = await app.inject({ method: 'GET', url: '/auth/me' })

  assert.equal(response.statusCode, 401)
  assert.deepEqual(response.json(), {
    data: null,
    error: { code: 'UNAUTHORIZED', message: 'Invalid or expired access token' },
  })

  await app.close()
})

test('GET /auth/me rejects tokens from a different issuer', async () => {
  const app = createTestApp()
  await app.ready()
  const token = signUserToken({ iss: 'https://attacker.example/auth/v1' })
  const response = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 401)

  await app.close()
})

test('GET /auth/me syncs and returns a valid Supabase user', async () => {
  let syncedSubject: string | undefined
  const app = createTestApp(async (payload) => {
    syncedSubject = payload.sub
    return testUser
  })
  await app.ready()
  const token = signUserToken()
  const response = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(syncedSubject, testUser.id)
  assert.deepEqual(response.json(), {
    data: { user: { id: testUser.id, email: testUser.email, fullName: testUser.fullName } },
    error: null,
  })

  await app.close()
})

test('GET /auth/me hides user synchronization failures', async () => {
  const app = createTestApp(async () => {
    throw new Error('database connection details')
  })
  await app.ready()
  const token = signUserToken()
  const response = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 500)
  assert.deepEqual(response.json(), {
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'Could not load your account' },
  })

  await app.close()
})
