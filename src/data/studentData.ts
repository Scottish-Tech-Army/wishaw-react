/**
 * @file studentData.ts — MOCK DATA (do not use in new code)
 *
 * ─── STATUS ──────────────────────────────────────────────────────────────────
 * This file is MOCK / SEED data only. It is NOT a source of truth for any
 * live feature. All profile-related components have been migrated to fetch
 * real data from the Spring Boot backend via `src/api/studentApi.ts`.
 *
 * ─── WHAT HAS BEEN REPLACED ──────────────────────────────────────────────────
 * The following exports are no longer imported by any component. They remain
 * here purely for reference / local dev convenience until the backend is fully
 * stood up in all environments:
 *
 *   • MODULES / Module / ModuleSession / ModuleSubBadge
 *       → replaced by ModuleProgressDto[] from GET /students/{id}/modules
 *         via getModuleProgress() / useModuleProgress()
 *
 *   • MAIN_BADGE_DEFINITIONS / MainBadgeDefinition / MainBadgeSubBadge
 *       → replaced by BadgeCatalogueDto from GET /students/{id}/badges
 *         via getBadgeCatalogue() / useBadgeCatalogue()
 *
 *   • XP_HISTORY / XpEvent
 *       → replaced by XpEventDto[] on DashboardSummaryDto.recentActivity
 *         from GET /students/{id}/dashboard via getDashboardSummary() / useDashboard()
 *
 * All team-related exports (TEAMS, TEAM_MEMBERS, Team, TeamMember,
 * TeamMemberBadgeProgress, TeamMemberModuleProgress) have been removed.
 * StudentTeams.tsx and StudentTeamDetail.tsx are now wired to the backend
 * via useTeams() / useTeamDetail() — see TODO-student-teams-backend.md.
 *
 * Do NOT add new imports of this file from components. Wire new features
 * directly to src/api/studentApi.ts instead.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Modules ──────────────────────────────────────────────────────────────────
// Modules are structured courses (12–16 weeks) delivered at in-person sessions
// by a trained youth worker. Each week has a lesson/challenge with a delivery
// plan and resources. Each module has a learning outcome and awards sub-badges.

export interface ModuleSession {
  week: number;
  title: string;
  completed: boolean;
}

export interface ModuleSubBadge {
  id: number;
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
  xpReward: number;
  earnedDate: string | null;
  /** Which of the 5 main badges this sub-badge awards XP towards */
  mainBadgeId: string;
}

export interface Module {
  id: number;
  icon: string;
  name: string;
  /** Overall learning outcome / goal for the module */
  outcome: string;
  game: string;
  durationWeeks: number;
  sessions: ModuleSession[];
  subBadges: ModuleSubBadge[];
}

export const MODULES: Module[] = [
  {
    id: 1,
    icon: "🎮",
    name: "Fortnite Fundamentals",
    outcome: "Understand core game mechanics and build consistent in-game decision-making.",
    game: "Fortnite",
    durationWeeks: 12,
    sessions: [
      { week: 1,  title: "Game overview & controls",         completed: true  },
      { week: 2,  title: "Building basics",                  completed: true  },
      { week: 3,  title: "Zone awareness",                   completed: true  },
      { week: 4,  title: "Loot prioritisation",              completed: true  },
      { week: 5,  title: "Early-game rotations",             completed: true  },
      { week: 6,  title: "Mid-game positioning",             completed: true  },
      { week: 7,  title: "Endgame strategy",                 completed: false },
      { week: 8,  title: "Aim & editing drills",             completed: false },
      { week: 9,  title: "Keybinding & settings",            completed: false },
      { week: 10, title: "VOD review session",               completed: false },
      { week: 11, title: "Scrimmage match",                  completed: false },
      { week: 12, title: "Module assessment & reflection",   completed: false },
    ],
    subBadges: [
      { id: 1001, icon: "🗺️", name: "Zone Reader",  desc: "Demonstrate correct zone rotation 3 sessions in a row", earned: true,  xpReward: 25, earnedDate: "Nov 2024", mainBadgeId: "game-mastery" },
      { id: 1002, icon: "🧱", name: "Builder",       desc: "Complete all building drills",                         earned: true,  xpReward: 25, earnedDate: "Nov 2024", mainBadgeId: "game-mastery" },
      { id: 1003, icon: "🎯", name: "Aim Trainer",   desc: "Hit 70%+ accuracy in the aim drill session",           earned: false, xpReward: 30, earnedDate: null,       mainBadgeId: "game-mastery" },
      { id: 1004, icon: "📋", name: "Tactician",     desc: "Present a winning endgame callout plan",               earned: false, xpReward: 30, earnedDate: null,       mainBadgeId: "game-mastery" },
    ],
  },
  {
    id: 2,
    icon: "🤝",
    name: "Team Communication",
    outcome: "Develop clear, positive in-game communication and leadership under pressure.",
    game: "Any",
    durationWeeks: 14,
    sessions: [
      { week: 1,  title: "What is comms? Active listening",   completed: true  },
      { week: 2,  title: "Callout language & shot-calling",   completed: true  },
      { week: 3,  title: "Giving & receiving feedback",       completed: true  },
      { week: 4,  title: "Tilt management",                   completed: false },
      { week: 5,  title: "Role clarity in a squad",           completed: false },
      { week: 6,  title: "Leading a team debrief",            completed: false },
      { week: 7,  title: "Conflict resolution",               completed: false },
      { week: 8,  title: "Positive reinforcement drills",     completed: false },
      { week: 9,  title: "Coaching a peer",                   completed: false },
      { week: 10, title: "Tournament comms simulation",       completed: false },
      { week: 11, title: "Reflection workshop",               completed: false },
      { week: 12, title: "Group presentation",                completed: false },
      { week: 13, title: "Peer review",                       completed: false },
      { week: 14, title: "Module assessment",                 completed: false },
    ],
    subBadges: [
      { id: 2001, icon: "📢", name: "Callout King", desc: "Land 10 accurate callouts in a scrimmage",          earned: true,  xpReward: 20, earnedDate: "Dec 2024", mainBadgeId: "teamwork" },
      { id: 2002, icon: "🧘", name: "Tilt-Proof",   desc: "Stay positive across 3 consecutive losing sessions", earned: false, xpReward: 30, earnedDate: null,       mainBadgeId: "esports-citizen" },
      { id: 2003, icon: "👨‍🏫", name: "Coach",        desc: "Successfully coach a peer through a challenge",     earned: false, xpReward: 30, earnedDate: null,       mainBadgeId: "teamwork" },
      { id: 2004, icon: "🏅", name: "Leader",        desc: "Captain the team in a tournament",                 earned: false, xpReward: 25, earnedDate: null,       mainBadgeId: "teamwork" },
    ],
  },
  {
    id: 3,
    icon: "📊",
    name: "Performance Analysis",
    outcome: "Use data and VOD review to identify weaknesses and track measurable improvement.",
    game: "Any",
    durationWeeks: 16,
    sessions: [
      { week: 1,  title: "Intro to stats & trackers",         completed: false },
      { week: 2,  title: "Reading a match report",            completed: false },
      { week: 3,  title: "VOD review fundamentals",           completed: false },
      { week: 4,  title: "Identifying patterns in losses",    completed: false },
      { week: 5,  title: "Setting SMART goals",               completed: false },
      { week: 6,  title: "Tracking your KD ratio",            completed: false },
      { week: 7,  title: "Heat maps & positioning data",      completed: false },
      { week: 8,  title: "Mid-module review",                 completed: false },
      { week: 9,  title: "Opponent scouting basics",          completed: false },
      { week: 10, title: "Building a personal stat sheet",    completed: false },
      { week: 11, title: "Comparative analysis",              completed: false },
      { week: 12, title: "Presenting your findings",          completed: false },
      { week: 13, title: "Applying improvements in-game",     completed: false },
      { week: 14, title: "Re-analysis after changes",         completed: false },
      { week: 15, title: "Peer review of stat sheets",        completed: false },
      { week: 16, title: "Module assessment & showcase",      completed: false },
    ],
    subBadges: [
      { id: 3001, icon: "🔍", name: "Scout",        desc: "Complete a full opponent scouting report",      earned: false, xpReward: 20, earnedDate: null, mainBadgeId: "game-mastery" },
      { id: 3002, icon: "📈", name: "Analyst",      desc: "Track your stats for 4 consecutive weeks",      earned: false, xpReward: 25, earnedDate: null, mainBadgeId: "digital-skills" },
      { id: 3003, icon: "🎥", name: "VOD Reviewer", desc: "Present a VOD review to the group",             earned: false, xpReward: 30, earnedDate: null, mainBadgeId: "game-mastery" },
      { id: 3004, icon: "🏆", name: "Strategist",   desc: "Build a winning game plan using your analysis", earned: false, xpReward: 25, earnedDate: null, mainBadgeId: "personal-development" },
    ],
  },
];

// ── The 5 Main YMCA Badges ────────────────────────────────────────────────────
// These are the 5 core badges from the Wishaw YMCA Esports Academy badging
// system. Sub-badges from modules award XP towards each of these badges.
// Level thresholds: Bronze 0-30, Silver 31-70, Gold 71-120, Platinum 120+

/**
 * @deprecated Superseded by SubBadgeDetailDto in src/api/types.ts.
 * Kept here only as the internal type for MAIN_BADGE_DEFINITIONS.
 * Remove once MAIN_BADGE_DEFINITIONS is replaced by the live API (task 5a).
 */
interface MainBadgeSubBadge {
  id: number;
  icon: string;
  name: string;
  /** Short description / goal shown on the card header */
  shortDesc: string;
  /** Full criteria shown when the card is expanded */
  criteria: string;
  /** XP awarded towards the parent main badge */
  xpReward: number;
  /** Whether this is delivered as a Lesson or an Activity */
  type: "lesson" | "activity";
  /** Skills from the Youthwork Skills & Outcomes Framework */
  skills: string[];
  earned: boolean;
  earnedDate: string | null;
}

/**
 * @deprecated Superseded by MainBadgeDetailDto in src/api/types.ts.
 * Kept here only as the internal type for MAIN_BADGE_DEFINITIONS.
 * Remove once MAIN_BADGE_DEFINITIONS is replaced by the live API (task 5a).
 */
interface MainBadgeDefinition {
  id: string;
  icon: string;
  name: string;
  /** Full description from the brief */
  description: string;
  /** Short tagline */
  tagline: string;
  /** Total XP earned towards this badge (across all modules) */
  xpEarned: number;
  subBadges: MainBadgeSubBadge[];
}

export const MAIN_BADGE_DEFINITIONS: MainBadgeDefinition[] = [
  {
    id: "game-mastery",
    icon: "🎮",
    name: "Game Mastery",
    tagline: "Learn, strategise, and dominate the game.",
    description:
      "Game Mastery involves young gamers learning game mechanics, developing strategies, and making informed decisions during gameplay. Young people work through structured modules to improve their understanding of their chosen game, building consistent performance through practice, review, and reflection.",
    xpEarned: 150,
    subBadges: [
      {
        id: 101,
        icon: "🗺️",
        name: "Zone Reader",
        shortDesc: "Read the zone and rotate safely.",
        criteria: "Demonstrate correct zone rotation 3 sessions in a row.",
        xpReward: 25,
        type: "activity",
        skills: ["Problem Solving", "Strategic Thinking"],
        earned: true,
        earnedDate: "Nov 2024",
      },
      {
        id: 102,
        icon: "🧱",
        name: "Builder",
        shortDesc: "Master building mechanics under pressure.",
        criteria: "Complete all building drill challenges in the Fortnite Fundamentals module.",
        xpReward: 25,
        type: "activity",
        skills: ["Practical Skills", "Perseverance"],
        earned: true,
        earnedDate: "Nov 2024",
      },
      {
        id: 103,
        icon: "🎯",
        name: "Aim Trainer",
        shortDesc: "Sharpen your aim with consistent practice.",
        criteria: "Hit 70%+ accuracy in the aim drill session.",
        xpReward: 30,
        type: "activity",
        skills: ["Focus", "Technical Ability"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 104,
        icon: "📋",
        name: "Tactician",
        shortDesc: "Plan and communicate a winning endgame strategy.",
        criteria: "Present a winning endgame callout plan to the group.",
        xpReward: 30,
        type: "lesson",
        skills: ["Strategic Thinking", "Communication"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 105,
        icon: "🔍",
        name: "Scout",
        shortDesc: "Research and analyse your opponents.",
        criteria: "Complete a full opponent scouting report.",
        xpReward: 20,
        type: "lesson",
        skills: ["Research", "Critical Thinking"],
        earned: false,
        earnedDate: null,
      },
    ],
  },
  {
    id: "teamwork",
    icon: "🤝",
    name: "Teamwork",
    tagline: "Achieve more together than apart.",
    description:
      "Teamwork is when young people work together by sharing goals, supporting each other, and completing tasks to achieve a common outcome, both in games and in real life. This badge develops cooperation, communication, and collective responsibility — skills that transfer directly from esports into everyday situations.",
    xpEarned: 75,
    subBadges: [
      {
        id: 201,
        icon: "📢",
        name: "Callout King",
        shortDesc: "Call out enemy positions clearly and accurately.",
        criteria: "Land 10 accurate callouts during a scrimmage session.",
        xpReward: 20,
        type: "activity",
        skills: ["Communication", "Situational Awareness"],
        earned: true,
        earnedDate: "Dec 2024",
      },
      {
        id: 202,
        icon: "👨‍🏫",
        name: "Coach",
        shortDesc: "Guide a teammate through a challenge.",
        criteria: "Successfully coach a peer through a module challenge.",
        xpReward: 30,
        type: "lesson",
        skills: ["Leadership", "Empathy"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 203,
        icon: "🏅",
        name: "Leader",
        shortDesc: "Step up and captain your team.",
        criteria: "Captain the team during a tournament match.",
        xpReward: 25,
        type: "activity",
        skills: ["Leadership", "Decision Making"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 204,
        icon: "🤲",
        name: "Supporter",
        shortDesc: "Lift a struggling teammate over several sessions.",
        criteria: "Actively support a struggling teammate across 3 sessions.",
        xpReward: 20,
        type: "activity",
        skills: ["Empathy", "Inclusivity"],
        earned: false,
        earnedDate: null,
      },
    ],
  },
  {
    id: "esports-citizen",
    icon: "🌐",
    name: "Esports Citizen",
    tagline: "Compete with integrity and represent your community.",
    description:
      "Esports Citizen is where young people learn how to participate online in a positive way, supporting positive competition, being able to communicate appropriately, and creating a code of conduct in their groups and teams. It covers sportsmanship, respectful interactions, and becoming a responsible member of the esports community.",
    xpEarned: 50,
    subBadges: [
      {
        id: 301,
        icon: "📜",
        name: "Code Maker",
        shortDesc: "Write the rules your team plays by.",
        criteria: "Help write and agree a team code of conduct.",
        xpReward: 20,
        type: "lesson",
        skills: ["Citizenship", "Collaboration"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 302,
        icon: "🕊️",
        name: "Peacekeeper",
        shortDesc: "Handle conflict calmly and constructively.",
        criteria: "Resolve an in-game conflict constructively during a session.",
        xpReward: 20,
        type: "activity",
        skills: ["Conflict Resolution", "Communication"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 303,
        icon: "🧘",
        name: "Tilt-Proof",
        shortDesc: "Stay positive even when things go wrong.",
        criteria: "Maintain positive language and attitude across 3 consecutive losing sessions.",
        xpReward: 30,
        type: "activity",
        skills: ["Emotional Regulation", "Resilience"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 304,
        icon: "🏟️",
        name: "Good Sport",
        shortDesc: "Be the player everyone respects.",
        criteria: "Demonstrate exemplary sportsmanship at a tournament (nominated by a coach).",
        xpReward: 25,
        type: "activity",
        skills: ["Integrity", "Respect"],
        earned: false,
        earnedDate: null,
      },
    ],
  },
  {
    id: "personal-development",
    icon: "🌱",
    name: "Personal Development",
    tagline: "Reflect, grow, and set new goals.",
    description:
      "Personal Development is used to improve young people's skills, building confidence and self-awareness. It involves young people identifying, reviewing, and reflecting on their mistakes, setting new goals, and focusing on improving their performance. This badge encourages a growth mindset and the habits of continuous improvement.",
    xpEarned: 0,
    subBadges: [
      {
        id: 401,
        icon: "🔄",
        name: "Reflector",
        shortDesc: "Review your performance honestly after every session.",
        criteria: "Complete a written self-reflection after each session for one full module.",
        xpReward: 25,
        type: "lesson",
        skills: ["Self-Awareness", "Reflection"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 402,
        icon: "🎯",
        name: "Goal Setter",
        shortDesc: "Set targets and check in on your progress.",
        criteria: "Set SMART goals at the start of a module and review them at the end.",
        xpReward: 20,
        type: "lesson",
        skills: ["Goal Setting", "Planning"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 403,
        icon: "💬",
        name: "Feedback Taker",
        shortDesc: "Use coach feedback to visibly improve.",
        criteria: "Receive feedback from a coach and demonstrate an improvement the following session.",
        xpReward: 25,
        type: "activity",
        skills: ["Adaptability", "Openness to Learning"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 404,
        icon: "🚀",
        name: "Level Up",
        shortDesc: "Track a stat and grow it measurably over time.",
        criteria: "Improve a tracked personal stat by at least 20% over 4 weeks.",
        xpReward: 30,
        type: "activity",
        skills: ["Perseverance", "Self-Improvement"],
        earned: false,
        earnedDate: null,
      },
    ],
  },
  {
    id: "digital-skills",
    icon: "💻",
    name: "Digital Skills",
    tagline: "Stay safe, stay savvy, and create online.",
    description:
      "Digital Skills involve young people learning how to stay safe online and understanding how to use online tools. It also includes developing confidence in using technology, communicating responsibly, and using digital platforms to learn and create. This badge prepares young people to navigate the digital world safely and effectively.",
    xpEarned: 0,
    subBadges: [
      {
        id: 501,
        icon: "🛡️",
        name: "Safe Surfer",
        shortDesc: "Know the risks and stay safe online.",
        criteria: "Complete the online safety module and pass the end quiz.",
        xpReward: 20,
        type: "lesson",
        skills: ["Online Safety", "Digital Literacy"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 502,
        icon: "🔐",
        name: "Data Guardian",
        shortDesc: "Protect your data and personal information.",
        criteria: "Demonstrate understanding of password hygiene and data privacy.",
        xpReward: 20,
        type: "lesson",
        skills: ["Digital Literacy", "Responsibility"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 503,
        icon: "🎥",
        name: "Content Creator",
        shortDesc: "Create and share something about your esports journey.",
        criteria: "Create and share a piece of digital content (clip, post, or presentation) about your esports journey.",
        xpReward: 30,
        type: "activity",
        skills: ["Creativity", "Digital Communication"],
        earned: false,
        earnedDate: null,
      },
      {
        id: 504,
        icon: "📈",
        name: "Analyst",
        shortDesc: "Use data tools to track and present your stats.",
        criteria: "Use a digital stats tracker for 4 consecutive weeks and present your findings.",
        xpReward: 25,
        type: "activity",
        skills: ["Data Literacy", "Critical Thinking"],
        earned: false,
        earnedDate: null,
      },
    ],
  },
];

// ── XP History ────────────────────────────────────────────────────────────────
export interface XpEvent {
  id: number;
  activity: string;
  xp: number;
  date: string;
  icon: string;
}

export const XP_HISTORY: XpEvent[] = [
  { id: 1,  activity: "Completed first session",        xp: 50,  date: "2024-10-05", icon: "🔥" },
  { id: 2,  activity: "Won match vs. Riverside",        xp: 120, date: "2024-10-12", icon: "🏆" },
  { id: 3,  activity: "10 sessions in a month",         xp: 150, date: "2024-11-03", icon: "⚡" },
  { id: 4,  activity: "Weekly challenge completed",     xp: 75,  date: "2024-11-18", icon: "🎯" },
  { id: 5,  activity: "Assisted 20 teammates",          xp: 50,  date: "2024-12-01", icon: "🤝" },
  { id: 6,  activity: "Tournament semi-final win",      xp: 200, date: "2025-01-09", icon: "🏅" },
  { id: 7,  activity: "Top scorer 3 sessions in a row", xp: 150, date: "2025-01-22", icon: "🎯" },
  { id: 8,  activity: "Won monthly tournament",         xp: 300, date: "2025-02-14", icon: "👑" },
  { id: 9,  activity: "Reached Level 10",               xp: 50,  date: "2025-03-07", icon: "⭐" },
  { id: 10, activity: "Weekly challenge completed",     xp: 75,  date: "2025-03-21", icon: "🎯" },
  { id: 11, activity: "Daily login streak bonus",       xp: 30,  date: "2025-04-02", icon: "📅" },
  { id: 12, activity: "Community event attendance",     xp: 60,  date: "2025-04-15", icon: "🎪" },
  { id: 13, activity: "Fortnite season challenge",      xp: 180, date: "2025-05-10", icon: "🎮" },
  { id: 14, activity: "Weekly challenge completed",     xp: 75,  date: "2025-06-03", icon: "🎯" },
  { id: 15, activity: "Reached Level 12",               xp: 100, date: "2025-06-28", icon: "🚀" },
];
