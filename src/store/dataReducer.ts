/**
 * dataReducer.ts
 *
 * Pure reducer for the global DataContext.
 * Kept in its own file so DataContext.tsx only exports
 * React components/hooks (required for Vite Fast Refresh).
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AppState,
  Activity,
  Badge,
  BadgeCategory,
  Centre,
  Group,
  Module,
  ModuleProgress,
  ModuleResource,
  SubBadge,
  TierThreshold,
  Tournament,
  User,
  YSOFSkill,
} from '../types';
import { applyXPAward, checkModuleCompletion } from './dataHelpers';

// ─────────────────────────────────────────────────────────────────────────────
//  ACTION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type DataAction =
  // Centres
  | { type: 'ADD_CENTRE'; payload: Omit<Centre, 'id' | 'createdAt'> }
  | { type: 'UPDATE_CENTRE'; payload: Centre }
  | { type: 'DELETE_CENTRE'; payload: { id: string } }
  // Groups
  | { type: 'ADD_GROUP'; payload: Omit<Group, 'id'> & { id?: string } }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'DELETE_GROUP'; payload: { id: string } }
  // Users
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: { id: string } }
  | { type: 'ADD_USER_TO_GROUP'; payload: { userId: string; groupId: string } }
  | { type: 'REMOVE_USER_FROM_GROUP'; payload: { userId: string; groupId: string } }
  // Badges
  | { type: 'ADD_BADGE'; payload: Omit<Badge, 'id'> }
  | { type: 'UPDATE_BADGE'; payload: Badge }
  // Sub-Badges
  | { type: 'ADD_SUB_BADGE'; payload: Omit<SubBadge, 'id'> }
  | { type: 'UPDATE_SUB_BADGE'; payload: SubBadge }
  | { type: 'DELETE_SUB_BADGE'; payload: { id: string } }
  // Modules
  | { type: 'ADD_MODULE'; payload: Omit<Module, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_MODULE'; payload: Module }
  | { type: 'DELETE_MODULE'; payload: { id: string } }
  // Module Resources
  | { type: 'ADD_MODULE_RESOURCE'; payload: Omit<ModuleResource, 'id' | 'uploadedAt'> }
  | { type: 'DELETE_MODULE_RESOURCE'; payload: { id: string } }
  // Module Progress
  | { type: 'ENROL_USER_IN_MODULE'; payload: { userId: string; moduleId: string } }
  | { type: 'COMPLETE_SUB_BADGE'; payload: { userId: string; moduleId: string; subBadgeId: string } }
  | { type: 'UNCOMPLETE_SUB_BADGE'; payload: { userId: string; moduleId: string; subBadgeId: string } }
  // Activities
  | { type: 'LOG_ACTIVITY'; payload: Omit<Activity, 'id' | 'createdAt'> }
  | { type: 'APPROVE_ACTIVITY'; payload: { id: string; adminId: string } }
  | { type: 'REJECT_ACTIVITY'; payload: { id: string; adminId: string; reason: string } }
  | { type: 'REQUEST_EVIDENCE'; payload: { id: string; adminId: string; message?: string } }
  | { type: 'UPDATE_ACTIVITY';  payload: Activity }
  // XP
  | { type: 'AWARD_XP'; payload: { userId: string; badgeCategory: BadgeCategory; xp: number } }
  // Tier Thresholds
  | { type: 'ADD_TIER_THRESHOLD'; payload: TierThreshold }
  | { type: 'UPDATE_TIER_THRESHOLD'; payload: TierThreshold }
  | { type: 'DELETE_TIER_THRESHOLD'; payload: { tier: string } }
  // YSOF Skills
  | { type: 'ADD_YSOF_SKILL'; payload: Omit<YSOFSkill, 'id'> }
  | { type: 'UPDATE_YSOF_SKILL'; payload: YSOFSkill }
  | { type: 'DELETE_YSOF_SKILL'; payload: { id: string } }
  // Tournaments
  | { type: 'ADD_TOURNAMENT'; payload: Omit<Tournament, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TOURNAMENT'; payload: Tournament }
  | { type: 'DELETE_TOURNAMENT'; payload: { id: string } }
  // Hydrate
  | { type: 'HYDRATE'; payload: AppState };

// ─────────────────────────────────────────────────────────────────────────────
//  REDUCER — split into two sub-reducers to stay under the 30-case lint limit
// ─────────────────────────────────────────────────────────────────────────────

function reducerPartA(state: AppState, action: DataAction): AppState | null {
  switch (action.type) {
    case 'HYDRATE': return action.payload;

    case 'ADD_CENTRE':
      return { ...state, centres: [...state.centres, { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() }] };
    case 'UPDATE_CENTRE':
      return { ...state, centres: state.centres.map((c) => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CENTRE':
      return { ...state, centres: state.centres.filter((c) => c.id !== action.payload.id) };

    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, { ...action.payload, id: action.payload.id ?? uuidv4() }] };
    case 'UPDATE_GROUP':
      return { ...state, groups: state.groups.map((g) => g.id === action.payload.id ? action.payload : g) };
    case 'DELETE_GROUP':
      return { ...state, groups: state.groups.filter((g) => g.id !== action.payload.id) };

    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return { ...state, users: state.users.map((u) => u.id === action.payload.id ? action.payload : u) };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter((u) => u.id !== action.payload.id) };
    case 'ADD_USER_TO_GROUP':
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.userId && !u.groupIds.includes(action.payload.groupId)
            ? { ...u, groupIds: [...u.groupIds, action.payload.groupId] }
            : u
        ),
      };
    case 'REMOVE_USER_FROM_GROUP':
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.userId
            ? { ...u, groupIds: u.groupIds.filter((id) => id !== action.payload.groupId) }
            : u
        ),
      };

    case 'ADD_BADGE':
      return { ...state, badges: [...state.badges, { ...action.payload, id: uuidv4() }] };
    case 'UPDATE_BADGE':
      return { ...state, badges: state.badges.map((b) => b.id === action.payload.id ? action.payload : b) };

    case 'ADD_SUB_BADGE':
      return { ...state, subBadges: [...state.subBadges, { ...action.payload, id: uuidv4() }] };
    case 'UPDATE_SUB_BADGE':
      return { ...state, subBadges: state.subBadges.map((sb) => sb.id === action.payload.id ? action.payload : sb) };
    case 'DELETE_SUB_BADGE':
      return { ...state, subBadges: state.subBadges.filter((sb) => sb.id !== action.payload.id) };

    default: return null; // hand off to Part B
  }
}

function reducerPartB(state: AppState, action: DataAction): AppState {
  switch (action.type) {
    case 'ADD_MODULE': {
      const now = new Date().toISOString();
      return { ...state, modules: [...state.modules, { ...action.payload, id: uuidv4(), createdAt: now, updatedAt: now }] };
    }
    case 'UPDATE_MODULE':
      return { ...state, modules: state.modules.map((m) => m.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : m) };
    case 'DELETE_MODULE':
      return { ...state, modules: state.modules.filter((m) => m.id !== action.payload.id) };

    case 'ADD_MODULE_RESOURCE':
      return { ...state, moduleResources: [...state.moduleResources, { ...action.payload, id: uuidv4(), uploadedAt: new Date().toISOString() }] };
    case 'DELETE_MODULE_RESOURCE':
      return { ...state, moduleResources: state.moduleResources.filter((r) => r.id !== action.payload.id) };

    case 'ENROL_USER_IN_MODULE': {
      const { userId, moduleId } = action.payload;
      if (state.moduleProgress.some((mp) => mp.userId === userId && mp.moduleId === moduleId)) return state;
      const newProgress: ModuleProgress = { id: uuidv4(), userId, moduleId, completedSubBadgeIds: [], isCompleted: false, startedAt: new Date().toISOString() };
      return { ...state, moduleProgress: [...state.moduleProgress, newProgress] };
    }

    case 'COMPLETE_SUB_BADGE': {
      const { userId, moduleId, subBadgeId } = action.payload;
      const subBadge = state.subBadges.find((sb) => sb.id === subBadgeId);
      const module = state.modules.find((m) => m.id === moduleId);
      const updatedProgress = state.moduleProgress.map((mp) => {
        if (mp.userId !== userId || mp.moduleId !== moduleId || mp.completedSubBadgeIds.includes(subBadgeId)) return mp;
        return checkModuleCompletion({ ...mp, completedSubBadgeIds: [...mp.completedSubBadgeIds, subBadgeId] }, module);
      });
      const updatedBadgeProgress = subBadge ? applyXPAward({ ...state, moduleProgress: updatedProgress }, userId, subBadge.badgeCategory, subBadge.xpValue) : state.userBadgeProgress;
      return { ...state, moduleProgress: updatedProgress, userBadgeProgress: updatedBadgeProgress };
    }

    case 'UNCOMPLETE_SUB_BADGE': {
      const { userId, moduleId, subBadgeId } = action.payload;
      const subBadge = state.subBadges.find((sb) => sb.id === subBadgeId);
      const updatedProgress = state.moduleProgress.map((mp) => {
        if (mp.userId !== userId || mp.moduleId !== moduleId) return mp;
        return { ...mp, completedSubBadgeIds: mp.completedSubBadgeIds.filter((id) => id !== subBadgeId), isCompleted: false, completedAt: undefined };
      });
      const updatedBadgeProgress = subBadge ? applyXPAward({ ...state, moduleProgress: updatedProgress }, userId, subBadge.badgeCategory, -subBadge.xpValue) : state.userBadgeProgress;
      return { ...state, moduleProgress: updatedProgress, userBadgeProgress: updatedBadgeProgress };
    }

    case 'LOG_ACTIVITY':
      return { ...state, activities: [...state.activities, { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() }] };

    case 'APPROVE_ACTIVITY': {
      const { id, adminId } = action.payload;
      const activity = state.activities.find((a) => a.id === id);
      if (activity?.status !== 'pending') return state;
      const updatedActivities = state.activities.map((a) =>
        a.id === id ? { ...a, status: 'approved' as const, loggedByAdminId: adminId, reviewedAt: new Date().toISOString() } : a
      );
      return { ...state, activities: updatedActivities, userBadgeProgress: applyXPAward({ ...state, activities: updatedActivities }, activity.userId, activity.badgeCategory, activity.xpAwarded) };
    }

    case 'REJECT_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === action.payload.id ? { ...a, status: 'rejected' as const, loggedByAdminId: action.payload.adminId, rejectionReason: action.payload.reason, reviewedAt: new Date().toISOString() } : a
        ),
      };

    case 'REQUEST_EVIDENCE':
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === action.payload.id
            ? { ...a, evidenceRequested: true, evidenceRequestedAt: new Date().toISOString(), evidenceRequestMessage: action.payload.message, loggedByAdminId: action.payload.adminId }
            : a
        ),
      };

    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map((a) => a.id === action.payload.id ? action.payload : a),
      };

    case 'AWARD_XP':
      return { ...state, userBadgeProgress: applyXPAward(state, action.payload.userId, action.payload.badgeCategory, action.payload.xp) };

    case 'ADD_TIER_THRESHOLD':
      return { ...state, tierThresholds: [...state.tierThresholds, action.payload] };
    case 'UPDATE_TIER_THRESHOLD':
      return { ...state, tierThresholds: state.tierThresholds.map((t) => t.tier === action.payload.tier ? action.payload : t) };
    case 'DELETE_TIER_THRESHOLD':
      return { ...state, tierThresholds: state.tierThresholds.filter((t) => t.tier !== action.payload.tier) };

    case 'ADD_YSOF_SKILL':
      return { ...state, ysofSkills: [...state.ysofSkills, { ...action.payload, id: uuidv4() }] };
    case 'UPDATE_YSOF_SKILL':
      return { ...state, ysofSkills: state.ysofSkills.map((s) => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_YSOF_SKILL':
      return { ...state, ysofSkills: state.ysofSkills.filter((s) => s.id !== action.payload.id) };

    case 'ADD_TOURNAMENT':
      return { ...state, tournaments: [...state.tournaments, { ...action.payload, id: uuidv4(), createdAt: new Date().toISOString() }] };
    case 'UPDATE_TOURNAMENT':
      return { ...state, tournaments: state.tournaments.map((t) => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TOURNAMENT':
      return { ...state, tournaments: state.tournaments.filter((t) => t.id !== action.payload.id) };

    default: return state;
  }
}

export function dataReducer(state: AppState, action: DataAction): AppState {
  return reducerPartA(state, action) ?? reducerPartB(state, action);
}
