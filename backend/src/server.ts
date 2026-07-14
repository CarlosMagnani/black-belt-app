import 'dotenv/config'
import { env } from './config/env'
import { buildApp } from './app'

async function start() {
  const app = buildApp({
    supabaseUrl: env.SUPABASE_URL,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    storageBucket: env.STORAGE_BUCKET,
  })

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`Server running on port ${env.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
