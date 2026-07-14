import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthPage, ConfirmationPage } from './features/auth/AuthPage'
import { RoleChoicePage } from './features/auth/RoleChoicePage'
import { OwnerOnboardingPage } from './features/onboarding/OwnerOnboardingPage'
import { supabase } from './lib/supabase'

function StudentOnboardingPlaceholder() {
  return (
    <main className="onboarding-placeholder bb-grain">
      <section className="page-enter">
        <p className="eyebrow">ONBOARDING ALUNO</p>
        <h1>ENTRAR NA ACADEMIA</h1>
        <p>Em breve...</p>
      </section>
    </main>
  )
}

function OwnerHomePlaceholder() {
  const location = useLocation()
  const notice = (location.state as { notice?: string } | null)?.notice

  return (
    <main className="onboarding-placeholder bb-grain">
      <section className="page-enter">
        <p className="eyebrow">ÁREA DO MESTRE</p>
        <h1>ACADEMIA CRIADA</h1>
        {notice && <p className="role-notice" role="status">{notice}</p>}
        <p>O painel da sua academia será construído na próxima etapa.</p>
      </section>
    </main>
  )
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoadingSession(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoadingSession(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  if (isLoadingSession) {
    return <SessionLoading />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/entrar" element={session ? <Navigate to="/boas-vindas" replace /> : <AuthPage mode="login" />} />
        <Route path="/criar-conta" element={session ? <Navigate to="/boas-vindas" replace /> : <AuthPage mode="register" />} />
        <Route path="/confirmar-email" element={session ? <Navigate to="/boas-vindas" replace /> : <ConfirmationPage />} />
        <Route path="/boas-vindas" element={session ? <RoleChoicePage /> : <Navigate to="/entrar" replace />} />
        <Route path="/onboarding/mestre" element={session ? <OwnerOnboardingPage /> : <Navigate to="/entrar" replace />} />
        <Route path="/mestre" element={session ? <OwnerHomePlaceholder /> : <Navigate to="/entrar" replace />} />
        <Route path="/onboarding/aluno" element={session ? <StudentOnboardingPlaceholder /> : <Navigate to="/entrar" replace />} />
        <Route path="*" element={<Navigate to={session ? '/boas-vindas' : '/entrar'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function SessionLoading() {
  return (
    <main className="session-loading bb-grain" aria-live="polite">
      <p className="eyebrow">BLACK BELT</p>
      <div className="dot-loader" aria-label="Carregando sessão"><span /><span /><span /></div>
      <p>Ajustando sua faixa...</p>
    </main>
  )
}

export default App
