import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { SessionLoading } from './components/SessionLoading'
import { AuthPage, ConfirmationPage } from './features/auth/AuthPage'
import { RoleChoicePage } from './features/auth/RoleChoicePage'
import { OwnerOnboardingPage } from './features/onboarding/OwnerOnboardingPage'
import { StudentHomePage } from './features/onboarding/StudentHomePage'
import { StudentOnboardingPage } from './features/onboarding/StudentOnboardingPage'
import { OwnerRoute } from './components/OwnerRoute'
import { OwnerWorkspaceLayout } from './features/owner/OwnerWorkspaceLayout'
import { OwnerHomePage } from './features/owner/OwnerHomePage'
import { RosterPage } from './features/owner/RosterPage'
import { FinancePlaceholder, AcademySettingsPlaceholder } from './features/owner/OwnerPlaceholders'
import { AgendaPage } from './features/schedule/AgendaPage'
import { ClassFormPage } from './features/schedule/ClassFormPage'

function App() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
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
        <Route path="/onboarding/aluno" element={session ? <StudentOnboardingPage /> : <Navigate to="/entrar" replace />} />

        <Route element={<OwnerRoute />}>
          <Route element={<OwnerWorkspaceLayout />}>
            <Route path="/mestre" element={<Navigate to="/mestre/painel" replace />} />
            <Route path="/mestre/painel" element={<OwnerHomePage />} />
            <Route path="/mestre/agenda" element={<AgendaPage />} />
            <Route path="/mestre/agenda/nova" element={<ClassFormPage mode="create" />} />
            <Route path="/mestre/agenda/:classId/editar" element={<ClassFormPage mode="edit" />} />
            <Route path="/mestre/agenda/:classId" element={<ClassFormPage mode="edit" />} />
            <Route path="/mestre/alunos" element={<RosterPage />} />
            <Route path="/mestre/caixa" element={<FinancePlaceholder />} />
            <Route path="/mestre/perfil" element={<AcademySettingsPlaceholder />} />
          </Route>
        </Route>

        <Route path="/aluno" element={session ? <StudentHomePage /> : <Navigate to="/entrar" replace />} />
        <Route path="*" element={<Navigate to={session ? '/boas-vindas' : '/entrar'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
