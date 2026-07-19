import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { SessionLoading } from './SessionLoading'

export function OwnerRoute() {
  const { session, onboardingRole, isLoading } = useAuth()

  if (isLoading) {
    return <SessionLoading />
  }

  if (!session) {
    return <Navigate to="/entrar" replace />
  }

  if (onboardingRole !== 'owner') {
    return <Navigate to="/boas-vindas" replace />
  }

  return <Outlet />
}
