import { Prisma } from '@prisma/client'
import type { Academy, AcademyMember, Belt, StudentBelt, User } from '@prisma/client'
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
  member: AcademyMember
  student: User
  studentBelt: StudentBelt
}

export type StudentMembershipRecord = {
  academy: Academy
  member: AcademyMember
  student: User
  studentBelt: StudentBelt
}

export interface MembershipRepository {
  createStudentOnboarding(input: CreateStudentOnboardingInput): Promise<CreateStudentOnboardingResult>
  findAcademyByInviteCode(inviteCode: string): Promise<Academy | null>
  findMemberByUserId(userId: string): Promise<AcademyMember | null>
  findStudentMembershipByUserId(userId: string): Promise<StudentMembershipRecord | null>
}

export class StudentMembershipConflictError extends Error {
  constructor() {
    super('Student already has an academy membership')
    this.name = 'StudentMembershipConflictError'
  }
}

export class PrismaMembershipRepository implements MembershipRepository {
  async createStudentOnboarding(input: CreateStudentOnboardingInput): Promise<CreateStudentOnboardingResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        const member = await tx.academyMember.create({
          data: {
            academyId: input.academyId,
            userId: input.userId,
            role: 'student',
            status: 'active',
          },
        })

        const studentBelt = await tx.studentBelt.create({
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
            avatarUrl: input.avatarUrl,
          },
        })

        const academy = await tx.academy.findUniqueOrThrow({
          where: { id: input.academyId },
        })

        return { academy, member, student, studentBelt }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new StudentMembershipConflictError()
      }
      throw error
    }
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

  async findStudentMembershipByUserId(userId: string): Promise<StudentMembershipRecord | null> {
    const result = await prisma.academyMember.findFirst({
      where: { userId, role: 'student' },
      include: {
        academy: true,
        user: true,
        studentBelt: true,
      },
    })

    if (!result?.studentBelt) {
      return null
    }

    const { academy, studentBelt, user: student, ...member } = result
    return { academy, member, student, studentBelt }
  }
}
