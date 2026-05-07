/**
 * Admin Dashboard.tsx
 *
 * Overview page with:
 *   - Stats cards (users, pending, modules, XP)
 *   - Recent activity feed
 *   - Quick action buttons
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  BookOpen,
  Zap,
  TrendingUp,
  UserPlus,
  Award,
  Activity,
  ArrowRight,
} from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import ActivityItem from '../../components/ui/ActivityItem';
import { useAuth } from '../../store/authContextCore';
import { useData } from '../../store/dataContextCore';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  linkTo?: string;
}

export default function Dashboard() {
  const { currentUser, isSuperAdmin } = useAuth();
  const { state, getTotalXP } = useData();

  // Filter data based on admin's centre (superadmin sees all)
  const centreId = currentUser?.centreId ?? '';

  const filteredUsers = useMemo(() => {
    if (isSuperAdmin) return state.users.filter((u) => u.role === 'user');
    return state.users.filter((u) => u.role === 'user' && u.centreId === centreId);
  }, [state.users, centreId, isSuperAdmin]);

  const filteredActivities = useMemo(() => {
    if (isSuperAdmin) return state.activities;
    const userIds = new Set(filteredUsers.map((u) => u.id));
    return state.activities.filter((a) => userIds.has(a.userId));
  }, [state.activities, filteredUsers, isSuperAdmin]);

  const filteredModules = useMemo(() => {
    if (isSuperAdmin) return state.modules;
    return state.modules.filter((m) => m.centreId === null || m.centreId === centreId);
  }, [state.modules, centreId, isSuperAdmin]);

  // Calculate stats
  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter((u) => u.isActive).length;
  const pendingApprovals = filteredActivities.filter((a) => a.status === 'pending').length;
  const activeModules = filteredModules.filter((m) => m.status === 'active').length;

  const totalXPAwarded = useMemo(() => {
    return filteredUsers.reduce((sum, user) => sum + getTotalXP(user.id), 0);
  }, [filteredUsers, getTotalXP]);

  // Recent activities (last 10, sorted by date)
  const recentActivities = useMemo(() => {
    return [...filteredActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [filteredActivities]);

  // Get user name by ID
  const getUserName = (userId: string): string => {
    const user = state.users.find((u) => u.id === userId);
    return user?.displayName ?? 'Unknown User';
  };

  // Stats cards config
  const stats: StatCard[] = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: <Users size={24} />,
      change: `${activeUsers} active`,
      changeType: 'neutral',
      linkTo: '/admin/users',
    },
    {
      label: 'Pending Approvals',
      value: pendingApprovals,
      icon: <ClipboardCheck size={24} />,
      change: pendingApprovals > 0 ? 'Needs attention' : 'All clear',
      changeType: pendingApprovals > 0 ? 'negative' : 'positive',
      linkTo: '/admin/approvals',
    },
    {
      label: 'Active Modules',
      value: activeModules,
      icon: <BookOpen size={24} />,
      change: `${filteredModules.length} total`,
      changeType: 'neutral',
      linkTo: '/admin/modules',
    },
    {
      label: 'Total XP Awarded',
      value: totalXPAwarded.toLocaleString(),
      icon: <Zap size={24} />,
      change: 'Across all users',
      changeType: 'positive',
    },
  ];

  // Quick actions
  const quickActions = [
    { label: 'Add User', icon: <UserPlus size={18} />, to: '/admin/users' },
    { label: 'Award XP', icon: <Award size={18} />, to: '/admin/badges' },
    { label: 'Review Approvals', icon: <ClipboardCheck size={18} />, to: '/admin/approvals' },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="admin-dashboard animate-fade-in">
        {/* Stats Grid */}
        <section className="admin-dashboard__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="admin-stat-card">
              <div className="admin-stat-card__icon">{stat.icon}</div>
              <div className="admin-stat-card__content">
                <span className="admin-stat-card__value">{stat.value}</span>
                <span className="admin-stat-card__label">{stat.label}</span>
                {stat.change && (
                  <span
                    className={`admin-stat-card__change admin-stat-card__change--${stat.changeType}`}
                  >
                    <TrendingUp size={12} />
                    {stat.change}
                  </span>
                )}
              </div>
              {stat.linkTo && (
                <Link to={stat.linkTo} className="admin-stat-card__link">
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="admin-dashboard__actions">
          <h2 className="admin-section-title">Quick Actions</h2>
          <div className="admin-dashboard__actions-grid">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.to} className="admin-action-btn">
                {action.icon}
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="admin-dashboard__activity">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <Activity size={20} />
              Recent Activity
            </h2>
            <Link to="/admin/approvals" className="admin-section-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentActivities.length > 0 ? (
            <div className="admin-dashboard__activity-list">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <ActivityItem
                    activity={activity}
                    showUser
                    userName={getUserName(activity.userId)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Activity size={40} className="empty-state-icon" />
              <p className="empty-state-title">No recent activity</p>
              <p className="empty-state-description">
                Activity from users in your centre will appear here.
              </p>
            </div>
          )}
        </section>

        {/* Centre Info (for admins) */}
        {!isSuperAdmin && currentUser && (
          <section className="admin-dashboard__centre">
            <h2 className="admin-section-title">Your Centre</h2>
            <div className="admin-centre-card">
              <div className="admin-centre-card__info">
                <span className="admin-centre-card__name">
                  {state.centres.find((c) => c.id === currentUser.centreId)?.name ?? 'Unknown'}
                </span>
                <span className="admin-centre-card__location">
                  {state.centres.find((c) => c.id === currentUser.centreId)?.location}
                </span>
              </div>
              <Link to="/admin/centres" className="btn btn-secondary btn-sm">
                Manage
              </Link>
            </div>
          </section>
        )}

        {/* Superadmin: All Centres Overview */}
        {isSuperAdmin && (
          <section className="admin-dashboard__centres">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Centres Overview</h2>
              <Link to="/admin/centres" className="admin-section-link">
                Manage All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="admin-centres-grid">
              {state.centres.map((centre) => {
                const centreUsers = state.users.filter(
                  (u) => u.centreId === centre.id && u.role === 'user'
                ).length;
                return (
                  <div key={centre.id} className="admin-centre-mini-card">
                    <span className="admin-centre-mini-card__name">{centre.name}</span>
                    <span className="admin-centre-mini-card__users">
                      {centreUsers} users
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </AdminShell>
  );
}
