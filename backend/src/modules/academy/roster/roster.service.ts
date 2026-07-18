import type { ActivityAction } from '@prisma/client'
import type { RosterRepository, RosterResponse, RoleChangeResponse, UpdateMemberRoleInput } from './roster.types'
import { isValidPromotion, isValidRevocation, canRevokeProfessor } from './roster.domain'
import {
  MemberNotFoundError,
  ForbiddenError,
  InvalidRoleTransitionError,
  ProfessorTeachesActiveClassError,
} from './roster.errors'

export interface RosterService {
  getMembers(userId: string): Promise<RosterResponse>
  updateMemberRole(
    userId: string,
    memberId: string,
    input: UpdateMemberRoleInput
  ): Promise<RoleChangeResponse>
}

export class DefaultRosterService implements RosterService {
  constructor(private readonly rosterRepository: RosterRepository) {}

  async getMembers(userId: string): Promise<RosterResponse> {
    const ownedAcademy = await this.rosterRepository.findOwnedAcademy(userId)
    if (!ownedAcademy) {
      throw new ForbiddenError('You do not own an academy')
    }

    const members = await this.rosterRepository.listMembers(ownedAcademy.academyId)

    return {
      academy: ownedAcademy.academy,
      members: members.map((m) => ({
        ...m,
        joinedAt: m.joinedAt.toISOString(),
      })),
    }
  }

  async updateMemberRole(
    userId: string,
    memberId: string,
    input: UpdateMemberRoleInput
  ): Promise<RoleChangeResponse> {
    const ownedAcademy = await this.rosterRepository.findOwnedAcademy(userId)
    if (!ownedAcademy) {
      throw new ForbiddenError('You do not own an academy')
    }

    const targetMember = await this.rosterRepository.findByAcademyAndMemberId(
      ownedAcademy.academyId,
      memberId
    )

    if (!targetMember) {
      throw new MemberNotFoundError()
    }

    // Prevent self-demotion
    if (targetMember.userId === userId) {
      throw new InvalidRoleTransitionError('Cannot change your own role')
    }

    const { role: currentRole } = targetMember
    const { role: newRole } = input

    if (currentRole === newRole) {
      throw new InvalidRoleTransitionError(
        `Member is already a ${currentRole}`
      )
    }

    // Determine the type of transition and validate
    let action: ActivityAction

    if (newRole === 'professor') {
      if (!isValidPromotion(currentRole, newRole)) {
        throw new InvalidRoleTransitionError(
          `Cannot promote a ${currentRole} to professor`
        )
      }
      action = 'professor_promoted' as ActivityAction
    } else {
      // newRole === 'student' (revocation)
      if (!isValidRevocation(currentRole, newRole)) {
        throw new InvalidRoleTransitionError(
          `Cannot change a ${currentRole} to student`
        )
      }

      // Check if professor has active classes
      const activeClassCount = await this.rosterRepository.countActiveClassesForInstructor(
        targetMember.userId,
        ownedAcademy.academyId
      )

      if (!canRevokeProfessor(activeClassCount)) {
        throw new ProfessorTeachesActiveClassError()
      }

      action = 'professor_revoked' as ActivityAction
    }

    const result = await this.rosterRepository.updateRole(
      ownedAcademy.academyId,
      memberId,
      userId,
      newRole,
      action
    )

    return {
      member: {
        ...result.member,
        joinedAt: result.member.joinedAt.toISOString(),
      },
      activityEventId: result.activityEventId,
    }
  }
}
