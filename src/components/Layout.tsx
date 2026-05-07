import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import UserGuide from './UserGuide';
import logo from '../assets/logo.png';

const PRIMARY_LINKS = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/profile', label: 'My Profile', icon: '👤' },
  { to: '/badges', label: 'Badges', icon: '🏅' },
  { to: '/modules', label: 'Modules', icon: '📚' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

const ADMIN_LINKS = [
  { to: '/admin/centres', label: 'Centres', icon: '🏢', mainAdminOnly: true },
  { to: '/admin/groups', label: 'Groups', icon: '🎯' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/badges', label: 'Badges', icon: '🏅', mainAdminOnly: true },
  { to: '/admin/sub-badges', label: 'Sub-Badges', icon: '⭐' },
  { to: '/admin/legacy-points', label: 'Legacy Points', icon: '🏛️' },
  { to: '/admin/modules', label: 'Modules', icon: '📦' },
  { to: '/admin/levels', label: 'Levels', icon: '📊', mainAdminOnly: true },
  { to: '/admin/progress', label: 'Award Progress', icon: '✓' },
];

export default function Layout() {
  const { user, logout, isAdmin, isMainAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.role) return;

    const guideKey = `wishaw-user-guide:${user.userId || user.username}:${user.role}`;
    if (localStorage.getItem(guideKey)) return;

    setGuideOpen(true);
    localStorage.setItem(guideKey, 'seen');
  }, [user?.role, user?.userId, user?.username]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);
  const openGuide = () => {
    setSidebarOpen(false);
    setGuideOpen(true);
  };

  const sidebarDisplayName = user?.displayName || user?.username || 'User';

  const visibleAdminLinks = ADMIN_LINKS.filter((link) => !link.mainAdminOnly || isMainAdmin);

  const renderNavLink = ({ to, label, icon, end = false }) => (
    <NavLink key={to} to={to} end={end}>
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      <span className="nav-label">{label}</span>
    </NavLink>
  );

  return (
    <div className="app-layout">
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open navigation menu">☰</button>
        <div className="mobile-header__brand">
          <div className="brand-copy">
            <strong className="mobile-brand-user">{sidebarDisplayName}</strong>
          </div>
        </div>
        <div className="header-actions">
          <button className="header-icon-btn" onClick={openGuide} title="Open user guide" aria-label="Open user guide">
            <span className="control-icon" aria-hidden="true">?</span>
          </button>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            <span className="control-icon" aria-hidden="true">{theme === 'light' ? '◐' : '☀'}</span>
          </button>
        </div>
      </div>

      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img className="brand-logo" src={logo} alt="YMCA eSports" />
          <div className="sidebar-user-bar">
            <strong className="sidebar-username" title={sidebarDisplayName}>{sidebarDisplayName}</strong>
            <div className="header-actions">
              <button className="header-icon-btn" onClick={openGuide} title="Open user guide" aria-label="Open user guide">
                <span className="control-icon" aria-hidden="true">?</span>
              </button>
              <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
                <span className="control-icon" aria-hidden="true">{theme === 'light' ? '◐' : '☀'}</span>
              </button>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav" onClick={closeSidebar}>
          <div className="sidebar-group-label">Explore</div>
          {PRIMARY_LINKS.map(renderNavLink)}

          {isAdmin && (
            <>
              <div className="sidebar-group-label">Admin</div>
              {visibleAdminLinks.map(renderNavLink)}
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-outline btn-block" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-shell">
          <Outlet />
        </div>
      </main>

      <UserGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
