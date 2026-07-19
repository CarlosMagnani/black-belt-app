export const queryKeys = {
  roster: () => ['academy', 'roster'] as const,
  classes: () => ['academy', 'classes'] as const,
  classDetail: (classId: string) => ['academy', 'classes', classId] as const,
}
