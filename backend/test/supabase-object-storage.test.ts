import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createObjectStorage } from '../src/modules/storage/create-object-storage'
import { ObjectStorageError } from '../src/modules/storage/object-storage'
import { SupabaseObjectStorage } from '../src/modules/storage/supabase-object-storage'

const storage = new SupabaseObjectStorage({
  bucket: 'academy-media',
  secretKey: 'sb_secret_server-only-test-key',
  supabaseUrl: 'https://blackbelt-test.supabase.co/',
  fetch: async (input, init) => {
    assert.equal(input, 'https://blackbelt-test.supabase.co/storage/v1/object/academy-media/owners/user-1/avatar%20photo.png')
    assert.equal(init?.method, 'POST')
    assert.equal(init?.headers?.apikey, 'sb_secret_server-only-test-key')
    assert.equal(init?.headers?.authorization, undefined)
    assert.equal(init?.headers?.['content-type'], 'image/png')
    assert.equal(init?.headers?.['x-upsert'], 'true')
    return new Response(null, { status: 200 })
  },
})

test('stores an object through the Supabase Storage API', async () => {
  const storedObject = await storage.store({
    content: new Uint8Array([1, 2, 3]),
    contentType: 'image/png',
    key: 'owners/user-1/avatar photo.png',
  })

  assert.deepEqual(storedObject, { key: 'owners/user-1/avatar photo.png' })
})

test('hides Supabase Storage failures from callers', async () => {
  const failingStorage = new SupabaseObjectStorage({
    bucket: 'academy-media',
    secretKey: 'sb_secret_server-only-test-key',
    supabaseUrl: 'https://blackbelt-test.supabase.co',
    fetch: async () => new Response('provider details', { status: 500 }),
  })

  await assert.rejects(
    failingStorage.store({
      content: new Uint8Array([1]),
      contentType: 'image/jpeg',
      key: 'academies/academy-1/logo.jpg',
    }),
    ObjectStorageError
  )
})

test('creates the configured storage provider behind the ObjectStorage port', () => {
  const configuredStorage = createObjectStorage({
    bucket: 'academy-media',
    provider: 'supabase',
    secretKey: 'sb_secret_server-only-test-key',
    supabaseUrl: 'https://blackbelt-test.supabase.co',
  })

  assert.ok(configuredStorage instanceof SupabaseObjectStorage)
})
