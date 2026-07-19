import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from './useAuth'
import type { ClassesResponse } from '../features/schedule/schedule.types'

export function useClasses(includeInactive = false) {
  const { onboardingRole } = useAuth()
  const showInactive = onboardingRole === 'owner' ? includeInactive : false

  const { data, isLoading, isError, error, refetch } = useQuery<ClassesResponse, Error>({
    queryKey: [...queryKeys.classes(), showInactive],
    queryFn: async () => {
      const result = await apiClient<ClassesResponse>(
        `/academy/classes?includeInactive=${showInactive}`
      )
      if (result.error || !result.data) {
        throw new Error(result.error?.message ?? 'Não foi possível carregar a agenda.')
      }
      return result.data
    },
  })

  return {
    classes: data?.classes ?? [],
    isLoading,
    isError,
    error,
    refetch,
  }
}
