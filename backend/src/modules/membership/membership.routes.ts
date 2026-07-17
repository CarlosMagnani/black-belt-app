import type { FastifyInstance } from 'fastify'
import { getStudentMembership, joinAcademy, verifyInviteCode } from './membership.controller'
import { createAuthenticate } from '../auth/auth.middleware'
import type { MembershipService } from './membership.service'
import type { AuthService } from '../auth/auth.service'
import type { AccessTokenVerifier } from '../auth/auth.types'

export async function membershipRoutes(
  app: FastifyInstance,
  membershipService: MembershipService,
  authService: AuthService,
  verifyAccessToken: AccessTokenVerifier
) {
  app.post(
    '/onboarding/student/verify-invite',
    { preHandler: createAuthenticate(authService, verifyAccessToken) },
    async (request, reply) => {
      return verifyInviteCode(request, reply, membershipService)
    }
  )

  app.post(
    '/onboarding/student',
    { preHandler: createAuthenticate(authService, verifyAccessToken) },
    async (request, reply) => {
      return joinAcademy(request, reply, membershipService)
    }
  )

  app.get(
    '/memberships/me',
    { preHandler: createAuthenticate(authService, verifyAccessToken) },
    async (request, reply) => {
      return getStudentMembership(request, reply, membershipService)
    }
  )
}
