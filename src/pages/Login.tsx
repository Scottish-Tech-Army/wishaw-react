import { useState, type SyntheticEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Gamepad2, Trophy, Users, Star, Zap, LogIn } from 'lucide-react';
import { useAuth } from '../store/authContextCore';

function roleDestination(role: string): string {
  if (role === 'superadmin') return '/superadmin';
  if (role === 'admin') return '/admin';
  return '/';
}

export default function Login() {
  const { login, loginError, isLoading, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Where to go after login (sent via router state, or role-based default)
  const from = (location.state as { from?: string })?.from;

  // If already logged in, redirect immediately
  if (isAuthenticated && currentUser) {
    const dest = from ?? roleDestination(currentUser.role);
    navigate(dest, { replace: true });
  }

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = login(username.trim(), password);
    if (success && currentUser) {
      const dest = from ?? roleDestination(currentUser.role);
      navigate(dest, { replace: true });
    }
  };

  return (
    <div className="login-container">
      {/* Animated background elements */}
      <div className="login-bg">
        <div className="login-bg__grid" />
        <div className="login-bg__glow login-bg__glow--1" />
        <div className="login-bg__glow login-bg__glow--2" />
        <div className="login-bg__particles">
          <div className="login-bg__particle login-bg__particle--1" />
          <div className="login-bg__particle login-bg__particle--2" />
          <div className="login-bg__particle login-bg__particle--3" />
          <div className="login-bg__particle login-bg__particle--4" />
          <div className="login-bg__particle login-bg__particle--5" />
          <div className="login-bg__particle login-bg__particle--6" />
        </div>
      </div>

      <div className="login-wrapper">
        {/* Left side - Hero section */}
        <div className="login-hero">
          <div className="login-hero__content">
            <div className="login-hero__badge">
              <Zap size={14} />
              <span>Level Up Your Skills</span>
            </div>
            <h1 className="login-hero__title">
              Welcome to<br />
              <span className="login-hero__accent">YMCA Esports</span><br />
              Academy
            </h1>
            <p className="login-hero__subtitle">
              Train, compete, and become a champion. Track your progress,
              earn badges, and climb the leaderboards.
            </p>

            <div className="login-hero__features">
              <div className="login-hero__feature">
                <div className="login-hero__feature-icon">
                  <Trophy size={20} />
                </div>
                <div className="login-hero__feature-text">
                  <strong>Earn Achievements</strong>
                  <span>Unlock badges as you progress</span>
                </div>
              </div>
              <div className="login-hero__feature">
                <div className="login-hero__feature-icon">
                  <Users size={20} />
                </div>
                <div className="login-hero__feature-text">
                  <strong>Compete Together</strong>
                  <span>Join tournaments & teams</span>
                </div>
              </div>
              <div className="login-hero__feature">
                <div className="login-hero__feature-icon">
                  <Star size={20} />
                </div>
                <div className="login-hero__feature-text">
                  <strong>Track Progress</strong>
                  <span>Level up & gain XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="login-form-section">
          <div className="login-card">
            {/* Logo / branding */}
            <div className="login-brand">
              <div className="login-brand__icon">
                <Gamepad2 size={28} />
              </div>
              <div className="login-brand__text">
                <h2 className="login-brand__title">Sign In</h2>
                <p className="login-brand__subtitle">Access your esports dashboard</p>
              </div>
            </div>

            {/* Form */}
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {/* Username */}
              <div className="login-field">
                <label htmlFor="username" className="login-field__label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="login-field__input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>

              {/* Password */}
              <div className="login-field">
                <label htmlFor="password" className="login-field__label">
                  Password
                </label>
                <div className="login-field__password-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-field__input login-field__input--password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-field__toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {loginError && (
                <div className="login-error" role="alert">
                  <span className="login-error__icon">!</span>
                  <span>{loginError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="login-submit"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <>
                    <span className="login-submit__spinner" />{' '}
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <Zap size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Dev hint */}
            <details className="login-dev-hint">
              <summary>Demo credentials</summary>
              <div className="login-dev-hint__content">
                {([
                  { role: 'Super Admin', u: 'superadmin', p: 'Admin@1234' },
                  { role: 'Admin', u: 'emma.w', p: 'Emma@5678' },
                  { role: 'User', u: 'leo.c', p: 'Leo@pass1' },
                  { role: 'User', u: 'mia.w', p: 'Mia@pass2' },
                ] as const).map(({ role, u, p }) => (
                  <div key={u} className="login-dev-hint__item">
                    <span className="login-dev-hint__role">{role}</span>
                    <code>{u}</code> / <code>{p}</code>
                    <button
                      type="button"
                      className="login-dev-hint__use-btn"
                      onClick={() => { setUsername(u); setPassword(p); }}
                      title={`Fill in ${u}`}
                    >
                      <LogIn size={12} />
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
