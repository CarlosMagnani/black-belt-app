import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { SessionLoading } from './SessionLoading'

export function OwnerRoute() {
  const { onboardingRole, isLoading } = useAuth()

  if (isLoading) {
    return <SessionLoading />
  }

  if (onboardingRole !== 'owner') {
    return <Navigate to="/boas-vindas" replace />
  }

  return <Outlet />
}
