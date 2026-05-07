import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authLogin, authLogout, forgotUsername, forgotPassword } from "../api/index";

export type UserRole = "student" | "admin" | null;

interface AuthUser {
  username: string;
  role: UserRole;
  /** In-game / leaderboard username (e.g. "@alex_gamer") */
  playerUsername: string;
  /**
   * The backend numeric ID for the student.
   * Used to fetch personalised data from the Spring Boot API.
   * Will be null for admin users or until the backend is integrated.
   */
  studentId: number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  lookupUsername: (email: string) => Promise<{ found: boolean; username?: string }>;
  lookupPassword: (username: string) => Promise<{ found: boolean; hint?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── JWT helpers ───────────────────────────────────────────────────────────────

interface JwtClaims {
  sub?: string;          // username
  studentId?: number;
  role?: string;
  playerUsername?: string;
  exp?: number;          // expiry as Unix timestamp (seconds)
}

/** Decode the payload section of a JWT. Does NOT verify the signature. */
function decodeJwt(token: string): JwtClaims {
  const payloadB64 = token.split(".")[1];
  const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(payloadJson) as JwtClaims;
}

/** Return true if the JWT has not yet expired (or has no exp claim). */
function isTokenValid(token: string): boolean {
  try {
    const { exp } = decodeJwt(token);
    if (exp === undefined) return true;
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

/** Build an AuthUser from decoded JWT claims, falling back to the raw username. */
function claimsToUser(claims: JwtClaims, fallbackUsername: string): AuthUser {
  const role: UserRole = claims.role === "ROLE_ADMIN" ? "admin" : "student";
  return {
    username:       claims.sub ?? fallbackUsername,
    role,
    playerUsername: claims.playerUsername ?? "",
    studentId:      claims.studentId ?? null,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Restore session from localStorage on app load.
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && isTokenValid(token)) {
      try {
        const claims = decodeJwt(token);
        setUser(claimsToUser(claims, ""));
      } catch {
        // Malformed token — discard it.
        localStorage.removeItem("auth_token");
      }
    } else if (token) {
      // Token present but expired — clean up.
      localStorage.removeItem("auth_token");
    }
  }, []); // run once on mount

  async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { token } = await authLogin(username, password);

      // Persist the JWT so apiFetch picks it up on subsequent requests.
      localStorage.setItem("auth_token", token);

      const claims = decodeJwt(token);
      setUser(claimsToUser(claims, username));
      return { success: true };
    } catch {
      return { success: false, error: "Invalid username or password." };
    }
  }

  function logout() {
    // Remove the token first so any in-flight requests stop sending it.
    localStorage.removeItem("auth_token");
    setUser(null);
    // Fire-and-forget: tell the backend to invalidate the server-side session.
    // Errors are intentionally swallowed — the client is logged out regardless.
    authLogout().catch(() => undefined);
  }

  /**
   * "Forgot username" — calls POST /api/v1/auth/forgot-username.
   * Returns { found: true, username } on success, { found: false } when the
   * email is not associated with any account (404).
   */
  async function lookupUsername(email: string): Promise<{ found: boolean; username?: string }> {
    try {
      const { username } = await forgotUsername(email);
      return { found: true, username };
    } catch {
      return { found: false };
    }
  }

  /**
   * "Forgot password" — calls POST /api/v1/auth/forgot-password.
   * Returns { found: true, hint } on success, { found: false } when the
   * username is not associated with any account (404).
   */
  async function lookupPassword(username: string): Promise<{ found: boolean; hint?: string }> {
    try {
      const { hint } = await forgotPassword(username);
      return { found: true, hint };
    } catch {
      return { found: false };
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, lookupUsername, lookupPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
