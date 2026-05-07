/**
 * dataHelpers.ts
 *
 * Pure helper functions used by the DataContext reducer.
 * Kept in a separate file so the context file exports only
 * React components/hooks (required for Fast Refresh).
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AppState,
  BadgeCategory,
  Module,
  ModuleProgress,
  TierThreshold,
  Tier,
  UserBadgeProgress,
  Tournament,
  User,
} from '../types';
import { computeAge } from '../types';

/** Compute the Tier for a given XP total against a sorted threshold list. */
export function computeTier(xp: number, thresholds: TierThreshold[]): Tier {
  const sorted = [...thresholds].sort((a, b) => b.minXP - a.minXP);
  const match = sorted.find((t) => xp >= t.minXP);
  return match ? match.tier : 'Bronze';
}

/** Upsert a UserBadgeProgress record after XP is awarded or deducted. */
export function applyXPAward(
  state: AppState,
  userId: string,
  badgeCategory: BadgeCategory,
  xp: number
): UserBadgeProgress[] {
  const existing = state.userBadgeProgress.find(
    (p) => p.userId === userId && p.badgeCategory === badgeCategory
  );

  if (existing) {
    const newXP = Math.max(0, existing.totalXP + xp);
    return state.userBadgeProgress.map((p) =>
      p.id === existing.id
        ? { ...p, totalXP: newXP, currentTier: computeTier(newXP, state.tierThresholds) }
        : p
    );
  }

  const newXP = Math.max(0, xp);
  const newRecord: UserBadgeProgress = {
    id: uuidv4(),
    userId,
    badgeCategory,
    totalXP: newXP,
    currentTier: computeTier(newXP, state.tierThresholds),
  };
  return [...state.userBadgeProgress, newRecord];
}

/** Check if all sub-badges in a module are completed; if so mark module done. */
export function checkModuleCompletion(
  progress: ModuleProgress,
  module: Module | undefined
): ModuleProgress {
  if (!module) return progress;
  const allDone = module.subBadgeIds.every((id) =>
    progress.completedSubBadgeIds.includes(id)
  );
  if (allDone && !progress.isCompleted) {
    return {
      ...progress,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
  }
  return progress;
}

/**
 * Check whether a user meets the age restrictions of a tournament.
 * Returns true if eligible, false if not. Users without a DOB are
 * considered eligible (age is unknown).
 */
export function canJoinTournament(user: User, tournament: Tournament): boolean {
  const age = computeAge(user.dateOfBirth);
  if (age === undefined) return true; // no DOB — cannot restrict
  if (tournament.minAge !== undefined && age < tournament.minAge) return false;
  if (tournament.maxAge !== undefined && age > tournament.maxAge) return false;
  return true;
}
