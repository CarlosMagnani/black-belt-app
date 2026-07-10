import type { FastifyInstance } from 'fastify'
import { getCurrentUser } from './auth.controller'
import { createAuthenticate } from './auth.middleware'
import type { AuthService } from './auth.service'

export async function authRoutes(app: FastifyInstance, authService: AuthService) {
  app.get('/auth/me', { preHandler: createAuthenticate(authService) }, getCurrentUser)
}
