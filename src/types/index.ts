// ─────────────────────────────────────────────
//  ENUMS & CONSTANTS
// ─────────────────────────────────────────────

export type Role = 'user' | 'admin' | 'superadmin';

export type Game =
  | 'Minecraft'
  | 'Rocket League'
  | 'Fortnite'
  | 'Multi / Casual'
  | 'Broadcast & Podcast'
  | 'General';

export type GroupType =
  | 'Juniors'
  | 'Competitive'
  | 'Media'
  | 'Casual'
  | 'Tournament';

/**
 * The 5 core badges that every young person levels up,
 * regardless of game or module.
 */
export type BadgeCategory =
  | 'Game Mastery'
  | 'Teamwork'
  | 'Esports Citizen'
  | 'Personal Development'
  | 'Digital Skills';

/**
 * XP tier levels – extensible so admins can add new ones
 * (Emerald, Diamond, Master, Pro …)
 */
export type Tier =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Emerald'
  | 'Diamond'
  | 'Master'
  | 'Pro';

// ─────────────────────────────────────────────
//  XP / TIER THRESHOLD
// ─────────────────────────────────────────────

/**
 * Defines the minimum XP required to reach a Tier.
 * Stored as an ordered list so new tiers can be injected
 * by a super-admin without code changes.
 */
export interface TierThreshold {
  tier: Tier;
  minXP: number;
  /** Colour used in the UI (tailwind / hex) */
  colour: string;
}

/** Default tier thresholds matching the brief */
export const DEFAULT_TIER_THRESHOLDS: TierThreshold[] = [
  { tier: 'Bronze', minXP: 0, colour: '#CD7F32' },
  { tier: 'Silver', minXP: 31, colour: '#C0C0C0' },
  { tier: 'Gold', minXP: 71, colour: '#FFD700' },
  { tier: 'Platinum', minXP: 121, colour: '#E5E4E2' },
  { tier: 'Emerald', minXP: 201, colour: '#50C878' },
  { tier: 'Diamond', minXP: 301, colour: '#B9F2FF' },
  { tier: 'Master', minXP: 451, colour: '#9B59B6' },
  { tier: 'Pro', minXP: 651, colour: '#00FF99' },
];

// ─────────────────────────────────────────────
//  CENTRE
// ─────────────────────────────────────────────

export interface Centre {
  id: string;
  name: string;
  location: string;
  country: 'Scotland' | 'Ireland' | 'England' | 'Wales' | 'Other';
  logoUrl?: string;
  createdAt: string; // ISO date string
  isActive: boolean;
}

// ─────────────────────────────────────────────
//  GROUP  (within a centre)
// ─────────────────────────────────────────────

export interface Group {
  id: string;
  centreId: string;
  name: string;
  /** Short alias / team tag, e.g. "RL Juniors" */
  nickname?: string;
  game: Game;
  type: GroupType;
  /** Age range description e.g. "8-14" */
  ageRange: string;
  description?: string;
  isActive: boolean;
}

// ─────────────────────────────────────────────
//  YOUTHWORK SKILLS & OUTCOMES FRAMEWORK (YSOF)
// ─────────────────────────────────────────────

export interface YSOFSkill {
  id: string;
  code: string;   // e.g. "PD-1"
  area: string;   // e.g. "Personal Development"
  description: string;
}

// ─────────────────────────────────────────────
//  SUB-BADGE  (a single challenge/achievement)
// ─────────────────────────────────────────────

export interface SubBadge {
  id: string;
  moduleId: string;
  /** Which of the 5 main badges this contributes XP to */
  badgeCategory: BadgeCategory;
  name: string;
  description: string;
  xpValue: number;
  /** At least 2 YSOF skill IDs */
  ysofSkillIds: string[];
  iconUrl?: string;
  /** Order within the module */
  order: number;
}

// ─────────────────────────────────────────────
//  MODULE  (like a course, 12-16 weeks)
// ─────────────────────────────────────────────

export type ModuleStatus = 'draft' | 'active' | 'archived';

export interface Module {
  id: string;
  /** Which centre "owns" this module (null = global / shared) */
  centreId: string | null;
  game: Game;
  name: string;
  description: string;
  /** Overall learning outcome / goal */
  learningOutcome: string;
  durationWeeks: number;
  status: ModuleStatus;
  /** Ordered list of sub-badge IDs */
  subBadgeIds: string[];
  /** Optional resource attachments (session plans, slides, etc.) */
  resources: ModuleResource[];
  /** Whether super-admin has approved for cross-centre use */
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleResource {
  id: string;
  moduleId: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'pptx' | 'other';
  url: string;
  uploadedAt: string;
}

// ─────────────────────────────────────────────
//  BADGE  (one of the 5 core badges per user)
// ─────────────────────────────────────────────

export interface Badge {
  id: string;
  category: BadgeCategory;
  name: string;
  description: string;
  iconUrl?: string;
}

// ─────────────────────────────────────────────
//  USER
// ─────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  /** bcrypt hash stored; plain text never stored */
  passwordHash: string;
  role: Role;
  /** Computed from firstName + lastName; kept for display convenience */
  displayName: string;
  firstName: string;
  lastName: string;
  /** Optional gamer tag / alias shown below the display name */
  nickname?: string;
  /** ISO date string e.g. "2010-06-15" */
  dateOfBirth?: string;
  avatarUrl?: string;
  centreId: string;
  /** Group IDs the user belongs to */
  groupIds: string[];
  /** Whether this admin/superadmin account has been approved */
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────
//  USER BADGE PROGRESS  (XP per badge category)
// ─────────────────────────────────────────────

export interface UserBadgeProgress {
  id: string;
  userId: string;
  badgeCategory: BadgeCategory;
  totalXP: number;
  /** Derived from totalXP + tier thresholds */
  currentTier: Tier;
}

// ─────────────────────────────────────────────
//  MODULE PROGRESS  (user ↔ module enrolment)
// ─────────────────────────────────────────────

export interface ModuleProgress {
  id: string;
  userId: string;
  moduleId: string;
  /** Sub-badge IDs that have been completed */
  completedSubBadgeIds: string[];
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

// ─────────────────────────────────────────────
//  ACTIVITY LOG
// ─────────────────────────────────────────────

export type ActivityStatus = 'pending' | 'approved' | 'rejected';

export type ActivityType =
  | 'Sub-Badge Completion'
  | 'Module Completion'
  | 'Mini-League Match'
  | 'Tournament Match'
  | 'Podcast / Broadcast'
  | 'Drop-In Session'
  | 'Manual XP Award'
  | 'Other';

export interface Activity {
  id: string;
  userId: string;
  centreId: string;
  /** Admin who logged or approved this activity */
  loggedByAdminId?: string;
  type: ActivityType;
  description: string;
  /** Which badge category receives the XP */
  badgeCategory: BadgeCategory;
  xpAwarded: number;
  /** Optional sub-badge this activity unlocks */
  subBadgeId?: string;
  /** Optional module this activity relates to */
  moduleId?: string;
  status: ActivityStatus;
  /** URL to user-uploaded evidence (image, file) */
  evidenceUrl?: string;
  /** Whether admin has requested evidence from the user */
  evidenceRequested?: boolean;
  /** When evidence was requested */
  evidenceRequestedAt?: string;
  /** Optional message from admin when requesting evidence */
  evidenceRequestMessage?: string;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

// ─────────────────────────────────────────────
//  TOURNAMENT
// ─────────────────────────────────────────────

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type TournamentFormat = 'Round Robin' | 'Single Elimination' | 'Double Elimination' | 'Swiss';

export interface Tournament {
  id: string;
  name: string;
  game: Game;
  format: TournamentFormat;
  status: TournamentStatus;
  /** Centre IDs that are participating */
  participatingCentreIds: string[];
  /** Created / managed by this admin */
  createdByAdminId: string;
  startDate: string;
  endDate?: string;
  description?: string;
  results?: TournamentResult[];
  /** Minimum participant age (inclusive) */
  minAge?: number;
  /** Maximum participant age (inclusive) */
  maxAge?: number;
  createdAt: string;
}

export interface TournamentResult {
  centreId: string;
  position: number;
  points: number;
}

// ─────────────────────────────────────────────
//  UTILITY HELPERS
// ─────────────────────────────────────────────

/**
 * Compute age in full years from a DOB ISO string.
 * Returns undefined if dob is not provided.
 */
export function computeAge(dob: string | undefined): number | undefined {
  if (!dob) return undefined;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ─────────────────────────────────────────────
//  AUTH SESSION  (in-memory only, not persisted)
// ─────────────────────────────────────────────

export interface AuthSession {
  user: User;
  loggedInAt: string;
}

// ─────────────────────────────────────────────
//  APP STATE  (shape of the global data store)
// ─────────────────────────────────────────────

export interface AppState {
  centres: Centre[];
  groups: Group[];
  users: User[];
  badges: Badge[];
  subBadges: SubBadge[];
  modules: Module[];
  moduleResources: ModuleResource[];
  moduleProgress: ModuleProgress[];
  userBadgeProgress: UserBadgeProgress[];
  activities: Activity[];
  ysofSkills: YSOFSkill[];
  tierThresholds: TierThreshold[];
  tournaments: Tournament[];
}
