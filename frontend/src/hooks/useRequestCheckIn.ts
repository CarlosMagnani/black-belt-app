import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, isApiError } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useToast } from './useToast'
import { getCheckInErrorMessage } from '../features/checkin/errorMessages'
import type { CreateCheckInInput, CreateCheckInResponse } from '../features/checkin/checkin.types'

export function useRequestCheckIn() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { mutate, isPending } = useMutation<CreateCheckInResponse, Error, CreateCheckInInput>({
    mutationFn: async ({ classScheduleId }) => {
      const result = await apiClient<CreateCheckInResponse>('/academy/checkins', {
        method: 'POST',
        body: JSON.stringify({ classScheduleId }),
      })
      if (result.error || !result.data) {
        const message = isApiError(result.error)
          ? getCheckInErrorMessage(result.error)
          : 'Não foi possível fazer check-in. Tente novamente.'
        throw new Error(message)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myCheckInsToday() })
      showToast({ type: 'success', message: 'Check-in enviado · Aguardando aprovação' })
    },
    onError: (error) => {
      showToast({ type: 'error', message: error.message })
    },
  })

  return {
    requestCheckIn: mutate,
    isPending,
  }
}
