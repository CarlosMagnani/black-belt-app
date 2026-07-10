import type { FastifyInstance } from 'fastify'
import { getCurrentUser, setOnboardingRole } from './auth.controller'
import { createAuthenticate } from './auth.middleware'
import type { AuthService } from './auth.service'
import type { AccessTokenVerifier } from './auth.types'

export async function authRoutes(
  app: FastifyInstance,
  authService: AuthService,
  verifyAccessToken: AccessTokenVerifier
) {
  app.get(
    '/auth/me',
    { preHandler: createAuthenticate(authService, verifyAccessToken) },
    getCurrentUser
  )

  app.post(
    '/auth/onboarding',
    { preHandler: createAuthenticate(authService, verifyAccessToken) },
    async (request, reply) => {
      return setOnboardingRole(request, reply, authService)
    }
  )
}
