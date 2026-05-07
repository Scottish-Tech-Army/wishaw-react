import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// ── Lazy-loaded pages (code-split by route) ──────────────────────────────────
// User portal
const UserHome      = lazy(() => import('./pages/user/Home'));
const UserProfile   = lazy(() => import('./pages/user/Profile'));
const Leaderboard   = lazy(() => import('./pages/user/Leaderboard'));
const UserModules   = lazy(() => import('./pages/user/Modules'));

// Admin dashboard
const AdminDashboard  = lazy(() => import('./pages/admin/Dashboard'));
const AdminApprovals  = lazy(() => import('./pages/admin/Approvals'));
const ManageUsers     = lazy(() => import('./pages/admin/ManageUsers'));
const ManageBadges    = lazy(() => import('./pages/admin/ManageBadges'));
const ManageModules   = lazy(() => import('./pages/admin/ManageModules'));
const ManageCentres   = lazy(() => import('./pages/admin/ManageCentres'));

// Super admin
const SuperDashboard  = lazy(() => import('./pages/superadmin/SuperDashboard'));

// Tournaments (shared)
const Tournaments     = lazy(() => import('./pages/Tournaments'));

// Fallback while lazy chunks load
function PageSpinner() {
  return (
    <div className="page-spinner">
      <div className="page-spinner__ring" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSpinner />}>
        <Routes>

          {/* ── Public ────────────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />

          {/* ── User portal (any authenticated user) ──────────────────── */}
          <Route path="/" element={
            <ProtectedRoute requiredRole="user">
              <UserHome />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requiredRole="user">
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute requiredRole="user">
              <Leaderboard />
            </ProtectedRoute>
          } />
          <Route path="/modules" element={
            <ProtectedRoute requiredRole="user">
              <UserModules />
            </ProtectedRoute>
          } />
          <Route path="/tournaments" element={
            <ProtectedRoute requiredRole="user">
              <Tournaments />
            </ProtectedRoute>
          } />

          {/* ── Admin dashboard ───────────────────────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/approvals" element={
            <ProtectedRoute requiredRole="admin">
              <AdminApprovals />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/badges" element={
            <ProtectedRoute requiredRole="admin">
              <ManageBadges />
            </ProtectedRoute>
          } />
          <Route path="/admin/modules" element={
            <ProtectedRoute requiredRole="admin">
              <ManageModules />
            </ProtectedRoute>
          } />
          <Route path="/admin/centres" element={
            <ProtectedRoute requiredRole="admin">
              <ManageCentres />
            </ProtectedRoute>
          } />

          {/* ── Super admin ───────────────────────────────────────────── */}
          <Route path="/superadmin" element={
            <ProtectedRoute requiredRole="superadmin">
              <SuperDashboard />
            </ProtectedRoute>
          } />

          {/* ── Catch-all → login ─────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
