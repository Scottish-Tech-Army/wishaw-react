/**
 * useLeaderboard — custom hook
 *
 * Fetches the full leaderboard from the Spring Boot backend.
 * Re-fetches automatically whenever `period` or `sortBy` changes (resets to page 0).
 * Appends new rows when `page` increases (infinite-scroll / "Load more").
 *
 * Usage:
 *   const { data, loading, error, refresh } = useLeaderboard(period, sortBy, page);
 */

import { useCallback, useEffect, useState } from "react";
import { getLeaderboard, ApiError } from "../api/index";
import type { LeaderboardSortKey } from "../api/index";
import type { LeaderboardPeriod, LeaderboardResponseDto } from "../api/types";

interface UseLeaderboardState {
  data: LeaderboardResponseDto | null;
  loading: boolean;
  /** Human-readable error message, or null when there is no error. */
  error: string | null;
  /** Re-fetch on demand. */
  refresh: () => void;
}

export function useLeaderboard(
  period: LeaderboardPeriod,
  sortBy: LeaderboardSortKey = "XP",
  page: number = 0,
): UseLeaderboardState {
  const [data, setData] = useState<LeaderboardResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const result = await getLeaderboard(period, sortBy, page);
        if (!cancelled) {
          if (page === 0) {
            // New query (period/sort changed) — replace the list entirely.
            setData(result);
          } else {
            // Subsequent page — append players to the existing list.
            setData((prev) =>
              prev
                ? { ...result, players: [...prev.players, ...result.players] }
                : result,
            );
          }
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError) {
          if (err.status === 401 || err.status === 403) {
            setError("Session expired. Please log in again.");
          } else {
            setError(`Server error (${err.status}). Please try again later.`);
          }
        } else {
          setError("Could not connect to the server. Check your network connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [period, sortBy, page, tick]);

  return { data, loading, error, refresh };
}
