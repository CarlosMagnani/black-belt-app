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
import { SchedulePlaceholder, FinancePlaceholder, AcademySettingsPlaceholder } from './features/owner/OwnerPlaceholders'

function App() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return <SessionLoading />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/welcome" replace /> : <AuthPage mode="login" />} />
        <Route path="/sign-up" element={session ? <Navigate to="/welcome" replace /> : <AuthPage mode="register" />} />
        <Route path="/confirm-email" element={session ? <Navigate to="/welcome" replace /> : <ConfirmationPage />} />
        <Route path="/welcome" element={session ? <RoleChoicePage /> : <Navigate to="/login" replace />} />
        <Route path="/onboarding/owner" element={session ? <OwnerOnboardingPage /> : <Navigate to="/login" replace />} />
        <Route path="/onboarding/student" element={session ? <StudentOnboardingPage /> : <Navigate to="/login" replace />} />

        <Route element={<OwnerRoute />}>
          <Route element={<OwnerWorkspaceLayout />}>
            <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
            <Route path="/owner/dashboard" element={<OwnerHomePage />} />
            <Route path="/owner/schedule" element={<SchedulePlaceholder />} />
            <Route path="/owner/students" element={<RosterPage />} />
            <Route path="/owner/finance" element={<FinancePlaceholder />} />
            <Route path="/owner/profile" element={<AcademySettingsPlaceholder />} />
          </Route>
        </Route>

        <Route path="/student" element={session ? <StudentHomePage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={session ? '/welcome' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
