import type { Academy, Belt, User } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export type CreateOwnerOnboardingInput = {
  academyCity: string
  academyName: string
  avatarUrl: string | null
  inviteCode: string
  logoUrl: string | null
  ownerBelt: Belt
  ownerDegree: number
  ownerId: string
  ownerNickname: string
}

export type CreateOwnerOnboardingResult = {
  academy: Academy
  owner: User
}

export interface AcademyRepository {
  createOwnerOnboarding(input: CreateOwnerOnboardingInput): Promise<CreateOwnerOnboardingResult>
  findByOwnerId(ownerId: string): Promise<Academy | null>
}

export class PrismaAcademyRepository implements AcademyRepository {
  async createOwnerOnboarding(input: CreateOwnerOnboardingInput): Promise<CreateOwnerOnboardingResult> {
    return prisma.$transaction(async (tx) => {
      const academy = await tx.academy.create({
        data: {
          name: input.academyName,
          city: input.academyCity,
          logoUrl: input.logoUrl,
          inviteCode: input.inviteCode,
          ownerId: input.ownerId,
        },
      })

      await tx.academyMember.create({
        data: {
          academyId: academy.id,
          userId: input.ownerId,
          role: 'owner',
        },
      })

      const owner = await tx.user.update({
        where: { id: input.ownerId },
        data: {
          nickname: input.ownerNickname,
          belt: input.ownerBelt,
          degree: input.ownerDegree,
          avatarUrl: input.avatarUrl,
        },
      })

      return { academy, owner }
    })
  }

  async findByOwnerId(ownerId: string): Promise<Academy | null> {
    return prisma.academy.findUnique({
      where: { ownerId },
    })
  }
}
