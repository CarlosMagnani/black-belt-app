import { prisma } from '../../lib/prisma'
import type {
  CheckInRepository,
  CheckInClassSchedule,
  CheckInRecordRaw,
  MemberAcademy,
} from './checkin.types'

type ClassWithInstructor = {
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
  } | null
}

type CheckInWithSchedule = {
  id: string
  classScheduleId: string
  classDate: Date
  status: string
  reviewedBy: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
  classSchedule: ClassWithInstructor | null
}

export class PrismaCheckInRepository implements CheckInRepository {
  async findClassById(classScheduleId: string): Promise<CheckInClassSchedule | null> {
    const cls = await prisma.classSchedule.findUnique({
      where: { id: classScheduleId },
      include: {
        instructor: {
          select: { id: true, fullName: true, nickname: true, avatarUrl: true },
        },
      },
    })

    if (!cls) return null

    return {
      id: cls.id,
      academyId: cls.academyId,
      title: cls.title,
      dayOfWeek: cls.dayOfWeek,
      startTime: cls.startTime,
      durationMinutes: cls.durationMinutes,
      instructorId: cls.instructorId,
      isActive: cls.isActive,
      instructor: cls.instructor ?? {
        id: cls.instructorId,
        fullName: '',
        nickname: null,
        avatarUrl: null,
      },
    }
  }

  async findByMemberClassDate(
    memberId: string,
    classScheduleId: string,
    classDate: Date
  ): Promise<CheckInRecordRaw | null> {
    const checkIn = await prisma.checkIn.findFirst({
      where: {
        studentMemberId: memberId,
        classScheduleId,
        classDate,
      },
      include: {
        classSchedule: {
          include: {
            instructor: {
              select: { id: true, fullName: true, nickname: true, avatarUrl: true },
            },
          },
        },
      },
    })

    if (!checkIn) return null
    return this.toRecordRaw(checkIn)
  }

  async listByMemberAndDate(
    memberId: string,
    academyId: string,
    classDate: Date
  ): Promise<CheckInRecordRaw[]> {
    const checkIns = await prisma.checkIn.findMany({
      where: {
        studentMemberId: memberId,
        academyId,
        classDate,
      },
      include: {
        classSchedule: {
          include: {
            instructor: {
              select: { id: true, fullName: true, nickname: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return checkIns.map((c) => this.toRecordRaw(c))
  }

  async findMemberAcademy(userId: string): Promise<MemberAcademy | null> {
    const member = await prisma.academyMember.findFirst({
      where: { userId, status: 'active' },
      select: { id: true, academyId: true },
    })
    if (!member) return null
    return { memberId: member.id, academyId: member.academyId }
  }

  async create(
    academyId: string,
    memberId: string,
    classScheduleId: string,
    classDate: Date
  ): Promise<CheckInRecordRaw> {
    // NOTE: We intentionally do NOT write an ActivityEvent for check-in creation
    // because the ActivityAction enum does not include a 'check_in_created' action.
    // Only check_in_approved and check_in_rejected are tracked as events (issue #10).
    const checkIn = await prisma.checkIn.create({
      data: {
        academyId,
        studentMemberId: memberId,
        classScheduleId,
        classDate,
        status: 'pending',
      },
      include: {
        classSchedule: {
          include: {
            instructor: {
              select: { id: true, fullName: true, nickname: true, avatarUrl: true },
            },
          },
        },
      },
    })

    return this.toRecordRaw(checkIn)
  }

  private toRecordRaw(raw: CheckInWithSchedule): CheckInRecordRaw {
    return {
      id: raw.id,
      classScheduleId: raw.classScheduleId,
      classDate: raw.classDate,
      status: raw.status,
      reviewedBy: raw.reviewedBy,
      reviewedAt: raw.reviewedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      classSchedule: raw.classSchedule
        ? {
            id: raw.classSchedule.id,
            academyId: raw.classSchedule.academyId,
            title: raw.classSchedule.title,
            dayOfWeek: raw.classSchedule.dayOfWeek,
            startTime: raw.classSchedule.startTime,
            durationMinutes: raw.classSchedule.durationMinutes,
            instructorId: raw.classSchedule.instructorId,
            isActive: raw.classSchedule.isActive,
            instructor: raw.classSchedule.instructor ?? {
              id: raw.classSchedule.instructorId,
              fullName: '',
              nickname: null,
              avatarUrl: null,
            },
          }
        : {
            id: '',
            academyId: '',
            title: '',
            dayOfWeek: 0,
            startTime: '',
            durationMinutes: 0,
            instructorId: '',
            isActive: false,
            instructor: { id: '', fullName: '', nickname: null, avatarUrl: null },
          },
    }
  }
}
