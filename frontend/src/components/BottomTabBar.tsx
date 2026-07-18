import type { ReactNode } from 'react'

export function BottomTabBar({
  tabs,
  activeId,
  onChange,
}: {
  tabs: Array<{ id: string; label: string; icon: ReactNode }>
  activeId: string
  onChange: (id: string) => void
}) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-bg pt-[10px] pb-[28px] px-6"
    >
      <ul className="flex justify-around list-none p-0 m-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <li key={tab.id}>
              <button
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 bg-transparent border-0 p-2 transition ${
                  isActive ? 'text-red' : 'text-muted-2'
                }`}
                onClick={() => onChange(tab.id)}
                type="button"
              >
                <span className="w-[18px] h-[18px] flex items-center justify-center">{tab.icon}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em]">{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
