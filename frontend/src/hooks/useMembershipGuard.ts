import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'
import type { StudentMembership } from '../features/onboarding/student.types'

export function useMembershipGuard() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery<StudentMembership, Error>({
    queryKey: queryKeys.myMembership(),
    queryFn: async () => {
      const result = await apiClient<StudentMembership>('/memberships/me')
      if (result.error || !result.data) {
        // 404 / 403 / any error means no membership → redirect
        throw new Error('no_membership')
      }
      return result.data
    },
    retry: false,
    meta: { suppressToast: true },
  })

  useEffect(() => {
    if (!isLoading && !data) {
      navigate('/onboarding/student', { replace: true })
    }
  }, [isLoading, data, navigate])

  return {
    membership: data ?? null,
    isLoading,
  }
}
