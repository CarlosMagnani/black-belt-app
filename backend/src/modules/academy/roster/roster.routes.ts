import type { FastifyInstance } from 'fastify'
import { getMembers, updateMemberRole } from './roster.controller'
import { createAuthenticate } from '../../auth/auth.middleware'
import type { AuthService } from '../../auth/auth.service'
import type { AccessTokenVerifier } from '../../auth/auth.types'
import type { RosterService } from './roster.service'

export async function rosterRoutes(
  app: FastifyInstance,
  rosterService: RosterService,
  authService: AuthService,
  verifyAccessToken: AccessTokenVerifier
) {
  // All routes are auth-protected
  const authenticate = createAuthenticate(authService, verifyAccessToken)

  app.get(
    '/academy/members',
    { preHandler: authenticate },
    async (request, reply) => {
      return getMembers(request, reply, rosterService)
    }
  )

  app.patch(
    '/academy/members/:memberId/role',
    { preHandler: authenticate },
    async (request, reply) => {
      return updateMemberRole(request, reply, rosterService)
    }
  )
}
