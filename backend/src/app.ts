import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { DefaultAuthService, type AuthService } from './modules/auth/auth.service'
import { createSupabaseTokenVerifier } from './modules/auth/supabase-token-verifier'
import type { AccessTokenVerifier } from './modules/auth/auth.types'
import { PrismaUserRepository } from './modules/users/user.repository'
import { authPlugin } from './plugins/auth'

type BuildAppOptions = {
  authService?: AuthService
  logger?: boolean
  supabaseUrl: string
  verifyAccessToken?: AccessTokenVerifier
}

export function buildApp(options: BuildAppOptions) {
  const app = Fastify({ logger: options.logger ?? true })
  const authService = options.authService ?? new DefaultAuthService(new PrismaUserRepository())
  const verifyAccessToken = options.verifyAccessToken ?? createSupabaseTokenVerifier(options.supabaseUrl)

  app.register(cors, { origin: true })
  app.register(helmet)
  app.register(authPlugin, {
    authService,
    verifyAccessToken,
  })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
