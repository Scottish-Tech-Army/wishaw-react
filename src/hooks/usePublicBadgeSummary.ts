/**
 * usePublicBadgeSummary — custom hook
 *
 * Fetches the lightweight badge summary for a player's public profile page.
 * Keyed by username slug (the URL param from /players/:username) rather than
 * studentId, because the public profile page is visible without a login.
 *
 * Backend endpoint: GET /api/v1/students/by-username/{username}/badges/summary
 *
 * Usage:
 *   const { badges, loading, error } = usePublicBadgeSummary(username);
 */

import { useEffect, useState } from "react";
import { getPublicBadgeSummary, ApiError } from "../api/index";
import type { MainBadgeSummaryDto } from "../api/types";

export interface UsePublicBadgeSummaryState {
  /** Badge summaries for all 5 core badges, or an empty array while loading. */
  badges: MainBadgeSummaryDto[];
  loading: boolean;
  /** Human-readable error message, or null when there is no error. */
  error: string | null;
}

export function usePublicBadgeSummary(
  username: string | null | undefined,
): UsePublicBadgeSummaryState {
  const [badges, setBadges] = useState<MainBadgeSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const result = await getPublicBadgeSummary(username!);
        if (!cancelled) setBadges(result.badges);
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError) {
          if (err.status === 404) {
            // Player not found or has no badges yet — return empty list silently.
            // The parent component handles the "player not found" case via
            // usePublicPlayerProfile, so we don't surface a 404 as an error here.
            if (!cancelled) setBadges([]);
          } else if (err.status === 401 || err.status === 403) {
            setError("Could not load badge data. Please try again.");
          } else {
            setError(`Could not load badges (${err.status}). Please try again later.`);
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

  return { badges, loading, error };
}
