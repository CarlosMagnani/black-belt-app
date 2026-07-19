import { todayInSaoPaulo, nowTimeInSaoPaulo, dayOfWeekInSaoPaulo } from '../../lib/brazil-time'
import { isEligibleToday } from './checkin.domain'
import type {
  CheckInRepository,
  CreateCheckInInput,
  CreateCheckInResponse,
  ListTodayCheckInsResponse,
} from './checkin.types'
import {
  ForbiddenError,
  ClassNotFoundError,
  ClassNotActiveError,
  ClassNotTodayError,
  NotYetTimeError,
  AlreadyRejectedError,
  AlreadyRequestedError,
} from './checkin.errors'

export interface CheckInService {
  createCheckIn(userId: string, input: CreateCheckInInput): Promise<CreateCheckInResponse>
  listTodayCheckIns(userId: string): Promise<ListTodayCheckInsResponse>
}

export class DefaultCheckInService implements CheckInService {
  constructor(private readonly checkInRepository: CheckInRepository) {}

  async createCheckIn(userId: string, input: CreateCheckInInput): Promise<CreateCheckInResponse> {
    // 1. Look up caller's academy membership
    const membership = await this.checkInRepository.findMemberAcademy(userId)
    if (!membership) {
      throw new ForbiddenError('You are not an active member of any academy')
    }

    // 2. Look up the class schedule
    const classSchedule = await this.checkInRepository.findClassById(input.classScheduleId)
    if (!classSchedule) {
      throw new ClassNotFoundError()
    }

    // 3. Verify the class belongs to the caller's academy
    if (classSchedule.academyId !== membership.academyId) {
      throw new ForbiddenError('You are not a member of this class\'s academy')
    }

    // 4. Compute today's date and time in São Paulo
    const todayDateStr = todayInSaoPaulo()
    const nowTime = nowTimeInSaoPaulo()
    const todayDayOfWeek = dayOfWeekInSaoPaulo(new Date())

    // 5. Domain: eligibility check
    const eligibility = isEligibleToday(
      classSchedule.isActive,
      classSchedule.dayOfWeek,
      todayDayOfWeek,
      classSchedule.startTime,
      nowTime
    )

    if (!eligibility.eligible) {
      if (eligibility.reason === 'class_not_active') {
        throw new ClassNotActiveError()
      }
      if (eligibility.reason === 'class_not_today') {
        throw new ClassNotTodayError()
      }
      if (eligibility.reason === 'not_yet_time') {
        throw new NotYetTimeError()
      }
    }

    // 6. Convert today's date string to a Date at midnight UTC (classDate in db)
    const classDate = new Date(todayDateStr + 'T00:00:00.000Z')

    // 7. Check for existing check-ins
    const existing = await this.checkInRepository.findByMemberClassDate(
      membership.memberId,
      input.classScheduleId,
      classDate
    )

    if (existing) {
      if (existing.status === 'rejected') {
        throw new AlreadyRejectedError()
      }
      // pending or approved
      throw new AlreadyRequestedError()
    }

    // 8. Create the check-in
    const created = await this.checkInRepository.create(
      membership.academyId,
      membership.memberId,
      input.classScheduleId,
      classDate
    )

    return {
      checkIn: this.toCheckInRecord(created),
      isNew: true,
    }
  }

  async listTodayCheckIns(userId: string): Promise<ListTodayCheckInsResponse> {
    const membership = await this.checkInRepository.findMemberAcademy(userId)
    if (!membership) {
      throw new ForbiddenError('You are not an active member of any academy')
    }

    const todayDateStr = todayInSaoPaulo()
    const classDate = new Date(todayDateStr + 'T00:00:00.000Z')

    const checkIns = await this.checkInRepository.listByMemberAndDate(
      membership.memberId,
      membership.academyId,
      classDate
    )

    return {
      checkIns: checkIns.map((c) => this.toCheckInRecord(c)),
    }
  }

  private toCheckInRecord(raw: {
    id: string
    classScheduleId: string
    classDate: Date
    status: string
    reviewedBy: string | null
    reviewedAt: Date | null
    createdAt: Date
    updatedAt: Date
    classSchedule: {
      id: string
      title: string
      dayOfWeek: number
      startTime: string
      durationMinutes: number
      instructor: { id: string; fullName: string; nickname: string | null; avatarUrl: string | null }
    }
  }) {
    return {
      id: raw.id,
      classScheduleId: raw.classScheduleId,
      classDate: raw.classDate.toISOString().slice(0, 10),
      status: raw.status as 'pending' | 'approved' | 'rejected',
      reviewedBy: raw.reviewedBy,
      reviewedAt: raw.reviewedAt?.toISOString() ?? null,
      createdAt: raw.createdAt.toISOString(),
      updatedAt: raw.updatedAt.toISOString(),
      classSchedule: {
        id: raw.classSchedule.id,
        title: raw.classSchedule.title,
        dayOfWeek: raw.classSchedule.dayOfWeek,
        startTime: raw.classSchedule.startTime,
        durationMinutes: raw.classSchedule.durationMinutes,
        instructor: raw.classSchedule.instructor,
      },
    }
  }
}
