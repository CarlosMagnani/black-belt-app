import type {
  ScheduleRepository,
  CreateClassInput,
  CreateClassResponse,
  UpdateClassInput,
  UpdateClassResponse,
  DeactivateClassResponse,
  ClassSummary,
} from './schedule.types'
import { isValidInstructor } from './schedule.domain'
import {
  ClassNotFoundError,
  ForbiddenError,
  InvalidInstructorError,
} from './schedule.errors'

export interface ScheduleService {
  listClasses(userId: string, includeInactive: boolean): Promise<ClassSummary[]>
  createClass(userId: string, input: CreateClassInput): Promise<CreateClassResponse>
  updateClass(
    userId: string,
    classId: string,
    input: UpdateClassInput
  ): Promise<UpdateClassResponse>
  deactivateClass(userId: string, classId: string): Promise<DeactivateClassResponse>
}

export class DefaultScheduleService implements ScheduleService {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}

  async listClasses(userId: string, includeInactive: boolean): Promise<ClassSummary[]> {
    const memberAcademy = await this.scheduleRepository.findMemberAcademy(userId)
    if (!memberAcademy) {
      throw new ForbiddenError('You are not an active member of any academy')
    }

    const classes = await this.scheduleRepository.listByAcademy(
      memberAcademy.academyId,
      includeInactive
    )

    return classes.map((c) => this.toClassSummary(c))
  }

  async createClass(userId: string, input: CreateClassInput): Promise<CreateClassResponse> {
    const ownedAcademy = await this.scheduleRepository.findMemberAcademyByRole(
      userId,
      'owner'
    )
    if (!ownedAcademy) {
      throw new ForbiddenError('You do not own an academy')
    }

    // Validate instructor
    const instructor = await this.scheduleRepository.findMemberByUserAndAcademy(
      input.instructorId,
      ownedAcademy.academyId
    )
    if (!isValidInstructor(instructor)) {
      throw new InvalidInstructorError()
    }

    const result = await this.scheduleRepository.create(
      ownedAcademy.academyId,
      userId,
      input
    )

    return {
      class: this.toClassSummary(result.class),
      activityEventId: result.activityEventId,
    }
  }

  async updateClass(
    userId: string,
    classId: string,
    input: UpdateClassInput
  ): Promise<UpdateClassResponse> {
    const ownedAcademy = await this.scheduleRepository.findMemberAcademyByRole(
      userId,
      'owner'
    )
    if (!ownedAcademy) {
      throw new ForbiddenError('You do not own an academy')
    }

    // Verify class exists in this academy
    const existing = await this.scheduleRepository.findByAcademyAndClassId(
      ownedAcademy.academyId,
      classId
    )
    if (!existing) {
      throw new ClassNotFoundError()
    }

    // Validate instructor if being changed
    if (input.instructorId) {
      const instructor = await this.scheduleRepository.findMemberByUserAndAcademy(
        input.instructorId,
        ownedAcademy.academyId
      )
      if (!isValidInstructor(instructor)) {
        throw new InvalidInstructorError()
      }
    }

    const result = await this.scheduleRepository.update(
      ownedAcademy.academyId,
      classId,
      userId,
      input
    )

    return {
      class: this.toClassSummary(result.class),
      activityEventId: result.activityEventId,
    }
  }

  async deactivateClass(
    userId: string,
    classId: string
  ): Promise<DeactivateClassResponse> {
    const ownedAcademy = await this.scheduleRepository.findMemberAcademyByRole(
      userId,
      'owner'
    )
    if (!ownedAcademy) {
      throw new ForbiddenError('You do not own an academy')
    }

    // Verify class exists in this academy
    const existing = await this.scheduleRepository.findByAcademyAndClassId(
      ownedAcademy.academyId,
      classId
    )
    if (!existing) {
      throw new ClassNotFoundError()
    }

    const result = await this.scheduleRepository.deactivate(
      ownedAcademy.academyId,
      classId,
      userId
    )

    return {
      class: this.toClassSummary(result.class),
      activityEventId: result.activityEventId,
    }
  }

  private toClassSummary(record: {
    id: string
    title: string
    dayOfWeek: number
    startTime: string
    durationMinutes: number
    location: string | null
    level: string | null
    isActive: boolean
    instructor: { id: string; fullName: string; nickname: string | null; avatarUrl: string | null }
    createdAt: Date
    updatedAt: Date
  }): ClassSummary {
    return {
      id: record.id,
      title: record.title,
      dayOfWeek: record.dayOfWeek,
      startTime: record.startTime,
      durationMinutes: record.durationMinutes,
      location: record.location,
      level: record.level as ClassSummary['level'],
      isActive: record.isActive,
      instructor: record.instructor,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }
  }
}
