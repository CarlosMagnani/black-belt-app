import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AuthService } from './auth.service'
import type { SupabaseJwtPayload } from './auth.types'

export function createAuthenticate(authService: AuthService) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    let payload: SupabaseJwtPayload

    try {
      payload = await request.jwtVerify<SupabaseJwtPayload>({
        requiredClaims: ['sub', 'email', 'role'],
      })

      if (payload.role !== 'authenticated' || !payload.sub || !payload.email) {
        throw new Error('Invalid authenticated user claims')
      }
    } catch {
      request.log.warn({ event: 'auth_failed' }, 'Authentication failed')
      return reply.code(401).send({
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired access token' },
      })
    }

    try {
      const user = await authService.syncAuthenticatedUser(payload)
      request.authenticatedUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      }
    } catch (error) {
      request.log.error(
        { err: error, event: 'auth_user_sync_failed', userId: payload.sub },
        'Could not sync authenticated user',
      )
      return reply.code(500).send({
        data: null,
        error: { code: 'INTERNAL_ERROR', message: 'Could not load your account' },
      })
    }
  }
}
