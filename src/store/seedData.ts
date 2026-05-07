/**
 * seedData.ts
 *
 * Pre-populated data for local development / first-run.
 * Built incrementally — each section is exported individually
 * and also assembled into SEED_DATA: AppState at the bottom.
 *
 * Sections in this file:
 *   2.2.1  Tier Thresholds
 *   2.2.2  YSOF Skills
 *   2.2.3  Centres
 *   2.2.4  Groups
 *   2.2.5  Badges
 *   2.2.6  Sub-Badges + Modules
 *   (2.2.7 – 2.2.10 will be added in subsequent steps)
 */

import type {
  AppState,
  TierThreshold,
  YSOFSkill,
  Centre,
  Group,
  Badge,
  SubBadge,
  Module,
  User,
  UserBadgeProgress,
  ModuleProgress,
  Activity,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.1 — TIER THRESHOLDS
//  Matches the brief exactly; extra tiers ready for super-admin to unlock.
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_TIER_THRESHOLDS: TierThreshold[] = [
  { tier: 'Bronze', minXP: 0, colour: '#CD7F32' },
  { tier: 'Silver', minXP: 31, colour: '#C0C0C0' },
  { tier: 'Gold', minXP: 71, colour: '#FFD700' },
  { tier: 'Platinum', minXP: 121, colour: '#E5E4E2' },
  { tier: 'Emerald', minXP: 201, colour: '#50C878' },
  { tier: 'Diamond', minXP: 301, colour: '#B9F2FF' },
  { tier: 'Master', minXP: 451, colour: '#9B59B6' },
  { tier: 'Pro', minXP: 651, colour: '#00FF99' },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.2 — YSOF SKILLS
//  Youthwork Skills & Outcomes Framework entries.
//  At least 2 must be attached to every sub-badge.
//  Areas: Personal Development (PD), Teamwork (TW), Esports Citizenship (EC),
//         Digital Skills (DS), Game Mastery (GM), Communication (CO)
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_YSOF_SKILLS: YSOFSkill[] = [
  // ── Personal Development ──────────────────────────────────────────────────
  {
    id: 'ysof-pd-1',
    code: 'PD-1',
    area: 'Personal Development',
    description: 'Identifies personal strengths and areas for improvement',
  },
  {
    id: 'ysof-pd-2',
    code: 'PD-2',
    area: 'Personal Development',
    description: 'Sets, reviews and reflects on personal goals',
  },
  {
    id: 'ysof-pd-3',
    code: 'PD-3',
    area: 'Personal Development',
    description: 'Demonstrates resilience when facing challenges or setbacks',
  },
  {
    id: 'ysof-pd-4',
    code: 'PD-4',
    area: 'Personal Development',
    description: 'Shows increased confidence and self-awareness over time',
  },

  // ── Teamwork ──────────────────────────────────────────────────────────────
  {
    id: 'ysof-tw-1',
    code: 'TW-1',
    area: 'Teamwork',
    description: 'Collaborates effectively within a team towards a shared goal',
  },
  {
    id: 'ysof-tw-2',
    code: 'TW-2',
    area: 'Teamwork',
    description: 'Actively supports and encourages peers during group activities',
  },
  {
    id: 'ysof-tw-3',
    code: 'TW-3',
    area: 'Teamwork',
    description: 'Contributes to creating a positive and inclusive team environment',
  },

  // ── Esports Citizenship ───────────────────────────────────────────────────
  {
    id: 'ysof-ec-1',
    code: 'EC-1',
    area: 'Esports Citizenship',
    description: 'Demonstrates positive and respectful behaviour online',
  },
  {
    id: 'ysof-ec-2',
    code: 'EC-2',
    area: 'Esports Citizenship',
    description: 'Understands and applies a code of conduct in competitive play',
  },
  {
    id: 'ysof-ec-3',
    code: 'EC-3',
    area: 'Esports Citizenship',
    description: 'Communicates appropriately in digital and in-person settings',
  },

  // ── Digital Skills ────────────────────────────────────────────────────────
  {
    id: 'ysof-ds-1',
    code: 'DS-1',
    area: 'Digital Skills',
    description: 'Uses digital tools safely, responsibly and confidently',
  },
  {
    id: 'ysof-ds-2',
    code: 'DS-2',
    area: 'Digital Skills',
    description: 'Understands how to stay safe online and protect personal information',
  },
  {
    id: 'ysof-ds-3',
    code: 'DS-3',
    area: 'Digital Skills',
    description: 'Uses digital platforms to learn, create and communicate',
  },

  // ── Game Mastery ──────────────────────────────────────────────────────────
  {
    id: 'ysof-gm-1',
    code: 'GM-1',
    area: 'Game Mastery',
    description: 'Demonstrates understanding and application of game mechanics',
  },
  {
    id: 'ysof-gm-2',
    code: 'GM-2',
    area: 'Game Mastery',
    description: 'Develops and adapts strategies to improve in-game performance',
  },
  {
    id: 'ysof-gm-3',
    code: 'GM-3',
    area: 'Game Mastery',
    description: 'Makes informed decisions under pressure during gameplay',
  },

  // ── Communication ─────────────────────────────────────────────────────────
  {
    id: 'ysof-co-1',
    code: 'CO-1',
    area: 'Communication',
    description: 'Expresses ideas clearly and listens actively to others',
  },
  {
    id: 'ysof-co-2',
    code: 'CO-2',
    area: 'Communication',
    description: 'Gives and receives constructive feedback in a positive manner',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.3 — CENTRES
//  3 centres: Wishaw (hub) + 2 pilot sites from the brief
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_CENTRES: Centre[] = [
  {
    id: 'centre-wishaw',
    name: 'Wishaw YMCA',
    location: 'Wishaw, North Lanarkshire',
    country: 'Scotland',
    logoUrl: undefined,
    createdAt: '2023-09-01T00:00:00.000Z',
    isActive: true,
  },
  {
    id: 'centre-hamilton',
    name: 'Hamilton YMCA',
    location: 'Hamilton, South Lanarkshire',
    country: 'Scotland',
    logoUrl: undefined,
    createdAt: '2024-03-01T00:00:00.000Z',
    isActive: true,
  },
  {
    id: 'centre-dublin',
    name: 'Dublin YMCA',
    location: 'Dublin',
    country: 'Ireland',
    logoUrl: undefined,
    createdAt: '2024-06-01T00:00:00.000Z',
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.4 — GROUPS
//  Groups within each centre, matching the real Wishaw academy structure.
//  Wishaw = 7 groups, Hamilton = 1, Dublin = 1
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_GROUPS: Group[] = [
  // ── Wishaw YMCA ──────────────────────────────────────────────────────────
  {
    id: 'group-wishaw-minecraft',
    centreId: 'centre-wishaw',
    name: 'Minecraft Juniors',
    nickname: 'MC Jnrs',
    game: 'Minecraft',
    type: 'Juniors',
    ageRange: '8-14',
    description: 'Survival challenges, build battles, PvP and speedrunning.',
    isActive: true,
  },
  {
    id: 'group-wishaw-rl-juniors',
    centreId: 'centre-wishaw',
    name: 'Rocket League Juniors',
    nickname: 'RL Jnrs',
    game: 'Rocket League',
    type: 'Juniors',
    ageRange: '8-14',
    description: 'Rank-based challenges, mechanics masterclass and team building.',
    isActive: true,
  },
  {
    id: 'group-wishaw-fortnite-juniors',
    centreId: 'centre-wishaw',
    name: 'Fortnite Juniors',
    nickname: 'FN Jnrs',
    game: 'Fortnite',
    type: 'Juniors',
    ageRange: '8-14',
    description: 'Rank-based challenges, mechanics masterclass and team building.',
    isActive: true,
  },
  {
    id: 'group-wishaw-rl-comp',
    centreId: 'centre-wishaw',
    name: 'Rocket League Competitive',
    nickname: 'RL Comp',
    game: 'Rocket League',
    type: 'Competitive',
    ageRange: '13+',
    description: 'Coaching and skill development for competitive Rocket League teams.',
    isActive: true,
  },
  {
    id: 'group-wishaw-fortnite-comp',
    centreId: 'centre-wishaw',
    name: 'Fortnite Competitive',
    nickname: 'FN Comp',
    game: 'Fortnite',
    type: 'Competitive',
    ageRange: '16+',
    description: 'Coaching and skill development for competitive Fortnite teams.',
    isActive: true,
  },
  {
    id: 'group-wishaw-media',
    centreId: 'centre-wishaw',
    name: 'Broadcast & Podcast',
    nickname: 'B&P Crew',
    game: 'Broadcast & Podcast',
    type: 'Media',
    ageRange: '13+',
    description: 'Live production, digital design and commentary.',
    isActive: true,
  },
  {
    id: 'group-wishaw-dropin',
    centreId: 'centre-wishaw',
    name: 'Esports Drop-In',
    nickname: 'Drop-In',
    game: 'Multi / Casual',
    type: 'Casual',
    ageRange: '8-18',
    description: 'Casual esports and gaming group — free play and social.',
    isActive: true,
  },
  {
    id: 'group-wishaw-mental-health',
    centreId: 'centre-wishaw',
    name: 'Reset & Respawn',
    nickname: 'R&R',
    game: 'Multi / Casual',
    type: 'Casual',
    ageRange: '8-18',
    description: 'Mental Health Awareness Gaming Group.',
    isActive: true,
  },
  // ── Hamilton YMCA ────────────────────────────────────────────────────────
  {
    id: 'group-hamilton-rl-juniors',
    centreId: 'centre-hamilton',
    name: 'Rocket League Juniors',
    nickname: 'Ham RL',
    game: 'Rocket League',
    type: 'Juniors',
    ageRange: '8-14',
    description: 'Pilot programme — rank-based challenges and team building.',
    isActive: true,
  },
  // ── Dublin YMCA ──────────────────────────────────────────────────────────
  {
    id: 'group-dublin-minecraft',
    centreId: 'centre-dublin',
    name: 'Minecraft Juniors',
    nickname: 'Dub MC',
    game: 'Minecraft',
    type: 'Juniors',
    ageRange: '8-14',
    description: 'Pilot programme — survival challenges and build battles.',
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.5 — CORE BADGES
//  Exactly 5 — one per BadgeCategory. These never change; they are the
//  permanent pillars of the badging system across all games and modules.
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_BADGES: Badge[] = [
  {
    id: 'badge-game-mastery',
    category: 'Game Mastery',
    name: 'Game Mastery',
    description:
      'Awarded for learning game mechanics, developing strategies and making informed decisions during gameplay.',
    iconUrl: undefined,
  },
  {
    id: 'badge-teamwork',
    category: 'Teamwork',
    name: 'Teamwork',
    description:
      'Awarded for working together by sharing goals, supporting each other and completing tasks to achieve a common outcome — both in games and in real life.',
    iconUrl: undefined,
  },
  {
    id: 'badge-esports-citizen',
    category: 'Esports Citizen',
    name: 'Esports Citizen',
    description:
      'Awarded for participating online in a positive way, supporting positive competition, communicating appropriately and creating a code of conduct within groups and teams.',
    iconUrl: undefined,
  },
  {
    id: 'badge-personal-development',
    category: 'Personal Development',
    name: 'Personal Development',
    description:
      'Awarded for improving skills, building confidence and self-awareness, identifying and reflecting on mistakes, setting new goals and focusing on improving performance.',
    iconUrl: undefined,
  },
  {
    id: 'badge-digital-skills',
    category: 'Digital Skills',
    name: 'Digital Skills',
    description:
      'Awarded for staying safe online, understanding online tools, developing confidence with technology, communicating responsibly and using digital platforms to learn and create.',
    iconUrl: undefined,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.6 — SUB-BADGES
//  Each sub-badge belongs to a module, contributes XP to one BadgeCategory,
//  and must cite at least 2 YSOF skill IDs.
//
//  Module 1 — "Road to Diamond"      (Rocket League)  → 5 sub-badges
//  Module 2 — "Defeat the Ender Dragon" (Minecraft)   → 5 sub-badges
// ─────────────────────────────────────────────────────────────────────────────

// ── Module 1: Road to Diamond sub-badges ─────────────────────────────────────

export const SEED_SUB_BADGES: SubBadge[] = [
  {
    id: 'sb-rtd-1',
    moduleId: 'mod-road-to-diamond',
    badgeCategory: 'Game Mastery',
    name: 'Kickoff King',
    description:
      'Demonstrate consistent, effective kickoff techniques in Rocket League matches and explain the strategic value of kickoff possession.',
    xpValue: 15,
    ysofSkillIds: ['ysof-gm-1', 'ysof-gm-2'],
    order: 1,
  },
  {
    id: 'sb-rtd-2',
    moduleId: 'mod-road-to-diamond',
    badgeCategory: 'Game Mastery',
    name: 'Rotation Master',
    description:
      'Apply correct 3-man rotation patterns during a full training match, maintaining field coverage without chasing.',
    xpValue: 20,
    ysofSkillIds: ['ysof-gm-2', 'ysof-gm-3'],
    order: 2,
  },
  {
    id: 'sb-rtd-3',
    moduleId: 'mod-road-to-diamond',
    badgeCategory: 'Game Mastery',
    name: 'Boost Management',
    description:
      'Complete a session challenge maintaining effective boost collection and denial, finishing with a positive boost-efficiency score.',
    xpValue: 15,
    ysofSkillIds: ['ysof-gm-1', 'ysof-gm-3'],
    order: 3,
  },
  {
    id: 'sb-rtd-4',
    moduleId: 'mod-road-to-diamond',
    badgeCategory: 'Teamwork',
    name: 'Team Communicator',
    description:
      'Lead an in-game voice/text communication plan for your team during a scrimmage, using agreed callouts and positive language throughout.',
    xpValue: 20,
    ysofSkillIds: ['ysof-tw-1', 'ysof-co-1'],
    order: 4,
  },
  {
    id: 'sb-rtd-5',
    moduleId: 'mod-road-to-diamond',
    badgeCategory: 'Personal Development',
    name: 'Replay Analyst',
    description:
      'Review a recorded gameplay clip, identify at least 2 mistakes and set a specific improvement goal for the next session.',
    xpValue: 20,
    ysofSkillIds: ['ysof-pd-1', 'ysof-pd-2'],
    order: 5,
  },

  // ── Module 2: Defeat the Ender Dragon sub-badges ──────────────────────────

  {
    id: 'sb-ded-1',
    moduleId: 'mod-defeat-ender-dragon',
    badgeCategory: 'Game Mastery',
    name: 'Survival Starter',
    description:
      'Survive your first 3 in-game days without dying, gathering food, wood, and stone using efficient early-game strategies.',
    xpValue: 10,
    ysofSkillIds: ['ysof-gm-1', 'ysof-pd-3'],
    order: 1,
  },
  {
    id: 'sb-ded-2',
    moduleId: 'mod-defeat-ender-dragon',
    badgeCategory: 'Game Mastery',
    name: 'Resource Runner',
    description:
      'Complete a mining expedition to collect diamond-tier resources while demonstrating safe mining practices and branch-mining technique.',
    xpValue: 15,
    ysofSkillIds: ['ysof-gm-2', 'ysof-gm-3'],
    order: 2,
  },
  {
    id: 'sb-ded-3',
    moduleId: 'mod-defeat-ender-dragon',
    badgeCategory: 'Digital Skills',
    name: 'Build Strategist',
    description:
      'Design and construct a functional base using online reference materials and digital planning tools, presenting your design decisions to the group.',
    xpValue: 15,
    ysofSkillIds: ['ysof-ds-3', 'ysof-co-1'],
    order: 3,
  },
  {
    id: 'sb-ded-4',
    moduleId: 'mod-defeat-ender-dragon',
    badgeCategory: 'Teamwork',
    name: 'Combat Ready',
    description:
      'Coordinate with a partner to clear a Nether Fortress together, sharing roles (attacker / support) and communicating throughout.',
    xpValue: 20,
    ysofSkillIds: ['ysof-tw-1', 'ysof-tw-2'],
    order: 4,
  },
  {
    id: 'sb-ded-5',
    moduleId: 'mod-defeat-ender-dragon',
    badgeCategory: 'Esports Citizen',
    name: 'Dragon Slayer',
    description:
      'Successfully defeat the Ender Dragon as a team. Reflect on sportsmanship, group support and online conduct during the final challenge.',
    xpValue: 30,
    ysofSkillIds: ['ysof-ec-1', 'ysof-ec-2'],
    order: 5,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.6 (cont.) — MODULES
//  Each module references its sub-badge IDs in order.
//  centreId: null = shared / approved for all centres.
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_MODULES: Module[] = [
  {
    id: 'mod-road-to-diamond',
    centreId: null,
    game: 'Rocket League',
    name: 'Road to Diamond',
    description:
      'A 14-week structured programme guiding players from foundational Rocket League mechanics through to Diamond-level strategic play.',
    learningOutcome:
      'Young people will be able to apply consistent rotation, boost management and communication strategies in competitive Rocket League matches.',
    durationWeeks: 14,
    status: 'active',
    subBadgeIds: ['sb-rtd-1', 'sb-rtd-2', 'sb-rtd-3', 'sb-rtd-4', 'sb-rtd-5'],
    resources: [],
    isApproved: true,
    createdAt: '2024-09-01T00:00:00.000Z',
    updatedAt: '2024-09-01T00:00:00.000Z',
  },
  {
    id: 'mod-defeat-ender-dragon',
    centreId: null,
    game: 'Minecraft',
    name: 'Defeat the Ender Dragon',
    description:
      'A 12-week journey through Minecraft from day-one survival to facing the Ender Dragon, covering resource gathering, building, Nether navigation and team combat.',
    learningOutcome:
      'Young people will complete the Ender Dragon challenge as a team, demonstrating planning, collaboration and safe digital practice throughout.',
    durationWeeks: 12,
    status: 'active',
    subBadgeIds: ['sb-ded-1', 'sb-ded-2', 'sb-ded-3', 'sb-ded-4', 'sb-ded-5'],
    resources: [],
    isApproved: true,
    createdAt: '2024-09-01T00:00:00.000Z',
    updatedAt: '2024-09-01T00:00:00.000Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.7 — USERS
//
//  Roles:
//    superadmin  → app-wide manager
//    admin       → centre manager (Emma, Wishaw)
//    user        → young people (Leo, Mia, Sam, Aiden)
//
//  DEV-ONLY credentials.  In a real deployment replace every
//  passwordHash with a bcrypt hash — never ship plain text passwords.
//  The "plain:" prefix lets AuthContext detect unhashed values at runtime.
//
//  No personal data collected — username + displayName only.
// ─────────────────────────────────────────────────────────────────────────────

// Credential table kept separate so it is easy to swap for hashes later.
const DEV_PASSWORDS: Record<string, string> = {
  superadmin: 'plain:Admin@1234',  // nosec – local dev seed only
  'emma.w': 'plain:Emma@5678',   // nosec
  'leo.c': 'plain:Leo@pass1',   // nosec
  'mia.w': 'plain:Mia@pass2',   // nosec
  'sam.a': 'plain:Sam@pass3',   // nosec
  'aiden.m': 'plain:Aiden@pass4', // nosec
};

export const SEED_USERS: User[] = [
  // ── Super Admin ──────────────────────────────────────────────────────────
  {
    id: 'user-superadmin',
    username: 'superadmin',
    passwordHash: DEV_PASSWORDS['superadmin'],
    role: 'superadmin',
    firstName: 'App',
    lastName: 'Manager',
    displayName: 'App Manager',
    dateOfBirth: '1985-06-10',
    avatarUrl: undefined,
    centreId: 'centre-wishaw',
    groupIds: [],
    isApproved: true,
    isActive: true,
    createdAt: '2023-09-01T00:00:00.000Z',
  },

  // ── Admin — Wishaw Centre Manager ─────────────────────────────────────────
  {
    id: 'user-emma',
    username: 'emma.w',
    passwordHash: DEV_PASSWORDS['emma.w'],
    role: 'admin',
    firstName: 'Emma',
    lastName: 'Wilson',
    displayName: 'Emma Wilson',
    dateOfBirth: '1990-08-24',
    avatarUrl: undefined,
    centreId: 'centre-wishaw',
    groupIds: [],
    isApproved: true,
    isActive: true,
    createdAt: '2023-09-01T00:00:00.000Z',
  },

  // ── Regular Users — Wishaw ────────────────────────────────────────────────
  {
    id: 'user-leo',
    username: 'leo.c',
    passwordHash: DEV_PASSWORDS['leo.c'],
    role: 'user',
    firstName: 'Leo',
    lastName: 'Carter',
    displayName: 'Leo Carter',
    dateOfBirth: '2012-03-22',
    avatarUrl: undefined,
    centreId: 'centre-wishaw',
    groupIds: ['group-wishaw-rl-juniors'],
    isApproved: true,
    isActive: true,
    createdAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 'user-mia',
    username: 'mia.w',
    passwordHash: DEV_PASSWORDS['mia.w'],
    role: 'user',
    firstName: 'Mia',
    lastName: 'Wong',
    displayName: 'Mia Wong',
    dateOfBirth: '2011-07-14',
    avatarUrl: undefined,
    centreId: 'centre-wishaw',
    groupIds: ['group-wishaw-minecraft'],
    isApproved: true,
    isActive: true,
    createdAt: '2024-01-10T00:00:00.000Z',
  },

  // ── Regular User — Hamilton (pilot site) ─────────────────────────────────
  {
    id: 'user-sam',
    username: 'sam.a',
    passwordHash: DEV_PASSWORDS['sam.a'],
    role: 'user',
    firstName: 'Sam',
    lastName: 'Ali',
    displayName: 'Sam Ali',
    dateOfBirth: '2013-11-05',
    avatarUrl: undefined,
    centreId: 'centre-hamilton',
    groupIds: ['group-hamilton-rl-juniors'],
    isApproved: true,
    isActive: true,
    createdAt: '2024-03-15T00:00:00.000Z',
  },

  // ── Regular User — Dublin (pilot site) ───────────────────────────────────
  {
    id: 'user-aiden',
    username: 'aiden.m',
    passwordHash: DEV_PASSWORDS['aiden.m'],
    role: 'user',
    firstName: 'Aiden',
    lastName: 'Murphy',
    displayName: 'Aiden Murphy',
    dateOfBirth: '2010-09-30',
    avatarUrl: undefined,
    centreId: 'centre-dublin',
    groupIds: ['group-dublin-minecraft'],
    isApproved: true,
    isActive: true,
    createdAt: '2024-06-20T00:00:00.000Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.8 — USER BADGE PROGRESS
//
//  One record per user per BadgeCategory they have earned XP in.
//  currentTier is derived from totalXP against SEED_TIER_THRESHOLDS.
//  (The DataContext will recalculate this automatically on every XP update;
//   these values just bootstrap the demo screens.)
//
//  Leo   — active Rocket League player, strong Game Mastery + Teamwork
//  Mia   — active Minecraft player, strong Esports Citizen + Digital Skills
//  Sam   — Hamilton pilot, early Personal Development progress
//  Aiden — Dublin pilot, just getting started
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_USER_BADGE_PROGRESS: UserBadgeProgress[] = [
  // ── Leo Carter ────────────────────────────────────────────────────────────
  {
    id: 'ubp-leo-gm',
    userId: 'user-leo',
    badgeCategory: 'Game Mastery',
    totalXP: 85,
    currentTier: 'Gold',          // 71–120 XP
  },
  {
    id: 'ubp-leo-tw',
    userId: 'user-leo',
    badgeCategory: 'Teamwork',
    totalXP: 45,
    currentTier: 'Silver',        // 31–70 XP
  },
  {
    id: 'ubp-leo-pd',
    userId: 'user-leo',
    badgeCategory: 'Personal Development',
    totalXP: 20,
    currentTier: 'Bronze',        // 0–30 XP
  },

  // ── Mia Wong ──────────────────────────────────────────────────────────────
  {
    id: 'ubp-mia-ec',
    userId: 'user-mia',
    badgeCategory: 'Esports Citizen',
    totalXP: 30,
    currentTier: 'Bronze',        // 0–30 XP
  },
  {
    id: 'ubp-mia-ds',
    userId: 'user-mia',
    badgeCategory: 'Digital Skills',
    totalXP: 55,
    currentTier: 'Silver',        // 31–70 XP
  },
  {
    id: 'ubp-mia-gm',
    userId: 'user-mia',
    badgeCategory: 'Game Mastery',
    totalXP: 25,
    currentTier: 'Bronze',        // 0–30 XP
  },

  // ── Sam Ali ───────────────────────────────────────────────────────────────
  {
    id: 'ubp-sam-pd',
    userId: 'user-sam',
    badgeCategory: 'Personal Development',
    totalXP: 20,
    currentTier: 'Bronze',        // 0–30 XP
  },
  {
    id: 'ubp-sam-tw',
    userId: 'user-sam',
    badgeCategory: 'Teamwork',
    totalXP: 15,
    currentTier: 'Bronze',        // 0–30 XP
  },

  // ── Aiden Murphy ─────────────────────────────────────────────────────────
  {
    id: 'ubp-aiden-gm',
    userId: 'user-aiden',
    badgeCategory: 'Game Mastery',
    totalXP: 10,
    currentTier: 'Bronze',        // 0–30 XP
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.9 — MODULE PROGRESS
//
//  Tracks which sub-badges each user has completed within a module.
//  Sub-badge IDs from 2.2.6 are referenced directly.
//
//  Leo   — Road to Diamond:           3 / 5 sub-badges complete
//  Mia   — Defeat the Ender Dragon:   2 / 5 sub-badges complete
//  Sam   — Road to Diamond:           1 / 5 sub-badges complete  (pilot)
//  Aiden — Defeat the Ender Dragon:   1 / 5 sub-badges complete  (pilot)
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_MODULE_PROGRESS: ModuleProgress[] = [
  // ── Leo Carter — Road to Diamond ─────────────────────────────────────────
  {
    id: 'mp-leo-rtd',
    userId: 'user-leo',
    moduleId: 'mod-road-to-diamond',
    completedSubBadgeIds: ['sb-rtd-1', 'sb-rtd-2', 'sb-rtd-3'],   // 3 of 5
    isCompleted: false,
    startedAt: '2025-01-15T00:00:00.000Z',
    completedAt: undefined,
  },

  // ── Mia Wong — Defeat the Ender Dragon ───────────────────────────────────
  {
    id: 'mp-mia-ded',
    userId: 'user-mia',
    moduleId: 'mod-defeat-ender-dragon',
    completedSubBadgeIds: ['sb-ded-1', 'sb-ded-2'],               // 2 of 5
    isCompleted: false,
    startedAt: '2025-01-15T00:00:00.000Z',
    completedAt: undefined,
  },

  // ── Sam Ali — Road to Diamond (Hamilton pilot) ────────────────────────────
  {
    id: 'mp-sam-rtd',
    userId: 'user-sam',
    moduleId: 'mod-road-to-diamond',
    completedSubBadgeIds: ['sb-rtd-1'],                            // 1 of 5
    isCompleted: false,
    startedAt: '2025-03-01T00:00:00.000Z',
    completedAt: undefined,
  },

  // ── Aiden Murphy — Defeat the Ender Dragon (Dublin pilot) ────────────────
  {
    id: 'mp-aiden-ded',
    userId: 'user-aiden',
    moduleId: 'mod-defeat-ender-dragon',
    completedSubBadgeIds: ['sb-ded-1'],                            // 1 of 5
    isCompleted: false,
    startedAt: '2025-06-10T00:00:00.000Z',
    completedAt: undefined,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  2.2.10 — ACTIVITIES
//
//  Activity log entries powering:
//    • User Home feed  (recent activity list)
//    • Admin Quick Log (what was just submitted)
//    • Admin Approvals page (pending entries awaiting review)
//
//  Mix of statuses: approved (shows on feed), pending (shows on approvals).
//  Types mirror real Wishaw session events from the brief.
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_ACTIVITIES: Activity[] = [
  // ── Approved — show on Leo's home feed ───────────────────────────────────
  {
    id: 'act-leo-1',
    userId: 'user-leo',
    centreId: 'centre-wishaw',
    loggedByAdminId: 'user-emma',
    type: 'Sub-Badge Completion',
    description: 'Completed Kickoff King sub-badge in Road to Diamond.',
    badgeCategory: 'Game Mastery',
    xpAwarded: 15,
    subBadgeId: 'sb-rtd-1',
    moduleId: 'mod-road-to-diamond',
    status: 'approved',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-01-22T10:00:00.000Z',
    reviewedAt: '2025-01-22T11:00:00.000Z',
  },
  {
    id: 'act-leo-2',
    userId: 'user-leo',
    centreId: 'centre-wishaw',
    loggedByAdminId: 'user-emma',
    type: 'Sub-Badge Completion',
    description: 'Completed Rotation Master sub-badge in Road to Diamond.',
    badgeCategory: 'Game Mastery',
    xpAwarded: 20,
    subBadgeId: 'sb-rtd-2',
    moduleId: 'mod-road-to-diamond',
    status: 'approved',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-01-29T10:00:00.000Z',
    reviewedAt: '2025-01-29T11:30:00.000Z',
  },
  {
    id: 'act-leo-3',
    userId: 'user-leo',
    centreId: 'centre-wishaw',
    loggedByAdminId: 'user-emma',
    type: 'Mini-League Match',
    description: 'Participated in Rocket League Scrim — positive communication throughout.',
    badgeCategory: 'Teamwork',
    xpAwarded: 20,
    subBadgeId: 'sb-rtd-4',
    moduleId: 'mod-road-to-diamond',
    status: 'approved',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-02-05T10:00:00.000Z',
    reviewedAt: '2025-02-05T12:00:00.000Z',
  },
  {
    id: 'act-leo-4',
    userId: 'user-leo',
    centreId: 'centre-wishaw',
    loggedByAdminId: 'user-emma',
    type: 'Podcast / Broadcast',
    description: 'Delivered intro segment for the Esports Academy podcast.',
    badgeCategory: 'Digital Skills',
    xpAwarded: 15,
    subBadgeId: undefined,
    moduleId: undefined,
    status: 'approved',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-02-12T10:00:00.000Z',
    reviewedAt: '2025-02-12T11:00:00.000Z',
  },

  // ── Approved — show on Mia's home feed ───────────────────────────────────
  {
    id: 'act-mia-1',
    userId: 'user-mia',
    centreId: 'centre-wishaw',
    loggedByAdminId: 'user-emma',
    type: 'Sub-Badge Completion',
    description: 'Completed Survival Starter sub-badge in Defeat the Ender Dragon.',
    badgeCategory: 'Game Mastery',
    xpAwarded: 10,
    subBadgeId: 'sb-ded-1',
    moduleId: 'mod-defeat-ender-dragon',
    status: 'approved',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-01-22T10:00:00.000Z',
    reviewedAt: '2025-01-22T11:00:00.000Z',
  },
  {
    id: 'act-mia-2',
    userId: 'user-mia',
    centreId: 'centre-wishaw',
    loggedByAdminId: 'user-emma',
    type: 'Sub-Badge Completion',
    description: 'Completed Resource Runner sub-badge in Defeat the Ender Dragon.',
    badgeCategory: 'Game Mastery',
    xpAwarded: 15,
    subBadgeId: 'sb-ded-2',
    moduleId: 'mod-defeat-ender-dragon',
    status: 'approved',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-01-29T10:00:00.000Z',
    reviewedAt: '2025-01-29T11:00:00.000Z',
  },

  // ── Pending — show on Admin Approvals page ────────────────────────────────
  {
    id: 'act-mia-3',
    userId: 'user-mia',
    centreId: 'centre-wishaw',
    loggedByAdminId: undefined,
    type: 'Sub-Badge Completion',
    description: 'Claims to have completed Build Strategist — uploaded screenshot as evidence.',
    badgeCategory: 'Digital Skills',
    xpAwarded: 15,
    subBadgeId: 'sb-ded-3',
    moduleId: 'mod-defeat-ender-dragon',
    status: 'pending',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-02-05T14:00:00.000Z',
    reviewedAt: undefined,
  },
  {
    id: 'act-sam-1',
    userId: 'user-sam',
    centreId: 'centre-hamilton',
    loggedByAdminId: undefined,
    type: 'Mini-League Match',
    description: 'Participated in Hamilton inter-centre Rocket League match — first competitive game.',
    badgeCategory: 'Teamwork',
    xpAwarded: 15,
    subBadgeId: undefined,
    moduleId: 'mod-road-to-diamond',
    status: 'pending',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-03-10T15:00:00.000Z',
    reviewedAt: undefined,
  },

  // ── Approved — Sam's existing progress ───────────────────────────────────
  {
    id: 'act-sam-2',
    userId: 'user-sam',
    centreId: 'centre-hamilton',
    loggedByAdminId: 'user-emma',
    type: 'Sub-Badge Completion',
    description: 'Completed Kickoff King sub-badge during Hamilton pilot session.',
    badgeCategory: 'Game Mastery',
    xpAwarded: 10,
    subBadgeId: 'sb-rtd-1',
    moduleId: 'mod-road-to-diamond',
    status: 'approved',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-03-05T10:00:00.000Z',
    reviewedAt: '2025-03-05T11:00:00.000Z',
  },

  // ── Approved — Aiden's first entry ───────────────────────────────────────
  {
    id: 'act-aiden-1',
    userId: 'user-aiden',
    centreId: 'centre-dublin',
    loggedByAdminId: 'user-emma',
    type: 'Sub-Badge Completion',
    description: 'Completed Survival Starter sub-badge — first session of Dublin pilot.',
    badgeCategory: 'Game Mastery',
    xpAwarded: 10,
    subBadgeId: 'sb-ded-1',
    moduleId: 'mod-defeat-ender-dragon',
    status: 'approved',
    evidenceUrl: undefined,
    rejectionReason: undefined,
    createdAt: '2025-06-18T10:00:00.000Z',
    reviewedAt: '2025-06-18T11:30:00.000Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  ASSEMBLED SEED STATE — COMPLETE
//  All sections 2.2.1 – 2.2.10 are included.
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_DATA: AppState = {
  tierThresholds: SEED_TIER_THRESHOLDS,
  ysofSkills: SEED_YSOF_SKILLS,
  centres: SEED_CENTRES,
  groups: SEED_GROUPS,
  badges: SEED_BADGES,
  subBadges: SEED_SUB_BADGES,
  modules: SEED_MODULES,
  moduleResources: [],
  users: SEED_USERS,
  userBadgeProgress: SEED_USER_BADGE_PROGRESS,
  moduleProgress: SEED_MODULE_PROGRESS,
  activities: SEED_ACTIVITIES,
  tournaments: [
    {
      id: 'tourn-rl-youth-2026',
      name: 'Spring RL Youth Cup 2026',
      game: 'Rocket League',
      format: 'Single Elimination',
      status: 'upcoming',
      participatingCentreIds: ['centre-wishaw', 'centre-hamilton'],
      createdByAdminId: 'user-emma',
      startDate: '2026-04-15T10:00:00.000Z',
      description: 'Annual youth Rocket League championship across YMCA centres.',
      minAge: 8,
      maxAge: 14,
      createdAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'tourn-fn-open-2026',
      name: 'Fortnite Open 2026',
      game: 'Fortnite',
      format: 'Round Robin',
      status: 'upcoming',
      participatingCentreIds: ['centre-wishaw', 'centre-dublin'],
      createdByAdminId: 'user-emma',
      startDate: '2026-05-10T12:00:00.000Z',
      description: 'Open-age Fortnite tournament — all skill levels welcome.',
      minAge: 13,
      createdAt: '2026-03-10T00:00:00.000Z',
    },
  ],
};
