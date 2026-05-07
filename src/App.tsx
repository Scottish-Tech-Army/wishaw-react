import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth-store';
import { ProtectedRoute, AuthRoute } from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import BadgesPage from './pages/BadgesPage';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import MatchDetailPage from './pages/MatchDetailPage';
import MyTournamentsPage from './pages/MyTournamentsPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import SportsManagement from './pages/admin/SportsManagement';
import AdminTournaments from './pages/admin/AdminTournaments';
import TournamentForm from './pages/admin/TournamentForm';
import AdminTournamentDetail from './pages/admin/AdminTournamentDetail';
import BadgesManagement from './pages/admin/BadgesManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCentres from './pages/admin/AdminCentres';
import AdminModules from './pages/admin/AdminModules';
import AdminImportLab from './pages/admin/AdminImportLab';

export default function App() {
  const { initialize } = useAuthStore();
  useEffect(() => { initialize(); }, [initialize]);

  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
      <Route path="/modules" element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
      <Route path="/modules/:id" element={<ProtectedRoute><ModuleDetailPage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/tournaments" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
      <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetailPage /></ProtectedRoute>} />
      <Route path="/matches/:id" element={<ProtectedRoute><MatchDetailPage /></ProtectedRoute>} />
      <Route path="/my-tournaments" element={<ProtectedRoute><MyTournamentsPage /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/sports" element={<ProtectedRoute adminOnly><SportsManagement /></ProtectedRoute>} />
      <Route path="/admin/tournaments" element={<ProtectedRoute adminOnly><AdminTournaments /></ProtectedRoute>} />
      <Route path="/admin/tournaments/create" element={<ProtectedRoute adminOnly><TournamentForm /></ProtectedRoute>} />
      <Route path="/admin/tournaments/:id" element={<ProtectedRoute adminOnly><AdminTournamentDetail /></ProtectedRoute>} />
      <Route path="/admin/tournaments/:id/edit" element={<ProtectedRoute adminOnly><TournamentForm /></ProtectedRoute>} />
      <Route path="/admin/badges" element={<ProtectedRoute adminOnly><BadgesManagement /></ProtectedRoute>} />
      <Route path="/admin/modules" element={<ProtectedRoute adminOnly><AdminModules /></ProtectedRoute>} />
      <Route path="/admin/import-lab" element={<ProtectedRoute adminOnly><AdminImportLab /></ProtectedRoute>} />
      <Route path="/admin/centres" element={<ProtectedRoute adminOnly><AdminCentres /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
