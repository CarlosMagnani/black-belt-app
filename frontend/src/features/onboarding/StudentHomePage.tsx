import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiClient } from '../../lib/api'
import type { StudentMembership } from './student.types'

const BELT_LABELS = {
  white: 'BRANCA',
  blue: 'AZUL',
  purple: 'ROXA',
  brown: 'MARROM',
  black: 'PRETA',
} as const

export function StudentHomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as { membership?: StudentMembership; notice?: string } | null
  const [membership, setMembership] = useState<StudentMembership | null>(state?.membership ?? null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (membership) return

    apiClient<StudentMembership>('/memberships/me')
      .then((result) => {
        if (result.data) {
          setMembership(result.data)
          return
        }
        if (result.error?.code === 'MEMBERSHIP_NOT_FOUND') {
          navigate('/onboarding/student', { replace: true })
          return
        }
        setError('Não foi possível carregar sua academia.')
      })
      .catch(() => setError('Não foi possível carregar sua academia.'))
  }, [membership, navigate])

  if (!membership && !error) {
    return (
      <main className="session-loading bb-grain" aria-live="polite">
        <p className="eyebrow">ÁREA DO ALUNO</p>
        <div className="dot-loader" aria-label="Carregando academia"><span /><span /><span /></div>
        <p>Preparando o tatame...</p>
      </main>
    )
  }

  return (
    <main className="student-home bb-grain">
      <section className="page-enter">
        <p className="eyebrow">ÁREA DO ALUNO</p>
        <h1>{membership ? <>VOCÊ ESTÁ<br />NO TATAME.</> : <>ALGO SAIU<br />DO EIXO.</>}</h1>
        {state?.notice && <p className="role-notice" role="status">{state.notice}</p>}
        {error && <p className="role-notice" role="alert">{error}</p>}
        {membership && (
          <div className="student-home__academy">
            <small>SUA ACADEMIA</small>
            <strong>{membership.academy.name}</strong>
            <span>{membership.academy.city}</span>
            <div className="student-home__belt">
              FAIXA {BELT_LABELS[membership.studentBelt.belt]} · {membership.studentBelt.degree} GRAU{membership.studentBelt.degree === 1 ? '' : 'S'}
            </div>
          </div>
        )}
        <p className="student-home__next">Agenda, check-ins e progresso entram nas próximas etapas do produto.</p>
      </section>
    </main>
  )
}
