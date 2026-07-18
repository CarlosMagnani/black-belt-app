export type Academy = {
  id: string
  name: string
  city: string
  inviteCode: string
  logoUrl: string | null
}

export type MemberRole = 'owner' | 'professor' | 'student'
export type MemberStatus = 'active' | 'inactive' | 'suspended'

export type MemberBelt = {
  belt: 'white' | 'blue' | 'purple' | 'brown' | 'black' | 'coral' | 'red'
  degree: 0 | 1 | 2 | 3 | 4
}

export type MemberSummary = {
  id: string
  userId: string
  fullName: string
  nickname: string | null
  avatarUrl: string | null
  role: MemberRole
  status: MemberStatus
  joinedAt: string
  currentBelt: MemberBelt | null
}

export type RosterResponse = {
  academy: Academy
  members: MemberSummary[]
}

export type RoleChangeResponse = {
  member: MemberSummary
  activityEventId: string
}
