import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../../portal.css";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import { useDashboard } from "../../../hooks/useDashboard";
import { BadgeCatalogueProvider } from "../../../context/BadgeCatalogueContext";
import { DEFAULT_AVATAR_URL } from "../../../constants";

const MAX_NOTIF = 5; // max recent activity items to surface in the bell dropdown

export default function StudentLayout() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Guard: redirect non-students and unauthenticated visitors out of the portal.
  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Fetch dashboard summary to power the notifications dropdown.
  const { data, loading: notifLoading, error: notifError, refresh: refreshNotif } =
    useDashboard(user?.studentId);

  const recentActivity = (data?.recentActivity ?? []).slice(0, MAX_NOTIF);

  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Track unread notifications count
  useEffect(() => {
    setUnreadCount(recentActivity.length);
  }, [recentActivity.length]);

  // Clear badge when dropdown opens
  useEffect(() => {
    if (notifOpen && unreadCount > 0) {
      // Store the timestamp when notifications were last viewed
      localStorage.setItem('notif_last_viewed', new Date().toISOString());
      // Clear the badge after a brief delay to give visual feedback
      const timer = setTimeout(() => setUnreadCount(0), 300);
      return () => clearTimeout(timer);
    }
  }, [notifOpen, unreadCount]);

  // Close on outside click or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div className="sp-layout">
      {/* Mobile backdrop — closes menu on tap outside */}
      {menuOpen && (
        <div
          className="sp-sidebar__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / mobile drawer */}
      <aside className={`sp-sidebar${menuOpen ? " sp-sidebar--open" : ""}`}>
        <div className="sp-sidebar__header">
          <span className="sp-sidebar__logo-icon">🎮</span>
          <div>
            <div className="sp-sidebar__brand">WYMCA Esports</div>
            <div className="sp-sidebar__portal-label">Student Portal</div>
          </div>
          {/* Mobile-only: close button inside the open drawer */}
          <button
            className="sp-sidebar__hamburger"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="sp-sidebar__nav" aria-label="Student portal navigation">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">🏠</span>
            Dashboard
          </NavLink>
          <NavLink
            to="/student/leaderboard"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">🏆</span>
            Leaderboard
          </NavLink>
          <NavLink
            to="/student/badges"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">🏅</span>
            Badges
          </NavLink>
          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">👤</span>
            My Profile
          </NavLink>
          <NavLink
            to="/student/teams"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">👥</span>
            Teams
          </NavLink>
          <NavLink
            to="/student/submit-evidence"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">📤</span>
            Submit Evidence
          </NavLink>
        </nav>

        <div className="sp-sidebar__footer">
          <NavLink
            to="/student/settings"
            className={({ isActive }) =>
              "sp-sidebar__settings-btn" + (isActive ? " sp-sidebar__settings-btn--active" : "")
            }
            title="Settings"
            aria-label="Settings"
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__settings-icon">⚙️</span>
            Settings
          </NavLink>
          <button className="sp-sidebar__exit-btn" onClick={() => navigate("/")}>
            ← Exit Portal
          </button>
          <button className="sp-sidebar__logout-btn" onClick={() => { logout(); navigate("/"); }}>
            ⏻ Log out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="sp-main">
        {/* Mobile-only top bar with hamburger */}
        <div className="sp-mobile-header">
          <button
            className="sp-mobile-header__hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
          <span className="sp-mobile-header__brand">🎮 WYMCA Esports</span>
        </div>

        {/* Top bar */}
        <header className="sp-topbar">
          <div className="sp-topbar__left">
            <span className="sp-topbar__greeting">
              Welcome back, <strong>{user?.username ?? "Player"}</strong> 👾
            </span>
          </div>
          <div className="sp-topbar__right">
            <button
              className="sp-topbar__theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <div className="sp-topbar__notifications" ref={notifRef}>
              <button
                className={`sp-topbar__notif-btn${notifOpen ? " sp-topbar__notif-btn--open" : ""}`}
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <span className="sp-topbar__notif-icon">🔔</span>
                {unreadCount > 0 && (
                  <span className="sp-topbar__notif-badge">{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <>
                <div
                  className="sp-notif-panel__backdrop"
                  onClick={() => setNotifOpen(false)}
                  aria-hidden="true"
                />
                <div className="sp-notif-panel">
                  <div className="sp-notif-panel__header">
                    <span className="sp-notif-panel__title">Recent Activity</span>
                    <button
                      className="sp-notif-panel__close-btn"
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Loading skeleton */}
                  {notifLoading && (
                    <ul className="sp-notif-panel__list">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <li key={i} className="sp-notif-panel__item sp-notif-panel__item--skeleton">
                          <span className="sp-notif-panel__item-icon sp-skeleton-block" />
                          <div className="sp-notif-panel__item-body">
                            <span className="sp-skeleton-block sp-skeleton-block--wide" />
                            <span className="sp-skeleton-block sp-skeleton-block--narrow" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Error state */}
                  {!notifLoading && notifError && (
                    <div className="sp-notif-panel__error">
                      <span>Couldn't load recent activity.</span>
                      <button className="sp-notif-panel__retry" onClick={refreshNotif}>
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Empty state */}
                  {!notifLoading && !notifError && recentActivity.length === 0 && (
                    <div className="sp-notif-panel__empty">No recent activity yet.</div>
                  )}

                  {/* Activity list */}
                  {!notifLoading && !notifError && recentActivity.length > 0 && (
                    <ul className="sp-notif-panel__list">
                      {recentActivity.map((event) => (
                        <li key={event.id} className="sp-notif-panel__item">
                          <span className="sp-notif-panel__item-icon">{event.icon}</span>
                          <div className="sp-notif-panel__item-body">
                            <span className="sp-notif-panel__item-activity">{event.activity}</span>
                            <span className="sp-notif-panel__item-meta">
                              <span className="sp-notif-panel__item-xp">+{event.xp} XP</span>
                              <span className="sp-notif-panel__item-date">
                                {new Date(event.date).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </span>
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="sp-notif-panel__footer">
                    <NavLink
                      to="/student/profile?tab=history"
                      className="sp-notif-panel__see-all"
                      onClick={() => setNotifOpen(false)}
                    >
                      See full history →
                    </NavLink>
                  </div>
                </div>
                </>
              )}
            </div>
            <NavLink to="/student/profile" className="sp-topbar__avatar">
              <img
                src={data?.avatarUrl ?? DEFAULT_AVATAR_URL}
                alt={`${user?.username ?? "Player"}'s avatar`}
              />
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="sp-content">
          <BadgeCatalogueProvider>
            <Outlet />
          </BadgeCatalogueProvider>
        </main>
      </div>
    </div>
  );
}
