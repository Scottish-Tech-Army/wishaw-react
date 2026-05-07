import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { BadgeProgressPage } from './pages/BadgeProgressPage'
import { CentreAdminPage } from './pages/CentreAdminPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { LoginPage } from './pages/LoginPage'
import { MainAdminPage } from './pages/MainAdminPage'
import { ModuleDetailsPage } from './pages/ModuleDetailsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlayerDashboardPage } from './pages/PlayerDashboardPage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { ProtectedRoute } from './router/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<PlayerDashboardPage />} />
            <Route path="/badges" element={<BadgeProgressPage />} />
            <Route path="/modules/:moduleId" element={<ModuleDetailsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['centre_admin', 'main_admin']} />}>
          <Route element={<AppShell />}>
            <Route path="/admin/centre" element={<CentreAdminPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['main_admin']} />}>
          <Route element={<AppShell />}>
            <Route path="/admin/main" element={<MainAdminPage />} />
          </Route>
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
