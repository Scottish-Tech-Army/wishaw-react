import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import {
  login as apiLogin,
  getStoredToken,
  getStoredUser,
  persistSession,
  clearSession,
  type LoginRequest,
  type User,
} from './authService'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken)
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep state in sync if storage is cleared externally
  useEffect(() => {
    setToken(getStoredToken())
    setUser(getStoredUser())
  }, [])

  async function login(credentials: LoginRequest) {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiLogin(credentials)
      persistSession(data)
      setToken(data.token)
      setUser(data.user)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    clearSession()
    setToken(null)
    setUser(null)
    globalThis.location.href = '/login'
  }

  const value: AuthState = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
