/**
 * BottomNav.tsx
 *
 * Mobile-first bottom navigation bar.
 * 4 tabs: Home | Leaderboard | Modules | Profile
 * Highlights the active route using NavLink.
 */

import { NavLink } from 'react-router-dom';
import { Home, Trophy, BookOpen, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',            label: 'Home',        Icon: Home },
  { to: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
  { to: '/modules',     label: 'Modules',     Icon: BookOpen },
  { to: '/profile',     label: 'Profile',     Icon: User },
] as const;

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
          }
          aria-label={label}
        >
          <Icon size={22} className="bottom-nav__icon" />
          <span className="bottom-nav__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
