import type { Academy, AcademyMember, Belt, User } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export type CreateStudentOnboardingInput = {
  academyId: string
  avatarUrl: string | null
  belt: Belt
  degree: number
  nickname: string
  userId: string
}

export type CreateStudentOnboardingResult = {
  academy: Academy
  student: User
}

export interface MembershipRepository {
  createStudentOnboarding(input: CreateStudentOnboardingInput): Promise<CreateStudentOnboardingResult>
  findAcademyByInviteCode(inviteCode: string): Promise<Academy | null>
  findMemberByUserId(userId: string): Promise<AcademyMember | null>
}

export class PrismaMembershipRepository implements MembershipRepository {
  async createStudentOnboarding(input: CreateStudentOnboardingInput): Promise<CreateStudentOnboardingResult> {
    return prisma.$transaction(async (tx) => {
      const member = await tx.academyMember.create({
        data: {
          academyId: input.academyId,
          userId: input.userId,
          role: 'student',
          status: 'active',
        },
      })

      await tx.studentBelt.create({
        data: {
          academyMemberId: member.id,
          belt: input.belt,
          degree: input.degree,
          approvedClassesAtLevel: 0,
          changedBy: input.userId,
        },
      })

      const student = await tx.user.update({
        where: { id: input.userId },
        data: {
          nickname: input.nickname,
          belt: input.belt,
          degree: input.degree,
          avatarUrl: input.avatarUrl,
        },
      })

      const academy = await tx.academy.findUniqueOrThrow({
        where: { id: input.academyId },
      })

      return { academy, student }
    })
  }

  async findAcademyByInviteCode(inviteCode: string): Promise<Academy | null> {
    return prisma.academy.findUnique({
      where: { inviteCode },
    })
  }

  async findMemberByUserId(userId: string): Promise<AcademyMember | null> {
    return prisma.academyMember.findFirst({
      where: { userId },
    })
  }
}
