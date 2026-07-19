import { IconButton } from './IconButton'
import { BellIcon, SettingsIcon, RefreshIcon } from './Icons'

export function PageHeader({
  eyebrow,
  title,
  badge = 'MASTER',
  onRefresh,
  isRefreshing,
}: {
  eyebrow: string
  title: string
  badge?: string
  onRefresh?: () => void
  isRefreshing?: boolean
}) {
  return (
    <header className="pt-[max(56px,env(safe-area-inset-top))] px-6 pb-2 flex items-center justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-red text-text font-mono text-[9px] uppercase tracking-[0.18em] px-2 py-0.5">
            {badge}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">
            {eyebrow}
          </span>
        </div>
        <h1 className="font-display text-[26px] uppercase tracking-[-0.01em] leading-[0.95]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRefresh && (
          <IconButton
            aria-label="Atualizar"
            aria-busy={isRefreshing}
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshIcon className={isRefreshing ? 'animate-spin' : ''} />
          </IconButton>
        )}
        <IconButton aria-label="Notificações">
          <BellIcon />
        </IconButton>
        <IconButton aria-label="Configurações">
          <SettingsIcon />
        </IconButton>
      </div>
    </header>
  )
}
