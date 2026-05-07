import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.tsx'
import Layout from './components/Layout.tsx'
import LoginPage from './pages/LoginPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import BadgesPage from './pages/BadgesPage.tsx'
import ModulesPage from './pages/ModulesPage.tsx'
import ModuleDetailPage from './pages/ModuleDetailPage.tsx'
import LeaderboardPage from './pages/LeaderboardPage.tsx'
import AdminCentresPage from './pages/admin/AdminCentresPage.tsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx'
import AdminModulesPage from './pages/admin/AdminModulesPage.tsx'
import AdminBadgesPage from './pages/admin/AdminBadgesPage.tsx'
import AdminSubBadgesPage from './pages/admin/AdminSubBadgesPage.tsx'
import AdminGroupsPage from './pages/admin/AdminGroupsPage.tsx'
import AdminProgressPage from './pages/admin/AdminProgressPage.tsx'
import AdminLevelsPage from './pages/admin/AdminLevelsPage.tsx'

interface RouteGuardProps {
  children: ReactNode
}

function ProtectedRoute({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }: RouteGuardProps) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return isAdmin ? children : <Navigate to="/" />;
}

function MainAdminRoute({ children }: RouteGuardProps) {
  const { isMainAdmin, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return isMainAdmin ? children : <Navigate to="/" />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />
        <Route path="badges" element={<BadgesPage />} />
        <Route path="modules" element={<ModulesPage />} />
        <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        {/* Admin routes */}
        <Route path="admin/centres" element={<AdminRoute><AdminCentresPage /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="admin/modules" element={<AdminRoute><AdminModulesPage /></AdminRoute>} />
        <Route path="admin/badges" element={<MainAdminRoute><AdminBadgesPage /></MainAdminRoute>} />
        <Route path="admin/sub-badges" element={<AdminRoute><AdminSubBadgesPage /></AdminRoute>} />
        <Route path="admin/groups" element={<AdminRoute><AdminGroupsPage /></AdminRoute>} />
        <Route path="admin/progress" element={<AdminRoute><AdminProgressPage /></AdminRoute>} />
        <Route path="admin/levels" element={<MainAdminRoute><AdminLevelsPage /></MainAdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
