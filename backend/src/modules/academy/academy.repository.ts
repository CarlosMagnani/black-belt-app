import type { Academy, AcademyMember, Role } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export type CreateAcademyInput = {
  name: string
  city: string
  logoUrl: string | null
  inviteCode: string
  ownerId: string
}

export type CreateAcademyMemberInput = {
  academyId: string
  userId: string
  role: Role
}

export interface AcademyRepository {
  create(input: CreateAcademyInput): Promise<Academy>
  createMember(input: CreateAcademyMemberInput): Promise<AcademyMember>
  findByOwnerId(ownerId: string): Promise<Academy | null>
  updateLogoUrl(academyId: string, logoUrl: string | null): Promise<Academy>
}

export class PrismaAcademyRepository implements AcademyRepository {
  async create(input: CreateAcademyInput): Promise<Academy> {
    return prisma.academy.create({
      data: input,
    })
  }

  async createMember(input: CreateAcademyMemberInput): Promise<AcademyMember> {
    return prisma.academyMember.create({
      data: input,
    })
  }

  async findByOwnerId(ownerId: string): Promise<Academy | null> {
    return prisma.academy.findUnique({
      where: { ownerId },
    })
  }

  async updateLogoUrl(academyId: string, logoUrl: string | null): Promise<Academy> {
    return prisma.academy.update({
      where: { id: academyId },
      data: { logoUrl },
    })
  }
}
