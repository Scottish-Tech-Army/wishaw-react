/**
 * PageShell.tsx
 *
 * Wraps every user-portal page with:
 *   - Top header: academy logo + page title + user avatar (logout on click)
 *   - Scrollable content area
 *   - BottomNav fixed at the bottom
 *
 * Admin/superadmin pages use their own shell (built in Step 5).
 */

import type { ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import BottomNav from './BottomNav';
import { useAuth } from '../../store/authContextCore';

interface Props {
  readonly children: ReactNode;
  /** Page title shown in the header */
  readonly title?: string;
  /** Hide BottomNav (e.g. on full-screen detail pages) */
  readonly hideNav?: boolean;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function PageShell({ children, title, hideNav = false }: Props) {
  const { currentUser, logout, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="page-shell">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="page-shell__header">
        <div className="page-shell__brand">
          <span className="page-shell__logo">⚡</span>
          <span className="page-shell__academy">YMCA Esports</span>
        </div>

        {title && <h1 className="page-shell__title">{title}</h1>}

        <div className="page-shell__actions">
          {currentUser && (
            <>
              {(isAdmin || isSuperAdmin) && (
                <Link
                  to={isSuperAdmin ? '/superadmin' : '/admin'}
                  className="page-shell__admin-link"
                  title="Admin Panel"
                >
                  <Shield size={18} />
                </Link>
              )}
              <div className="page-shell__avatar" title={currentUser.displayName}>
                {currentUser.avatarUrl
                  ? <img src={currentUser.avatarUrl} alt={currentUser.displayName} />
                  : <span>{initials(currentUser.displayName)}</span>
                }
              </div>
              <button
                className="page-shell__logout"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────── */}
      <main className="page-shell__content">
        {children}
      </main>

      {/* ── Bottom nav ─────────────────────────────────────────────── */}
      {!hideNav && <BottomNav />}
    </div>
  );
}
