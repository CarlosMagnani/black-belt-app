import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  STORAGE_BUCKET: z.string().min(1).default('academy-media'),
  STORAGE_PROVIDER: z.enum(['supabase']).default('supabase'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
})

export const env = envSchema.parse(process.env)
