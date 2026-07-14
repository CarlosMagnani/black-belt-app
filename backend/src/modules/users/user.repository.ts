import type { Belt, OnboardingRole, User } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export type SyncUserInput = {
  id: string
  email: string
  fullName: string
}

export type UpdateProfileInput = {
  belt: Belt
  degree: number
  avatarUrl: string | null
}

export interface UserRepository {
  sync(input: SyncUserInput): Promise<User>
  setOnboardingRole(userId: string, role: OnboardingRole): Promise<User>
  updateProfile(userId: string, input: UpdateProfileInput): Promise<User>
}

export class PrismaUserRepository implements UserRepository {
  sync(input: SyncUserInput) {
    return prisma.user.upsert({
      where: { id: input.id },
      create: input,
      update: { email: input.email },
    })
  }

  setOnboardingRole(userId: string, role: OnboardingRole) {
    return prisma.user.update({
      where: { id: userId },
      data: { onboardingRole: role },
    })
  }

  updateProfile(userId: string, input: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data: input,
    })
  }
}
