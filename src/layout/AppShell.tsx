import { LayoutDashboard, LogOut, Medal, Shield, ShieldCheck, Trophy } from 'lucide-react'
import type { ComponentType } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ size?: number }>
}

export function AppShell() {
  const { role, user, logout } = useAuthStore()

  const items: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/badges', label: 'Badges', icon: Medal },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  if (role === 'centre_admin') {
    items.push({ to: '/admin/centre', label: 'Centre Admin', icon: Shield })
  }

  if (role === 'main_admin') {
    items.push({ to: '/admin/main', label: 'Main Admin', icon: ShieldCheck })
  }

  return (
    <div className="app-shell">
      <header className="top-bar" role="banner">
        <div>
          <p className="eyebrow">Wishaw Progress Hub</p>
          <h1>{role === 'user' ? 'Player Dashboard' : 'Admin Portal'}</h1>
        </div>
        <div className="top-bar-actions">
          <span aria-label="Logged in user">{user?.displayName}</span>
          <button type="button" className="button ghost" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="shell-content">
        <nav className="sidebar" aria-label="Primary">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <main className="page-main" role="main">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Mobile primary">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} end className={({ isActive }) => `bottom-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
