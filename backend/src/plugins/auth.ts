import fastifyJwt from '@fastify/jwt'
import type { FastifyInstance } from 'fastify'
import { authRoutes } from '../modules/auth/auth.routes'
import type { AuthService } from '../modules/auth/auth.service'

type AuthPluginOptions = {
  authService: AuthService
  jwtSecret: string
  supabaseUrl: string
}

export async function authPlugin(app: FastifyInstance, options: AuthPluginOptions) {
  app.decorateRequest('authenticatedUser')

  await app.register(fastifyJwt, {
    secret: options.jwtSecret,
    verify: {
      algorithms: ['HS256'],
      allowedAud: 'authenticated',
      allowedIss: `${options.supabaseUrl.replace(/\/$/, '')}/auth/v1`,
    },
  })

  await authRoutes(app, options.authService)
}
