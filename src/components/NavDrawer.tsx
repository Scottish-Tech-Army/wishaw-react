import { useState, useEffect, useRef } from 'react'
import { navigate } from '../lib/navigate'
import { useAuth } from '../auth/AuthContext'
import '../styles/nav-drawer.css'

interface NavItem {
  label: string
  path: string
  icon: string
  section?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Player Dashboard', path: '/dashboard', icon: 'dashboard',        section: 'player' },
  { label: 'Badges',           path: '/badges',     icon: 'military_tech',    section: 'player' },
  { label: 'Challenges',       path: '/submit',     icon: 'assignment_turned_in', section: 'player' },
  { label: 'Leaderboard',      path: '/leaderboard',icon: 'leaderboard',      section: 'player' },
  { label: 'Admin Dashboard',  path: '/admin',      icon: 'admin_panel_settings', section: 'admin' },
  { label: 'User Management',  path: '/admin/users', icon: 'group',           section: 'admin' },
  { label: 'Badge Management', path: '/admin/badges', icon: 'military_tech',  section: 'admin' },
  { label: 'Manage Groups',    path: '/groups',     icon: 'groups',           section: 'admin' },
  { label: 'Parent View',      path: '/parent',     icon: 'family_restroom',  section: 'other' },
]

interface Props {
  currentPath: string
}

export default function NavDrawer({ currentPath }: Readonly<Props>) {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLElement>(null)
  const { logout } = useAuth()

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  /* Trap focus inside when open */
  useEffect(() => {
    if (open) document.body.classList.add('nav-drawer-body-lock')
    else document.body.classList.remove('nav-drawer-body-lock')
    return () => document.body.classList.remove('nav-drawer-body-lock')
  }, [open])

  function handleNav(path: string) {
    navigate(path)
    setOpen(false)
  }

  return (
    <>
      {/* Floating trigger button (fixed, bottom-left) */}
      <button
        className="nav-fab"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <span className="material-symbol">menu</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="nav-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <nav
        ref={drawerRef}
        className={`nav-drawer ${open ? 'nav-drawer--open' : ''}`}
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="nav-drawer-header">
          <div className="nav-drawer-brand">
            <div className="nav-drawer-logo">
              <span className="material-symbol" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <div>
              <strong>WISHAW ARENA</strong>
              <small>YMCA Esports Division</small>
            </div>
          </div>
          <button
            className="nav-drawer-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <span className="material-symbol">close</span>
          </button>
        </div>

        {/* Player links */}
        <div className="nav-drawer-section-label">Player</div>
        <ul className="nav-drawer-list">
          {NAV_ITEMS.filter(n => n.section === 'player').map(item => (
            <li key={item.path}>
              <button
                className={`nav-drawer-link ${currentPath === item.path ? 'nav-drawer-link--active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <span className="material-symbol">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Admin links */}
        <div className="nav-drawer-section-label">Admin</div>
        <ul className="nav-drawer-list">
          {NAV_ITEMS.filter(n => n.section === 'admin').map(item => (
            <li key={item.path}>
              <button
                className={`nav-drawer-link ${currentPath === item.path ? 'nav-drawer-link--active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <span className="material-symbol">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Other links */}
        <div className="nav-drawer-section-label">Other</div>
        <ul className="nav-drawer-list">
          {NAV_ITEMS.filter(n => n.section === 'other').map(item => (
            <li key={item.path}>
              <button
                className={`nav-drawer-link ${currentPath === item.path ? 'nav-drawer-link--active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <span className="material-symbol">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="nav-drawer-footer">
          <button
            className="nav-drawer-link nav-drawer-link--logout"
            onClick={() => { setOpen(false); logout(); }}
          >
            <span className="material-symbol">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  )
}
