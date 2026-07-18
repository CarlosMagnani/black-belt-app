import { Card } from '../../components/Card'
import { useAuth } from '../../hooks/useAuth'
import { useRoster } from '../../hooks/useRoster'

export function OwnerHomePage() {
  const { user } = useAuth()
  const { academy } = useRoster()

  return (
    <section className="page-enter space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">PAINEL</p>
        <h2 className="font-display text-[22px] uppercase tracking-[-0.01em] leading-[0.95]">
          AGUARDANDO #13
        </h2>
      </div>

      <Card className="p-5 space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-2">ACADEMIA</p>
        <p className="font-display text-[20px] uppercase tracking-[-0.01em] leading-[0.95]">
          {academy?.name ?? 'Sua academia'}
        </p>
        <p className="text-[13px] text-muted-2">{user?.fullName}</p>
      </Card>
    </section>
  )
}
