import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import { useToast } from '../hooks/useToast'
import type { RoleChangeResponse } from '../features/owner/roster.types'

export function usePromoteToProfessor() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (memberId: string) => {
      const result = await apiClient<RoleChangeResponse>(`/academy/members/${memberId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: 'professor' }),
      })
      if (result.error || !result.data) {
        throw result.error ?? new Error('Não foi possível promover.')
      }
      return result.data.member
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roster() })
      showToast({ type: 'success', message: 'Promovido' })
    },
  })
}
