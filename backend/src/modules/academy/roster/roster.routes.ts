import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getMembers, updateMemberRole } from './roster.controller'
import { createAuthenticate } from '../../auth/auth.middleware'
import type { AuthService } from '../../auth/auth.service'
import type { AccessTokenVerifier } from '../../auth/auth.types'
import type { RosterService } from './roster.service'
import { resolveOwnedAcademy } from '../academy-helpers'

export async function rosterRoutes(
  app: FastifyInstance,
  rosterService: RosterService,
  authService: AuthService,
  verifyAccessToken: AccessTokenVerifier
) {
  // All routes are auth-protected
  const authenticate = createAuthenticate(authService, verifyAccessToken)

  // Decorate request so route-level preHandler can store the resolved academy
  app.decorateRequest('academy')

  /**
   * Route-level owner check that short-circuits unauthorized callers
   * before they reach the service layer. The service-level check
   * (findOwnedAcademy) stays as defense in depth.
   */
  async function requireAcademyOwner(request: FastifyRequest, reply: FastifyReply) {
    const user = request.authenticatedUser
    if (!user) {
      return reply.code(401).send({
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const academy = await resolveOwnedAcademy(user.id)
    if (!academy) {
      return reply.code(403).send({
        data: null,
        error: { code: 'FORBIDDEN', message: 'You do not own an academy' },
      })
    }

    request.academy = academy
  }

  app.get(
    '/academy/members',
    { preHandler: [authenticate, requireAcademyOwner] },
    async (request, reply) => {
      return getMembers(request, reply, rosterService)
    }
  )

  app.patch(
    '/academy/members/:memberId/role',
    { preHandler: [authenticate, requireAcademyOwner] },
    async (request, reply) => {
      return updateMemberRole(request, reply, rosterService)
    }
  )
}
