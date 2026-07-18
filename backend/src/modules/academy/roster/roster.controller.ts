import type { FastifyReply, FastifyRequest } from 'fastify'
import type { RosterService } from './roster.service'
import { updateMemberRoleSchema } from './roster.types'
import {
  ForbiddenError,
  MemberNotFoundError,
  InvalidRoleTransitionError,
  ProfessorTeachesActiveClassError,
} from './roster.errors'

export async function getMembers(
  request: FastifyRequest,
  reply: FastifyReply,
  rosterService: RosterService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  try {
    const result = await rosterService.getMembers(user.id)
    return reply.send({ data: result, error: null })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return reply.code(403).send({
        data: null,
        error: { code: 'FORBIDDEN', message: error.message },
      })
    }

    request.log.error({ err: error }, 'Failed to list academy members')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not list academy members' },
    })
  }
}

export async function updateMemberRole(
  request: FastifyRequest,
  reply: FastifyReply,
  rosterService: RosterService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  const { memberId } = request.params as { memberId: string }

  const parseResult = updateMemberRoleSchema.safeParse(request.body)
  if (!parseResult.success) {
    return reply.code(400).send({
      data: null,
      error: { code: 'INVALID_INPUT', message: 'role must be "professor" or "student"' },
    })
  }

  try {
    const result = await rosterService.updateMemberRole(user.id, memberId, parseResult.data)
    return reply.send({ data: result, error: null })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return reply.code(403).send({
        data: null,
        error: { code: 'FORBIDDEN', message: error.message },
      })
    }

    if (error instanceof MemberNotFoundError) {
      return reply.code(404).send({
        data: null,
        error: { code: 'NOT_FOUND', message: 'Member not found' },
      })
    }

    if (error instanceof InvalidRoleTransitionError) {
      return reply.code(400).send({
        data: null,
        error: { code: 'INVALID_ROLE_TRANSITION', message: error.message },
      })
    }

    if (error instanceof ProfessorTeachesActiveClassError) {
      return reply.code(400).send({
        data: null,
        error: {
          code: 'professor_teaches_active_class',
          message: 'Professor cannot be revoked while teaching active classes',
        },
      })
    }

    request.log.error({ err: error }, 'Failed to update member role')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not update member role' },
    })
  }
}
