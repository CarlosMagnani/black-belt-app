import { useLocation, useNavigate } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'
import { HomeIcon, CalendarIcon, UsersIcon, BoltIcon, UserIcon } from './Icons'

const TABS = [
  { id: 'painel', label: 'PAINEL', icon: <HomeIcon />, to: '/owner/dashboard' },
  { id: 'agenda', label: 'AGENDA', icon: <CalendarIcon />, to: '/owner/schedule' },
  { id: 'alunos', label: 'ALUNOS', icon: <UsersIcon />, to: '/owner/students' },
  { id: 'caixa', label: 'CAIXA', icon: <BoltIcon />, to: '/owner/finance' },
  { id: 'perfil', label: 'PERFIL', icon: <UserIcon />, to: '/owner/profile' },
]

export function OwnerTabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeId = TABS.find((tab) => location.pathname.startsWith(tab.to))?.id ?? 'painel'

  function handleChange(id: string) {
    const tab = TABS.find((t) => t.id === id)
    if (tab && tab.to !== location.pathname) {
      navigate(tab.to)
    }
  }

  return <BottomTabBar tabs={TABS} activeId={activeId} onChange={handleChange} />
}
