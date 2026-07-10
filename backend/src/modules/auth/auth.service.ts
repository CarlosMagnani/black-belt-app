import type { User } from '@prisma/client'
import type { UserRepository } from '../users/user.repository'
import type { SupabaseJwtPayload } from './auth.types'

export interface AuthService {
  syncAuthenticatedUser(payload: SupabaseJwtPayload): Promise<User>
}

export class DefaultAuthService implements AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  syncAuthenticatedUser(payload: SupabaseJwtPayload) {
    return this.userRepository.sync({
      id: payload.sub,
      email: payload.email,
      fullName: getFullName(payload),
    })
  }
}

function getFullName(payload: SupabaseJwtPayload) {
  const fullName = payload.user_metadata?.full_name

  if (typeof fullName === 'string' && fullName.trim().length > 0) {
    return fullName.trim()
  }

  return payload.email.split('@')[0]
}
