export const queryKeys = {
  roster: (userId?: string) => ['academy', 'roster', userId] as const,
  classes: () => ['academy', 'classes'] as const,
  classDetail: (classId: string) => ['academy', 'classes', classId] as const,
  myCheckInsToday: () => ['academy', 'checkins', 'today'] as const,
  myMembership: () => ['memberships', 'me'] as const,
}
