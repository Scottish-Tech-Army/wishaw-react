import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { isSessionTokenValid } from '../utils/auth'
import { DEFAULT_LOGIN_PASSWORD } from '../utils/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, token, role } = useAuthStore()
  const [username, setUsername] = useState('player1')
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD)
  const [error, setError] = useState('')

  if (token && isSessionTokenValid(token) && role) {
    return <Navigate to={role === 'user' ? '/' : role === 'centre_admin' ? '/admin/centre' : '/admin/main'} replace />
  }

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const ok = login(username, password)
    if (!ok) {
      setError('Invalid username or password')
      return
    }

    setError('')
    navigate(from, { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Wishaw Progress Hub</h1>
        <p>Track modules, badges, evidence, and approvals in one app.</p>
        <form onSubmit={onSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" className="button full">
            Log In
          </button>
          {error ? <p role="alert" className="error-text">{error}</p> : null}
        </form>

        <div className="demo-help" aria-label="Demo credentials">
          <p>Demo users:</p>
          <p>mainadmin / {DEFAULT_LOGIN_PASSWORD}</p>
          <p>centreadmin / {DEFAULT_LOGIN_PASSWORD}</p>
          <p>player1 / {DEFAULT_LOGIN_PASSWORD}</p>
        </div>
      </div>
    </div>
  )
}
