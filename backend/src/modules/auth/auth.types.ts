export type SupabaseJwtPayload = {
  sub: string
  email: string
  role: string
  aud: string | string[]
  iss: string
  exp: number
  user_metadata?: {
    full_name?: unknown
  }
}

export type AuthenticatedUser = {
  id: string
  email: string
  fullName: string
}

declare module 'fastify' {
  interface FastifyRequest {
    authenticatedUser?: AuthenticatedUser
  }
}
