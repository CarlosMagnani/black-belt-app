import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, isApiError } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useToast } from './useToast'
import type { ClassActionResponse } from '../features/schedule/schedule.types'

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

      if (result.error && result.error.code === 'NOT_FOUND') {
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
