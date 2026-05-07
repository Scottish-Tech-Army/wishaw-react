/**
 * SuperDashboard.tsx – SuperAdmin Platform Dashboard
 *
 * Step 7.1: Platform Overview Stats
 * Step 7.2: Centre Comparison Section
 * Step 7.3: Platform Activity Feed
 * Step 7.4: Top Performers
 * Step 7.5: Quick Actions
 *
 * Features:
 *   - Platform-wide statistics
 *   - Centre comparison table with sorting
 *   - Cross-centre analytics
 *   - Recent activity feed
 *   - Top performers leaderboard
 *   - Quick action shortcuts
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Zap,
  BookOpen,
  Building2,
  Trophy,
  ClipboardCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Globe,
  ChevronRight,
  Activity,
  Award,
  Clock,
  Star,
  UserPlus,
  Settings,
  FileText,
  Shield,
  Medal,
  Target,
} from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import { useData } from '../../store/dataContextCore';

type SortField = 'name' | 'users' | 'xp' | 'modules' | 'admins';
type SortDirection = 'asc' | 'desc';

interface CentreStats {
  id: string;
  name: string;
  location: string;
  country: string;
  userCount: number;
  adminCount: number;
  totalXP: number;
  moduleCount: number;
  isActive: boolean;
}

export default function SuperDashboard() {
  const { state, getTotalXP } = useData();

  // Sorting state for centres table
  const [sortField, setSortField] = useState<SortField>('users');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 7.1: Platform Overview Stats
  // ─────────────────────────────────────────────────────────────────────────────

  const platformStats = useMemo(() => {
    const totalUsers = state.users.filter((u) => u.role === 'user' && u.isActive).length;
    const totalAdmins = state.users.filter((u) => u.role === 'admin' && u.isActive).length;
    const totalXP = state.users
      .filter((u) => u.role === 'user')
      .reduce((sum, user) => sum + getTotalXP(user.id), 0);
    const activeModules = state.modules.filter((m) => m.status === 'active').length;
    const activeCentres = state.centres.filter((c) => c.isActive).length;
    const activeTournaments = state.tournaments.filter(
      (t) => t.status === 'upcoming' || t.status === 'ongoing'
    ).length;

    // Pending counts
    const pendingActivities = state.activities.filter((a) => a.status === 'pending').length;
    const pendingUsers = state.users.filter(
      (u) => (u.role === 'admin' || u.role === 'superadmin') && !u.isApproved
    ).length;
    const pendingModules = state.modules.filter((m) => !m.isApproved && m.centreId !== null).length;
    const totalPending = pendingActivities + pendingUsers + pendingModules;

    return {
      totalUsers,
      totalAdmins,
      totalXP,
      activeModules,
      activeCentres,
      activeTournaments,
      totalPending,
      pendingActivities,
      pendingUsers,
      pendingModules,
    };
  }, [state, getTotalXP]);

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 7.3: Platform Activity Feed (recent cross-centre activity)
  // ─────────────────────────────────────────────────────────────────────────────

  const recentActivities = useMemo(() => {
    // Get all activities sorted by date, most recent first
    const allActivities = [...state.activities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return allActivities.map((activity) => {
      const user = state.users.find((u) => u.id === activity.userId);
      const centre = user ? state.centres.find((c) => c.id === user.centreId) : null;
      const module = state.modules.find((m) => m.id === activity.moduleId);

      return {
        ...activity,
        userName: user?.displayName || 'Unknown User',
        centreName: centre?.name || 'Unknown Centre',
        moduleName: module?.name || 'Unknown Module',
      };
    });
  }, [state]);

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 7.4: Top Performers (platform-wide leaderboard)
  // ─────────────────────────────────────────────────────────────────────────────

  const topPerformers = useMemo(() => {
    const userStats = state.users
      .filter((u) => u.role === 'user' && u.isActive)
      .map((user) => {
        const xp = getTotalXP(user.id);
        const centre = state.centres.find((c) => c.id === user.centreId);
        const badgeCount = state.userBadgeProgress.filter((ubp) => ubp.userId === user.id).length;
        const completedActivities = state.activities.filter(
          (a) => a.userId === user.id && a.status === 'approved'
        ).length;

        return {
          id: user.id,
          displayName: user.displayName,
          centreName: centre?.name || 'No Centre',
          xp,
          badgeCount,
          completedActivities,
          avatarUrl: user.avatarUrl,
        };
      })
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5);

    return userStats;
  }, [state, getTotalXP]);

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 7.2: Centre Comparison
  // ─────────────────────────────────────────────────────────────────────────────

  const centreStats = useMemo((): CentreStats[] => {
    return state.centres.map((centre) => {
      const centreUsers = state.users.filter(
        (u) => u.centreId === centre.id && u.role === 'user' && u.isActive
      );
      const centreAdmins = state.users.filter(
        (u) => u.centreId === centre.id && u.role === 'admin' && u.isActive
      );
      const centreXP = centreUsers.reduce((sum, user) => sum + getTotalXP(user.id), 0);
      const centreModules = state.modules.filter(
        (m) => m.centreId === centre.id && m.status === 'active'
      ).length;

      return {
        id: centre.id,
        name: centre.name,
        location: centre.location,
        country: centre.country,
        userCount: centreUsers.length,
        adminCount: centreAdmins.length,
        totalXP: centreXP,
        moduleCount: centreModules,
        isActive: centre.isActive,
      };
    });
  }, [state, getTotalXP]);

  // Sort centres
  const sortedCentres = useMemo(() => {
    const sorted = [...centreStats].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'users':
          comparison = a.userCount - b.userCount;
          break;
        case 'xp':
          comparison = a.totalXP - b.totalXP;
          break;
        case 'modules':
          comparison = a.moduleCount - b.moduleCount;
          break;
        case 'admins':
          comparison = a.adminCount - b.adminCount;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [centreStats, sortField, sortDirection]);

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="sort-icon sort-icon--inactive" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="sort-icon" />
    ) : (
      <ArrowDown size={14} className="sort-icon" />
    );
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <AdminShell title="Platform Dashboard">
      <div className="super-dashboard animate-fade-in">
        {/* Platform Header */}
        <div className="super-dashboard__header">
          <div className="super-dashboard__header-content">
            <Globe size={32} className="super-dashboard__header-icon" />
            <div>
              <h1 className="super-dashboard__title">Platform Overview</h1>
              <p className="super-dashboard__subtitle">
                Cross-centre analytics and management
              </p>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            STEP 7.1: Platform Stats Grid
            ───────────────────────────────────────────────────────────────────── */}
        <section className="super-dashboard__stats">
          <div className="super-stat-card">
            <div className="super-stat-card__icon super-stat-card__icon--users">
              <Users size={24} />
            </div>
            <div className="super-stat-card__content">
              <span className="super-stat-card__value">{formatNumber(platformStats.totalUsers)}</span>
              <span className="super-stat-card__label">Total Users</span>
            </div>
            <div className="super-stat-card__trend super-stat-card__trend--up">
              <TrendingUp size={14} />
              Active
            </div>
          </div>

          <div className="super-stat-card">
            <div className="super-stat-card__icon super-stat-card__icon--xp">
              <Zap size={24} />
            </div>
            <div className="super-stat-card__content">
              <span className="super-stat-card__value">{formatNumber(platformStats.totalXP)}</span>
              <span className="super-stat-card__label">Total XP Awarded</span>
            </div>
          </div>

          <div className="super-stat-card">
            <div className="super-stat-card__icon super-stat-card__icon--centres">
              <Building2 size={24} />
            </div>
            <div className="super-stat-card__content">
              <span className="super-stat-card__value">{platformStats.activeCentres}</span>
              <span className="super-stat-card__label">Active Centres</span>
            </div>
            <Link to="/admin/centres" className="super-stat-card__link">
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="super-stat-card">
            <div className="super-stat-card__icon super-stat-card__icon--modules">
              <BookOpen size={24} />
            </div>
            <div className="super-stat-card__content">
              <span className="super-stat-card__value">{platformStats.activeModules}</span>
              <span className="super-stat-card__label">Active Modules</span>
            </div>
            <Link to="/admin/modules" className="super-stat-card__link">
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="super-stat-card">
            <div className="super-stat-card__icon super-stat-card__icon--tournaments">
              <Trophy size={24} />
            </div>
            <div className="super-stat-card__content">
              <span className="super-stat-card__value">{platformStats.activeTournaments}</span>
              <span className="super-stat-card__label">Active Tournaments</span>
            </div>
            <Link to="/tournaments" className="super-stat-card__link">
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="super-stat-card super-stat-card--pending">
            <div className="super-stat-card__icon super-stat-card__icon--pending">
              <ClipboardCheck size={24} />
            </div>
            <div className="super-stat-card__content">
              <span className="super-stat-card__value">{platformStats.totalPending}</span>
              <span className="super-stat-card__label">Pending Approvals</span>
              <div className="super-stat-card__breakdown">
                <span>{platformStats.pendingActivities} activities</span>
                <span>{platformStats.pendingUsers} users</span>
                <span>{platformStats.pendingModules} modules</span>
              </div>
            </div>
            {platformStats.totalPending > 0 && (
              <Link to="/admin/approvals" className="super-stat-card__link super-stat-card__link--alert">
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            STEP 7.2: Centre Comparison Table
            ───────────────────────────────────────────────────────────────────── */}
        <section className="super-dashboard__centres">
          <div className="super-section-header">
            <h2 className="super-section-title">
              <Building2 size={20} />
              Centre Comparison
            </h2>
            <Link to="/admin/centres" className="super-section-link">
              Manage Centres
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="super-centres-table-wrapper">
            <table className="super-centres-table">
              <thead>
                <tr>
                  <th>
                    <button
                      className="super-centres-table__sort-btn"
                      onClick={() => handleSort('name')}
                    >
                      Centre
                      {getSortIcon('name')}
                    </button>
                  </th>
                  <th>
                    <button
                      className="super-centres-table__sort-btn"
                      onClick={() => handleSort('users')}
                    >
                      Users
                      {getSortIcon('users')}
                    </button>
                  </th>
                  <th>
                    <button
                      className="super-centres-table__sort-btn"
                      onClick={() => handleSort('xp')}
                    >
                      Total XP
                      {getSortIcon('xp')}
                    </button>
                  </th>
                  <th>
                    <button
                      className="super-centres-table__sort-btn"
                      onClick={() => handleSort('modules')}
                    >
                      Modules
                      {getSortIcon('modules')}
                    </button>
                  </th>
                  <th>
                    <button
                      className="super-centres-table__sort-btn"
                      onClick={() => handleSort('admins')}
                    >
                      Admins
                      {getSortIcon('admins')}
                    </button>
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedCentres.map((centre) => (
                  <tr key={centre.id} className={centre.isActive ? '' : 'super-centres-table__row--inactive'}>
                    <td>
                      <div className="super-centres-table__centre">
                        <span className="super-centres-table__centre-name">{centre.name}</span>
                        <span className="super-centres-table__centre-location">
                          {centre.location}, {centre.country}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="super-centres-table__number">{centre.userCount}</span>
                    </td>
                    <td>
                      <span className="super-centres-table__xp">{formatNumber(centre.totalXP)}</span>
                    </td>
                    <td>
                      <span className="super-centres-table__number">{centre.moduleCount}</span>
                    </td>
                    <td>
                      <span className="super-centres-table__number">{centre.adminCount}</span>
                    </td>
                    <td>
                      <span
                        className={`super-centres-table__status ${
                          centre.isActive
                            ? 'super-centres-table__status--active'
                            : 'super-centres-table__status--inactive'
                        }`}
                      >
                        {centre.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedCentres.length === 0 && (
            <div className="empty-state">
              <Building2 size={40} className="empty-state-icon" />
              <p className="empty-state-title">No centres found</p>
              <p className="empty-state-description">
                Create your first centre to get started.
              </p>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            STEP 7.3 & 7.4: Activity Feed + Top Performers (Side by Side)
            ───────────────────────────────────────────────────────────────────── */}
        <div className="super-dashboard__grid">
          {/* STEP 7.3: Platform Activity Feed */}
          <section className="super-activity-feed">
            <div className="super-section-header">
              <h2 className="super-section-title">
                <Activity size={20} />
                Recent Activity
              </h2>
              <Link to="/admin/approvals" className="super-section-link">
                View All
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="super-activity-feed__list">
              {recentActivities.length === 0 ? (
                <div className="super-activity-feed__empty">
                  <Clock size={32} className="empty-state-icon" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="super-activity-item">
                    <div className={`super-activity-item__icon super-activity-item__icon--${activity.status}`}>
                      {activity.status === 'approved' && <Award size={16} />}
                      {activity.status === 'pending' && <Clock size={16} />}
                      {activity.status === 'rejected' && <Target size={16} />}
                    </div>
                    <div className="super-activity-item__content">
                      <div className="super-activity-item__header">
                        <span className="super-activity-item__user">{activity.userName}</span>
                        <span className={`super-activity-item__status super-activity-item__status--${activity.status}`}>
                          {activity.status}
                        </span>
                      </div>
                      <p className="super-activity-item__type">{activity.type}</p>
                      <div className="super-activity-item__meta">
                        <span className="super-activity-item__centre">
                          <Building2 size={12} />
                          {activity.centreName}
                        </span>
                        <span className="super-activity-item__xp">
                          <Zap size={12} />
                          +{activity.xpAwarded} XP
                        </span>
                      </div>
                    </div>
                    <div className="super-activity-item__time">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* STEP 7.4: Top Performers */}
          <section className="super-top-performers">
            <div className="super-section-header">
              <h2 className="super-section-title">
                <Star size={20} />
                Top Performers
              </h2>
              <Link to="/leaderboard" className="super-section-link">
                Full Leaderboard
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="super-top-performers__list">
              {topPerformers.length === 0 ? (
                <div className="super-top-performers__empty">
                  <Medal size={32} className="empty-state-icon" />
                  <p>No performers yet</p>
                </div>
              ) : (
                topPerformers.map((performer, index) => (
                  <div key={performer.id} className="super-performer-item">
                    <div className={`super-performer-item__rank super-performer-item__rank--${index + 1}`}>
                      {index < 3 ? (
                        <Medal size={20} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="super-performer-item__avatar">
                      {performer.avatarUrl ? (
                        <img src={performer.avatarUrl} alt={performer.displayName} />
                      ) : (
                        <Users size={18} />
                      )}
                    </div>
                    <div className="super-performer-item__info">
                      <span className="super-performer-item__name">{performer.displayName}</span>
                      <span className="super-performer-item__centre">
                        <Building2 size={12} />
                        {performer.centreName}
                      </span>
                    </div>
                    <div className="super-performer-item__stats">
                      <span className="super-performer-item__xp">
                        <Zap size={14} />
                        {formatNumber(performer.xp)}
                      </span>
                      <span className="super-performer-item__badges">
                        <Award size={12} />
                        {performer.badgeCount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            STEP 7.5: Quick Actions Panel
            ───────────────────────────────────────────────────────────────────── */}
        <section className="super-quick-actions">
          <div className="super-section-header">
            <h2 className="super-section-title">
              <Settings size={20} />
              Quick Actions
            </h2>
          </div>

          <div className="super-quick-actions__grid">
            <Link to="/admin/users" className="super-quick-action">
              <div className="super-quick-action__icon super-quick-action__icon--users">
                <UserPlus size={24} />
              </div>
              <div className="super-quick-action__content">
                <span className="super-quick-action__title">Manage Users</span>
                <span className="super-quick-action__desc">Add, edit, or deactivate users</span>
              </div>
              <ChevronRight size={18} className="super-quick-action__arrow" />
            </Link>

            <Link to="/admin/modules" className="super-quick-action">
              <div className="super-quick-action__icon super-quick-action__icon--modules">
                <FileText size={24} />
              </div>
              <div className="super-quick-action__content">
                <span className="super-quick-action__title">Manage Modules</span>
                <span className="super-quick-action__desc">Create or edit learning modules</span>
              </div>
              <ChevronRight size={18} className="super-quick-action__arrow" />
            </Link>

            <Link to="/admin/centres" className="super-quick-action">
              <div className="super-quick-action__icon super-quick-action__icon--centres">
                <Building2 size={24} />
              </div>
              <div className="super-quick-action__content">
                <span className="super-quick-action__title">Manage Centres</span>
                <span className="super-quick-action__desc">Add new centres or groups</span>
              </div>
              <ChevronRight size={18} className="super-quick-action__arrow" />
            </Link>

            <Link to="/admin/approvals" className="super-quick-action">
              <div className="super-quick-action__icon super-quick-action__icon--approvals">
                <Shield size={24} />
              </div>
              <div className="super-quick-action__content">
                <span className="super-quick-action__title">Approvals</span>
                <span className="super-quick-action__desc">
                  {platformStats.totalPending > 0
                    ? `${platformStats.totalPending} items pending review`
                    : 'No pending approvals'}
                </span>
              </div>
              <ChevronRight size={18} className="super-quick-action__arrow" />
            </Link>

            <Link to="/tournaments" className="super-quick-action">
              <div className="super-quick-action__icon super-quick-action__icon--tournaments">
                <Trophy size={24} />
              </div>
              <div className="super-quick-action__content">
                <span className="super-quick-action__title">Tournaments</span>
                <span className="super-quick-action__desc">Create cross-centre tournaments</span>
              </div>
              <ChevronRight size={18} className="super-quick-action__arrow" />
            </Link>

            <Link to="/admin/badges" className="super-quick-action">
              <div className="super-quick-action__icon super-quick-action__icon--badges">
                <Award size={24} />
              </div>
              <div className="super-quick-action__content">
                <span className="super-quick-action__title">Manage Badges</span>
                <span className="super-quick-action__desc">Configure badges and XP tiers</span>
              </div>
              <ChevronRight size={18} className="super-quick-action__arrow" />
            </Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
