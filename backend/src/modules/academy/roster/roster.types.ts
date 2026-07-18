import { z } from 'zod'
import type { ActivityAction } from '@prisma/client'

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const updateMemberRoleSchema = z.object({
  role: z.enum(['professor', 'student']),
})

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>

// ─── Response Types ─────────────────────────────────────────────────────────

export type MemberSummary = {
  id: string
  userId: string
  fullName: string
  nickname: string | null
  avatarUrl: string | null
  role: 'owner' | 'professor' | 'student'
  status: 'active' | 'inactive' | 'suspended'
  joinedAt: string
  currentBelt: { belt: string; degree: number } | null
}

export type AcademyData = {
  id: string
  name: string
  city: string
  inviteCode: string
  logoUrl: string | null
}

export type RosterResponse = {
  academy: AcademyData
  members: MemberSummary[]
}

export type RoleChangeResponse = {
  member: MemberSummary
  activityEventId: string
}

// ─── Repository Interface ───────────────────────────────────────────────────

export type OwnedAcademy = {
  academyId: string
  academy: AcademyData
}

export type RosterMemberRecord = {
  id: string
  userId: string
  fullName: string
  nickname: string | null
  avatarUrl: string | null
  role: 'owner' | 'professor' | 'student'
  status: 'active' | 'inactive' | 'suspended'
  joinedAt: Date
  currentBelt: { belt: string; degree: number } | null
}

export type UpdateRoleResult = {
  member: RosterMemberRecord
  activityEventId: string
}

export interface RosterRepository {
  findOwnedAcademy(userId: string): Promise<OwnedAcademy | null>
  listMembers(academyId: string): Promise<RosterMemberRecord[]>
  findByAcademyAndMemberId(academyId: string, memberId: string): Promise<RosterMemberRecord | null>
  countActiveClassesForInstructor(instructorId: string): Promise<number>
  updateRole(
    academyId: string,
    memberId: string,
    actorId: string,
    newRole: 'professor' | 'student',
    action: ActivityAction
  ): Promise<UpdateRoleResult>
}
