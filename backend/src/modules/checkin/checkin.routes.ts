import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { createCheckIn, listTodayCheckIns } from './checkin.controller'
import { createAuthenticate } from '../auth/auth.middleware'
import type { AuthService } from '../auth/auth.service'
import type { AccessTokenVerifier } from '../auth/auth.types'
import type { CheckInService } from './checkin.service'
import { resolveAcademyMember } from '../academy/academy-helpers'

export async function checkInRoutes(
  app: FastifyInstance,
  checkInService: CheckInService,
  authService: AuthService,
  verifyAccessToken: AccessTokenVerifier
) {
  const authenticate = createAuthenticate(authService, verifyAccessToken)

  /**
   * Route-level member check — any active academy member can create check-ins
   * and read their own check-ins. Reuses the shared resolveAcademyMember helper.
   */
  async function requireAcademyMember(request: FastifyRequest, reply: FastifyReply) {
    const user = request.authenticatedUser
    if (!user) {
      return reply.code(401).send({
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      })
    }

    const academy = await resolveAcademyMember(user.id)
    if (!academy) {
      return reply.code(403).send({
        data: null,
        error: { code: 'FORBIDDEN', message: 'You are not an active member of any academy' },
      })
    }

    request.academy = academy
  }

  // POST /academy/checkins — any active member can create a check-in request
  app.post(
    '/academy/checkins',
    { preHandler: [authenticate, requireAcademyMember] },
    async (request, reply) => {
      return createCheckIn(request, reply, checkInService)
    }
  )

  // GET /academy/checkins/today — any active member can read their check-ins for today
  app.get(
    '/academy/checkins/today',
    { preHandler: [authenticate, requireAcademyMember] },
    async (request, reply) => {
      return listTodayCheckIns(request, reply, checkInService)
    }
  )
}
