/**
 * AdminShell.tsx
 *
 * Wrapper for all admin/superadmin pages with:
 *   - Collapsible sidebar navigation
 *   - Header with user info and logout
 *   - Mobile-responsive hamburger menu
 */

import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Award,
  BookOpen,
  Building2,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronLeft,
  Globe,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../store/authContextCore';

interface Props {
  readonly children: ReactNode;
  readonly title?: string;
}

interface NavItem {
  to: string;
  icon: ReactNode;
  label: string;
  superadminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/superadmin', icon: <Globe size={20} />, label: 'Platform', superadminOnly: true },
  { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/admin/approvals', icon: <ClipboardCheck size={20} />, label: 'Approvals' },
  { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
  { to: '/admin/badges', icon: <Award size={20} />, label: 'Badges' },
  { to: '/admin/modules', icon: <BookOpen size={20} />, label: 'Modules' },
  { to: '/admin/centres', icon: <Building2 size={20} />, label: 'Centres' },
  { to: '/tournaments', icon: <Trophy size={20} />, label: 'Tournaments' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function AdminShell({ children, title }: Props) {
  const { currentUser, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);

  if (!currentUser) {
    return (
      <div className="admin-shell">
        <div className="page-spinner">
          <div className="spinner" />
          <span className="page-spinner-text">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="admin-overlay"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__brand">
            <span className="admin-sidebar__logo">⚡</span>
            <span className="admin-sidebar__title">YMCA Admin</span>
          </div>
          <button
            className="admin-sidebar__close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => {
            // Skip superadmin-only items for regular admins
            if (item.superadminOnly && !isSuperAdmin) return null;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                }
                onClick={closeSidebar}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__role">
            <Shield size={14} />
            <span>{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
          </div>
          <button
            className="admin-sidebar__back"
            onClick={() => navigate('/')}
          >
            <ChevronLeft size={16} />
            <span>User Portal</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <button
            className="admin-header__menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {title && <h1 className="admin-header__title">{title}</h1>}

          <div className="admin-header__user">
            <div className="admin-header__avatar">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.displayName} />
              ) : (
                <span>{getInitials(currentUser.displayName)}</span>
              )}
            </div>
            <div className="admin-header__info">
              <span className="admin-header__name">{currentUser.displayName}</span>
              <span className="admin-header__role-badge">
                {isSuperAdmin ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <button
              className="admin-header__logout"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
