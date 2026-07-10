import 'dotenv/config'
import { env } from './config/env'
import { buildApp } from './app'

async function start() {
  const app = buildApp({
    jwtSecret: env.SUPABASE_JWT_SECRET,
    supabaseUrl: env.SUPABASE_URL,
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
