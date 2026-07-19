import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import type { RosterResponse } from '../features/owner/roster.types'
import { useAuth } from './useAuth'

export function useRoster() {
  const { user } = useAuth()

  const { data, isLoading, isError, error, refetch } = useQuery<RosterResponse, Error>({
    queryKey: queryKeys.roster(user?.id),
    queryFn: async () => {
      const result = await apiClient<RosterResponse>('/academy/members')
      if (result.error || !result.data) {
        throw new Error(result.error?.message ?? 'Não foi possível carregar a equipe.')
      }
      return result.data
    },
    enabled: Boolean(user?.id),
  })

  return {
    academy: data?.academy ?? null,
    members: data?.members ?? [],
    isLoading,
    isError,
    error,
    refetch,
  }
}
