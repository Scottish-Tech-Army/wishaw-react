/**
 * useTeams — custom hook
 *
 * Fetches the list of all teams from the Spring Boot backend.
 * Re-fetches automatically when `refresh()` is called.
 *
 * Usage:
 *   const { data, loading, error, refresh } = useTeams();
 */

import { useCallback, useEffect, useState } from "react";
import { getTeams, ApiError } from "../api/index";
import type { TeamSummaryDto } from "../api/types";

interface UseTeamsState {
  data: TeamSummaryDto[] | null;
  loading: boolean;
  /** Human-readable error message, or null when there is no error. */
  error: string | null;
  /** Re-fetch on demand. */
  refresh: () => void;
}

export function useTeams(): UseTeamsState {
  const [data, setData] = useState<TeamSummaryDto[] | null>(null);
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
        const result = await getTeams();
        if (!cancelled) setData(result);
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
  }, [tick]);

  return { data, loading, error, refresh };
}
