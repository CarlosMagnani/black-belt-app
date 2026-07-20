import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { listClasses, createClass, updateClass, deactivateClass } from './schedule.controller'
import { createAuthenticate } from '../auth/auth.middleware'
import type { AuthService } from '../auth/auth.service'
import type { AccessTokenVerifier } from '../auth/auth.types'
import type { ScheduleService } from './schedule.service'
import { resolveOwnedAcademy, resolveAcademyMember } from '../academy/academy-helpers'

export async function scheduleRoutes(
  app: FastifyInstance,
  scheduleService: ScheduleService,
  authService: AuthService,
  verifyAccessToken: AccessTokenVerifier
) {
  // All routes are auth-protected
  const authenticate = createAuthenticate(authService, verifyAccessToken)

  /**
   * Route-level owner check that short-circuits unauthorized callers
   * before they reach the service layer.
   *
   * NOTE: The 'academy' request decorator is already registered by roster.routes.ts
   * in the same Fastify instance. Do NOT decorate it again here.
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

  /**
   * Route-level member check — any active member can read classes.
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

  // GET /academy/classes — any member can read
  app.get(
    '/academy/classes',
    { preHandler: [authenticate, requireAcademyMember] },
    async (request, reply) => {
      return listClasses(request, reply, scheduleService)
    }
  )

  // POST /academy/classes — owner only
  app.post(
    '/academy/classes',
    { preHandler: [authenticate, requireAcademyOwner] },
    async (request, reply) => {
      return createClass(request, reply, scheduleService)
    }
  )

  // PATCH /academy/classes/:classId — owner only
  app.patch(
    '/academy/classes/:classId',
    { preHandler: [authenticate, requireAcademyOwner] },
    async (request, reply) => {
      return updateClass(request, reply, scheduleService)
    }
  )

  // DELETE /academy/classes/:classId — owner only
  app.delete(
    '/academy/classes/:classId',
    { preHandler: [authenticate, requireAcademyOwner] },
    async (request, reply) => {
      return deactivateClass(request, reply, scheduleService)
    }
  )
}
