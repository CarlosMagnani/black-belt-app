import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function RoleChoicePage() {
  const [selectedRole, setSelectedRole] = useState<'owner' | 'student' | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut() {
    setIsSigningOut(true)
    await supabase.auth.signOut()
    setIsSigningOut(false)
  }

  return (
    <main className="role-page bb-grain">
      <section className="role-hero">
        <div className="role-hero__stripes" aria-hidden="true" />
        <button className="sign-out" type="button" onClick={signOut} disabled={isSigningOut}>
          {isSigningOut ? 'SAINDO...' : 'SAIR'}
        </button>
        <div className="brand-lockup brand-lockup--hero" aria-label="Black Belt">
          <span>BLACK</span>
          <span>BELT</span>
          <small>BJJ ACADEMY · OSS</small>
        </div>
      </section>
      <section className="role-page__body page-enter">
        <p className="eyebrow">BEM-VINDO AO TATAME</p>
        <h1>COMO VOCÊ VIVE A ARTE?</h1>
        <p>Escolha seu caminho. Você poderá concluir seu perfil na próxima etapa.</p>
        <div className="role-list">
          <RoleCard
            icon={<CrownIcon />}
            kicker="01 / MESTRE"
            title="GERENCIO MINHA ACADEMIA"
            subtitle="Academia, equipe, agenda e alunos."
            onClick={() => setSelectedRole('owner')}
          />
          <RoleCard
            icon={<ShieldIcon />}
            kicker="02 / ALUNO"
            title="TREINO NO TATAME"
            subtitle="Aulas, presença e evolução na faixa."
            onClick={() => setSelectedRole('student')}
          />
        </div>
        {selectedRole ? (
          <p className="role-notice" role="status">
            {selectedRole === 'owner' ? 'Onboarding de mestre' : 'Onboarding de aluno'} será o próximo passo.
          </p>
        ) : null}
        <p className="role-page__footer">OSS · RESPEITE A ARTE</p>
      </section>
    </main>
  )
}

function RoleCard({
  icon,
  kicker,
  onClick,
  subtitle,
  title,
}: {
  icon: React.ReactNode
  kicker: string
  onClick: () => void
  subtitle: string
  title: string
}) {
  return (
    <button className="role-card" type="button" onClick={onClick}>
      <span className="role-card__icon" aria-hidden="true">{icon}</span>
      <span className="role-card__copy">
        <small>{kicker}</small>
        <strong>{title}</strong>
        <em>{subtitle}</em>
      </span>
      <span className="role-card__arrow" aria-hidden="true">↗</span>
    </button>
  )
}

function CrownIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 7 4 4 5-7 5 7 4-4-2 12H5L3 7Z" stroke="currentColor" strokeWidth="1.7" /><path d="M5 19h14" stroke="currentColor" strokeWidth="1.7" /></svg>
}

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="1.7" /><path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" /></svg>
}
