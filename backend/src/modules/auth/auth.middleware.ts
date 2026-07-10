import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AuthService } from './auth.service'
import type { AccessTokenVerifier, SupabaseJwtPayload } from './auth.types'

export function createAuthenticate(authService: AuthService, verifyAccessToken: AccessTokenVerifier) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    let payload: SupabaseJwtPayload

    try {
      const token = getBearerToken(request.headers.authorization)
      payload = await verifyAccessToken(token)
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
      request.userOnboardingRole = user.onboardingRole
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

function getBearerToken(authorization: string | undefined) {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i)

  if (!match) {
    throw new Error('Missing bearer token')
  }

  return match[1]
}
