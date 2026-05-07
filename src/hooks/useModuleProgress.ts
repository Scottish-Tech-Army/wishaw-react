/**
 * useModuleProgress — custom hook
 *
 * Fetches and manages the student's module progress list from the Spring Boot
 * backend. Exposes loading, error and data states to the consuming component.
 *
 * Backend endpoint: GET /api/v1/students/{studentId}/modules
 *
 * Usage:
 *   const { data, loading, error, refresh } = useModuleProgress(studentId);
 */

import { useCallback, useEffect, useState } from "react";
import { getModuleProgress, ApiError } from "../api/index";
import type { ModuleProgressDto } from "../api/types";

export interface UseModuleProgressState {
  data: ModuleProgressDto[] | null;
  loading: boolean;
  /** Human-readable error message, or null when there is no error. */
  error: string | null;
  /** Re-fetch on demand (e.g. after submitting evidence). */
  refresh: () => void;
}

export function useModuleProgress(
  studentId: number | null | undefined,
): UseModuleProgressState {
  const [data, setData] = useState<ModuleProgressDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (studentId == null) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const result = await getModuleProgress(studentId!);
        if (!cancelled) setData(result);
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError) {
          if (err.status === 401 || err.status === 403) {
            setError("Session expired. Please log in again.");
          } else if (err.status === 404) {
            setError("Module data not found.");
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
  }, [studentId, tick]);

  return { data, loading, error, refresh };
}
