/**
 * Badge utility helpers — shared across components.
 *
 * Keeps badge-level resolution logic in one place so StudentProfile,
 * StudentBadges, and any future component always use the same thresholds
 * as returned by the backend (BadgeCatalogueDto.badgeLevels).
 */

import type { BadgeLevelDto } from "../api/types";

/**
 * Resolve the highest badge level a student has reached for a given XP value.
 *
 * @param xp         - The student's current XP for the badge.
 * @param badgeLevels - Ordered list of thresholds from the backend (lowest → highest).
 * @returns The matching BadgeLevelDto, or the first (lowest) level as a fallback.
 */
export function resolveBadgeLevel(xp: number, badgeLevels: BadgeLevelDto[]): BadgeLevelDto {
  // Walk backwards so we return the highest level whose minXP is ≤ xp.
  const sorted = [...badgeLevels].sort((a, b) => a.minXP - b.minXP);
  return (
    [...sorted].reverse().find((l) => xp >= l.minXP) ?? sorted[0]
  );
}
