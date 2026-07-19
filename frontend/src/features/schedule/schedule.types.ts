import type { MemberSummary } from '../owner/roster.types'

export type ClassLevel = 'todas' | 'iniciante' | 'intermediario' | 'avancado'

export type ScheduledClass = {
  id: string
  title: string
  description: string | null
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  startTime: string
  durationMinutes: number
  location: string | null
  level: ClassLevel | null
  isActive: boolean
  instructor: {
    id: string
    fullName: string
    nickname: string | null
    avatarUrl: string | null
  }
  createdAt: string
  updatedAt: string
}

export type ClassesResponse = {
  classes: ScheduledClass[]
}

export type CreateClassInput = {
  title: string
  description?: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  startTime: string
  durationMinutes: number
  location?: string
  level?: ClassLevel | null
  instructorId: string
}

export type UpdateClassInput = Partial<CreateClassInput>

export type ClassActionResponse = {
  class: ScheduledClass
  activityEventId: string
}

export type { MemberSummary }
