export const queryKeys = {
  roster: (userId?: string) => ['academy', 'roster', userId] as const,
}
