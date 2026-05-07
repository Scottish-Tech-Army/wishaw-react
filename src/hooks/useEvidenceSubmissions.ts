/**
 * useEvidenceSubmissions — custom hook
 *
 * Fetches the evidence submission history for the given student from the
 * Spring Boot backend. Re-fetches automatically when `refresh()` is called.
 *
 * Usage:
 *   const { data, loading, error, refresh } = useEvidenceSubmissions(studentId);
 */

import { useCallback, useEffect, useState } from "react";
import { getEvidenceSubmissions, ApiError } from "../api/index";
import type { EvidenceSubmissionDto } from "../api/types";

interface UseEvidenceSubmissionsState {
  data: EvidenceSubmissionDto[] | null;
  loading: boolean;
  /** Human-readable error message, or null when there is no error. */
  error: string | null;
  /** Re-fetch on demand (e.g. after a successful submission). */
  refresh: () => void;
}

export function useEvidenceSubmissions(
  studentId: number | null | undefined,
): UseEvidenceSubmissionsState {
  const [data, setData] = useState<EvidenceSubmissionDto[] | null>(null);
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
        const result = await getEvidenceSubmissions(studentId!);
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
  }, [studentId, tick]);

  return { data, loading, error, refresh };
}
