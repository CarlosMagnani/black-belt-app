import type { User } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export type SyncUserInput = {
  id: string
  email: string
  fullName: string
}

export interface UserRepository {
  sync(input: SyncUserInput): Promise<User>
}

export class PrismaUserRepository implements UserRepository {
  sync(input: SyncUserInput) {
    return prisma.user.upsert({
      where: { id: input.id },
      create: input,
      update: { email: input.email },
    })
  }
}
