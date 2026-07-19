import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import type { CheckInsTodayResponse } from '../features/checkin/checkin.types'

export function useMyCheckInsToday() {
  const { data, isLoading, isError, error, refetch } = useQuery<CheckInsTodayResponse, Error>({
    queryKey: queryKeys.myCheckInsToday(),
    queryFn: async () => {
      const result = await apiClient<CheckInsTodayResponse>('/academy/checkins/today')
      if (result.error || !result.data) {
        throw new Error(result.error?.message ?? 'Não foi possível carregar seus check-ins.')
      }
      return result.data
    },
  })

  return {
    checkIns: data?.checkIns ?? [],
    isLoading,
    isError,
    error,
    refetch,
  }
}
