export type MediaContentType = 'image/jpeg' | 'image/png' | 'image/webp'

export type StoreObjectInput = {
  content: Uint8Array
  contentType: MediaContentType
  key: string
}

export type StoredObject = {
  key: string
}

export interface ObjectStorage {
  delete(key: string): Promise<void>
  store(input: StoreObjectInput): Promise<StoredObject>
}

export class ObjectStorageError extends Error {
  constructor() {
    super('Could not store media')
  }
}
