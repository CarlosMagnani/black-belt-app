import type { FastifyReply, FastifyRequest } from 'fastify'
import type { MembershipService } from './membership.service'
import { AlreadyMemberError, InvalidInviteCodeError, MediaUploadError } from './membership.service'
import type { Belt } from '@prisma/client'
import type { MediaContentType } from '../storage/object-storage'

const ALLOWED_CONTENT_TYPES: MediaContentType[] = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function joinAcademy(
  request: FastifyRequest,
  reply: FastifyReply,
  membershipService: MembershipService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  if (request.userOnboardingRole !== 'student') {
    return reply.code(403).send({
      data: null,
      error: { code: 'FORBIDDEN', message: 'Only students can join academies' },
    })
  }

  const parts = request.parts()
  let oversizedFileField: string | null = null
  let inviteCode: string | undefined
  let nickname: string | undefined
  let belt: Belt | undefined
  let degree: number | undefined
  let photo: { content: Uint8Array; contentType: MediaContentType } | null = null

  for await (const part of parts) {
    if (part.type === 'file') {
      const buffer = await part.toBuffer()
      
      if (part.file.truncated || buffer.length > MAX_FILE_SIZE) {
        oversizedFileField ??= part.fieldname
        continue
      }

      if (!isAllowedContentType(part.mimetype)) {
        return reply.code(400).send({
          data: null,
          error: { code: 'INVALID_FILE_TYPE', message: `${part.fieldname} must be JPEG, PNG, or WebP` },
        })
      }

      if (part.fieldname === 'photo') {
        photo = { content: new Uint8Array(buffer), contentType: part.mimetype }
      }
    } else {
      if (part.fieldname === 'inviteCode') {
        inviteCode = String(part.value)
      } else if (part.fieldname === 'nickname') {
        nickname = String(part.value)
      } else if (part.fieldname === 'belt') {
        belt = String(part.value) as Belt
      } else if (part.fieldname === 'degree') {
        degree = parseInt(String(part.value), 10)
      }
    }
  }

  if (oversizedFileField) {
    return reply.code(400).send({
      data: null,
      error: { code: 'FILE_TOO_LARGE', message: `${oversizedFileField} exceeds 5MB limit` },
    })
  }

  if (!inviteCode?.trim() || !nickname?.trim() || !belt || degree === undefined) {
    return reply.code(400).send({
      data: null,
      error: { code: 'MISSING_FIELDS', message: 'inviteCode, nickname, belt, and degree are required' },
    })
  }

  const validBelts: Belt[] = ['white', 'blue', 'purple', 'brown', 'black', 'coral', 'red']
  if (!validBelts.includes(belt)) {
    return reply.code(400).send({
      data: null,
      error: { code: 'INVALID_BELT', message: 'belt must be a valid belt' },
    })
  }

  if (!Number.isInteger(degree) || degree < 0 || degree > 4) {
    return reply.code(400).send({
      data: null,
      error: { code: 'INVALID_DEGREE', message: 'degree must be between 0 and 4' },
    })
  }

  try {
    const result = await membershipService.joinAcademy({
      userId: user.id,
      inviteCode: inviteCode.trim(),
      nickname: nickname.trim(),
      belt,
      degree,
      photo,
    })

    return reply.code(201).send({
      data: result,
      error: null,
    })
  } catch (error) {
    if (error instanceof InvalidInviteCodeError) {
      return reply.code(404).send({
        data: null,
        error: { code: 'INVALID_INVITE_CODE', message: 'Invalid invite code' },
      })
    }

    if (error instanceof AlreadyMemberError) {
      return reply.code(409).send({
        data: null,
        error: { code: 'ALREADY_MEMBER', message: 'You are already a member of an academy' },
      })
    }

    if (error instanceof MediaUploadError) {
      return reply.code(422).send({
        data: null,
        error: { code: 'MEDIA_UPLOAD_FAILED', message: `Could not upload ${error.field}. Please try again.` },
      })
    }
    
    request.log.error({ err: error }, 'Failed to join academy')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not join academy' },
    })
  }
}

function isAllowedContentType(contentType: string): contentType is MediaContentType {
  return ALLOWED_CONTENT_TYPES.includes(contentType as MediaContentType)
}
