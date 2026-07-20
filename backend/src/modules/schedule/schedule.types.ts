import { z } from 'zod'

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const createClassSchema = z.object({
  title: z.string().trim().min(1).max(100),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:mm format (24h)',
  }),
  durationMinutes: z.number().int().min(15).max(240),
  location: z.string().trim().max(100).optional(),
  level: z.enum(['todas', 'iniciante', 'intermediario', 'avancado']).optional(),
  instructorId: z.string().uuid(),
})

export type CreateClassInput = z.infer<typeof createClassSchema>

export const updateClassSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
      message: 'startTime must be in HH:mm format (24h)',
    })
    .optional(),
  durationMinutes: z.number().int().min(15).max(240).optional(),
  location: z.string().trim().max(100).optional(),
  level: z.enum(['todas', 'iniciante', 'intermediario', 'avancado']).optional(),
  instructorId: z.string().uuid().optional(),
})

export type UpdateClassInput = z.infer<typeof updateClassSchema>

// ─── Response Types ─────────────────────────────────────────────────────────

export type InstructorSummary = {
  id: string
  fullName: string
  nickname: string | null
  avatarUrl: string | null
}

export type ClassSummary = {
  id: string
  title: string
  dayOfWeek: number
  startTime: string
  durationMinutes: number
  location: string | null
  level: 'todas' | 'iniciante' | 'intermediario' | 'avancado' | null
  isActive: boolean
  instructor: InstructorSummary
  createdAt: string
  updatedAt: string
}

export type CreateClassResponse = {
  class: ClassSummary
  activityEventId: string
}

export type UpdateClassResponse = {
  class: ClassSummary
  activityEventId: string
}

export type DeactivateClassResponse = {
  class: ClassSummary
  activityEventId: string | null
}

// ─── Repository Interface ───────────────────────────────────────────────────

export type ClassRecord = {
  id: string
  academyId: string
  title: string
  dayOfWeek: number
  startTime: string
  durationMinutes: number
  location: string | null
  level: string | null
  instructorId: string
  isActive: boolean
  instructor: {
    id: string
    fullName: string
    nickname: string | null
    avatarUrl: string | null
  }
  createdAt: Date
  updatedAt: Date
}

export type CreateClassResult = {
  class: ClassRecord
  activityEventId: string
}

export type UpdateClassResult = {
  class: ClassRecord
  activityEventId: string
}

export type DeactivateClassResult = {
  class: ClassRecord
  activityEventId: string | null
}

export type MemberAcademy = {
  academyId: string
}

export type InstructorMember = {
  id: string
  userId: string
  role: string
  status: string
} | null

export interface ScheduleRepository {
  findMemberAcademy(userId: string): Promise<MemberAcademy | null>
  findMemberAcademyByRole(userId: string, role: string): Promise<MemberAcademy | null>
  findMemberByUserAndAcademy(userId: string, academyId: string): Promise<InstructorMember>
  listByAcademy(
    academyId: string,
    includeInactive: boolean
  ): Promise<ClassRecord[]>
  findByAcademyAndClassId(
    academyId: string,
    classId: string
  ): Promise<ClassRecord | null>
  create(
    academyId: string,
    actorId: string,
    input: CreateClassInput
  ): Promise<CreateClassResult>
  update(
    academyId: string,
    classId: string,
    actorId: string,
    input: UpdateClassInput
  ): Promise<UpdateClassResult>
  deactivate(
    academyId: string,
    classId: string,
    actorId: string
  ): Promise<DeactivateClassResult>
}
