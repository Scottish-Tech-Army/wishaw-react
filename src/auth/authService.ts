export interface LoginRequest {
  username: string
  password: string
}

/** Shape returned by POST /auth/login */
export interface LoginApiResponse {
  userId: string
  role: string
  token: string
}

/** Full user profile from GET /auth/me */
export interface User {
  userId: string
  username: string
  role: string
  centreId: string | null
  displayName: string
}

/** What the rest of the app works with after login */
export interface AuthSession {
  token: string
  user: User
}

// Keep LoginResponse as an alias so existing imports don't break
export type LoginResponse = AuthSession

export const API_BASE = 'http://localhost:3001'

export async function login(credentials: LoginRequest): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? body?.message ?? 'Login failed')
  }

  const loginData: LoginApiResponse = await res.json()

  // Fetch full profile so we have username / displayName
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
  })

  let user: User
  if (meRes.ok) {
    user = await meRes.json()
  } else {
    // Fallback: build minimal user from login response
    user = {
      userId: loginData.userId,
      username: credentials.username,
      role: loginData.role,
      centreId: null,
      displayName: credentials.username,
    }
  }

  return { token: loginData.token, user }
}

export function getStoredToken(): string | null {
  return sessionStorage.getItem('auth_token')
}

export function getStoredUser(): User | null {
  const raw = sessionStorage.getItem('auth_user')
  if (!raw || raw === 'undefined' || raw === 'null') return null
  try {
    return JSON.parse(raw)
  } catch {
    sessionStorage.removeItem('auth_user')
    return null
  }
}

export function persistSession(data: AuthSession): void {
  sessionStorage.setItem('auth_token', data.token)
  sessionStorage.setItem('auth_user', JSON.stringify(data.user))
}

export function clearSession(): void {
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('auth_user')
}
