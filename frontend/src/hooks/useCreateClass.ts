import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient, isApiError } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useToast } from './useToast'
import type { ClassActionResponse, CreateClassInput } from '../features/schedule/schedule.types'

export function useCreateClass() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (input: CreateClassInput) => {
      const result = await apiClient<ClassActionResponse>('/academy/classes', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      if (result.error || !result.data) {
        throw result.error ?? new Error('Não foi possível criar a aula.')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes() })
      showToast({ type: 'success', message: 'Aula criada' })
      navigate('/mestre/agenda')
    },
    onError: (error) => {
      const message = isApiError(error) ? error.message : 'Não foi possível criar a aula.'
      showToast({ type: 'error', message })
    },
  })
}
