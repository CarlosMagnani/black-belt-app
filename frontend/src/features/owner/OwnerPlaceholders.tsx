import { EmptyState } from '../../components/EmptyState'

export function FinancePlaceholder() {
  return (
    <section className="page-enter space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">CAIXA</p>
        <h2 className="font-display text-[22px] uppercase tracking-[-0.01em] leading-[0.95]">
          AGUARDANDO #12
        </h2>
      </div>
      <EmptyState message="O caixa da academia será construído na próxima etapa." />
    </section>
  )
}

export function AcademySettingsPlaceholder() {
  return (
    <section className="page-enter space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">PERFIL</p>
        <h2 className="font-display text-[22px] uppercase tracking-[-0.01em] leading-[0.95]">
          EM BREVE
        </h2>
      </div>
      <EmptyState message="As configurações da academia estarão disponíveis em breve." />
    </section>
  )
}
