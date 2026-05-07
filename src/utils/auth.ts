import { jwtDecode } from 'jwt-decode'
import type { SessionTokenPayload, User } from '../types/domain'

const ONE_DAY_SECONDS = 60 * 60 * 24
export const DEFAULT_LOGIN_PASSWORD = 'Password123'

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function createToken(payload: SessionTokenPayload): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = toBase64Url(JSON.stringify(payload))
  const signature = toBase64Url('demo-signature')
  return `${header}.${body}.${signature}`
}

export function loginWithUsernamePassword(
  users: User[],
  username: string,
  password: string,
): { token: string; user: User } | null {
  if (password !== DEFAULT_LOGIN_PASSWORD) {
    return null
  }

  const found = users.find((user) => user.username.toLowerCase() === username.trim().toLowerCase())

  if (!found) {
    return null
  }

  const token = createToken({
    sub: found.id,
    role: found.role,
    exp: Math.floor(Date.now() / 1000) + ONE_DAY_SECONDS,
  })

  return { token, user: found }
}

export function isSessionTokenValid(token: string): boolean {
  try {
    const payload = jwtDecode<SessionTokenPayload>(token)
    return payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}
