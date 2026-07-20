import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { test } from 'node:test'
import type { User } from '@prisma/client'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'
import { buildApp } from '../src/app'
import { DefaultAuthService } from '../src/modules/auth/auth.service'
import { createSupabaseTokenVerifier } from '../src/modules/auth/supabase-token-verifier'
import type { SyncUserInput, UserRepository } from '../src/modules/users/user.repository'

const supabaseUrl = 'https://blackbelt-test.supabase.co'
const testKeyId = 'blackbelt-test-key'
const testKeyPair = generateKeyPair('ES256')
const testTokenVerifier = testKeyPair.then(async ({ publicKey }) => {
  const jwk = await exportJWK(publicKey)
  jwk.alg = 'ES256'
  jwk.kid = testKeyId
  jwk.use = 'sig'

  return createSupabaseTokenVerifier(supabaseUrl, createLocalJWKSet({ keys: [jwk] }))
})

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

async function createTestApp(syncAuthenticatedUser = async () => testUser) {
  return buildApp({
    authService: { syncAuthenticatedUser },
    supabaseUrl,
    verifyAccessToken: await testTokenVerifier,
    logger: false,
  })
}

async function signUserToken(overrides: Record<string, unknown> = {}) {
  const { privateKey } = await testKeyPair

  return new SignJWT({
    sub: testUser.id,
    email: testUser.email,
    role: 'authenticated',
    aud: 'authenticated',
    iss: `${supabaseUrl}/auth/v1`,
    exp: Math.floor(Date.now() / 1000) + 60,
    ...overrides,
  })
    .setProtectedHeader({ alg: 'ES256', kid: testKeyId, typ: 'JWT' })
    .sign(privateKey)
}

function signLegacyToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    sub: testUser.id,
    email: testUser.email,
    role: 'authenticated',
    aud: 'authenticated',
    iss: `${supabaseUrl}/auth/v1`,
    exp: Math.floor(Date.now() / 1000) + 60,
  })).toString('base64url')
  const signature = createHmac('sha256', 'legacy-secret')
    .update(`${header}.${payload}`)
    .digest('base64url')

  return `${header}.${payload}.${signature}`
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

test('POST /auth/onboarding persists the owner role before owner onboarding', async () => {
  let selectedRole: string | undefined
  const app = buildApp({
    authService: {
      async syncAuthenticatedUser() {
        return testUser
      },
      async setOnboardingRole(_userId, role) {
        selectedRole = role
        return { ...testUser, onboardingRole: role }
      },
    },
    supabaseUrl,
    verifyAccessToken: await testTokenVerifier,
    logger: false,
  })
  await app.ready()
  const token = await signUserToken()
  const response = await app.inject({
    method: 'POST',
    url: '/auth/onboarding',
    headers: { authorization: `Bearer ${token}` },
    payload: { role: 'owner' },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(selectedRole, 'owner')
  assert.equal(response.json().data.user.onboardingRole, 'owner')

  await app.close()
})

test('GET /auth/me rejects requests without a bearer token', async () => {
  const app = await createTestApp()
  const response = await app.inject({ method: 'GET', url: '/auth/me' })

  assert.equal(response.statusCode, 401)
  assert.deepEqual(response.json(), {
    data: null,
    error: { code: 'UNAUTHORIZED', message: 'Invalid or expired access token' },
  })

  await app.close()
})

test('GET /auth/me rejects tokens from a different issuer', async () => {
  const app = await createTestApp()
  await app.ready()
  const token = await signUserToken({ iss: 'https://attacker.example/auth/v1' })
  const response = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 401)

  await app.close()
})

test('GET /auth/me rejects expired tokens', async () => {
  const app = await createTestApp()
  const token = await signUserToken({ exp: Math.floor(Date.now() / 1000) - 1 })
  const response = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 401)

  await app.close()
})

test('GET /auth/me rejects tokens without an expiration', async () => {
  const app = await createTestApp()
  const token = await signUserToken({ exp: undefined })
  const response = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 401)

  await app.close()
})

test('GET /auth/me rejects tokens for another audience', async () => {
  const app = await createTestApp()
  const token = await signUserToken({ aud: 'anon' })
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
  const app = await createTestApp(async (payload) => {
    syncedSubject = payload.sub
    return testUser
  })
  await app.ready()
  const token = await signUserToken()
  const response = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(response.statusCode, 200)
  assert.equal(syncedSubject, testUser.id)
  assert.deepEqual(response.json(), {
    data: {
      user: {
        id: testUser.id,
        email: testUser.email,
        fullName: testUser.fullName,
        onboardingRole: null,
      },
    },
    error: null,
  })

  await app.close()
})

test('GET /auth/me hides user synchronization failures', async () => {
  const app = await createTestApp(async () => {
    throw new Error('database connection details')
  })
  await app.ready()
  const token = await signUserToken()
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

test('GET /auth/me rejects legacy HS256 tokens', async () => {
  const app = await createTestApp()
  const response = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: `Bearer ${signLegacyToken()}` },
  })

  assert.equal(response.statusCode, 401)

  await app.close()
})
