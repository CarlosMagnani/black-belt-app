import type { ObjectStorage } from './object-storage'
import { SupabaseObjectStorage } from './supabase-object-storage'

type ObjectStorageConfig = {
  bucket: string
  provider: 'supabase'
  serviceRoleKey: string
  supabaseUrl: string
}

export function createObjectStorage(config: ObjectStorageConfig): ObjectStorage {
  switch (config.provider) {
    case 'supabase':
      return new SupabaseObjectStorage({
        bucket: config.bucket,
        serviceRoleKey: config.serviceRoleKey,
        supabaseUrl: config.supabaseUrl,
      })
  }
}
