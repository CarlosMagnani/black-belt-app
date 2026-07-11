import {
  ObjectStorageError,
  type ObjectStorage,
  type StoreObjectInput,
  type StoredObject,
} from './object-storage'

type SupabaseObjectStorageOptions = {
  bucket: string
  fetch?: typeof fetch
  serviceRoleKey: string
  supabaseUrl: string
}

export class SupabaseObjectStorage implements ObjectStorage {
  private readonly bucket: string
  private readonly fetch: typeof fetch
  private readonly serviceRoleKey: string
  private readonly supabaseUrl: string

  constructor(options: SupabaseObjectStorageOptions) {
    this.bucket = options.bucket
    this.fetch = options.fetch ?? globalThis.fetch
    this.serviceRoleKey = options.serviceRoleKey
    this.supabaseUrl = options.supabaseUrl.replace(/\/$/, '')
  }

  async store(input: StoreObjectInput): Promise<StoredObject> {
    const response = await this.fetch(this.objectUrl(input.key), {
      method: 'POST',
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        'content-type': input.contentType,
        'x-upsert': 'false',
      },
      body: Buffer.from(input.content),
    })

    if (!response.ok) {
      throw new ObjectStorageError()
    }

    return { key: input.key }
  }

  async delete(key: string): Promise<void> {
    const response = await this.fetch(`${this.supabaseUrl}/storage/v1/object/${encodeURIComponent(this.bucket)}`, {
      method: 'DELETE',
      headers: this.headers({ 'content-type': 'application/json' }),
      body: JSON.stringify({ prefixes: [key] }),
    })

    if (!response.ok) {
      throw new ObjectStorageError()
    }
  }

  private headers(extraHeaders: Record<string, string> = {}) {
    return {
      apikey: this.serviceRoleKey,
      authorization: `Bearer ${this.serviceRoleKey}`,
      ...extraHeaders,
    }
  }

  private objectUrl(key: string) {
    const encodedKey = key.split('/').map(encodeURIComponent).join('/')
    return `${this.supabaseUrl}/storage/v1/object/${encodeURIComponent(this.bucket)}/${encodedKey}`
  }
}
