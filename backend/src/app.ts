import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { DefaultAuthService, type AuthService } from './modules/auth/auth.service'
import { PrismaUserRepository } from './modules/users/user.repository'
import { authPlugin } from './plugins/auth'

type BuildAppOptions = {
  authService?: AuthService
  jwtSecret: string
  logger?: boolean
  supabaseUrl: string
}

export function buildApp(options: BuildAppOptions) {
  const app = Fastify({ logger: options.logger ?? true })
  const authService = options.authService ?? new DefaultAuthService(new PrismaUserRepository())

  app.register(cors, { origin: true })
  app.register(helmet)
  app.register(authPlugin, {
    authService,
    jwtSecret: options.jwtSecret,
    supabaseUrl: options.supabaseUrl,
  })

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
