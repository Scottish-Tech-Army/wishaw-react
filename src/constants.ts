/**
 * Shared application constants
 *
 * Keep this file free of React imports so it can be used in hooks,
 * utilities, and components alike.
 */

// ── Avatar ────────────────────────────────────────────────────────────────────

/**
 * Fallback avatar shown whenever a student has no uploaded profile picture.
 * Used in StudentLayout (topbar), StudentPublicProfile, and the leaderboard.
 *
 * The seed "default" produces a consistent, neutral placeholder.
 * Swap to any other DiceBear collection or a self-hosted SVG as needed.
 */
export const DEFAULT_AVATAR_URL =
  "https://api.dicebear.com/9.x/avataaars/svg?seed=default&backgroundColor=b6e3f4";
