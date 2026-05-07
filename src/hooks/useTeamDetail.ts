/**
 * useTeamDetail — custom hook
 *
 * Fetches the full detail for a single team (including all member data) from
 * the Spring Boot backend. Re-fetches automatically when `teamId` changes or
 * when `refresh()` is called.
 *
 * Usage:
 *   const { data, loading, error, refresh } = useTeamDetail(teamId);
 */

import { useCallback, useEffect, useState } from "react";
import { getTeamDetail, ApiError } from "../api/index";
import type { TeamDetailDto } from "../api/types";

interface UseTeamDetailState {
  data: TeamDetailDto | null;
  loading: boolean;
  /** Human-readable error message, or null when there is no error. */
  error: string | null;
  /** Re-fetch on demand. */
  refresh: () => void;
}

export function useTeamDetail(teamId: string | undefined): UseTeamDetailState {
  const [data, setData] = useState<TeamDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    // Guard: do nothing until teamId is known (matches the pattern used by
    // useStudentProfile which guards against a null studentId).
    if (teamId == null) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const result = await getTeamDetail(teamId!);
        if (!cancelled) setData(result);
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError) {
          if (err.status === 401 || err.status === 403) {
            setError("Session expired. Please log in again.");
          } else if (err.status === 404) {
            setError("Team not found.");
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
  }, [teamId, tick]);

  return { data, loading, error, refresh };
}
