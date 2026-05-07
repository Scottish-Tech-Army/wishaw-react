/**
 * AuthContext.tsx — exports ONLY the AuthProvider component.
 *
 * Consumers use:
 *   import { useAuth } from './authContext'
 *
 * How auth works (local / no backend):
 *   - Users are stored in DataContext's AppState.
 *   - Login compares username + password against stored users.
 *   - Passwords prefixed "plain:" are compared directly (dev seed).
 *   - The session (userId + timestamp) is persisted to localStorage
 *     so the user stays logged in across page refreshes.
 *   - No JWT, no network request — purely in-memory + localStorage.
 */

import { useState, useMemo, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import type { StoredSession } from './authContextCore';
import { AuthContext } from './authContextCore';
import { useData } from './useData';
import useLocalStorage from './useLocalStorage';

const SESSION_KEY = 'wishaw_session';

interface Props {
  readonly children: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PASSWORD CHECK  (dev-only plain: prefix; replace with bcrypt in production)
// ─────────────────────────────────────────────────────────────────────────────

function checkPassword(stored: string, input: string): boolean {
  if (stored.startsWith('plain:')) {
    return stored.slice(6) === input;
  }
  // In a real deployment: return bcrypt.compareSync(input, stored);
  // For now, reject any non-plain hash so we don't silently allow access.
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: Props) {
  const { state } = useData();

  const [session, setSession, clearSession] = useLocalStorage<StoredSession | null>(
    SESSION_KEY,
    null
  );

  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Resolve the current user from the stored session userId
  const currentUser: User | null = useMemo(() => {
    if (!session?.userId) return null;
    return state.users.find((u) => u.id === session.userId) ?? null;
  }, [session, state.users]);

  const login = useCallback(
    (username: string, password: string): boolean => {
      setIsLoading(true);
      setLoginError(null);

      const trimmedUsername = username.trim().toLowerCase();
      const user = state.users.find(
        (u) => u.username.toLowerCase() === trimmedUsername
      );

      if (!user) {
        setLoginError('Username not found.');
        setIsLoading(false);
        return false;
      }

      if (!user.isActive) {
        setLoginError('This account has been deactivated.');
        setIsLoading(false);
        return false;
      }

      if (!user.isApproved) {
        setLoginError('Your account is pending admin approval.');
        setIsLoading(false);
        return false;
      }

      if (!checkPassword(user.passwordHash, password)) {
        setLoginError('Incorrect password.');
        setIsLoading(false);
        return false;
      }

      setSession({ userId: user.id, loggedInAt: new Date().toISOString() });
      setIsLoading(false);
      return true;
    },
    [state.users, setSession]
  );

  const logout = useCallback(() => {
    clearSession();
    setLoginError(null);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      loginError,
      login,
      logout,
      isAuthenticated: currentUser !== null,
      isAdmin: currentUser?.role === 'admin' || currentUser?.role === 'superadmin',
      isSuperAdmin: currentUser?.role === 'superadmin',
    }),
    [currentUser, isLoading, loginError, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
