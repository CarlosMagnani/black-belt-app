import type { FastifyInstance } from 'fastify'
import { createOwnerAcademy } from './academy.controller'
import { createAuthenticate } from '../auth/auth.middleware'
import type { AcademyService } from './academy.service'
import type { AuthService } from '../auth/auth.service'
import type { AccessTokenVerifier } from '../auth/auth.types'

export async function academyRoutes(
  app: FastifyInstance,
  academyService: AcademyService,
  authService: AuthService,
  verifyAccessToken: AccessTokenVerifier
) {
  app.post(
    '/onboarding/owner',
    { preHandler: createAuthenticate(authService, verifyAccessToken) },
    async (request, reply) => {
      return createOwnerAcademy(request, reply, academyService)
    }
  )
}
