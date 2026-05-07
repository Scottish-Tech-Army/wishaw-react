
import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import StudentLayout from "./components/portal/student/StudentLayout";
import StudentDashboard from "./components/portal/student/StudentDashboard";
import StudentLeaderboard from "./components/portal/student/StudentLeaderboard";
import StudentProfile from "./components/portal/student/StudentProfile";
import AdminLayout from "./components/portal/admin/AdminLayout";
import AdminDashboard from "./components/portal/admin/AdminDashboard";
import AdminUsers from "./components/portal/admin/AdminUsers";
import AdminGroups from "./components/portal/admin/AdminGroups";
import AdminBadges from "./components/portal/admin/AdminBadges";
import AdminModules from "./components/portal/admin/AdminModules";
import AdminAwardProgress from "./components/portal/admin/AdminAwardProgress";
import AdminActivity from "./components/portal/admin/AdminActivity";
import AdminLeaderboard from "./components/portal/admin/AdminLeaderboard";
import StudentBadges from "./components/portal/student/StudentBadges";
import StudentSettings from "./components/portal/student/StudentSettings";
import StudentTeams from "./components/portal/student/StudentTeams";
import StudentTeamDetail from "./components/portal/student/StudentTeamDetail";
import StudentPublicProfile from "./components/portal/student/StudentPublicProfile";
import EvidenceSubmission from "./components/portal/student/EvidenceSubmission";
import { useAuth } from "./context/AuthContext";
import "./App.css";

// ── Forgot-credentials modal ────────────────────────────────────────────────
type ForgotMode = "username" | "password";

function ForgotModal({ mode, onClose }: { mode: ForgotMode; onClose: () => void }) {
  const { lookupUsername, lookupPassword } = useAuth();
  const [value, setValue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const isUsername = mode === "username";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setNotFound(false);

    if (isUsername) {
      const res = await lookupUsername(value);
      if (res.found) setResult(`Your username is: ${res.username}`);
      else setNotFound(true);
    } else {
      const res = await lookupPassword(value);
      if (res.found) setResult(`Password hint: ${res.hint}`);
      else setNotFound(true);
    }
  }

  return (
    <div className="forgot-backdrop" onClick={onClose}>
      <div className="forgot-modal" onClick={(e) => e.stopPropagation()}>
        <button className="forgot-modal__close" onClick={onClose} aria-label="Close">✕</button>
        <h3 className="forgot-modal__title">
          {isUsername ? "Forgot your username?" : "Forgot your password?"}
        </h3>
        <p className="forgot-modal__desc">
          {isUsername
            ? "Enter the email address linked to your account and we'll remind you of your username."
            : "Enter your username and we'll send a password reset hint."}
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <input
            className="home__login-input"
            type={isUsername ? "email" : "text"}
            placeholder={isUsername ? "Email address" : "Username"}
            value={value}
            onChange={(e) => { setValue(e.target.value); setResult(null); setNotFound(false); }}
            required
            autoFocus
          />
          <button className="home__login-btn forgot-modal__submit" type="submit">
            {isUsername ? "Look up username" : "Send reset hint"}
          </button>
        </form>
        {result   && <p className="forgot-modal__success">✅ {result}</p>}
        {notFound && <p className="home__login-error">No account found. Please check and try again.</p>}
      </div>
    </div>
  );
}

function Home() {
  const { user, login, logout } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState<ForgotMode | null>(null);

  const canStudent = user?.role === "student";
  const canAdmin   = user?.role === "admin";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Login failed.");
    }
  }

  return (
    <div className="home">
      <div className="home__overlay">
        <div className="home__content">
          <div className="home__logo-icon">🎮</div>
          <h1 className="home__title">WYMCA Esports</h1>
          <p className="home__subtitle">
            Empowering young people through gaming, teamwork, and digital skills
            in Wishaw and beyond.
          </p>

          {/* ── Login / Logged-in section ── */}
          {!user ? (
            <form className="home__login" onSubmit={handleLogin} noValidate>
              <h2 className="home__login-heading">Sign in to your portal</h2>
              <div className="home__login-fields">
                <input
                  className="home__login-input"
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  className="home__login-input"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="home__login-error">{error}</p>}
              <button
                className="home__login-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <div className="home__login-help">
                <button type="button" className="home__login-help-link" onClick={() => setForgotMode("username")}>
                  Forgot your username?
                </button>
                <span className="home__login-help-sep">·</span>
                <button type="button" className="home__login-help-link" onClick={() => setForgotMode("password")}>
                  Forgot your password?
                </button>
              </div>
            </form>
          ) : (
            <div className="home__logged-in">
              <span className="home__logged-in-greeting">
                👋 Signed in as <strong>{user.username}</strong>
              </span>
              <button className="home__logout-btn" onClick={logout}>
                Sign Out
              </button>
            </div>
          )}

          {/* ── Portal buttons ── */}
          <div className="home__portals">
            {canStudent ? (
              <Link
                to="/student"
                className="home__portal-btn home__portal-btn--student home__portal-btn--active"
              >
                <span className="home__portal-btn-icon">🧑‍🎓</span>
                <span className="home__portal-btn-label">Go to Student Portal</span>
                <span className="home__portal-btn-arrow">→</span>
              </Link>
            ) : (
              <div
                className="home__portal-btn home__portal-btn--student home__portal-btn--locked"
                title="Sign in as a student to access this portal"
              >
                <span className="home__portal-btn-icon">🧑‍🎓</span>
                <span className="home__portal-btn-label">Student Portal</span>
                <span className="home__portal-btn-lock">🔒</span>
              </div>
            )}

            {canAdmin ? (
              <Link
                to="/admin"
                className="home__portal-btn home__portal-btn--admin home__portal-btn--active"
              >
                <span className="home__portal-btn-icon">🛡️</span>
                <span className="home__portal-btn-label">Go to Admin Portal</span>
                <span className="home__portal-btn-arrow">→</span>
              </Link>
            ) : (
              <div
                className="home__portal-btn home__portal-btn--admin home__portal-btn--locked"
                title="Sign in as an admin to access this portal"
              >
                <span className="home__portal-btn-icon">🛡️</span>
                <span className="home__portal-btn-label">Admin Portal</span>
                <span className="home__portal-btn-lock">🔒</span>
              </div>
            )}
          </div>

          {!user && (
            <p className="home__hint">
              Sign in above to unlock your portal.
            </p>
          )}
        </div>
      </div>

      {forgotMode && (
        <ForgotModal mode={forgotMode} onClose={() => setForgotMode(null)} />
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="leaderboard" element={<StudentLeaderboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="badges" element={<StudentBadges />} />
        <Route path="settings" element={<StudentSettings />} />
        <Route path="teams" element={<StudentTeams />} />
        <Route path="teams/:teamId" element={<StudentTeamDetail />} />
        <Route path="players/:username" element={<StudentPublicProfile />} />
        <Route path="submit-evidence" element={<EvidenceSubmission />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="groups" element={<AdminGroups />} />
        <Route path="modules" element={<AdminModules />} />
        <Route path="badges" element={<AdminBadges />} />
        <Route path="award-progress" element={<AdminAwardProgress />} />
        <Route path="leaderboard" element={<AdminLeaderboard />} />
        <Route path="activity" element={<AdminActivity />} />
      </Route>
    </Routes>
  );
}

export default App;
