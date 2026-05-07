/**
 * usePublicPlayerProfile — custom hook
 *
 * Fetches the full public profile for a player identified by their username
 * slug (the URL param from /players/:username). No auth token is required.
 *
 * Backend endpoint: GET /api/v1/students/by-username/{username}/public-profile
 *
 * Distinguishes between:
 *  - notFound: true  → username does not exist (404) → show "Player not found" UI
 *  - error: string   → server/network failure → show generic error UI
 *  - data: ...       → success → render the profile
 *
 * Usage:
 *   const { data, loading, notFound, error } = usePublicPlayerProfile(username);
 */

import { useEffect, useState } from "react";
import { getPublicPlayerProfile, ApiError } from "../api/index";
import type { PublicPlayerProfileDto } from "../api/types";

export interface UsePublicPlayerProfileState {
  data: PublicPlayerProfileDto | null;
  loading: boolean;
  /** True when the backend returned 404 — renders "Player not found" UI. */
  notFound: boolean;
  /** Human-readable error for non-404 failures, or null. */
  error: string | null;
}

export function usePublicPlayerProfile(
  username: string | null | undefined,
): UsePublicPlayerProfileState {
  const [data, setData] = useState<PublicPlayerProfileDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    setData(null);
    setNotFound(false);
    setError(null);

    async function fetchData() {
      setLoading(true);

      try {
        const result = await getPublicPlayerProfile(username!);
        if (!cancelled) setData(result);
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError) {
          if (err.status === 404) {
            setNotFound(true);
          } else if (err.status === 401 || err.status === 403) {
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
  }, [username]);

  return { data, loading, notFound, error };
}
