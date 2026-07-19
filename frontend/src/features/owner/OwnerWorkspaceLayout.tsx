import { Outlet } from 'react-router-dom'
import { PageHeader } from '../../components/PageHeader'
import { OwnerTabBar } from '../../components/OwnerTabBar'
import { useAuth } from '../../hooks/useAuth'
import { useRoster } from '../../hooks/useRoster'

export function OwnerWorkspaceLayout() {
  const { user } = useAuth()
  const { academy, isLoading, refetch } = useRoster()

  const firstName = user?.fullName?.split(' ')[0] ?? ''
  const title = firstName ? `BOM DIA, ${firstName.toUpperCase()}.` : 'BOM DIA, MESTRE.'
  const eyebrow = academy?.name ?? 'SUA ACADEMIA'

  return (
    <div className="min-h-dvh bg-bg text-text flex flex-col">
      <PageHeader
        badge="MASTER"
        eyebrow={eyebrow}
        title={title}
        onRefresh={refetch}
        isRefreshing={isLoading}
      />
      <main className="flex-1 px-6 pb-28 overflow-y-auto">
        <Outlet />
      </main>
      <OwnerTabBar />
    </div>
  )
}
