import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useNotificationStore } from '../store/notification-store';
import ThemeToggle from './ThemeToggle';
import {
  Trophy, Home, User, Bell, LogOut, Menu, X,
  LayoutDashboard, Swords, Calendar, Award, BarChart3, BookOpen, MapPin, Upload,
} from 'lucide-react';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import NotificationPopup from './NotificationPopup';

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, logout, isAdmin } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchNotifications();
    const interval = setInterval(() => { if (user) fetchNotifications(); }, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const playerNav = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/badges', icon: Award, label: 'Badges' },
    { path: '/modules', icon: BookOpen, label: 'Modules' },
    { path: '/leaderboard', icon: BarChart3, label: 'Leaderboard' },
    { path: '/tournaments', icon: Trophy, label: 'Tournaments' },
    { path: '/my-tournaments', icon: Calendar, label: 'My Tournaments' },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const adminNav = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/sports', icon: Swords, label: 'Sports' },
    { path: '/admin/tournaments', icon: Trophy, label: 'Tournaments' },
    { path: '/admin/badges', icon: Award, label: 'Badges' },
    { path: '/admin/modules', icon: BookOpen, label: 'Modules' },
    { path: '/admin/import-lab', icon: Upload, label: 'Import Lab' },
    { path: '/admin/centres', icon: MapPin, label: 'Centres' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  // For admins, only show player nav items that don't overlap with admin nav
  const adminPlayerNav = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/leaderboard', icon: BarChart3, label: 'Leaderboard' },
    { path: '/my-tournaments', icon: Calendar, label: 'My Tournaments' },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  type NavItem = { path: string; icon: typeof Home; label: string; divider?: never } | { divider: true; path?: never; icon?: never; label?: never };
  const navItems: NavItem[] = isAdmin() ? [...adminNav, { divider: true as const }, ...adminPlayerNav] : playerNav;

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-surface-800 border-r border-surface-700/50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex items-center gap-3 border-b border-surface-700/50 px-5 py-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-300/80">Academy</p>
            <h1 className="font-bold text-white text-sm">WYMCA eSports</h1>
            <p className="text-xs text-surface-400">Badge portal and tournaments</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-surface-400" /></button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item, i) => {
            if (item.divider) return <div key={i} className="border-t border-surface-700/50 my-3" />;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-primary-500/15 text-primary-300 border border-primary-500/20' : 'text-surface-400 hover:text-white hover:bg-surface-700/50')}>
                <item.icon className="w-4 h-4" />{item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-surface-700/50">
          <div className="flex items-center gap-3 px-3 py-2">
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 text-sm font-semibold">
              {profile?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.displayName || 'User'}</p>
              <p className="text-xs text-surface-400 truncate">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-red-400 transition-colors"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-surface-900/80 backdrop-blur-lg border-b border-surface-700/50">
          <div className="flex items-center gap-4 px-4 py-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-surface-800" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5 text-surface-300" /></button>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.22em] text-surface-500">Live workspace</p>
              <p className="text-sm font-semibold text-white">{isAdmin() ? 'Admin control room' : 'Player dashboard'}</p>
            </div>
            <ThemeToggle />
            <Link to="/notifications" className="relative rounded-lg p-2 hover:bg-surface-800 transition-colors">
              <Bell className="w-5 h-5 text-surface-300" />
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
      <NotificationPopup />
    </div>
  );
}
