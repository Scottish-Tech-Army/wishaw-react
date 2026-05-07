import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import PlayerDashboard from './pages/PlayerDashboard'
import SubmitEvidence from './pages/SubmitEvidence'
import RegistrationPage from './pages/RegistrationPage'
import RegistrationSuccess from './pages/RegistrationSuccess'
import BadgesPage from './pages/BadgesPage'
import LeaderboardView from './pages/LeaderboardView'
import ManageGroups from './pages/ManageGroups'
import ParentDashboard from './pages/ParentDashboard'
import BadgeManagementPage from './pages/BadgeManagementPage'
import UserManagementPage from './pages/UserManagementPage'
import NavDrawer from './components/NavDrawer'
import PwaInstallPrompt from './components/PwaInstallPrompt'

/** Pages that should NOT show the nav drawer */
const PUBLIC_PATHS = new Set(['/', '/login', '/register', '/registration-success'])

const ROUTES: Record<string, () => JSX.Element> = {
  '/':                     () => <LoginPage />,
  '/login':                () => <LoginPage />, 
  '/admin':                () => <AdminDashboard />,
  '/dashboard':            () => <PlayerDashboard />,
  '/player':               () => <PlayerDashboard />,
  '/submit':               () => <SubmitEvidence />,
  '/register':             () => <RegistrationPage />,
  '/registration-success': () => <RegistrationSuccess />,
  '/badges':               () => <BadgesPage />,
  '/leaderboard':          () => <LeaderboardView />,
  '/groups':               () => <ManageGroups />,
  '/admin/badges':         () => <BadgeManagementPage />,
  '/admin/users':          () => <UserManagementPage />,
  '/parent':               () => <ParentDashboard />,
}

function App() {
  const [path, setPath] = useState(globalThis.location?.pathname ?? '/')

  /* Listen for popstate so browser back/forward works */
  useEffect(() => {
    const onPop = () => setPath(globalThis.location.pathname)
    globalThis.addEventListener('popstate', onPop)
    return () => globalThis.removeEventListener('popstate', onPop)
  }, [])

  const renderPage = ROUTES[path] ?? ROUTES['/']
  const showNav = !PUBLIC_PATHS.has(path)

  return (
    <>
      {showNav && <NavDrawer currentPath={path} />}
      {renderPage()}
      <PwaInstallPrompt />
    </>
  )
}

export default App
