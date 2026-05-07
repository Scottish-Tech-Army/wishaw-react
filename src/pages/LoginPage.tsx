import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

const ROLE_ROUTES: Record<string, string> = {
  admin:  '/admin',
  parent: '/parent',
  coach:  '/dashboard',
  player: '/dashboard',
}

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuth()

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!username.trim()) return
    try {
      await login({ username, password })
      const user = JSON.parse(sessionStorage.getItem('auth_user') ?? '{}')
      const role = (user.role ?? '').toLowerCase()
      globalThis.location.href = ROLE_ROUTES[role] ?? '/dashboard'
    } catch {
      // error is already surfaced via useAuth().error
    }
  }

  return (
    <div className="login-page">
      <div className="login-background" aria-hidden="true">
        <div className="neon-grid" />
        <div className="orb orb-primary" />
        <div className="orb orb-tertiary" />
        <div className="line-accent line-1" />
        <div className="line-accent line-2" />
        <div className="line-accent line-3" />
      </div>

      <main className="login-main">
        <div className="login-shell">
          <header className="brand-section">
            <div className="logo-frame">
              <div className="logo-halo" />
              <div className="logo-chip">
                <div className="logo-core">
                  <span className="material-symbol">bolt</span>
                </div>
              </div>
            </div>

            <h1>
              WISHAW <span>ARENA</span>
            </h1>

            <div className="brand-subtitle">
              <div className="rule" />
              <p>YMCA Esports Division</p>
              <div className="rule" />
            </div>
          </header>

          <section className="login-card" aria-label="Login form">
            <div className="asymmetric-accent" />
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="username">Player Handle</label>
                <div className="field-wrap">
                  <span className="material-symbol">person</span>
                  <input
                    id="username"
                    type="text"
                    placeholder="ENTER USERNAME"
                    autoComplete="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="password">Access Key</label>
                <div className="field-wrap">
                  <span className="material-symbol">lock</span>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="login-button" disabled={isLoading}>
                <span>{isLoading ? 'LOGGING IN…' : 'LOGIN'}</span>
                <span className="material-symbol">bolt</span>
              </button>

              <p className="meta-copy">No email needed, just your player details.</p>

              <p className="meta-copy">
                New to the academy?{' '}
                <a href="/register" className="login-register-link">Register here</a>
              </p>
            </form>
          </section>

          <section className="trust-grid" aria-label="Support details">
            <article className="trust-card">
              <div className="trust-icon trust-icon-secondary">
                <span className="material-symbol">verified_user</span>
              </div>
              <div>
                <p>Secure Connection</p>
                <strong>Kinetic SSL Active</strong>
              </div>
            </article>

            <article className="trust-card">
              <div className="trust-icon trust-icon-tertiary">
                <span className="material-symbol">support_agent</span>
              </div>
              <div>
                <p>Need Help?</p>
                <strong>Ask your Coach</strong>
              </div>
            </article>
          </section>
        </div>
      </main>

      <div className="bottom-bar" aria-hidden="true" />
    </div>
  )
}

export default LoginPage