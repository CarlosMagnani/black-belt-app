import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useToast } from './useToast'
import type { ApiError } from '../lib/api'
import type { ClassActionResponse } from '../features/schedule/schedule.types'

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as ApiError).code === 'string'
  )
}

export function useDeactivateClass() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (classId: string) => {
      const result = await apiClient<ClassActionResponse>(`/academy/classes/${classId}`, {
        method: 'DELETE',
      })

      if (result.data) {
        return result.data
      }

      if (result.error && result.error.code === 'not_found') {
        return null
      }

      throw result.error ?? new Error('Não foi possível desativar a aula.')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes() })
      showToast({ type: 'success', message: 'Aula desativada' })
    },
    onError: (error) => {
      const message = isApiError(error) ? error.message : 'Não foi possível desativar a aula.'
      showToast({ type: 'error', message })
    },
  })
}
