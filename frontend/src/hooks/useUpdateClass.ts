import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient, isApiError } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useToast } from './useToast'
import type { ClassActionResponse, UpdateClassInput } from '../features/schedule/schedule.types'

export function useUpdateClass() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async ({ classId, body }: { classId: string; body: UpdateClassInput }) => {
      const result = await apiClient<ClassActionResponse>(`/academy/classes/${classId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      if (result.error || !result.data) {
        throw result.error ?? new Error('Não foi possível atualizar a aula.')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes() })
      showToast({ type: 'success', message: 'Aula atualizada' })
      navigate('/mestre/agenda')
    },
    onError: (error) => {
      const message = isApiError(error) ? error.message : 'Não foi possível atualizar a aula.'
      showToast({ type: 'error', message })
    },
  })
}
