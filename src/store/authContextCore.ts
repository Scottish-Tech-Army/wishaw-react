/**
 * authContext.ts  (lowercase — NOT a component file)
 *
 * Contains:
 *   - AuthContextValue interface
 *   - AuthContext React context object
 *   - useAuth() hook
 */

import { createContext, useContext } from 'react';
import type { User } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
//  SESSION  (what gets stored in localStorage)
// ─────────────────────────────────────────────────────────────────────────────

export interface StoredSession {
  userId: string;
  loggedInAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONTEXT VALUE SHAPE
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthContextValue {
  /** The currently logged-in user, or null if not authenticated */
  currentUser: User | null;
  /** True while a login attempt is in progress */
  isLoading: boolean;
  /** Error message from the last failed login attempt */
  loginError: string | null;
  /** Attempt to log in; returns true on success */
  login: (username: string, password: string) => boolean;
  /** Clear the session */
  logout: () => void;
  /** Convenience flags */
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONTEXT OBJECT
// ─────────────────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
