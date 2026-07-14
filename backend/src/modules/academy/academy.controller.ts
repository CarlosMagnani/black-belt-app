import type { FastifyReply, FastifyRequest } from 'fastify'
import type { AcademyService } from './academy.service'
import { AcademyAlreadyExistsError } from './academy.service'
import type { Belt } from '@prisma/client'

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function createOwnerAcademy(
  request: FastifyRequest,
  reply: FastifyReply,
  academyService: AcademyService
) {
  const user = request.authenticatedUser
  if (!user) {
    return reply.code(401).send({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    })
  }

  if (request.userOnboardingRole !== 'owner') {
    return reply.code(403).send({
      data: null,
      error: { code: 'FORBIDDEN', message: 'Only owners can create academies' },
    })
  }

  const parts = request.parts()
  let academyName: string | undefined
  let academyCity: string | undefined
  let ownerBelt: Belt | undefined
  let ownerDegree: number | undefined
  let logo: { content: Uint8Array; contentType: string } | null = null
  let photo: { content: Uint8Array; contentType: string } | null = null

  for await (const part of parts) {
    if (part.type === 'file') {
      const buffer = await part.toBuffer()
      
      if (buffer.length > MAX_FILE_SIZE) {
        return reply.code(400).send({
          data: null,
          error: { code: 'FILE_TOO_LARGE', message: `${part.fieldname} exceeds 5MB limit` },
        })
      }

      if (!ALLOWED_CONTENT_TYPES.includes(part.mimetype)) {
        return reply.code(400).send({
          data: null,
          error: { code: 'INVALID_FILE_TYPE', message: `${part.fieldname} must be JPEG, PNG, or WebP` },
        })
      }

      const fileData = { content: new Uint8Array(buffer), contentType: part.mimetype }
      
      if (part.fieldname === 'logo') {
        logo = fileData
      } else if (part.fieldname === 'photo') {
        photo = fileData
      }
    } else {
      if (part.fieldname === 'academyName') {
        academyName = String(part.value)
      } else if (part.fieldname === 'academyCity') {
        academyCity = String(part.value)
      } else if (part.fieldname === 'ownerBelt') {
        ownerBelt = String(part.value) as Belt
      } else if (part.fieldname === 'ownerDegree') {
        ownerDegree = parseInt(String(part.value), 10)
      }
    }
  }

  if (!academyName || !academyCity || !ownerBelt || ownerDegree === undefined) {
    return reply.code(400).send({
      data: null,
      error: { code: 'MISSING_FIELDS', message: 'academyName, academyCity, ownerBelt, and ownerDegree are required' },
    })
  }

  const validBelts: Belt[] = ['white', 'blue', 'purple', 'brown', 'black', 'coral', 'red']
  if (!validBelts.includes(ownerBelt)) {
    return reply.code(400).send({
      data: null,
      error: { code: 'INVALID_BELT', message: 'ownerBelt must be a valid belt' },
    })
  }

  if (ownerDegree < 0 || ownerDegree > 4) {
    return reply.code(400).send({
      data: null,
      error: { code: 'INVALID_DEGREE', message: 'ownerDegree must be between 0 and 4' },
    })
  }

  try {
    const result = await academyService.createOwnerAcademy({
      userId: user.id,
      academyName,
      academyCity,
      ownerBelt,
      ownerDegree,
      logo,
      photo,
    })

    return reply.code(201).send({
      data: result,
      error: null,
    })
  } catch (error) {
    if (error instanceof AcademyAlreadyExistsError) {
      return reply.code(409).send({
        data: null,
        error: { code: 'ACADEMY_EXISTS', message: 'You already own an academy' },
      })
    }
    
    request.log.error({ err: error }, 'Failed to create academy')
    return reply.code(500).send({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Could not create academy' },
    })
  }
}
