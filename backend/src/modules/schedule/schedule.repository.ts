import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import type {
  ScheduleRepository,
  ClassRecord,
  CreateClassInput,
  CreateClassResult,
  UpdateClassInput,
  UpdateClassResult,
  DeactivateClassResult,
  MemberAcademy,
  InstructorMember,
} from './schedule.types'

type InstructorData = { id: string; fullName: string; nickname: string | null; avatarUrl: string | null }

type ClassWithInstructor = {
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
  instructor: InstructorData | null
  createdAt: Date
  updatedAt: Date
}

const classInclude = {
  instructor: {
    select: { id: true, fullName: true, nickname: true, avatarUrl: true },
  },
} as const

export class PrismaScheduleRepository implements ScheduleRepository {
  async findMemberAcademy(userId: string): Promise<MemberAcademy | null> {
    const member = await prisma.academyMember.findFirst({
      where: { userId, status: 'active' },
      select: { academyId: true },
    })
    if (!member) return null
    return { academyId: member.academyId }
  }

  async findMemberAcademyByRole(userId: string, role: string): Promise<MemberAcademy | null> {
    const member = await prisma.academyMember.findFirst({
      where: { userId, role: role as any, status: 'active' },
      select: { academyId: true },
    })
    if (!member) return null
    return { academyId: member.academyId }
  }

  async findMemberByUserAndAcademy(userId: string, academyId: string): Promise<InstructorMember> {
    const member = await prisma.academyMember.findFirst({
      where: { userId, academyId },
      select: { id: true, userId: true, role: true, status: true },
    })
    return member as InstructorMember
  }

  async listByAcademy(academyId: string, includeInactive: boolean): Promise<ClassRecord[]> {
    const where: Prisma.ClassScheduleWhereInput = { academyId }
    if (!includeInactive) {
      where.isActive = true
    }

    const classes = await prisma.classSchedule.findMany({
      where,
      include: classInclude,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return classes.map((c) => this.toClassRecord(c))
  }

  async findByAcademyAndClassId(academyId: string, classId: string): Promise<ClassRecord | null> {
    const cls = await prisma.classSchedule.findFirst({
      where: { id: classId, academyId },
      include: classInclude,
    })

    if (!cls) return null
    return this.toClassRecord(cls)
  }

  async create(
    academyId: string,
    actorId: string,
    input: CreateClassInput
  ): Promise<CreateClassResult> {
    return prisma.$transaction(async (tx) => {
      const cls = await tx.classSchedule.create({
        data: {
          academyId,
          title: input.title,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          durationMinutes: input.durationMinutes,
          location: input.location ?? null,
          level: input.level ?? null,
          instructorId: input.instructorId,
          isActive: true,
        },
      })

      const event = await tx.activityEvent.create({
        data: {
          academyId,
          actorId,
          action: 'class_created',
          subjectClassId: cls.id,
        },
      })

      const full = await tx.classSchedule.findUniqueOrThrow({
        where: { id: cls.id },
        include: classInclude,
      })

      return {
        class: this.toClassRecord(full),
        activityEventId: event.id,
      }
    })
  }

  async update(
    academyId: string,
    classId: string,
    actorId: string,
    input: UpdateClassInput
  ): Promise<UpdateClassResult> {
    return prisma.$transaction(async (tx) => {
      const data: Prisma.ClassScheduleUpdateInput = {}
      if (input.title !== undefined) data.title = input.title
      if (input.dayOfWeek !== undefined) data.dayOfWeek = input.dayOfWeek
      if (input.startTime !== undefined) data.startTime = input.startTime
      if (input.durationMinutes !== undefined) data.durationMinutes = input.durationMinutes
      if (input.location !== undefined) data.location = input.location
      if (input.level !== undefined) data.level = input.level
      if (input.instructorId !== undefined) {
        data.instructor = { connect: { id: input.instructorId } }
      }

      const cls = await tx.classSchedule.update({
        where: { id: classId },
        data,
      })

      const event = await tx.activityEvent.create({
        data: {
          academyId,
          actorId,
          action: 'class_updated',
          subjectClassId: cls.id,
        },
      })

      const full = await tx.classSchedule.findUniqueOrThrow({
        where: { id: cls.id },
        include: classInclude,
      })

      return {
        class: this.toClassRecord(full),
        activityEventId: event.id,
      }
    })
  }

  async deactivate(
    academyId: string,
    classId: string,
    actorId: string
  ): Promise<DeactivateClassResult> {
    // Check if already inactive first
    const existing = await prisma.classSchedule.findUnique({
      where: { id: classId },
      select: { isActive: true },
    })

    if (existing && !existing.isActive) {
      // Already inactive — return current state without writing an event
      const full = await prisma.classSchedule.findUniqueOrThrow({
        where: { id: classId },
        include: classInclude,
      })

      return {
        class: this.toClassRecord(full),
        activityEventId: null,
      }
    }

    return prisma.$transaction(async (tx) => {
      const cls = await tx.classSchedule.update({
        where: { id: classId },
        data: { isActive: false },
      })

      const event = await tx.activityEvent.create({
        data: {
          academyId,
          actorId,
          action: 'class_deactivated',
          subjectClassId: cls.id,
        },
      })

      const full = await tx.classSchedule.findUniqueOrThrow({
        where: { id: cls.id },
        include: classInclude,
      })

      return {
        class: this.toClassRecord(full),
        activityEventId: event.id,
      }
    })
  }

  private toClassRecord(raw: ClassWithInstructor): ClassRecord {
    return {
      id: raw.id,
      academyId: raw.academyId,
      title: raw.title,
      dayOfWeek: raw.dayOfWeek,
      startTime: raw.startTime,
      durationMinutes: raw.durationMinutes,
      location: raw.location,
      level: raw.level as ClassRecord['level'],
      instructorId: raw.instructorId,
      isActive: raw.isActive,
      instructor: raw.instructor ?? { id: raw.instructorId, fullName: '', nickname: null, avatarUrl: null },
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }
}
