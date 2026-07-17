import type { Belt } from '@prisma/client'
import type { MembershipRepository } from './membership.repository'
import { StudentMembershipConflictError } from './membership.repository'
import type { MediaContentType, ObjectStorage } from '../storage/object-storage'
import { ObjectStorageError } from '../storage/object-storage'

export type JoinAcademyInput = {
  userId: string
  inviteCode: string
  nickname: string
  belt: Belt
  degree: number
  photo?: { content: Uint8Array; contentType: MediaContentType } | null
}

export type StudentOnboardingResult = {
  academy: {
    id: string
    name: string
    city: string
  }
  membership: {
    id: string
    joinedAt: Date
    status: string
  }
  student: {
    id: string
    fullName: string
    nickname: string | null
    avatarUrl: string | null
  }
  studentBelt: {
    approvedClassesAtLevel: number
    belt: Belt
    degree: number
  }
}

export interface MembershipService {
  getStudentMembership(userId: string): Promise<StudentOnboardingResult | null>
  joinAcademy(input: JoinAcademyInput): Promise<StudentOnboardingResult>
  verifyInviteCode(inviteCode: string): Promise<StudentOnboardingResult['academy']>
}

export class DefaultMembershipService implements MembershipService {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly objectStorage: ObjectStorage
  ) {}

  async verifyInviteCode(inviteCode: string): Promise<StudentOnboardingResult['academy']> {
    const academy = await this.membershipRepository.findAcademyByInviteCode(normalizeInviteCode(inviteCode))
    if (!academy) {
      throw new InvalidInviteCodeError()
    }

    return { id: academy.id, name: academy.name, city: academy.city }
  }

  async getStudentMembership(userId: string): Promise<StudentOnboardingResult | null> {
    const result = await this.membershipRepository.findStudentMembershipByUserId(userId)
    if (!result) {
      return null
    }

    return {
      academy: {
        id: result.academy.id,
        name: result.academy.name,
        city: result.academy.city,
      },
      membership: {
        id: result.member.id,
        joinedAt: result.member.joinedAt,
        status: result.member.status,
      },
      student: {
        id: result.student.id,
        fullName: result.student.fullName,
        nickname: result.student.nickname,
        avatarUrl: result.student.avatarUrl,
      },
      studentBelt: {
        approvedClassesAtLevel: result.studentBelt.approvedClassesAtLevel,
        belt: result.studentBelt.belt,
        degree: result.studentBelt.degree,
      },
    }
  }

  async joinAcademy(input: JoinAcademyInput): Promise<StudentOnboardingResult> {
    const academy = await this.membershipRepository.findAcademyByInviteCode(normalizeInviteCode(input.inviteCode))
    if (!academy) {
      throw new InvalidInviteCodeError()
    }

    const existingMember = await this.membershipRepository.findMemberByUserId(input.userId)
    if (existingMember) {
      throw new AlreadyMemberError()
    }

    let avatarUrl: string | null = null

    if (input.photo) {
      try {
        const photoKey = `users/${input.userId}/avatar`
        await this.objectStorage.store({
          key: photoKey,
          content: input.photo.content,
          contentType: input.photo.contentType,
        })
        avatarUrl = photoKey
      } catch (error) {
        if (error instanceof ObjectStorageError) {
          throw new MediaUploadError('photo')
        }
        throw error
      }
    }

    try {
      const result = await this.membershipRepository.createStudentOnboarding({
        academyId: academy.id,
        avatarUrl,
        belt: input.belt,
        degree: input.degree,
        nickname: input.nickname,
        userId: input.userId,
      })

      return {
        academy: {
          id: result.academy.id,
          name: result.academy.name,
          city: result.academy.city,
        },
        membership: {
          id: result.member.id,
          joinedAt: result.member.joinedAt,
          status: result.member.status,
        },
        student: {
          id: result.student.id,
          fullName: result.student.fullName,
          nickname: result.student.nickname,
          avatarUrl: result.student.avatarUrl,
        },
        studentBelt: {
          approvedClassesAtLevel: result.studentBelt.approvedClassesAtLevel,
          belt: result.studentBelt.belt,
          degree: result.studentBelt.degree,
        },
      }
    } catch (error) {
      if (avatarUrl) {
        await this.safeDeleteObject(avatarUrl)
      }
      if (error instanceof StudentMembershipConflictError) {
        throw new AlreadyMemberError()
      }
      throw error
    }
  }

  private async safeDeleteObject(key: string): Promise<void> {
    try {
      await this.objectStorage.delete(key)
    } catch {
      // best-effort cleanup; orphaned objects are preferable to a broken flow
    }
  }
}

function normalizeInviteCode(inviteCode: string) {
  return inviteCode.trim().toUpperCase()
}

export class InvalidInviteCodeError extends Error {
  constructor() {
    super('Invalid invite code')
    this.name = 'InvalidInviteCodeError'
  }
}

export class AlreadyMemberError extends Error {
  constructor() {
    super('User is already a member of an academy')
    this.name = 'AlreadyMemberError'
  }
}

export class MediaUploadError extends Error {
  constructor(public readonly field: string) {
    super(`Could not upload ${field}`)
    this.name = 'MediaUploadError'
  }
}
