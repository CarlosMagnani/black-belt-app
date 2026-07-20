import { z } from 'zod'

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const createCheckInSchema = z.object({
  classScheduleId: z.string().uuid(),
})

export type CreateCheckInInput = z.infer<typeof createCheckInSchema>

// ─── Response Types ─────────────────────────────────────────────────────────

export type InstructorSummary = {
  id: string
  fullName: string
  nickname: string | null
  avatarUrl: string | null
}

export type ClassScheduleSummary = {
  id: string
  title: string
  dayOfWeek: number
  startTime: string
  durationMinutes: number
  instructor: InstructorSummary
}

export type CheckInRecord = {
  id: string
  classScheduleId: string
  classDate: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  classSchedule: ClassScheduleSummary
}

export type CreateCheckInResponse = {
  checkIn: CheckInRecord
  isNew: boolean
}

export type ListTodayCheckInsResponse = {
  checkIns: CheckInRecord[]
}

// ─── Repository Interface ───────────────────────────────────────────────────

export type CheckInClassSchedule = {
  id: string
  academyId: string
  title: string
  dayOfWeek: number
  startTime: string
  durationMinutes: number
  instructorId: string
  isActive: boolean
  instructor: {
    id: string
    fullName: string
    nickname: string | null
    avatarUrl: string | null
  }
}

export type CheckInRecordRaw = {
  id: string
  classScheduleId: string
  classDate: Date
  status: string
  reviewedBy: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
  classSchedule: CheckInClassSchedule
}

export type MemberAcademy = {
  memberId: string
  academyId: string
}

export interface CheckInRepository {
  /**
   * Find a class schedule by ID (any academy).
   */
  findClassById(classScheduleId: string): Promise<CheckInClassSchedule | null>

  /**
   * Find an existing check-in for the same (member, class, date).
   */
  findByMemberClassDate(
    memberId: string,
    classScheduleId: string,
    classDate: Date
  ): Promise<CheckInRecordRaw | null>

  /**
   * List the member's check-ins for a given date in their academy,
   * including the class schedule and instructor.
   */
  listByMemberAndDate(
    memberId: string,
    academyId: string,
    classDate: Date
  ): Promise<CheckInRecordRaw[]>

  /**
   * Find the caller's academy membership (any role, active).
   * Returns the memberId (PK of AcademyMember) and academyId.
   */
  findMemberAcademy(userId: string): Promise<MemberAcademy | null>

  /**
   * Create a pending check-in.
   */
  create(
    academyId: string,
    memberId: string,
    classScheduleId: string,
    classDate: Date
  ): Promise<CheckInRecordRaw>
}
