export type CheckInStatus = 'pending' | 'approved' | 'rejected'

export type CheckInRecord = {
  id: string
  classScheduleId: string
  classDate: string
  status: CheckInStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  classSchedule: {
    id: string
    title: string
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
    startTime: string
    durationMinutes: number
    instructor: {
      id: string
      fullName: string
      nickname: string | null
      avatarUrl: string | null
    }
  }
}

export type CreateCheckInInput = {
  classScheduleId: string
}

export type CreateCheckInResponse = {
  checkIn: CheckInRecord
  isNew: true
}

export type CheckInsTodayResponse = {
  checkIns: CheckInRecord[]
}
