import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ScheduleService } from './schedule.service'
import { createClassSchema, updateClassSchema } from './schedule.types'
import {
  ForbiddenError,
  ClassNotFoundError,
  InvalidInstructorError,
} from './schedule.errors'

export async function listClasses(
  request: FastifyRequest,
  reply: FastifyReply,
  scheduleService: ScheduleService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  const query = request.query as { includeInactive?: string }
  const includeInactive = query.includeInactive === 'true'

  try {
    const classes = await scheduleService.listClasses(user.id, includeInactive)
    return reply.send({ data: { classes }, error: null })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return reply.code(403).send({
        data: null,
        error: { code: 'FORBIDDEN', message: error.message },
      })
    }

    request.log.error({ err: error }, 'Failed to list classes')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not list classes' },
    })
  }
}

export async function createClass(
  request: FastifyRequest,
  reply: FastifyReply,
  scheduleService: ScheduleService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  const parseResult = createClassSchema.safeParse(request.body)
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
    const result = await scheduleService.createClass(user.id, parseResult.data)
    return reply.code(201).send({ data: result, error: null })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return reply.code(403).send({
        data: null,
        error: { code: 'FORBIDDEN', message: error.message },
      })
    }

    if (error instanceof InvalidInstructorError) {
      return reply.code(400).send({
        data: null,
        error: { code: 'invalid_instructor', message: error.message },
      })
    }

    request.log.error({ err: error }, 'Failed to create class')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not create class' },
    })
  }
}

export async function updateClass(
  request: FastifyRequest,
  reply: FastifyReply,
  scheduleService: ScheduleService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  const { classId } = request.params as { classId: string }

  const parseResult = updateClassSchema.safeParse(request.body)
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
    const result = await scheduleService.updateClass(user.id, classId, parseResult.data)
    return reply.send({ data: result, error: null })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return reply.code(403).send({
        data: null,
        error: { code: 'FORBIDDEN', message: error.message },
      })
    }

    if (error instanceof ClassNotFoundError) {
      return reply.code(404).send({
        data: null,
        error: { code: 'NOT_FOUND', message: 'Class not found' },
      })
    }

    if (error instanceof InvalidInstructorError) {
      return reply.code(400).send({
        data: null,
        error: { code: 'invalid_instructor', message: error.message },
      })
    }

    request.log.error({ err: error }, 'Failed to update class')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not update class' },
    })
  }
}

export async function deactivateClass(
  request: FastifyRequest,
  reply: FastifyReply,
  scheduleService: ScheduleService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  const { classId } = request.params as { classId: string }

  try {
    const result = await scheduleService.deactivateClass(user.id, classId)
    return reply.send({ data: result, error: null })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return reply.code(403).send({
        data: null,
        error: { code: 'FORBIDDEN', message: error.message },
      })
    }

    if (error instanceof ClassNotFoundError) {
      return reply.code(404).send({
        data: null,
        error: { code: 'NOT_FOUND', message: 'Class not found' },
      })
    }

    request.log.error({ err: error }, 'Failed to deactivate class')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not deactivate class' },
    })
  }
}
