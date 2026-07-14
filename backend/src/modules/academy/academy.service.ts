import { randomBytes } from 'crypto'
import type { Belt, User } from '@prisma/client'
import type { AcademyRepository } from './academy.repository'
import type { UserRepository } from '../users/user.repository'
import type { ObjectStorage } from '../storage/object-storage'
import { ObjectStorageError } from '../storage/object-storage'
import { prisma } from '../../lib/prisma'

export type CreateOwnerAcademyInput = {
  userId: string
  academyName: string
  academyCity: string
  ownerNickname: string
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
    nickname: string | null
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

    let logoUrl: string | null = null
    let avatarUrl: string | null = null

    if (input.logo) {
      try {
        const logoKey = `academies/${input.userId}/logo`
        await this.objectStorage.store({
          key: logoKey,
          content: input.logo.content,
          contentType: input.logo.contentType as any,
        })
        logoUrl = logoKey
      } catch (error) {
        if (error instanceof ObjectStorageError) {
          throw new MediaUploadError('logo')
        }
        throw error
      }
    }

    if (input.photo) {
      try {
        const photoKey = `users/${input.userId}/avatar`
        await this.objectStorage.store({
          key: photoKey,
          content: input.photo.content,
          contentType: input.photo.contentType as any,
        })
        avatarUrl = photoKey
      } catch (error) {
        if (error instanceof ObjectStorageError) {
          if (logoUrl) {
            await this.safeDeleteObject(logoUrl)
          }
          throw new MediaUploadError('photo')
        }
        throw error
      }
    }

    const inviteCode = this.generateInviteCode()

    try {
      const result = await prisma.$transaction(async (tx) => {
        const academy = await tx.academy.create({
          data: {
            name: input.academyName,
            city: input.academyCity,
            logoUrl,
            inviteCode,
            ownerId: input.userId,
          },
        })

        await tx.academyMember.create({
          data: {
            academyId: academy.id,
            userId: input.userId,
            role: 'owner',
          },
        })

        const owner = await tx.user.update({
          where: { id: input.userId },
          data: {
            nickname: input.ownerNickname,
            belt: input.ownerBelt,
            degree: input.ownerDegree,
            avatarUrl,
          },
        })

        return { academy, owner }
      })

      return {
        academy: {
          id: result.academy.id,
          name: result.academy.name,
          city: result.academy.city,
          logoUrl: result.academy.logoUrl,
          inviteCode: result.academy.inviteCode,
        },
        owner: {
          id: result.owner.id,
          fullName: result.owner.fullName,
          nickname: result.owner.nickname,
          avatarUrl: result.owner.avatarUrl,
          belt: result.owner.belt,
          degree: result.owner.degree,
        },
      }
    } catch (error) {
      if (logoUrl) {
        await this.safeDeleteObject(logoUrl)
      }
      if (avatarUrl) {
        await this.safeDeleteObject(avatarUrl)
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

export class MediaUploadError extends Error {
  constructor(public readonly field: string) {
    super(`Could not upload ${field}`)
    this.name = 'MediaUploadError'
  }
}
