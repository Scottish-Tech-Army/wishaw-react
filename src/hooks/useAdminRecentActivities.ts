/**
 * useAdminRecentActivities — custom hook
 *
 * Fetches and manages the admin dashboard's recent activity feed from the
 * Spring Boot backend.  Exposes loading, error and data states.
 *
 * Usage:
 *   const { data, loading, error, refresh } = useAdminRecentActivities();
 */

import { useCallback, useEffect, useState } from "react";
import { getAdminRecentActivities, ApiError } from "../api/index";
import type { AdminRecentActivityDto } from "../api/types";

interface UseAdminRecentActivitiesState {
  data: AdminRecentActivityDto[];
  loading: boolean;
  /** Human-readable error message, or null when there is no error. */
  error: string | null;
  /** Re-fetch on demand (e.g. after awarding a badge). */
  refresh: () => void;
}

export function useAdminRecentActivities(): UseAdminRecentActivitiesState {
  const [data, setData] = useState<AdminRecentActivityDto[]>([]);
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
        const result = await getAdminRecentActivities();
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

    fetchData();
    return () => { cancelled = true; };
  }, [tick]);

  return { data, loading, error, refresh };
}
