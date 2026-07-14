import { randomBytes } from 'crypto'
import type { Belt, User } from '@prisma/client'
import type { AcademyRepository } from './academy.repository'
import type { UserRepository } from '../users/user.repository'
import type { ObjectStorage } from '../storage/object-storage'

export type CreateOwnerAcademyInput = {
  userId: string
  academyName: string
  academyCity: string
  ownerBelt: Belt
  ownerDegree: number
  logo?: { content: Uint8Array; contentType: string } | null
  photo?: { content: Uint8Array; contentType: string } | null
}

export type OwnerOnboardingResult = {
  academy: {
    id: string
    name: string
    city: string
    logoUrl: string | null
    inviteCode: string
  }
  owner: {
    id: string
    fullName: string
    avatarUrl: string | null
    belt: Belt | null
    degree: number
  }
}

export interface AcademyService {
  createOwnerAcademy(input: CreateOwnerAcademyInput): Promise<OwnerOnboardingResult>
}

export class DefaultAcademyService implements AcademyService {
  constructor(
    private readonly academyRepository: AcademyRepository,
    private readonly userRepository: UserRepository,
    private readonly objectStorage: ObjectStorage
  ) {}

  async createOwnerAcademy(input: CreateOwnerAcademyInput): Promise<OwnerOnboardingResult> {
    const existingAcademy = await this.academyRepository.findByOwnerId(input.userId)
    if (existingAcademy) {
      throw new AcademyAlreadyExistsError()
    }

    const inviteCode = this.generateInviteCode()
    const academyId = crypto.randomUUID()
    const memberTransaction = await this.createAcademyAndMember(
      academyId,
      input,
      inviteCode
    )

    let logoUrl: string | null = null
    let avatarUrl: string | null = null

    if (input.logo) {
      const logoKey = `academies/${memberTransaction.academyId}/logo`
      await this.objectStorage.store({
        key: logoKey,
        content: input.logo.content,
        contentType: input.logo.contentType as any,
      })
      logoUrl = logoKey
    }

    if (input.photo) {
      const photoKey = `users/${input.userId}/avatar`
      await this.objectStorage.store({
        key: photoKey,
        content: input.photo.content,
        contentType: input.photo.contentType as any,
      })
      avatarUrl = photoKey
    }

    const academy = await this.updateAcademyLogo(memberTransaction.academyId, logoUrl)
    const owner = await this.updateOwnerProfile(
      input.userId,
      input.ownerBelt,
      input.ownerDegree,
      avatarUrl
    )

    return {
      academy: {
        id: academy.id,
        name: academy.name,
        city: academy.city,
        logoUrl: academy.logoUrl,
        inviteCode: academy.inviteCode,
      },
      owner: {
        id: owner.id,
        fullName: owner.fullName,
        avatarUrl: owner.avatarUrl,
        belt: owner.belt,
        degree: owner.degree,
      },
    }
  }

  private async createAcademyAndMember(
    academyId: string,
    input: CreateOwnerAcademyInput,
    inviteCode: string
  ) {
    const academy = await this.academyRepository.create({
      name: input.academyName,
      city: input.academyCity,
      logoUrl: null,
      inviteCode,
      ownerId: input.userId,
    })

    const member = await this.academyRepository.createMember({
      academyId: academy.id,
      userId: input.userId,
      role: 'owner',
    })

    return { academyId: academy.id, memberId: member.id }
  }

  private async updateAcademyLogo(academyId: string, logoUrl: string | null) {
    return this.academyRepository.updateLogoUrl(academyId, logoUrl)
  }

  private async updateOwnerProfile(
    userId: string,
    belt: Belt,
    degree: number,
    avatarUrl: string | null
  ): Promise<User> {
    return this.userRepository.updateProfile(userId, { belt, degree, avatarUrl })
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 6
    const bytes = randomBytes(length)
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars[bytes[i] % chars.length]
    }
    return `BB-${code}`
  }
}

export class AcademyAlreadyExistsError extends Error {
  constructor() {
    super('User already owns an academy')
    this.name = 'AcademyAlreadyExistsError'
  }
}
