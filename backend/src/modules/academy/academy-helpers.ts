import { prisma } from '../../lib/prisma'

/**
 * A minimal representation of an academy owned by a user.
 * Used by route-level middleware to short-circuit unauthorized requests
 * before they reach the service layer (defense in depth).
 */
export type ResolvedAcademy = {
  academyId: string
}

/**
 * Looks up the academy that the given user owns.
 * Returns null if the user is not an owner of any academy.
 */
export async function resolveOwnedAcademy(userId: string): Promise<ResolvedAcademy | null> {
  const member = await prisma.academyMember.findFirst({
    where: { userId, role: 'owner' },
    select: { academyId: true },
  })
  if (!member) return null
  return { academyId: member.academyId }
}

declare module 'fastify' {
  interface FastifyRequest {
    academy?: ResolvedAcademy
  }
}
