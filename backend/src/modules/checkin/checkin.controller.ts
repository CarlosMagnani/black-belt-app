import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CheckInService } from './checkin.service'
import { createCheckInSchema } from './checkin.types'
import {
  ForbiddenError,
  ClassNotFoundError,
  ClassNotActiveError,
  ClassNotTodayError,
  NotYetTimeError,
  AlreadyRejectedError,
  AlreadyRequestedError,
} from './checkin.errors'

export async function createCheckIn(
  request: FastifyRequest,
  reply: FastifyReply,
  checkInService: CheckInService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  const parseResult = createCheckInSchema.safeParse(request.body)
  if (!parseResult.success) {
    return reply.code(400).send({
      data: null,
      error: {
        code: 'invalid_input',
        message: 'Invalid input',
        details: parseResult.error.issues,
      },
    })
  }

  try {
    const result = await checkInService.createCheckIn(user.id, parseResult.data)
    return reply.code(201).send({ data: result, error: null })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return reply.code(403).send({
        data: null,
        error: { code: 'forbidden', message: error.message },
      })
    }

    if (error instanceof ClassNotFoundError) {
      return reply.code(404).send({
        data: null,
        error: { code: 'class_not_found', message: error.message },
      })
    }

    if (error instanceof ClassNotActiveError) {
      return reply.code(400).send({
        data: null,
        error: { code: 'class_not_active', message: error.message },
      })
    }

    if (error instanceof ClassNotTodayError) {
      return reply.code(400).send({
        data: null,
        error: { code: 'class_not_today', message: error.message },
      })
    }

    if (error instanceof NotYetTimeError) {
      return reply.code(400).send({
        data: null,
        error: { code: 'not_yet_time', message: error.message },
      })
    }

    if (error instanceof AlreadyRejectedError) {
      return reply.code(400).send({
        data: null,
        error: { code: 'already_rejected', message: error.message },
      })
    }

    if (error instanceof AlreadyRequestedError) {
      return reply.code(409).send({
        data: null,
        error: { code: 'already_requested', message: error.message },
      })
    }

    request.log.error({ err: error }, 'Failed to create check-in')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not create check-in' },
    })
  }
}

export async function listTodayCheckIns(
  request: FastifyRequest,
  reply: FastifyReply,
  checkInService: CheckInService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  try {
    const result = await checkInService.listTodayCheckIns(user.id)
    return reply.send({ data: result, error: null })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return reply.code(403).send({
        data: null,
        error: { code: 'forbidden', message: error.message },
      })
    }

    request.log.error({ err: error }, 'Failed to list today\'s check-ins')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not list check-ins' },
    })
  }
}
