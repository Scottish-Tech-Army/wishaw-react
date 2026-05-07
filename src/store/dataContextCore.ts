/**
 * dataContext.ts  (lowercase — NOT a component file)
 *
 * Contains:
 *   - DataContextValue interface
 *   - DataContext React context object
 *   - useData() hook
 *   - buildDataContextValue() factory used by DataProvider
 *   - computeTier re-export
 */

import { createContext, useContext, type Dispatch } from 'react';
import type {
  AppState,
  BadgeCategory,
  ModuleProgress,
  UserBadgeProgress,
} from '../types';
import type { DataAction } from './dataReducer';

export { computeTier } from './dataHelpers';
export type { DataAction } from './dataReducer';

// ─────────────────────────────────────────────────────────────────────────────
//  CONTEXT VALUE SHAPE
// ─────────────────────────────────────────────────────────────────────────────

export interface DataContextValue {
  state: AppState;
  dispatch: Dispatch<DataAction>;
  /** Get the hex colour for a given XP total */
  getTierColour: (xp: number) => string;
  /** Get UserBadgeProgress for a user + badge category */
  getBadgeProgress: (userId: string, category: BadgeCategory) => UserBadgeProgress | undefined;
  /** Get all module progress records for a user */
  getUserModuleProgress: (userId: string) => ModuleProgress[];
  /** Sum of XP across all badge categories for a user */
  getTotalXP: (userId: string) => number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONTEXT OBJECT
// ─────────────────────────────────────────────────────────────────────────────

export const DataContext = createContext<DataContextValue | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
//  VALUE FACTORY  (called inside useMemo in DataProvider)
// ─────────────────────────────────────────────────────────────────────────────

export function buildDataContextValue(
  state: AppState,
  dispatch: Dispatch<DataAction>
): DataContextValue {
  return {
    state,
    dispatch,

    getTierColour: (xp: number): string => {
      const sorted = [...state.tierThresholds].sort((a, b) => b.minXP - a.minXP);
      return sorted.find((t) => xp >= t.minXP)?.colour ?? '#CD7F32';
    },

    getBadgeProgress: (
      userId: string,
      category: BadgeCategory
    ): UserBadgeProgress | undefined =>
      state.userBadgeProgress.find(
        (p) => p.userId === userId && p.badgeCategory === category
      ),

    getUserModuleProgress: (userId: string): ModuleProgress[] =>
      state.moduleProgress.filter((mp) => mp.userId === userId),

    getTotalXP: (userId: string): number =>
      state.userBadgeProgress
        .filter((p) => p.userId === userId)
        .reduce((sum, p) => sum + p.totalXP, 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
