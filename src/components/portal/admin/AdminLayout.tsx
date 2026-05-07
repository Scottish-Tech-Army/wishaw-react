import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../../../portal.css";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

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
      <aside className={`sp-sidebar ap-sidebar${menuOpen ? " sp-sidebar--open" : ""}`}>
        <div className="sp-sidebar__header">
          <span className="sp-sidebar__logo-icon">🛡️</span>
          <div>
            <div className="sp-sidebar__brand">WYMCA Esports</div>
            <div className="sp-sidebar__portal-label ap-portal-label">Admin Portal</div>
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

        <nav className="sp-sidebar__nav" aria-label="Admin portal navigation">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active ap-link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">🏠</span>
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active ap-link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">👥</span>
            Users
          </NavLink>
          <NavLink
            to="/admin/groups"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active ap-link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">🎯</span>
            Groups
          </NavLink>
          <NavLink
            to="/admin/modules"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active ap-link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">📚</span>
            Modules
          </NavLink>
          <NavLink
            to="/admin/badges"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active ap-link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">🏅</span>
            Badges
          </NavLink>
          <NavLink
            to="/admin/award-progress"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active ap-link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">🎖️</span>
            Award Progress
          </NavLink>
          <NavLink
            to="/admin/leaderboard"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active ap-link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">🏆</span>
            Leaderboard
          </NavLink>
          <NavLink
            to="/admin/activity"
            className={({ isActive }) =>
              "sp-sidebar__link" + (isActive ? " sp-sidebar__link--active ap-link--active" : "")
            }
            onClick={() => setMenuOpen(false)}
          >
            <span className="sp-sidebar__link-icon">⚡</span>
            Activity
          </NavLink>
        </nav>

        <div className="sp-sidebar__footer">
          <button
            className="sp-sidebar__exit-btn"
            onClick={() => navigate("/")}
          >
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
          <span className="sp-mobile-header__brand ap-mobile-header__brand">🛡️ WYMCA Esports Admin</span>
        </div>

        {/* Top bar */}
        <header className="sp-topbar">
          <div className="sp-topbar__left">
            <span className="sp-topbar__greeting">
              Welcome, <strong>Admin</strong> 🛡️
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
            <div className="ap-topbar__role-badge">Admin</div>
            <div className="sp-topbar__avatar ap-topbar__avatar">
              <img
                src="https://api.dicebear.com/9.x/avataaars/svg?seed=Admin&backgroundColor=ffdfbf"
                alt="Admin Avatar"
              />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="sp-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
