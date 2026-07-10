import type { FastifyReply, FastifyRequest } from 'fastify'

export async function getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
  return reply.send({
    data: { user: request.authenticatedUser! },
    error: null,
  })
}
