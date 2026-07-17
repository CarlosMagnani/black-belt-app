export type StudentBeltId = 'white' | 'blue' | 'purple' | 'brown' | 'black'

export type StudentMembership = {
  academy: {
    city: string
    id: string
    name: string
  }
  membership: {
    id: string
    joinedAt: string
    status: string
  }
  student: {
    avatarUrl: string | null
    fullName: string
    id: string
    nickname: string | null
  }
  studentBelt: {
    approvedClassesAtLevel: number
    belt: StudentBeltId
    degree: number
  }
}
