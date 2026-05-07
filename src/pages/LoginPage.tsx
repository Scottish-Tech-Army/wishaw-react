import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-layout">
        <section className="login-hero">
          <p className="login-kicker">YMCA eSports  </p>
          <h2>Track badges, modules, and leaderboards in one place.</h2>
          <p className="login-hero-copy">
            A cleaner dashboard for modules, badges, challenges, and leaderboards so players and admins can see momentum at a glance.
          </p>

          <div className="login-metric-grid">
            <div className="login-metric">
              <strong>5</strong>
              <span>Core badge tracks</span>
            </div>
            <div className="login-metric">
              <strong>12-16</strong>
              <span>Week programmes</span>
            </div>
            <div className="login-metric">
              <strong>Live</strong>
              <span>XP and leaderboard views</span>
            </div>
          </div>

          <div className="login-feature-list">
            <div className="login-feature">Progress snapshots and badge milestones</div>
            <div className="login-feature">Module browsing with centre filtering</div>
            <div className="login-feature">Admin tools for content and award progress</div>
          </div>
        </section>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-card-header">
            <p className="login-kicker">Welcome back</p>
            <h3>Sign in to continue</h3>
            <p className="subtitle">Use your badge portal account to access your dashboard.</p>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="form-control"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary btn-block login-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="login-demo">
            Demo access: <strong>admin / password123</strong>
          </p>
        </form>
      </div>
    </div>
  );
}
