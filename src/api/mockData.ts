/**
 * @file mockData.ts — Static mock responses for every DTO used by the student portal.
 *
 * Used exclusively by mockApi.ts, which is only bundled when VITE_USE_MOCK=true.
 * Vite tree-shakes this entire file from production builds.
 *
 * Data is drawn from / kept consistent with src/data/studentData.ts where possible.
 */

import type {
  DashboardSummaryDto,
  MainBadgeSummaryDto,
  XpEventDto,
  LeaderboardResponseDto,
  LeaderboardPlayerDto,
  LeaderboardCentreDto,
  BadgeCatalogueDto,
  BadgeLevelDto,
  MainBadgeDetailDto,
  SubBadgeDetailDto,
  ModuleProgressDto,
  ModuleSubBadgeDto,
  StudentProfileDto,
  TeamSummaryDto,
  TeamDetailDto,
  TeamMemberDto,
  TeamMemberBadgeProgressDto,
  TeamMemberModuleProgressDto,
  EvidenceSubmissionDto,
  PublicBadgeSummaryDto,
  PublicPlayerProfileDto,
  PublicModuleProgressDto,
  LoginResponseDto,
  AdminBadgeCatalogueDto,
  BadgeLeaderboardEntryDto,
  AdminModuleDto,
  AdminSubBadgeDto,
  AdminSessionDto,
  AdminResourceDto,
  AdminGroupDto,
  AdminGroupMemberAwardDto,
  AdminGroupAwardViewDto,
  AdminAwardModuleDto,
  AdminUserSearchResultDto,
  AdminUserAwardStateDto,
  AdminRecentActivityDto,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// 1A — MOCK_DASHBOARD  (DashboardSummaryDto)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_DASHBOARD: DashboardSummaryDto = {
  // ── 1A-i  Identity & XP block ────────────────────────────────────────────
  studentId:      1,
  gamertag:       "Tiger Bear",
  name:           "Alex Johnson",
  username:       "@alex_gamer",
  avatarUrl:      null,
  joinedDate:     "Sep 2024",
  hub:            "Hub Glasgow",
  level:          12,
  xp:             1245,
  xpForNextLevel: 1500,

  // ── 1A-ii  Weekly stats & counts ─────────────────────────────────────────
  weeklyXp:        75,
  teamWeeklyXp:    210,
  hubWeeklyXp:     540,
  totalSubBadges:  20,
  earnedSubBadges: 3,
  leaderboardRank: 4,
  nextSessionAt:   "2026-04-07T18:00:00",

  // ── 1A-iii  Team information ─────────────────────────────────────────────
  teamName:        "The Code Warriors",
  teamIcon:        "⚔️",
  teamId:          "team-1",
  teamColour:      "#3b82f6",
  isCaptain:       false,

  // ── 1A-iv  Badge summaries ───────────────────────────────────────────────
  badges: [
    {
      id:             "game-mastery",
      icon:           "🎮",
      name:           "Game Mastery",
      xpEarned:       150,
      levelName:      "PLATINUM",
      levelLabel:     "Platinum",
      levelColor:     "#a8a9ad",
      levelIcon:      "💎",
      subBadgesEarned: 2,
      subBadgesTotal:  5,
    },
    {
      id:             "teamwork",
      icon:           "🤝",
      name:           "Teamwork",
      xpEarned:       75,
      levelName:      "GOLD",
      levelLabel:     "Gold",
      levelColor:     "#ffd700",
      levelIcon:      "🥇",
      subBadgesEarned: 1,
      subBadgesTotal:  4,
    },
    {
      id:             "esports-citizen",
      icon:           "🌐",
      name:           "Esports Citizen",
      xpEarned:       50,
      levelName:      "SILVER",
      levelLabel:     "Silver",
      levelColor:     "#c0c0c0",
      levelIcon:      "🥈",
      subBadgesEarned: 0,
      subBadgesTotal:  4,
    },
    {
      id:             "personal-development",
      icon:           "🌱",
      name:           "Personal Development",
      xpEarned:       0,
      levelName:      "BRONZE",
      levelLabel:     "Bronze",
      levelColor:     "#cd7f32",
      levelIcon:      "🥉",
      subBadgesEarned: 0,
      subBadgesTotal:  4,
    },
    {
      id:             "digital-skills",
      icon:           "💻",
      name:           "Digital Skills",
      xpEarned:       0,
      levelName:      "BRONZE",
      levelLabel:     "Bronze",
      levelColor:     "#cd7f32",
      levelIcon:      "🥉",
      subBadgesEarned: 0,
      subBadgesTotal:  4,
    },
  ] satisfies MainBadgeSummaryDto[],

  // ── 1A-iv  Recent activity ────────────────────────────────────────────────
  recentActivity: [
    { id: 10, activity: "Weekly challenge completed",     xp:  75, date: "2025-03-21", icon: "🎯" },
    { id: 9,  activity: "Reached Level 10",               xp:  50, date: "2025-03-07", icon: "⭐" },
    { id: 8,  activity: "Won monthly tournament",         xp: 300, date: "2025-02-14", icon: "👑" },
    { id: 7,  activity: "Top scorer 3 sessions in a row", xp: 150, date: "2025-01-22", icon: "🎯" },
    { id: 6,  activity: "Tournament semi-final win",      xp: 200, date: "2025-01-09", icon: "🏅" },
  ] satisfies XpEventDto[],
};

// ─────────────────────────────────────────────────────────────────────────────
// 1B — MOCK_LEADERBOARD  (LeaderboardResponseDto)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_LEADERBOARD: LeaderboardResponseDto = {
  // ── 1B-i  Response metadata ───────────────────────────────────────────────
  period:                 "ALL_TIME",
  totalCount:             12,
  currentUserUsername:    "@alex_gamer",
  currentUserCentreName:  "Hub Glasgow",

  // ── 1B-ii  Players tab ───────────────────────────────────────────────────
  players: [
    { rank: 1,  studentId: 11, name: "Jordan Raines",   username: "@jordan_r",    gamertag: "J-Force",        level: 18, periodXp: 2100, completedModules: 3, badgesCompleted: 4, centre: "Hub Edinburgh",   avatarUrl: "", badgeIcons: ["💎","🥇","🥈","🥉"] },
    { rank: 2,  studentId: 12, name: "Priya Kapoor",    username: "@priya_k",     gamertag: "Strategy Queen", level: 16, periodXp: 1980, completedModules: 3, badgesCompleted: 4, centre: "Hub Manchester",  avatarUrl: "", badgeIcons: ["💎","🥇","🥈","🥉"] },
    { rank: 3,  studentId: 13, name: "Callum Shaw",     username: "@callum_s",    gamertag: "Callum Clutch",  level: 15, periodXp: 1750, completedModules: 3, badgesCompleted: 3, centre: "Hub Glasgow",     avatarUrl: "", badgeIcons: ["💎","🥇","🥈"] },
    { rank: 4,  studentId: 1,  name: "Alex Johnson",    username: "@alex_gamer",  gamertag: "Tiger Bear",     level: 12, periodXp: 1245, completedModules: 2, badgesCompleted: 3, centre: "Hub Glasgow",     avatarUrl: "", badgeIcons: ["💎","🥇","🥈"] },
    { rank: 5,  studentId: 14, name: "Mei Lin",         username: "@mei_l",       gamertag: "Mei Dragon",     level: 12, periodXp: 1190, completedModules: 2, badgesCompleted: 2, centre: "Hub Birmingham",  avatarUrl: "", badgeIcons: ["🥇","🥈"] },
    { rank: 6,  studentId: 15, name: "Tyler Braun",     username: "@tyler_b",     gamertag: "TylerTech",      level: 11, periodXp: 1050, completedModules: 2, badgesCompleted: 2, centre: "Hub Manchester",  avatarUrl: "", badgeIcons: ["🥇","🥈"] },
    { rank: 7,  studentId: 16, name: "Aisha Okonkwo",   username: "@aisha_o",     gamertag: "Aisha Ace",      level: 10, periodXp:  980, completedModules: 2, badgesCompleted: 2, centre: "Hub Edinburgh",   avatarUrl: "", badgeIcons: ["🥇","🥈"] },
    { rank: 8,  studentId: 17, name: "Rory MacDonald",  username: "@rory_mac",    gamertag: "Rory Mac",       level: 10, periodXp:  870, completedModules: 1, badgesCompleted: 1, centre: "Hub Glasgow",     avatarUrl: "", badgeIcons: ["🥉"] },
    { rank: 9,  studentId: 18, name: "Zara Patel",      username: "@zara_p",      gamertag: "Zara Storm",     level:  9, periodXp:  760, completedModules: 1, badgesCompleted: 1, centre: "Hub Birmingham",  avatarUrl: "", badgeIcons: ["🥉"] },
    { rank: 10, studentId: 19, name: "Finn O'Brien",    username: "@finn_ob",     gamertag: "Finn Fire",      level:  8, periodXp:  640, completedModules: 1, badgesCompleted: 1, centre: "Hub Edinburgh",   avatarUrl: "", badgeIcons: ["🥉"] },
    { rank: 11, studentId: 20, name: "Sasha Ivanova",   username: "@sasha_i",     gamertag: "Sasha Shadow",   level:  7, periodXp:  510, completedModules: 1, badgesCompleted: 0, centre: "Hub Manchester",  avatarUrl: "", badgeIcons: [] },
    { rank: 12, studentId: 21, name: "Kwame Asante",    username: "@kwame_a",     gamertag: "Kwame",          level:  5, periodXp:  320, completedModules: 0, badgesCompleted: 0, centre: "Hub Glasgow",     avatarUrl: "", badgeIcons: [] },
  ] satisfies LeaderboardPlayerDto[],

  // ── 1B-iii  Centres tab ──────────────────────────────────────────────────
  centres: [
    { rank: 1, name: "Hub Glasgow",     icon: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", memberCount: 4, periodXp: 4165, totalBadges: 10, totalModules: 8, topPlayerName: "Callum Shaw"  },
    { rank: 2, name: "Hub Edinburgh",   icon: "🏰",      memberCount: 3, periodXp: 3720, totalBadges:  9, totalModules: 6, topPlayerName: "Jordan Raines" },
    { rank: 3, name: "Hub Manchester",  icon: "🐝",      memberCount: 3, periodXp: 3540, totalBadges:  6, totalModules: 5, topPlayerName: "Priya Kapoor"  },
    { rank: 4, name: "Hub Birmingham",  icon: "⚙️",      memberCount: 2, periodXp: 1950, totalBadges:  3, totalModules: 3, topPlayerName: "Mei Lin"        },
    { rank: 5, name: "Hub Liverpool",   icon: "🎸",      memberCount: 0, periodXp:    0, totalBadges:  0, totalModules: 0, topPlayerName: "—"              },
  ] satisfies LeaderboardCentreDto[],
};

// ─────────────────────────────────────────────────────────────────────────────
// 1C — MOCK_BADGE_CATALOGUE  (BadgeCatalogueDto)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_BADGE_CATALOGUE: BadgeCatalogueDto = {
  // ── 1C-i  Badge levels ────────────────────────────────────────────────────
  badgeLevels: [
    { name: "bronze",   label: "Bronze",   minXP:   0, maxXP:  30, color: "#cd7f32", icon: "🥉" },
    { name: "silver",   label: "Silver",   minXP:  31, maxXP:  70, color: "#c0c0c0", icon: "🥈" },
    { name: "gold",     label: "Gold",     minXP:  71, maxXP: 120, color: "#ffd700", icon: "🥇" },
    { name: "platinum", label: "Platinum", minXP: 121, maxXP: null, color: "#a8a9ad", icon: "💎" },
  ] satisfies BadgeLevelDto[],

  // ── 1C-ii  Main badge definitions ────────────────────────────────────────
  badges: [
    {
      id:          "game-mastery",
      icon:        "🎮",
      name:        "Game Mastery",
      tagline:     "Learn, strategise, and dominate the game.",
      description: "Game Mastery involves young gamers learning game mechanics, developing strategies, and making informed decisions during gameplay. Young people work through structured modules to improve their understanding of their chosen game, building consistent performance through practice, review, and reflection.",
      xpEarned:    150,
      subBadges: [
        { id: 101, icon: "🗺️", name: "Zone Reader",  shortDesc: "Read the zone and rotate safely.",                   criteria: "Demonstrate correct zone rotation 3 sessions in a row.",                              xpReward: 25, type: "activity", skills: ["Problem Solving", "Strategic Thinking"],      earned: true,  earnedDate: "Nov 2024" },
        { id: 102, icon: "🧱", name: "Builder",       shortDesc: "Master building mechanics under pressure.",          criteria: "Complete all building drill challenges in the Fortnite Fundamentals module.",          xpReward: 25, type: "activity", skills: ["Practical Skills", "Perseverance"],            earned: true,  earnedDate: "Nov 2024" },
        { id: 103, icon: "🎯", name: "Aim Trainer",   shortDesc: "Sharpen your aim with consistent practice.",        criteria: "Hit 70%+ accuracy in the aim drill session.",                                          xpReward: 30, type: "activity", skills: ["Focus", "Technical Ability"],                 earned: false, earnedDate: null       },
        { id: 104, icon: "📋", name: "Tactician",     shortDesc: "Plan and communicate a winning endgame strategy.",  criteria: "Present a winning endgame callout plan to the group.",                                 xpReward: 30, type: "lesson",   skills: ["Strategic Thinking", "Communication"],        earned: false, earnedDate: null       },
        { id: 105, icon: "🔍", name: "Scout",         shortDesc: "Research and analyse your opponents.",              criteria: "Complete a full opponent scouting report.",                                            xpReward: 20, type: "lesson",   skills: ["Research", "Critical Thinking"],              earned: false, earnedDate: null       },
      ] satisfies SubBadgeDetailDto[],
    },
    {
      id:          "teamwork",
      icon:        "🤝",
      name:        "Teamwork",
      tagline:     "Achieve more together than apart.",
      description: "Teamwork is when young people work together by sharing goals, supporting each other, and completing tasks to achieve a common outcome, both in games and in real life. This badge develops cooperation, communication, and collective responsibility — skills that transfer directly from esports into everyday situations.",
      xpEarned:    75,
      subBadges: [
        { id: 201, icon: "📢", name: "Callout King", shortDesc: "Call out enemy positions clearly and accurately.",    criteria: "Land 10 accurate callouts during a scrimmage session.",                                xpReward: 20, type: "activity", skills: ["Communication", "Situational Awareness"],   earned: true,  earnedDate: "Dec 2024" },
        { id: 202, icon: "👨‍🏫", name: "Coach",        shortDesc: "Guide a teammate through a challenge.",              criteria: "Successfully coach a peer through a module challenge.",                                xpReward: 30, type: "lesson",   skills: ["Leadership", "Empathy"],                     earned: false, earnedDate: null       },
        { id: 203, icon: "🏅", name: "Leader",        shortDesc: "Step up and captain your team.",                    criteria: "Captain the team during a tournament match.",                                          xpReward: 25, type: "activity", skills: ["Leadership", "Decision Making"],              earned: false, earnedDate: null       },
        { id: 204, icon: "🤲", name: "Supporter",     shortDesc: "Lift a struggling teammate over several sessions.", criteria: "Actively support a struggling teammate across 3 sessions.",                            xpReward: 20, type: "activity", skills: ["Empathy", "Inclusivity"],                    earned: false, earnedDate: null       },
      ] satisfies SubBadgeDetailDto[],
    },
    {
      id:          "esports-citizen",
      icon:        "🌐",
      name:        "Esports Citizen",
      tagline:     "Compete with integrity and represent your community.",
      description: "Esports Citizen is where young people learn how to participate online in a positive way, supporting positive competition, being able to communicate appropriately, and creating a code of conduct in their groups and teams. It covers sportsmanship, respectful interactions, and becoming a responsible member of the esports community.",
      xpEarned:    50,
      subBadges: [
        { id: 301, icon: "📜", name: "Code Maker",   shortDesc: "Write the rules your team plays by.",              criteria: "Help write and agree a team code of conduct.",                                          xpReward: 20, type: "lesson",   skills: ["Citizenship", "Collaboration"],               earned: false, earnedDate: null },
        { id: 302, icon: "🕊️", name: "Peacekeeper",  shortDesc: "Handle conflict calmly and constructively.",      criteria: "Resolve an in-game conflict constructively during a session.",                          xpReward: 20, type: "activity", skills: ["Conflict Resolution", "Communication"],       earned: false, earnedDate: null },
        { id: 303, icon: "🧘", name: "Tilt-Proof",   shortDesc: "Stay positive even when things go wrong.",        criteria: "Maintain positive language and attitude across 3 consecutive losing sessions.",          xpReward: 30, type: "activity", skills: ["Emotional Regulation", "Resilience"],         earned: false, earnedDate: null },
        { id: 304, icon: "🏟️", name: "Good Sport",   shortDesc: "Be the player everyone respects.",               criteria: "Demonstrate exemplary sportsmanship at a tournament (nominated by a coach).",            xpReward: 25, type: "activity", skills: ["Integrity", "Respect"],                      earned: false, earnedDate: null },
      ] satisfies SubBadgeDetailDto[],
    },
    {
      id:          "personal-development",
      icon:        "🌱",
      name:        "Personal Development",
      tagline:     "Reflect, grow, and set new goals.",
      description: "Personal Development is used to improve young people's skills, building confidence and self-awareness. It involves young people identifying, reviewing, and reflecting on their mistakes, setting new goals, and focusing on improving their performance. This badge encourages a growth mindset and the habits of continuous improvement.",
      xpEarned:    0,
      subBadges: [
        { id: 401, icon: "🔄", name: "Reflector",      shortDesc: "Review your performance honestly after every session.", criteria: "Complete a written self-reflection after each session for one full module.",         xpReward: 25, type: "lesson",   skills: ["Self-Awareness", "Reflection"],               earned: false, earnedDate: null },
        { id: 402, icon: "🎯", name: "Goal Setter",    shortDesc: "Set targets and check in on your progress.",           criteria: "Set SMART goals at the start of a module and review them at the end.",              xpReward: 20, type: "lesson",   skills: ["Goal Setting", "Planning"],                  earned: false, earnedDate: null },
        { id: 403, icon: "💬", name: "Feedback Taker", shortDesc: "Use coach feedback to visibly improve.",               criteria: "Receive feedback from a coach and demonstrate an improvement the following session.", xpReward: 25, type: "activity", skills: ["Adaptability", "Openness to Learning"],      earned: false, earnedDate: null },
        { id: 404, icon: "🚀", name: "Level Up",        shortDesc: "Track a stat and grow it measurably over time.",      criteria: "Improve a tracked personal stat by at least 20% over 4 weeks.",                      xpReward: 30, type: "activity", skills: ["Perseverance", "Self-Improvement"],           earned: false, earnedDate: null },
      ] satisfies SubBadgeDetailDto[],
    },
    {
      id:          "digital-skills",
      icon:        "💻",
      name:        "Digital Skills",
      tagline:     "Stay safe, stay savvy, and create online.",
      description: "Digital Skills involve young people learning how to stay safe online and understanding how to use online tools. It also includes developing confidence in using technology, communicating responsibly, and using digital platforms to learn and create. This badge prepares young people to navigate the digital world safely and effectively.",
      xpEarned:    0,
      subBadges: [
        { id: 501, icon: "🛡️", name: "Safe Surfer",       shortDesc: "Know the risks and stay safe online.",                    criteria: "Complete the online safety module and pass the end quiz.",                                        xpReward: 20, type: "lesson",   skills: ["Online Safety", "Digital Literacy"],              earned: false, earnedDate: null },
        { id: 502, icon: "🔐", name: "Data Guardian",     shortDesc: "Protect your data and personal information.",             criteria: "Demonstrate understanding of password hygiene and data privacy.",                                  xpReward: 20, type: "lesson",   skills: ["Digital Literacy", "Responsibility"],             earned: false, earnedDate: null },
        { id: 503, icon: "🎥", name: "Content Creator",   shortDesc: "Create and share something about your esports journey.", criteria: "Create and share a piece of digital content (clip, post, or presentation) about your esports journey.", xpReward: 30, type: "activity", skills: ["Creativity", "Digital Communication"],           earned: false, earnedDate: null },
        { id: 504, icon: "📈", name: "Analyst",           shortDesc: "Use data tools to track and present your stats.",        criteria: "Use a digital stats tracker for 4 consecutive weeks and present your findings.",                     xpReward: 25, type: "activity", skills: ["Data Literacy", "Critical Thinking"],             earned: false, earnedDate: null },
      ] satisfies SubBadgeDetailDto[],
    },
  ] satisfies MainBadgeDetailDto[],
};

// ─────────────────────────────────────────────────────────────────────────────
// 1D — MOCK_MODULES  (ModuleProgressDto[])
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_MODULES: ModuleProgressDto[] = [
  // ── 1D-i  Module shells ───────────────────────────────────────────────────
  {
    id:            1,
    icon:          "🎮",
    name:          "Fortnite Fundamentals",
    outcome:       "Understand core game mechanics and build consistent in-game decision-making.",
    durationWeeks: 12,
    subBadges: [
      { id: 1001, icon: "🗺️", name: "Zone Reader",  desc: "Demonstrate correct zone rotation 3 sessions in a row",  xpReward: 25, mainBadgeId: "game-mastery", earned: true,  earnedDate: "Nov 2024" },
      { id: 1002, icon: "🧱", name: "Builder",       desc: "Complete all building drills",                           xpReward: 25, mainBadgeId: "game-mastery", earned: true,  earnedDate: "Nov 2024" },
      { id: 1003, icon: "🎯", name: "Aim Trainer",   desc: "Hit 70%+ accuracy in the aim drill session",            xpReward: 30, mainBadgeId: "game-mastery", earned: false, earnedDate: null       },
      { id: 1004, icon: "📋", name: "Tactician",     desc: "Present a winning endgame callout plan",                xpReward: 30, mainBadgeId: "game-mastery", earned: false, earnedDate: null       },
    ] satisfies ModuleSubBadgeDto[],
  },
  {
    id:            2,
    icon:          "🤝",
    name:          "Team Communication",
    outcome:       "Develop clear, positive in-game communication and leadership under pressure.",
    durationWeeks: 14,
    subBadges: [
      { id: 2001, icon: "📢", name: "Callout King", desc: "Land 10 accurate callouts in a scrimmage",           xpReward: 20, mainBadgeId: "teamwork",        earned: true,  earnedDate: "Dec 2024" },
      { id: 2002, icon: "🧘", name: "Tilt-Proof",   desc: "Stay positive across 3 consecutive losing sessions", xpReward: 30, mainBadgeId: "esports-citizen", earned: false, earnedDate: null       },
      { id: 2003, icon: "👨‍🏫", name: "Coach",        desc: "Successfully coach a peer through a challenge",     xpReward: 30, mainBadgeId: "teamwork",        earned: false, earnedDate: null       },
      { id: 2004, icon: "🏅", name: "Leader",        desc: "Captain the team in a tournament",                  xpReward: 25, mainBadgeId: "teamwork",        earned: false, earnedDate: null       },
    ] satisfies ModuleSubBadgeDto[],
  },
  {
    id:            3,
    icon:          "📊",
    name:          "Performance Analysis",
    outcome:       "Use data and VOD review to identify weaknesses and track measurable improvement.",
    durationWeeks: 16,
    subBadges: [
      { id: 3001, icon: "🔍", name: "Scout",        desc: "Complete a full opponent scouting report",      xpReward: 20, mainBadgeId: "game-mastery",        earned: false, earnedDate: null },
      { id: 3002, icon: "📈", name: "Analyst",      desc: "Track your stats for 4 consecutive weeks",      xpReward: 25, mainBadgeId: "digital-skills",      earned: false, earnedDate: null },
      { id: 3003, icon: "🎥", name: "VOD Reviewer", desc: "Present a VOD review to the group",             xpReward: 30, mainBadgeId: "game-mastery",        earned: false, earnedDate: null },
      { id: 3004, icon: "🏆", name: "Strategist",   desc: "Build a winning game plan using your analysis", xpReward: 25, mainBadgeId: "personal-development", earned: false, earnedDate: null },
    ] satisfies ModuleSubBadgeDto[],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1E — MOCK_STUDENT_PROFILE  (StudentProfileDto)
// ─────────────────────────────────────────────────────────────────────────────

export let MOCK_STUDENT_PROFILE: StudentProfileDto = {
  studentId: 1,
  username:  "@alex_gamer",
  gamertag:  "Tiger Bear",
  bio:       "Fortnite grinder and team captain in training. Here to improve, compete, and have fun. 🎮",
  avatarUrl: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1F — MOCK_TEAMS  (TeamSummaryDto[])
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_TEAMS: TeamSummaryDto[] = [
  // ── 1F-i  Team shells & 1F-ii  Avatar stacks ─────────────────────────────
  {
    id:               "wolf-cubs",
    name:             "Wolf Cubs",
    icon:             "🐺",
    colour:           "#4f8ef7",
    hub:              "Hub Glasgow",
    founded:          "2024",
    description:      "Competitive Fortnite squad from Glasgow, focused on team play and climbing the ranked ladder together.",
    game:             "Fortnite",
    memberCount:      5,
    captainGamertag:  "Tiger Bear",
    memberAvatarUrls: ["", "", "", "", ""],
  },
  {
    id:               "pixel-wolves",
    name:             "Pixel Wolves",
    icon:             "🐾",
    colour:           "#9b59b6",
    hub:              "Hub Edinburgh",
    founded:          "2024",
    description:      "Edinburgh-based squad grinding ranked modes across multiple titles.",
    game:             "Valorant",
    memberCount:      4,
    captainGamertag:  "Jordan Raines",
    memberAvatarUrls: ["", "", "", ""],
  },
  {
    id:               "neon-bees",
    name:             "Neon Bees",
    icon:             "🐝",
    colour:           "#f39c12",
    hub:              "Hub Manchester",
    founded:          "2025",
    description:      "Manchester crew bringing the energy. Known for aggressive early-game plays.",
    game:             "Fortnite",
    memberCount:      4,
    captainGamertag:  "Priya Kapoor",
    memberAvatarUrls: ["", "", "", ""],
  },
  {
    id:               "iron-circuit",
    name:             "Iron Circuit",
    icon:             "⚙️",
    colour:           "#e74c3c",
    hub:              "Hub Birmingham",
    founded:          "2025",
    description:      "Birmingham's newest team, still finding their feet but full of potential.",
    game:             "Rocket League",
    memberCount:      3,
    captainGamertag:  "Mei Lin",
    memberAvatarUrls: ["", "", ""],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1G — MOCK_TEAM_DETAIL  (TeamDetailDto)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_TEAM_DETAIL: TeamDetailDto = {
  // ── 1G-i  Team header ─────────────────────────────────────────────────────
  id:          "wolf-cubs",
  name:        "Wolf Cubs",
  icon:        "🐺",
  colour:      "#4f8ef7",
  hub:         "Hub Glasgow",
  founded:     "2024",
  description: "Competitive Fortnite squad from Glasgow, focused on team play and climbing the ranked ladder together.",
  game:        "Fortnite",

  // ── 1G-ii  Members ───────────────────────────────────────────────────────
  members: [
    {
      studentId:   1,
      gamertag:    "Tiger Bear",
      realName:    "Alex Johnson",
      username:    "@alex_gamer",
      teamId:      "wolf-cubs",
      joinedDate:  "Sep 2024",
      avatarUrl:   null,
      isCaptain:   true,
      level:       12,
      totalXP:     1245,
      badgeProgress: [
        { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned: 150, subBadgesEarned: 2, subBadgesTotal: 5, levelName: "PLATINUM", levelLabel: "Platinum", levelColor: "#a8a9ad", levelIcon: "💎" },
        { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  75, subBadgesEarned: 1, subBadgesTotal: 4, levelName: "GOLD",     levelLabel: "Gold",     levelColor: "#ffd700", levelIcon: "🥇" },
        { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  50, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "SILVER",   levelLabel: "Silver",   levelColor: "#c0c0c0", levelIcon: "🥈" },
        { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE",   levelLabel: "Bronze",   levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE",   levelLabel: "Bronze",   levelColor: "#cd7f32", levelIcon: "🥉" },
      ] satisfies TeamMemberBadgeProgressDto[],
      moduleProgress: [
        { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  6, sessionsTotal: 12 },
        { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  3, sessionsTotal: 14 },
      ] satisfies TeamMemberModuleProgressDto[],
    },
    {
      studentId:   17,
      gamertag:    "Rory Mac",
      realName:    "Rory MacDonald",
      username:    "@rory_mac",
      teamId:      "wolf-cubs",
      joinedDate:  "Sep 2024",
      avatarUrl:   null,
      isCaptain:   false,
      level:       10,
      totalXP:     870,
      badgeProgress: [
        { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned: 100, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "GOLD",   levelLabel: "Gold",   levelColor: "#ffd700", levelIcon: "🥇" },
        { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  55, subBadgesEarned: 1, subBadgesTotal: 4, levelName: "SILVER", levelLabel: "Silver", levelColor: "#c0c0c0", levelIcon: "🥈" },
        { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  20, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
      ] satisfies TeamMemberBadgeProgressDto[],
      moduleProgress: [
        { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  4, sessionsTotal: 12 },
        { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  1, sessionsTotal: 14 },
      ] satisfies TeamMemberModuleProgressDto[],
    },
    {
      studentId:   21,
      gamertag:    "Kwame",
      realName:    "Kwame Asante",
      username:    "@kwame_a",
      teamId:      "wolf-cubs",
      joinedDate:  "Oct 2024",
      avatarUrl:   null,
      isCaptain:   false,
      level:       5,
      totalXP:     320,
      badgeProgress: [
        { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned: 25, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
      ] satisfies TeamMemberBadgeProgressDto[],
      moduleProgress: [
        { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted: 2, sessionsTotal: 12 },
      ] satisfies TeamMemberModuleProgressDto[],
    },
    {
      studentId:   22,
      gamertag:    "Nova Strike",
      realName:    "Layla Hassan",
      username:    "@nova_strike",
      teamId:      "wolf-cubs",
      joinedDate:  "Jan 2025",
      avatarUrl:   null,
      isCaptain:   false,
      level:       7,
      totalXP:     490,
      badgeProgress: [
        { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned: 50, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "SILVER", levelLabel: "Silver", levelColor: "#c0c0c0", levelIcon: "🥈" },
        { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned: 20, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
      ] satisfies TeamMemberBadgeProgressDto[],
      moduleProgress: [
        { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted: 3, sessionsTotal: 12 },
      ] satisfies TeamMemberModuleProgressDto[],
    },
    {
      studentId:   23,
      gamertag:    "Blaze Runner",
      realName:    "Connor Reid",
      username:    "@blaze_runner",
      teamId:      "wolf-cubs",
      joinedDate:  "Feb 2025",
      avatarUrl:   null,
      isCaptain:   false,
      level:       6,
      totalXP:     380,
      badgeProgress: [
        { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned: 25, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:  0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
      ] satisfies TeamMemberBadgeProgressDto[],
      moduleProgress: [
        { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted: 1, sessionsTotal: 12 },
      ] satisfies TeamMemberModuleProgressDto[],
    },
  ] satisfies TeamMemberDto[],
};

// ─────────────────────────────────────────────────────────────────────────────
// 1G.1 — MOCK_TEAM_DETAILS  (Record<string, TeamDetailDto>)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_TEAM_DETAILS: Record<string, TeamDetailDto> = {
  "wolf-cubs": MOCK_TEAM_DETAIL,
  
  "pixel-wolves": {
    // ── Team header ───────────────────────────────────────────────────────────
    id:          "pixel-wolves",
    name:        "Pixel Wolves",
    icon:        "🐾",
    colour:      "#9b59b6",
    hub:         "Hub Edinburgh",
    founded:     "2024",
    description: "Edinburgh-based squad grinding ranked modes across multiple titles.",
    game:        "Valorant",

    // ── Members ───────────────────────────────────────────────────────────────
    members: [
      {
        studentId:   24,
        gamertag:    "J-Force",
        realName:    "Jordan Raines",
        username:    "@jordan_raines",
        teamId:      "pixel-wolves",
        joinedDate:  "Aug 2024",
        avatarUrl:   null,
        isCaptain:   true,
        level:       11,
        totalXP:     1050,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned: 125, subBadgesEarned: 2, subBadgesTotal: 5, levelName: "GOLD",     levelLabel: "Gold",     levelColor: "#ffd700", levelIcon: "🥇" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  80, subBadgesEarned: 1, subBadgesTotal: 4, levelName: "GOLD",     levelLabel: "Gold",     levelColor: "#ffd700", levelIcon: "🥇" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  45, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "SILVER",   levelLabel: "Silver",   levelColor: "#c0c0c0", levelIcon: "🥈" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:  25, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE",   levelLabel: "Bronze",   levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE",   levelLabel: "Bronze",   levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 3, moduleName: "Valorant Tactics",      moduleIcon: "🎯", sessionsCompleted:  5, sessionsTotal: 12 },
          { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  4, sessionsTotal: 14 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
      {
        studentId:   25,
        gamertag:    "Shadow Ace",
        realName:    "Aisha Patel",
        username:    "@shadow_ace",
        teamId:      "pixel-wolves",
        joinedDate:  "Aug 2024",
        avatarUrl:   null,
        isCaptain:   false,
        level:       9,
        totalXP:     780,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned:  75, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "GOLD",   levelLabel: "Gold",   levelColor: "#ffd700", levelIcon: "🥇" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  50, subBadgesEarned: 1, subBadgesTotal: 4, levelName: "SILVER", levelLabel: "Silver", levelColor: "#c0c0c0", levelIcon: "🥈" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  20, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 3, moduleName: "Valorant Tactics",      moduleIcon: "🎯", sessionsCompleted:  4, sessionsTotal: 12 },
          { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  2, sessionsTotal: 14 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
      {
        studentId:   26,
        gamertag:    "Pixel Flash",
        realName:    "Cameron Scott",
        username:    "@pixel_flash",
        teamId:      "pixel-wolves",
        joinedDate:  "Nov 2024",
        avatarUrl:   null,
        isCaptain:   false,
        level:       8,
        totalXP:     610,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned:  50, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "SILVER", levelLabel: "Silver", levelColor: "#c0c0c0", levelIcon: "🥈" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  30, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  25, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 3, moduleName: "Valorant Tactics",      moduleIcon: "🎯", sessionsCompleted:  3, sessionsTotal: 12 },
          { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  1, sessionsTotal: 14 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
      {
        studentId:   27,
        gamertag:    "Echo Strike",
        realName:    "Zara Ahmed",
        username:    "@echo_strike",
        teamId:      "pixel-wolves",
        joinedDate:  "Jan 2025",
        avatarUrl:   null,
        isCaptain:   false,
        level:       6,
        totalXP:     420,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned:  25, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  25, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 3, moduleName: "Valorant Tactics",      moduleIcon: "🎯", sessionsCompleted:  2, sessionsTotal: 12 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
    ] satisfies TeamMemberDto[],
  },

  "neon-bees": {
    // ── Team header ───────────────────────────────────────────────────────────
    id:          "neon-bees",
    name:        "Neon Bees",
    icon:        "🐝",
    colour:      "#f39c12",
    hub:         "Hub Manchester",
    founded:     "2025",
    description: "Manchester crew bringing the energy. Known for aggressive early-game plays.",
    game:        "Fortnite",

    // ── Members ───────────────────────────────────────────────────────────────
    members: [
      {
        studentId:   28,
        gamertag:    "Priya Kapoor",
        realName:    "Priya Kapoor",
        username:    "@priya_kapoor",
        teamId:      "neon-bees",
        joinedDate:  "Jan 2025",
        avatarUrl:   null,
        isCaptain:   true,
        level:       10,
        totalXP:     920,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned: 100, subBadgesEarned: 2, subBadgesTotal: 5, levelName: "GOLD",   levelLabel: "Gold",   levelColor: "#ffd700", levelIcon: "🥇" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  60, subBadgesEarned: 1, subBadgesTotal: 4, levelName: "SILVER", levelLabel: "Silver", levelColor: "#c0c0c0", levelIcon: "🥈" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  30, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:  25, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  5, sessionsTotal: 12 },
          { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  3, sessionsTotal: 14 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
      {
        studentId:   29,
        gamertag:    "Buzz Bolt",
        realName:    "Marcus Lee",
        username:    "@buzz_bolt",
        teamId:      "neon-bees",
        joinedDate:  "Jan 2025",
        avatarUrl:   null,
        isCaptain:   false,
        level:       9,
        totalXP:     750,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned:  75, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "GOLD",   levelLabel: "Gold",   levelColor: "#ffd700", levelIcon: "🥇" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  45, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "SILVER", levelLabel: "Silver", levelColor: "#c0c0c0", levelIcon: "🥈" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  20, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  4, sessionsTotal: 12 },
          { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  2, sessionsTotal: 14 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
      {
        studentId:   30,
        gamertag:    "Honey Strike",
        realName:    "Chloe Brown",
        username:    "@honey_strike",
        teamId:      "neon-bees",
        joinedDate:  "Feb 2025",
        avatarUrl:   null,
        isCaptain:   false,
        level:       7,
        totalXP:     540,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned:  50, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "SILVER", levelLabel: "Silver", levelColor: "#c0c0c0", levelIcon: "🥈" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  30, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  25, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  3, sessionsTotal: 12 },
          { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  1, sessionsTotal: 14 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
      {
        studentId:   31,
        gamertag:    "Neon Sting",
        realName:    "Tyler Martinez",
        username:    "@neon_sting",
        teamId:      "neon-bees",
        joinedDate:  "Feb 2025",
        avatarUrl:   null,
        isCaptain:   false,
        level:       6,
        totalXP:     430,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned:  25, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  25, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  2, sessionsTotal: 12 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
    ] satisfies TeamMemberDto[],
  },

  "iron-circuit": {
    // ── Team header ───────────────────────────────────────────────────────────
    id:          "iron-circuit",
    name:        "Iron Circuit",
    icon:        "⚙️",
    colour:      "#e74c3c",
    hub:         "Hub Birmingham",
    founded:     "2025",
    description: "Birmingham's newest team, still finding their feet but full of potential.",
    game:        "Rocket League",

    // ── Members ───────────────────────────────────────────────────────────────
    members: [
      {
        studentId:   32,
        gamertag:    "Mei Lin",
        realName:    "Mei Lin",
        username:    "@mei_lin",
        teamId:      "iron-circuit",
        joinedDate:  "Feb 2025",
        avatarUrl:   null,
        isCaptain:   true,
        level:       8,
        totalXP:     680,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned:  75, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "GOLD",   levelLabel: "Gold",   levelColor: "#ffd700", levelIcon: "🥇" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  50, subBadgesEarned: 1, subBadgesTotal: 4, levelName: "SILVER", levelLabel: "Silver", levelColor: "#c0c0c0", levelIcon: "🥈" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  25, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:  20, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 4, moduleName: "Rocket League Mechanics", moduleIcon: "🚗", sessionsCompleted:  4, sessionsTotal: 12 },
          { moduleId: 2, moduleName: "Team Communication",       moduleIcon: "🤝", sessionsCompleted:  2, sessionsTotal: 14 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
      {
        studentId:   33,
        gamertag:    "Bolt Drive",
        realName:    "Ethan Clarke",
        username:    "@bolt_drive",
        teamId:      "iron-circuit",
        joinedDate:  "Feb 2025",
        avatarUrl:   null,
        isCaptain:   false,
        level:       6,
        totalXP:     470,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned:  50, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "SILVER", levelLabel: "Silver", levelColor: "#c0c0c0", levelIcon: "🥈" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  25, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:  20, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 4, moduleName: "Rocket League Mechanics", moduleIcon: "🚗", sessionsCompleted:  3, sessionsTotal: 12 },
          { moduleId: 2, moduleName: "Team Communication",       moduleIcon: "🤝", sessionsCompleted:  1, sessionsTotal: 14 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
      {
        studentId:   34,
        gamertag:    "Circuit Breaker",
        realName:    "Sophia Williams",
        username:    "@circuit_breaker",
        teamId:      "iron-circuit",
        joinedDate:  "Mar 2025",
        avatarUrl:   null,
        isCaptain:   false,
        level:       5,
        totalXP:     350,
        badgeProgress: [
          { mainBadgeId: "game-mastery",        mainBadgeName: "Game Mastery",        mainBadgeIcon: "🎮", xpEarned:  25, subBadgesEarned: 1, subBadgesTotal: 5, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "teamwork",             mainBadgeName: "Teamwork",             mainBadgeIcon: "🤝", xpEarned:  25, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "esports-citizen",      mainBadgeName: "Esports Citizen",      mainBadgeIcon: "🌐", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "personal-development", mainBadgeName: "Personal Development", mainBadgeIcon: "🌱", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
          { mainBadgeId: "digital-skills",       mainBadgeName: "Digital Skills",       mainBadgeIcon: "💻", xpEarned:   0, subBadgesEarned: 0, subBadgesTotal: 4, levelName: "BRONZE", levelLabel: "Bronze", levelColor: "#cd7f32", levelIcon: "🥉" },
        ] satisfies TeamMemberBadgeProgressDto[],
        moduleProgress: [
          { moduleId: 4, moduleName: "Rocket League Mechanics", moduleIcon: "🚗", sessionsCompleted:  2, sessionsTotal: 12 },
        ] satisfies TeamMemberModuleProgressDto[],
      },
    ] satisfies TeamMemberDto[],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 1H — MOCK_EVIDENCE_SUBMISSIONS  (EvidenceSubmissionDto[])
// ─────────────────────────────────────────────────────────────────────────────

export let MOCK_EVIDENCE_SUBMISSIONS: EvidenceSubmissionDto[] = [
  { id: 1, badgeName: "Game Mastery",   subBadgeName: "Zone Reader",    subBadgeIcon: "🗺️", fileName: "zone-rotation-clip.mp4",   notes: "Clipped three consecutive sessions showing correct zone rotation.",    submittedAt: "10 Mar 2026", status: "approved"  },
  { id: 2, badgeName: "Teamwork",       subBadgeName: "Callout King",   subBadgeIcon: "📢", fileName: "callout-highlights.mp4",   notes: "10 accurate callouts from the scrimmage on 5th March.",               submittedAt: "15 Mar 2026", status: "approved"  },
  { id: 3, badgeName: "Game Mastery",   subBadgeName: "Aim Trainer",    subBadgeIcon: "🎯", fileName: "aim-drill-results.png",    notes: "Screenshot of 73% accuracy from aim drill session.",                  submittedAt: "22 Mar 2026", status: "rejected"  },
  { id: 4, badgeName: "Teamwork",       subBadgeName: "Coach",          subBadgeIcon: "👨‍🏫", fileName: "coaching-session-log.pdf", notes: "Session log and peer feedback form from coaching Rory through zone positioning.", submittedAt: "28 Mar 2026", status: "pending"   },
  { id: 5, badgeName: "Esports Citizen",subBadgeName: "Code Maker",     subBadgeIcon: "📜", fileName: "team-code-of-conduct.pdf", notes: "Our agreed team code of conduct, signed by all 5 members.",           submittedAt: "30 Mar 2026", status: "pending"   },
] satisfies EvidenceSubmissionDto[];

// ─────────────────────────────────────────────────────────────────────────────
// 1I — MOCK_PUBLIC_BADGE_SUMMARY  (PublicBadgeSummaryDto)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PUBLIC_BADGE_SUMMARY: PublicBadgeSummaryDto = {
  // Reuses the same 5 badge summaries built in 1A-iii
  badges: MOCK_DASHBOARD.badges,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1J — MOCK_PUBLIC_PLAYER_PROFILE  (PublicPlayerProfileDto)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PUBLIC_PLAYER_PROFILE: PublicPlayerProfileDto = {
  // ── 1J-i  Identity & stats ────────────────────────────────────────────────
  username:    "@alex_gamer",
  gamertag:    "Tiger Bear",
  realName:    "Alex Johnson",
  bio:         "Fortnite grinder and team captain in training. Here to improve, compete, and have fun. 🎮",
  joinedDate:  "Sep 2024",
  level:       12,
  totalXP:     1245,
  avatarUrl:   null,
  globalRank:  4,

  // ── 1J-ii  Team fields ───────────────────────────────────────────────────
  teamName:    "Wolf Cubs",
  teamIcon:    "🐺",
  teamId:      "wolf-cubs",
  teamColour:  "#4f8ef7",
  hub:         "Hub Glasgow",
  isCaptain:   true,

  // ── 1J-iii  Module progress ───────────────────────────────────────────────
  moduleProgress: [
    { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  6, sessionsTotal: 12 },
    { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  3, sessionsTotal: 14 },
    { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  0, sessionsTotal: 16 },
  ] satisfies PublicModuleProgressDto[],
};

// ─────────────────────────────────────────────────────────────────────────────
// 1J-iv — MOCK_PUBLIC_PLAYER_PROFILES_MAP  (Map of all player profiles)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PUBLIC_PLAYER_PROFILES_MAP: Record<string, PublicPlayerProfileDto> = {
  "@alex_gamer": MOCK_PUBLIC_PLAYER_PROFILE,
  
  "@jordan_r": {
    username:    "@jordan_r",
    gamertag:    "J-Force",
    realName:    "Jordan Raines",
    bio:         "Top ranked player from Edinburgh. Always pushing for #1.",
    joinedDate:  "Aug 2024",
    level:       18,
    totalXP:     2100,
    avatarUrl:   null,
    globalRank:  1,
    teamName:    "Edinburgh Eagles",
    teamIcon:    "🦅",
    teamId:      null,
    teamColour:  "#ffa500",
    hub:         "Hub Edinburgh",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted: 12, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted: 14, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  8, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@priya_k": {
    username:    "@priya_k",
    gamertag:    "Priya Kapoor",
    realName:    "Priya Kapoor",
    bio:         "Manchester represent! Strategy and tactics are my game.",
    joinedDate:  "Jul 2024",
    level:       16,
    totalXP:     1980,
    avatarUrl:   null,
    globalRank:  2,
    teamName:    "Manchester Mavericks",
    teamIcon:    "🐝",
    teamId:      null,
    teamColour:  "#ffcc00",
    hub:         "Hub Manchester",
    isCaptain:   true,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted: 12, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted: 12, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  6, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@callum_s": {
    username:    "@callum_s",
    gamertag:    "Callum Shaw",
    realName:    "Callum Shaw",
    bio:         "Glasgow's finest. Let's get that Victory Royale!",
    joinedDate:  "Sep 2024",
    level:       15,
    totalXP:     1750,
    avatarUrl:   null,
    globalRank:  3,
    teamName:    "Highland Heroes",
    teamIcon:    "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    teamId:      null,
    teamColour:  "#0065bd",
    hub:         "Hub Glasgow",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted: 10, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  8, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  4, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@mei_l": {
    username:    "@mei_l",
    gamertag:    "Mei Lin",
    realName:    "Mei Lin",
    bio:         "Birmingham squad! Building better every day.",
    joinedDate:  "Oct 2024",
    level:       12,
    totalXP:     1190,
    avatarUrl:   null,
    globalRank:  5,
    teamName:    null,
    teamIcon:    null,
    teamId:      null,
    teamColour:  null,
    hub:         "Hub Birmingham",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  8, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  4, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  0, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@tyler_b": {
    username:    "@tyler_b",
    gamertag:    "Tyler Braun",
    realName:    "Tyler Braun",
    bio:         "Grinding daily. Manchester born and raised.",
    joinedDate:  "Oct 2024",
    level:       11,
    totalXP:     1050,
    avatarUrl:   null,
    globalRank:  6,
    teamName:    "Manchester Mavericks",
    teamIcon:    "🐝",
    teamId:      null,
    teamColour:  "#ffcc00",
    hub:         "Hub Manchester",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  7, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  5, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  0, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@aisha_o": {
    username:    "@aisha_o",
    gamertag:    "Aisha Okonkwo",
    realName:    "Aisha Okonkwo",
    bio:         "Edinburgh pride! Always learning, always improving.",
    joinedDate:  "Nov 2024",
    level:       10,
    totalXP:     980,
    avatarUrl:   null,
    globalRank:  7,
    teamName:    "Edinburgh Eagles",
    teamIcon:    "🦅",
    teamId:      null,
    teamColour:  "#ffa500",
    hub:         "Hub Edinburgh",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  6, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  4, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  0, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@rory_mac": {
    username:    "@rory_mac",
    gamertag:    "Rory MacDonald",
    realName:    "Rory MacDonald",
    bio:         "Just started but ready to compete!",
    joinedDate:  "Nov 2024",
    level:       10,
    totalXP:     870,
    avatarUrl:   null,
    globalRank:  8,
    teamName:    "Wolf Cubs",
    teamIcon:    "🐺",
    teamId:      "wolf-cubs",
    teamColour:  "#4f8ef7",
    hub:         "Hub Glasgow",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  5, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  2, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  0, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@zara_p": {
    username:    "@zara_p",
    gamertag:    "Zara Patel",
    realName:    "Zara Patel",
    bio:         "Birmingham rep! New to esports but loving the journey.",
    joinedDate:  "Dec 2024",
    level:       9,
    totalXP:     760,
    avatarUrl:   null,
    globalRank:  9,
    teamName:    null,
    teamIcon:    null,
    teamId:      null,
    teamColour:  null,
    hub:         "Hub Birmingham",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  4, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  2, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  0, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@finn_ob": {
    username:    "@finn_ob",
    gamertag:    "Finn O'Brien",
    realName:    "Finn O'Brien",
    bio:         "Edinburgh esports enthusiast. Learning every day!",
    joinedDate:  "Dec 2024",
    level:       8,
    totalXP:     640,
    avatarUrl:   null,
    globalRank:  10,
    teamName:    null,
    teamIcon:    null,
    teamId:      null,
    teamColour:  null,
    hub:         "Hub Edinburgh",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  3, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  1, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  0, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@sasha_i": {
    username:    "@sasha_i",
    gamertag:    "Sasha Ivanova",
    realName:    "Sasha Ivanova",
    bio:         "Manchester based, focused on improvement.",
    joinedDate:  "Jan 2025",
    level:       7,
    totalXP:     510,
    avatarUrl:   null,
    globalRank:  11,
    teamName:    null,
    teamIcon:    null,
    teamId:      null,
    teamColour:  null,
    hub:         "Hub Manchester",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  2, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  1, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  0, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
  
  "@kwame_a": {
    username:    "@kwame_a",
    gamertag:    "Kwame Asante",
    realName:    "Kwame Asante",
    bio:         "New player from Glasgow. Ready to learn!",
    joinedDate:  "Feb 2025",
    level:       5,
    totalXP:     320,
    avatarUrl:   null,
    globalRank:  12,
    teamName:    null,
    teamIcon:    null,
    teamId:      null,
    teamColour:  null,
    hub:         "Hub Glasgow",
    isCaptain:   false,
    moduleProgress: [
      { moduleId: 1, moduleName: "Fortnite Fundamentals", moduleIcon: "🎮", sessionsCompleted:  1, sessionsTotal: 12 },
      { moduleId: 2, moduleName: "Team Communication",    moduleIcon: "🤝", sessionsCompleted:  0, sessionsTotal: 14 },
      { moduleId: 3, moduleName: "Performance Analysis",  moduleIcon: "📊", sessionsCompleted:  0, sessionsTotal: 16 },
    ] satisfies PublicModuleProgressDto[],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 1K — MOCK_LOGIN_RESPONSE  (LoginResponseDto)
// ─────────────────────────────────────────────────────────────────────────────
//
// Token anatomy (base64url segments separated by dots):
//   header:  {"alg":"none"}
//   payload: {"sub":"alex_gamer","studentId":1,"role":"ROLE_STUDENT","playerUsername":"@alex_gamer"}
//   sig:     dummy_signature  (not verified — mock only)

export const MOCK_LOGIN_RESPONSE: LoginResponseDto = {
  token: "eyJhbGciOiJub25lIn0.eyJzdWIiOiJhbGV4X2dhbWVyIiwic3R1ZGVudElkIjoxLCJyb2xlIjoiUk9MRV9TVFVERU5UIiwicGxheWVyVXNlcm5hbWUiOiJAYWxleF9nYW1lciJ9.dummy_signature",
};

// ─────────────────────────────────────────────────────────────────────────────
// 1L — MOCK_BADGE_LEADERBOARDS  (per-badge top earners)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_BADGE_LEADERBOARDS: Record<string, BadgeLeaderboardEntryDto[]> = {
  "game-mastery": [
    { rank: 1, name: "Jordan Raines",  username: "@jordan_r",   xp: 180 },
    { rank: 2, name: "Alex Johnson",   username: "@alex_gamer", xp: 150 },
    { rank: 3, name: "Callum Shaw",    username: "@callum_s",   xp: 130 },
    { rank: 4, name: "Rory MacDonald", username: "@rory_mac",   xp: 100 },
    { rank: 5, name: "Priya Kapoor",   username: "@priya_k",    xp: 85  },
  ],
  "teamwork": [
    { rank: 1, name: "Priya Kapoor",   username: "@priya_k",    xp: 120 },
    { rank: 2, name: "Callum Shaw",    username: "@callum_s",   xp: 95  },
    { rank: 3, name: "Alex Johnson",   username: "@alex_gamer", xp: 75  },
    { rank: 4, name: "Rory MacDonald", username: "@rory_mac",   xp: 55  },
    { rank: 5, name: "Mei Lin",        username: "@mei_l",      xp: 40  },
  ],
  "esports-citizen": [
    { rank: 1, name: "Callum Shaw",    username: "@callum_s",   xp: 90  },
    { rank: 2, name: "Jordan Raines",  username: "@jordan_r",   xp: 70  },
    { rank: 3, name: "Alex Johnson",   username: "@alex_gamer", xp: 50  },
    { rank: 4, name: "Tyler Braun",    username: "@tyler_b",    xp: 35  },
    { rank: 5, name: "Aisha Okonkwo",  username: "@aisha_o",    xp: 20  },
  ],
  "personal-development": [
    { rank: 1, name: "Mei Lin",        username: "@mei_l",      xp: 60  },
    { rank: 2, name: "Aisha Okonkwo",  username: "@aisha_o",    xp: 45  },
    { rank: 3, name: "Priya Kapoor",   username: "@priya_k",    xp: 30  },
    { rank: 4, name: "Jordan Raines",  username: "@jordan_r",   xp: 20  },
    { rank: 5, name: "Tyler Braun",    username: "@tyler_b",    xp: 10  },
  ],
  "digital-skills": [
    { rank: 1, name: "Tyler Braun",    username: "@tyler_b",    xp: 75  },
    { rank: 2, name: "Zara Patel",     username: "@zara_p",     xp: 55  },
    { rank: 3, name: "Mei Lin",        username: "@mei_l",      xp: 40  },
    { rank: 4, name: "Finn O'Brien",   username: "@finn_ob",    xp: 25  },
    { rank: 5, name: "Sasha Ivanova",  username: "@sasha_i",    xp: 15  },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 1M — MOCK_ADMIN_BADGE_CATALOGUE  (AdminBadgeCatalogueDto)
// ─────────────────────────────────────────────────────────────────────────────

export let MOCK_ADMIN_BADGE_CATALOGUE: AdminBadgeCatalogueDto = {
  badgeLevels: [...MOCK_BADGE_CATALOGUE.badgeLevels],
  badges:      MOCK_BADGE_CATALOGUE.badges,
  badgeLeaderboards: MOCK_BADGE_LEADERBOARDS,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1N — MOCK_ADMIN_MODULES  (AdminModuleDto[])
// ─────────────────────────────────────────────────────────────────────────────

export let MOCK_ADMIN_MODULES: AdminModuleDto[] = [
  {
    id:            1,
    name:          "Fortnite Fundamentals",
    game:          "Fortnite",
    outcome:       "Understand core game mechanics and build consistent in-game decision-making.",
    durationWeeks: 12,
    status:        "Active",
    groupsUsingIt: ["Wolf Cubs", "Neon Bees"],
    subBadges: [
      { id: 1001, name: "Zone Reader",  description: "Demonstrate correct zone rotation 3 sessions in a row.",   mainBadgeId: "game-mastery", xpValue: 25, skills: ["Problem Solving", "Strategic Thinking"]   },
      { id: 1002, name: "Builder",      description: "Complete all building drill challenges.",                   mainBadgeId: "game-mastery", xpValue: 25, skills: ["Practical Skills", "Perseverance"]         },
      { id: 1003, name: "Aim Trainer",  description: "Hit 70%+ accuracy in the aim drill session.",              mainBadgeId: "game-mastery", xpValue: 30, skills: ["Focus", "Technical Ability"]               },
      { id: 1004, name: "Tactician",    description: "Present a winning endgame callout plan to the group.",     mainBadgeId: "game-mastery", xpValue: 30, skills: ["Strategic Thinking", "Communication"]       },
    ] satisfies AdminSubBadgeDto[],
    sessions: [
      { id: 101, weekNumber: 1, title: "Introduction & Settings Setup", sessionPlan: "Welcome & icebreaker (10 min). Overview of the 12-week programme and badge structure (10 min). Guided setup of Fortnite keybinds, sensitivity and HUD (25 min). Free-play warm-up (15 min).", deliveryNotes: "Have spare controllers ready. Print the recommended settings sheet for each student. Differentiation: pair experienced players with newcomers for the setup phase.", resources: [
        { id: 10001, fileName: "Week1-Slides.pptx",          fileType: "pptx",  fileSizeBytes: 2_450_000, url: "/mock/files/week1-slides.pptx",         uploadedAt: "2025-09-01T09:00:00Z" },
        { id: 10002, fileName: "Recommended-Settings.pdf",    fileType: "pdf",   fileSizeBytes: 340_000,   url: "/mock/files/recommended-settings.pdf", uploadedAt: "2025-09-01T09:05:00Z" },
      ] satisfies AdminResourceDto[] },
      { id: 102, weekNumber: 2, title: "Movement & Positioning", sessionPlan: "Recap quiz on last week (5 min). Movement drills in Creative mode – strafing, jumping, crouch-peeking (20 min). Mini-scrimmage focusing on positioning (25 min). Group debrief (10 min).", deliveryNotes: "Use the Creative map code 1234-5678-9012. Keep the debrief focused on what students noticed about positioning, not on wins/losses.", resources: [
        { id: 10003, fileName: "Week2-Movement-Drills.pptx",  fileType: "pptx",  fileSizeBytes: 1_800_000, url: "/mock/files/week2-movement.pptx",       uploadedAt: "2025-09-08T09:00:00Z" },
        { id: 10004, fileName: "Movement-Demo.mp4",           fileType: "video", fileSizeBytes: 48_000_000, url: "/mock/files/movement-demo.mp4",        uploadedAt: "2025-09-08T09:10:00Z" },
      ] satisfies AdminResourceDto[] },
      { id: 103, weekNumber: 3, title: "Building Basics", sessionPlan: "Warm-up free-build (10 min). Instructor demo of wall-ramp-floor combo (10 min). Individual building drills – timed challenges (20 min). 1v1 build battles for fun (15 min). Reflection journal entry (5 min).", deliveryNotes: "Ensure students save replays for week 4 VOD review. Slower builders should focus on wall-ramp only – don't push floor combos yet.", resources: [
        { id: 10005, fileName: "Building-Basics-Slides.pptx", fileType: "pptx",  fileSizeBytes: 2_100_000, url: "/mock/files/building-basics.pptx",     uploadedAt: "2025-09-15T09:00:00Z" },
      ] satisfies AdminResourceDto[] },
    ] satisfies AdminSessionDto[],
  },
  {
    id:            2,
    name:          "Team Communication",
    game:          "Fortnite",
    outcome:       "Develop clear, positive in-game communication and leadership under pressure.",
    durationWeeks: 14,
    status:        "Active",
    groupsUsingIt: ["Wolf Cubs", "Pixel Wolves", "Neon Bees", "Iron Circuit"],
    subBadges: [
      { id: 2001, name: "Callout King", description: "Land 10 accurate callouts in a scrimmage session.",           mainBadgeId: "teamwork",        xpValue: 20, skills: ["Communication", "Situational Awareness"] },
      { id: 2002, name: "Tilt-Proof",   description: "Stay positive across 3 consecutive losing sessions.",        mainBadgeId: "esports-citizen", xpValue: 30, skills: ["Emotional Regulation", "Resilience"]     },
      { id: 2003, name: "Coach",        description: "Successfully coach a peer through a module challenge.",      mainBadgeId: "teamwork",        xpValue: 30, skills: ["Leadership", "Empathy"]                 },
      { id: 2004, name: "Leader",       description: "Captain the team during a tournament match.",                mainBadgeId: "teamwork",        xpValue: 25, skills: ["Leadership", "Decision Making"]          },
    ] satisfies AdminSubBadgeDto[],
    sessions: [
      { id: 201, weekNumber: 1, title: "What Good Comms Sound Like", sessionPlan: "Icebreaker (10 min). Watch & discuss pro comms clips (15 min). Practice callouts in Creative (25 min). Group debrief (10 min).", deliveryNotes: "Use the curated YouTube playlist linked below. Pause clips to highlight good/bad callout examples.", resources: [
        { id: 20001, fileName: "Comms-Intro-Slides.pptx", fileType: "pptx", fileSizeBytes: 1_600_000, url: "/mock/files/comms-intro.pptx", uploadedAt: "2025-09-01T09:00:00Z" },
      ] satisfies AdminResourceDto[] },
      { id: 202, weekNumber: 2, title: "Callout Drills", sessionPlan: "Warm-up duos (10 min). Structured callout drill – one player blind, partner navigates via voice only (25 min). Swap roles. Reflection (10 min).", deliveryNotes: "Monitor for frustration — the blind drill is hard. Celebrate effort, not just accuracy.", resources: [] },
    ] satisfies AdminSessionDto[],
  },
  {
    id:            3,
    name:          "Performance Analysis",
    game:          "Fortnite",
    outcome:       "Use data and VOD review to identify weaknesses and track measurable improvement.",
    durationWeeks: 16,
    status:        "Active",
    groupsUsingIt: ["Pixel Wolves"],
    subBadges: [
      { id: 3001, name: "Scout",        description: "Complete a full opponent scouting report.",               mainBadgeId: "game-mastery",        xpValue: 20, skills: ["Research", "Critical Thinking"]         },
      { id: 3002, name: "Analyst",      description: "Track your stats for 4 consecutive weeks.",              mainBadgeId: "digital-skills",      xpValue: 25, skills: ["Data Literacy", "Critical Thinking"]    },
      { id: 3003, name: "VOD Reviewer", description: "Present a VOD review to the group.",                    mainBadgeId: "game-mastery",        xpValue: 30, skills: ["Communication", "Self-Awareness"]       },
      { id: 3004, name: "Strategist",   description: "Build a winning game plan using your analysis.",         mainBadgeId: "personal-development", xpValue: 25, skills: ["Strategic Thinking", "Goal Setting"]    },
    ] satisfies AdminSubBadgeDto[],
    sessions: [
      { id: 301, weekNumber: 1, title: "Intro to VOD Review", sessionPlan: "Explain what VOD review is and why pros use it (15 min). Watch example VOD together (20 min). Students record a match for homework (5 min).", deliveryNotes: "Use OBS setup guide for students who don't know how to record. Pair up students to review each other's footage next week.", resources: [
        { id: 30001, fileName: "VOD-Review-Guide.pdf", fileType: "pdf", fileSizeBytes: 520_000, url: "/mock/files/vod-review-guide.pdf", uploadedAt: "2025-09-01T09:00:00Z" },
      ] satisfies AdminResourceDto[] },
    ] satisfies AdminSessionDto[],
  },
  {
    id:            4,
    name:          "Rocket League Mechanics",
    game:          "Rocket League",
    outcome:       "Master car control, aerial play, and rotation fundamentals in Rocket League.",
    durationWeeks: 12,
    status:        "Active",
    groupsUsingIt: ["Iron Circuit"],
    subBadges: [
      { id: 4001, name: "Ball Chaser",    description: "Demonstrate consistent ball control in 3 sessions.",     mainBadgeId: "game-mastery", xpValue: 25, skills: ["Focus", "Practical Skills"]               },
      { id: 4002, name: "Aerial Ace",     description: "Land 5 aerial shots in a training session.",            mainBadgeId: "game-mastery", xpValue: 30, skills: ["Technical Ability", "Perseverance"]        },
      { id: 4003, name: "Rotation Pro",   description: "Show correct rotation across 3 ranked matches.",       mainBadgeId: "teamwork",     xpValue: 25, skills: ["Situational Awareness", "Communication"]  },
    ] satisfies AdminSubBadgeDto[],
    sessions: [
      { id: 401, weekNumber: 1, title: "Car Control Basics", sessionPlan: "Controller setup & camera settings (10 min). Free-play warm-up (10 min). Guided car-control drills – powerslide, half-flip, fast aerial (30 min). Reflection (10 min).", deliveryNotes: "Have the camera settings cheat sheet printed. Encourage students to customise after trying the recommended settings.", resources: [
        { id: 40001, fileName: "RL-Camera-Settings.pdf", fileType: "pdf", fileSizeBytes: 180_000, url: "/mock/files/rl-camera-settings.pdf", uploadedAt: "2025-09-01T09:00:00Z" },
        { id: 40002, fileName: "Car-Control-Drills.pptx", fileType: "pptx", fileSizeBytes: 1_400_000, url: "/mock/files/car-control-drills.pptx", uploadedAt: "2025-09-01T09:05:00Z" },
      ] satisfies AdminResourceDto[] },
    ] satisfies AdminSessionDto[],
  },
  {
    id:            5,
    name:          "Digital Safety Essentials",
    game:          "General",
    outcome:       "Learn to stay safe online and protect personal data across all platforms.",
    durationWeeks: 12,
    status:        "Draft",
    groupsUsingIt: [],
    subBadges: [
      { id: 5001, name: "Password Pro",     description: "Create strong passwords and enable 2FA on all accounts.", mainBadgeId: "digital-skills", xpValue: 20, skills: ["Online Safety", "Digital Literacy"]    },
      { id: 5002, name: "Phishing Spotter", description: "Identify 5 phishing attempts in a simulation exercise.", mainBadgeId: "digital-skills", xpValue: 25, skills: ["Critical Thinking", "Online Safety"]   },
    ] satisfies AdminSubBadgeDto[],
    sessions: [],
  },
  {
    id:            6,
    name:          "Valorant Tactics",
    game:          "Valorant",
    outcome:       "Develop tactical awareness, agent mastery, and coordinated team play in Valorant.",
    durationWeeks: 14,
    status:        "Archived",
    groupsUsingIt: [],
    subBadges: [
      { id: 6001, name: "Agent Expert",   description: "Demonstrate proficiency with 3 different agents.",       mainBadgeId: "game-mastery", xpValue: 25, skills: ["Adaptability", "Strategic Thinking"]      },
      { id: 6002, name: "Site Anchor",    description: "Hold a bomb site successfully for 5 rounds.",           mainBadgeId: "game-mastery", xpValue: 30, skills: ["Focus", "Decision Making"]                },
      { id: 6003, name: "Flash Caller",   description: "Coordinate ability usage with teammates in 3 rounds.",  mainBadgeId: "teamwork",     xpValue: 25, skills: ["Communication", "Leadership"]             },
    ] satisfies AdminSubBadgeDto[],
    sessions: [
      { id: 601, weekNumber: 1, title: "Agent Roles & Abilities", sessionPlan: "Overview of agent roles – Duelist, Controller, Initiator, Sentinel (15 min). Ability showcase in custom game (25 min). Choose your main agent & justify (15 min). Wrap-up (5 min).", deliveryNotes: "Let students experiment freely with abilities before narrowing down. Keep a chart of who picks which agent for team balance later.", resources: [
        { id: 60001, fileName: "Agent-Roles-Overview.pptx", fileType: "pptx", fileSizeBytes: 2_200_000, url: "/mock/files/agent-roles.pptx", uploadedAt: "2025-09-01T09:00:00Z" },
      ] satisfies AdminResourceDto[] },
    ] satisfies AdminSessionDto[],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2A — MOCK_ADMIN_GROUPS  (AdminGroupDto[])
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_ADMIN_GROUPS: AdminGroupDto[] = [
  { id: "wolf-cubs",     name: "Wolf Cubs",     hub: "Hub Glasgow",    game: "Minecraft",     groupType: "Juniors",     moduleIds: [1, 2], memberCount: 5 },
  { id: "pixel-wolves",  name: "Pixel Wolves",  hub: "Hub Edinburgh",  game: "Fortnite",      groupType: "Competitive", moduleIds: [2, 3], memberCount: 4 },
  { id: "neon-bees",     name: "Neon Bees",     hub: "Hub Manchester", game: "Rocket League", groupType: "Casual",      moduleIds: [1, 2], memberCount: 4 },
  { id: "iron-circuit",  name: "Iron Circuit",  hub: "Hub Birmingham", game: "Competitive",   groupType: "Competitive", moduleIds: [2, 4], memberCount: 3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2B — MOCK_AWARD_STATE  (per-group member award records)
// ─────────────────────────────────────────────────────────────────────────────
//
// Maps groupId → list of member award states.
// awardedSubBadgeIds / awardedDates reflect sub-badges already earned by each
// member as seen in the badge-catalogue and module-progress mock data above.

export let MOCK_GROUP_MEMBER_AWARDS: Record<string, AdminGroupMemberAwardDto[]> = {
  "wolf-cubs": [
    { studentId: 1,  gamertag: "Tiger Bear",   realName: "Alex Johnson",   username: "@alex_gamer",   avatarUrl: null, level: 12, awardedSubBadgeIds: [1001, 1002, 2001],       awardedDates: { 1001: "2024-11-15", 1002: "2024-11-22", 2001: "2024-12-06" } },
    { studentId: 17, gamertag: "Rory Mac",     realName: "Rory MacDonald", username: "@rory_mac",     avatarUrl: null, level: 10, awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2024-11-29" } },
    { studentId: 21, gamertag: "Kwame",        realName: "Kwame Asante",   username: "@kwame_a",      avatarUrl: null, level: 5,  awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2025-01-10" } },
    { studentId: 22, gamertag: "Nova Strike",  realName: "Layla Hassan",   username: "@nova_strike",  avatarUrl: null, level: 7,  awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2025-02-07" } },
    { studentId: 23, gamertag: "Blaze Runner", realName: "Connor Reid",    username: "@blaze_runner", avatarUrl: null, level: 6,  awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2025-03-01" } },
  ],
  "pixel-wolves": [
    { studentId: 24, gamertag: "J-Force",      realName: "Jordan Raines",  username: "@jordan_raines", avatarUrl: null, level: 11, awardedSubBadgeIds: [2001],                   awardedDates: { 2001: "2024-12-13" } },
    { studentId: 25, gamertag: "Shadow Ace",   realName: "Aisha Patel",    username: "@shadow_ace",    avatarUrl: null, level: 9,  awardedSubBadgeIds: [2001],                   awardedDates: { 2001: "2024-12-20" } },
    { studentId: 26, gamertag: "Pixel Flash",  realName: "Cameron Scott",  username: "@pixel_flash",   avatarUrl: null, level: 8,  awardedSubBadgeIds: [],                       awardedDates: {} },
    { studentId: 27, gamertag: "Echo Strike",  realName: "Zara Ahmed",     username: "@echo_strike",   avatarUrl: null, level: 6,  awardedSubBadgeIds: [],                       awardedDates: {} },
  ],
  "neon-bees": [
    { studentId: 28, gamertag: "Priya Kapoor", realName: "Priya Kapoor",   username: "@priya_kapoor",  avatarUrl: null, level: 10, awardedSubBadgeIds: [1001, 1002, 2001],       awardedDates: { 1001: "2025-01-17", 1002: "2025-01-24", 2001: "2025-02-07" } },
    { studentId: 29, gamertag: "Buzz Bolt",    realName: "Marcus Lee",     username: "@buzz_bolt",     avatarUrl: null, level: 9,  awardedSubBadgeIds: [1001],                   awardedDates: { 1001: "2025-01-31" } },
    { studentId: 30, gamertag: "Honey Strike", realName: "Chloe Brown",    username: "@honey_strike",  avatarUrl: null, level: 7,  awardedSubBadgeIds: [1001],                   awardedDates: { 1001: "2025-02-14" } },
    { studentId: 31, gamertag: "Neon Sting",   realName: "Tyler Martinez", username: "@neon_sting",    avatarUrl: null, level: 6,  awardedSubBadgeIds: [1001],                   awardedDates: { 1001: "2025-02-28" } },
  ],
  "iron-circuit": [
    { studentId: 32, gamertag: "Mei Lin",          realName: "Mei Lin",         username: "@mei_lin",          avatarUrl: null, level: 8, awardedSubBadgeIds: [4001, 2001],  awardedDates: { 4001: "2025-03-07", 2001: "2025-03-14" } },
    { studentId: 33, gamertag: "Bolt Drive",       realName: "Ethan Clarke",    username: "@bolt_drive",       avatarUrl: null, level: 6, awardedSubBadgeIds: [4001],        awardedDates: { 4001: "2025-03-07" } },
    { studentId: 34, gamertag: "Circuit Breaker",  realName: "Sophia Williams", username: "@circuit_breaker",  avatarUrl: null, level: 5, awardedSubBadgeIds: [4001],        awardedDates: { 4001: "2025-03-14" } },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2C — MOCK_ALL_USERS  (flat list for admin user search)
// ─────────────────────────────────────────────────────────────────────────────
//
// Derived from the leaderboard + team member data to provide the admin
// user-search endpoint with a consistent, browseable list.

export const MOCK_ALL_USERS: AdminUserSearchResultDto[] = [
  { studentId: 1,  gamertag: "Tiger Bear",      realName: "Alex Johnson",    username: "@alex_gamer",      avatarUrl: null, level: 12, hub: "Hub Glasgow"    },
  { studentId: 17, gamertag: "Rory Mac",        realName: "Rory MacDonald",  username: "@rory_mac",        avatarUrl: null, level: 10, hub: "Hub Glasgow"    },
  { studentId: 21, gamertag: "Kwame",           realName: "Kwame Asante",    username: "@kwame_a",         avatarUrl: null, level: 5,  hub: "Hub Glasgow"    },
  { studentId: 22, gamertag: "Nova Strike",     realName: "Layla Hassan",    username: "@nova_strike",     avatarUrl: null, level: 7,  hub: "Hub Glasgow"    },
  { studentId: 23, gamertag: "Blaze Runner",    realName: "Connor Reid",     username: "@blaze_runner",    avatarUrl: null, level: 6,  hub: "Hub Glasgow"    },
  { studentId: 24, gamertag: "J-Force",         realName: "Jordan Raines",   username: "@jordan_raines",   avatarUrl: null, level: 11, hub: "Hub Edinburgh"  },
  { studentId: 25, gamertag: "Shadow Ace",      realName: "Aisha Patel",     username: "@shadow_ace",      avatarUrl: null, level: 9,  hub: "Hub Edinburgh"  },
  { studentId: 26, gamertag: "Pixel Flash",     realName: "Cameron Scott",   username: "@pixel_flash",     avatarUrl: null, level: 8,  hub: "Hub Edinburgh"  },
  { studentId: 27, gamertag: "Echo Strike",     realName: "Zara Ahmed",      username: "@echo_strike",     avatarUrl: null, level: 6,  hub: "Hub Edinburgh"  },
  { studentId: 28, gamertag: "Priya Kapoor",    realName: "Priya Kapoor",    username: "@priya_kapoor",    avatarUrl: null, level: 10, hub: "Hub Manchester" },
  { studentId: 29, gamertag: "Buzz Bolt",       realName: "Marcus Lee",      username: "@buzz_bolt",       avatarUrl: null, level: 9,  hub: "Hub Manchester" },
  { studentId: 30, gamertag: "Honey Strike",    realName: "Chloe Brown",     username: "@honey_strike",    avatarUrl: null, level: 7,  hub: "Hub Manchester" },
  { studentId: 31, gamertag: "Neon Sting",      realName: "Tyler Martinez",  username: "@neon_sting",      avatarUrl: null, level: 6,  hub: "Hub Manchester" },
  { studentId: 32, gamertag: "Mei Lin",         realName: "Mei Lin",         username: "@mei_lin",         avatarUrl: null, level: 8,  hub: "Hub Birmingham" },
  { studentId: 33, gamertag: "Bolt Drive",      realName: "Ethan Clarke",    username: "@bolt_drive",      avatarUrl: null, level: 6,  hub: "Hub Birmingham" },
  { studentId: 34, gamertag: "Circuit Breaker", realName: "Sophia Williams", username: "@circuit_breaker", avatarUrl: null, level: 5,  hub: "Hub Birmingham" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2D — MOCK_USER_AWARD_STATES  (per-student award state for individual award)
// ─────────────────────────────────────────────────────────────────────────────
//
// Keyed by studentId. The awardedSubBadgeIds / awardedDates must stay in sync
// with MOCK_GROUP_MEMBER_AWARDS above — both are mutated by the mock API.

export let MOCK_USER_AWARD_STATES: Record<number, AdminUserAwardStateDto> = {
  1:  { studentId: 1,  gamertag: "Tiger Bear",      realName: "Alex Johnson",    username: "@alex_gamer",      awardedSubBadgeIds: [1001, 1002, 2001],       awardedDates: { 1001: "2024-11-15", 1002: "2024-11-22", 2001: "2024-12-06" } },
  17: { studentId: 17, gamertag: "Rory Mac",        realName: "Rory MacDonald",  username: "@rory_mac",        awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2024-11-29" } },
  21: { studentId: 21, gamertag: "Kwame",           realName: "Kwame Asante",    username: "@kwame_a",         awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2025-01-10" } },
  22: { studentId: 22, gamertag: "Nova Strike",     realName: "Layla Hassan",    username: "@nova_strike",     awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2025-02-07" } },
  23: { studentId: 23, gamertag: "Blaze Runner",    realName: "Connor Reid",     username: "@blaze_runner",    awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2025-03-01" } },
  24: { studentId: 24, gamertag: "J-Force",         realName: "Jordan Raines",   username: "@jordan_raines",   awardedSubBadgeIds: [2001],                    awardedDates: { 2001: "2024-12-13" } },
  25: { studentId: 25, gamertag: "Shadow Ace",      realName: "Aisha Patel",     username: "@shadow_ace",      awardedSubBadgeIds: [2001],                    awardedDates: { 2001: "2024-12-20" } },
  26: { studentId: 26, gamertag: "Pixel Flash",     realName: "Cameron Scott",   username: "@pixel_flash",     awardedSubBadgeIds: [],                        awardedDates: {} },
  27: { studentId: 27, gamertag: "Echo Strike",     realName: "Zara Ahmed",      username: "@echo_strike",     awardedSubBadgeIds: [],                        awardedDates: {} },
  28: { studentId: 28, gamertag: "Priya Kapoor",    realName: "Priya Kapoor",    username: "@priya_kapoor",    awardedSubBadgeIds: [1001, 1002, 2001],        awardedDates: { 1001: "2025-01-17", 1002: "2025-01-24", 2001: "2025-02-07" } },
  29: { studentId: 29, gamertag: "Buzz Bolt",       realName: "Marcus Lee",      username: "@buzz_bolt",       awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2025-01-31" } },
  30: { studentId: 30, gamertag: "Honey Strike",    realName: "Chloe Brown",     username: "@honey_strike",    awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2025-02-14" } },
  31: { studentId: 31, gamertag: "Neon Sting",      realName: "Tyler Martinez",  username: "@neon_sting",      awardedSubBadgeIds: [1001],                    awardedDates: { 1001: "2025-02-28" } },
  32: { studentId: 32, gamertag: "Mei Lin",         realName: "Mei Lin",         username: "@mei_lin",         awardedSubBadgeIds: [4001, 2001],              awardedDates: { 4001: "2025-03-07", 2001: "2025-03-14" } },
  33: { studentId: 33, gamertag: "Bolt Drive",      realName: "Ethan Clarke",    username: "@bolt_drive",      awardedSubBadgeIds: [4001],                    awardedDates: { 4001: "2025-03-07" } },
  34: { studentId: 34, gamertag: "Circuit Breaker", realName: "Sophia Williams", username: "@circuit_breaker", awardedSubBadgeIds: [4001],                    awardedDates: { 4001: "2025-03-14" } },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2E — MOCK_ADMIN_RECENT_ACTIVITIES  (AdminRecentActivityDto[])
// ─────────────────────────────────────────────────────────────────────────────
//
// The admin dashboard's "Recent Activity" feed.  Ordered reverse-chronologically.
// In production the backend would generate these from audit-log events.

export const MOCK_ADMIN_RECENT_ACTIVITIES: AdminRecentActivityDto[] = [
  {
    id: 1,
    type: "badge",
    icon: "🏅",
    action: "Awarded \"Road to Diamond \u2013 Week 3\" to Jamie R.",
    centre: "Wishaw",
    admin: "StaffA",
    time: "5 minutes ago",
  },
  {
    id: 2,
    type: "badge",
    icon: "🏅",
    action: "Awarded \"Ender Dragon \u2013 Survival\" to Chloe M.",
    centre: "Wishaw",
    admin: "StaffA",
    time: "12 minutes ago",
  },
  {
    id: 3,
    type: "module",
    icon: "📚",
    action: "Completed module \"Defeat the Ender Dragon\" \u2014 Group Minecraft Juniors",
    centre: "Glasgow",
    admin: "VolunteerB",
    time: "1 hour ago",
  },
  {
    id: 4,
    type: "user",
    icon: "👤",
    action: "Added new user \"kieran_rl\" to Rocket League Competitive",
    centre: "Wishaw",
    admin: "StaffA",
    time: "2 hours ago",
  },
  {
    id: 5,
    type: "badge",
    icon: "🏅",
    action: "Awarded \"Teamwork \u2013 Session 4\" to 4 players",
    centre: "Dublin",
    admin: "VolunteerC",
    time: "3 hours ago",
  },
  {
    id: 6,
    type: "module",
    icon: "📚",
    action: "Started new module \"Rocket League Fundamentals\" \u2014 Juniors",
    centre: "Glasgow",
    admin: "VolunteerB",
    time: "Yesterday",
  },
  {
    id: 7,
    type: "user",
    icon: "👤",
    action: "Added new user \"sophie_mc\" to Minecraft Juniors",
    centre: "Wishaw",
    admin: "StaffA",
    time: "Yesterday",
  },
  {
    id: 8,
    type: "badge",
    icon: "🏅",
    action: "Awarded \"Digital Skills \u2013 Safety Online\" to Alex T.",
    centre: "Dublin",
    admin: "VolunteerC",
    time: "2 days ago",
  },
];
