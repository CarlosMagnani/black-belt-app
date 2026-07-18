import type { ActivityAction } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import type {
  RosterRepository,
  OwnedAcademy,
  RosterMemberRecord,
  UpdateRoleResult,
} from './roster.types'

export class PrismaRosterRepository implements RosterRepository {
  async findOwnedAcademy(userId: string): Promise<OwnedAcademy | null> {
    const member = await prisma.academyMember.findFirst({
      where: { userId, role: 'owner' },
      include: {
        academy: {
          select: {
            id: true,
            name: true,
            city: true,
            inviteCode: true,
            logoUrl: true,
          },
        },
      },
    })

    if (!member) return null

    return {
      academyId: member.academy.id,
      academy: member.academy,
    }
  }

  async listMembers(academyId: string): Promise<RosterMemberRecord[]> {
    const members = await prisma.academyMember.findMany({
      where: { academyId },
      include: {
        user: {
          select: {
            fullName: true,
            nickname: true,
            avatarUrl: true,
          },
        },
        studentBelt: {
          select: {
            belt: true,
            degree: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    })

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      fullName: m.user.fullName,
      nickname: m.user.nickname,
      avatarUrl: m.user.avatarUrl,
      role: m.role as 'owner' | 'professor' | 'student',
      status: m.status as 'active' | 'inactive' | 'suspended',
      joinedAt: m.joinedAt,
      currentBelt: m.studentBelt
        ? { belt: m.studentBelt.belt, degree: m.studentBelt.degree }
        : null,
    }))
  }

  async findByAcademyAndMemberId(
    academyId: string,
    memberId: string
  ): Promise<RosterMemberRecord | null> {
    const member = await prisma.academyMember.findFirst({
      where: { id: memberId, academyId },
      include: {
        user: {
          select: {
            fullName: true,
            nickname: true,
            avatarUrl: true,
          },
        },
        studentBelt: {
          select: {
            belt: true,
            degree: true,
          },
        },
      },
    })

    if (!member) return null

    return {
      id: member.id,
      userId: member.userId,
      fullName: member.user.fullName,
      nickname: member.user.nickname,
      avatarUrl: member.user.avatarUrl,
      role: member.role as 'owner' | 'professor' | 'student',
      status: member.status as 'active' | 'inactive' | 'suspended',
      joinedAt: member.joinedAt,
      currentBelt: member.studentBelt
        ? { belt: member.studentBelt.belt, degree: member.studentBelt.degree }
        : null,
    }
  }

  async countActiveClassesForInstructor(instructorId: string): Promise<number> {
    return prisma.classSchedule.count({
      where: { instructorId, isActive: true },
    })
  }

  async updateRole(
    academyId: string,
    memberId: string,
    actorId: string,
    newRole: 'professor' | 'student',
    action: ActivityAction
  ): Promise<UpdateRoleResult> {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.academyMember.update({
        where: { id: memberId },
        data: { role: newRole },
      })

      const event = await tx.activityEvent.create({
        data: {
          academyId,
          actorId,
          action,
          subjectMemberId: memberId,
        },
      })

      // Fetch the full member record to return
      const member = await tx.academyMember.findUniqueOrThrow({
        where: { id: memberId },
        include: {
          user: {
            select: {
              fullName: true,
              nickname: true,
              avatarUrl: true,
            },
          },
          studentBelt: {
            select: {
              belt: true,
              degree: true,
            },
          },
        },
      })

      return {
        member: {
          id: member.id,
          userId: member.userId,
          fullName: member.user.fullName,
          nickname: member.user.nickname,
          avatarUrl: member.user.avatarUrl,
          role: member.role as 'owner' | 'professor' | 'student',
          status: member.status as 'active' | 'inactive' | 'suspended',
          joinedAt: member.joinedAt,
          currentBelt: member.studentBelt
            ? { belt: member.studentBelt.belt, degree: member.studentBelt.degree }
            : null,
        },
        activityEventId: event.id,
      }
    })
  }
}
