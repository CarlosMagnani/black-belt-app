import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTVerifyGetKey,
} from 'jose'
import type { AccessTokenVerifier, SupabaseJwtPayload } from './auth.types'

export function createSupabaseTokenVerifier(
  supabaseUrl: string,
  keySet?: JWTVerifyGetKey,
): AccessTokenVerifier {
  const issuer = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`
  const jwks = keySet ?? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`), {
    cacheMaxAge: 600_000,
    cooldownDuration: 30_000,
    timeoutDuration: 5_000,
  })

  return async function verifyAccessToken(token: string) {
    const { payload } = await jwtVerify(token, jwks, {
      algorithms: ['ES256'],
      audience: 'authenticated',
      issuer,
      requiredClaims: ['sub', 'email', 'role', 'exp'],
    })

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      payload.role !== 'authenticated'
    ) {
      throw new Error('Invalid authenticated user claims')
    }

    return payload as SupabaseJwtPayload
  }
}
