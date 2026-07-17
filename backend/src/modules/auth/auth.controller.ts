import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AuthService } from './auth.service'
import type { OnboardingRoleInput } from './auth.types'
import { onboardingRoleSchema } from './auth.types'

export async function getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
  return reply.send({
    data: {
      user: {
        ...request.authenticatedUser!,
        onboardingRole: request.userOnboardingRole ?? null,
      },
    },
    error: null,
  })
}

export async function setOnboardingRole(
  request: FastifyRequest,
  reply: FastifyReply,
  authService: AuthService
) {
  const user = request.authenticatedUser!

  if (request.userOnboardingRole) {
    return reply.code(409).send({
      data: null,
      error: { code: 'ROLE_ALREADY_SET', message: 'Role has already been selected' },
    })
  }

  const parseResult = onboardingRoleSchema.safeParse(request.body)
  if (!parseResult.success) {
    return reply.code(400).send({
      data: null,
      error: { code: 'INVALID_INPUT', message: 'Invalid role. Must be "owner" or "student"' },
    })
  }

  const { role }: OnboardingRoleInput = parseResult.data
  const updatedUser = await authService.setOnboardingRole(user.id, role)

  return reply.send({
    data: {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        onboardingRole: updatedUser.onboardingRole,
      },
    },
    error: null,
  })
}
