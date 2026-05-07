/**
 * API Types — Student Portal
 *
 * These interfaces mirror the DTOs returned by the Java Spring Boot backend.
 * Keep field names in camelCase here; Spring Boot's Jackson is expected to
 * serialise using camelCase naming strategy (spring.jackson.property-naming-strategy=LOWER_CAMEL_CASE).
 */

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Response from POST /api/v1/auth/login
 * The backend returns a signed JWT plus basic profile info.
 */
export interface LoginResponseDto {
  /** Signed JWT — store in localStorage under "auth_token" */
  token: string;
}

// ── XP / Activity ─────────────────────────────────────────────────────────────

/** A single entry in the student's XP history log. */
export interface XpEventDto {
  id: number;
  activity: string;
  xp: number;
  /** ISO-8601 date string, e.g. "2025-03-21" */
  date: string;
  /** Emoji icon stored on the backend */
  icon: string;
}

// ── Badge Progress ────────────────────────────────────────────────────────────

/** Badge-level label as stored in the backend enum. */
export type BadgeLevelName = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

/** Summary of a single main badge's progress for the dashboard hex row. */
export interface MainBadgeSummaryDto {
  /** Stable identifier, e.g. "game-mastery" */
  id: string;
  icon: string;
  name: string;
  /** Total XP earned by the student towards this badge */
  xpEarned: number;
  /** Current badge level resolved by the backend */
  levelName: BadgeLevelName;
  /** Human-readable label, e.g. "Gold" */
  levelLabel: string;
  /** Colour hex code for the current level */
  levelColor: string;
  /** Emoji icon for the current level */
  levelIcon: string;
  /** Number of sub-badges the student has earned */
  subBadgesEarned: number;
  /** Total number of sub-badges for this main badge */
  subBadgesTotal: number;
}

// ── Dashboard summary ─────────────────────────────────────────────────────────

/**
 * The main payload returned by GET /api/v1/students/{studentId}/dashboard
 *
 * This aggregates everything the StudentDashboard component needs in a single
 * round-trip: XP progress, weekly stats, badge summaries and recent activity.
 */
export interface DashboardSummaryDto {
  // — Student identity
  studentId: number;
  gamertag: string;
  /** Display name */
  name: string;
  /** Username / handle (e.g. @alex_gamer) */
  username: string;
  /**
   * URL to the student's avatar image.
   * Null when no avatar has been uploaded; the frontend should fall back to
   * DEFAULT_AVATAR_URL (see src/constants.ts).
   */
  avatarUrl: string | null;
  /** Free-text bio shown on the profile page */
  bio: string | null;
  /** ISO-8601 date string for when the student joined, e.g. "Sep 2024" */
  joinedDate: string;
  /** Name of the centre / hub, or null */
  hub: string | null;

  // — XP progress
  level: number;
  xp: number;
  /** XP threshold for the next level */
  xpForNextLevel: number;

  // — Weekly stats
  weeklyXp: number;
  teamWeeklyXp: number;
  hubWeeklyXp: number;

  // — Badge counts (for the "Badges Earned" stat card)
  totalSubBadges: number;
  earnedSubBadges: number;

  // — Current leaderboard position (global)
  leaderboardRank: number | null;

  // — Next scheduled session (ISO-8601 datetime or null)
  nextSessionAt: string | null;

  // — Team information
  /** Name of the team the student belongs to, or null */
  teamName: string | null;
  /** Emoji icon for the team, or null */
  teamIcon: string | null;
  /** Stable ID used for team navigation links, or null */
  teamId: string | null;
  /** CSS colour string for the team, or null */
  teamColour: string | null;
  /** Whether the student is the captain of their team */
  isCaptain: boolean;

  // — Badge summaries for the hex row (all 5 main badges)
  badges: MainBadgeSummaryDto[];

  // — Five most recent XP events (reverse-chronological)
  recentActivity: XpEventDto[];
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

/** Time scope for leaderboard queries. Matches the backend enum. */
export type LeaderboardPeriod = "ALL_TIME" | "THIS_MONTH" | "THIS_WEEK";

/** Sort dimension for the players leaderboard. Matches the backend enum. */
export type LeaderboardSortKey = "XP" | "LEVEL" | "MODULES" | "BADGES";

/**
 * A single row in the players leaderboard.
 *
 * Backend endpoint: GET /api/v1/leaderboard/players
 */
export interface LeaderboardPlayerDto {
  rank: number;
  studentId: number;
  name: string;
  username: string;
  gamertag: string;
  level: number;
  /** XP for the requested time period */
  periodXp: number;
  completedModules: number;
  badgesCompleted: number;
  /** Name of the centre / hub this student belongs to */
  centre: string;
  /** URL to the student's avatar image */
  avatarUrl: string;
  /** Emoji badges to display on the row */
  badgeIcons: string[];
}

/**
 * A single row in the centres leaderboard.
 *
 * Backend endpoint: GET /api/v1/leaderboard/centres
 */
export interface LeaderboardCentreDto {
  rank: number;
  name: string;
  /** Emoji icon associated with the centre */
  icon: string;
  memberCount: number;
  /** XP for the requested time period */
  periodXp: number;
  totalBadges: number;
  totalModules: number;
  topPlayerName: string;
}

/**
 * Full leaderboard response — both tabs in a single request.
 *
 * Backend endpoint: GET /api/v1/leaderboard?period=ALL_TIME
 */
export interface LeaderboardResponseDto {
  period: LeaderboardPeriod;
  players: LeaderboardPlayerDto[];
  centres: LeaderboardCentreDto[];
  /** Total number of players matching the query (before pagination). Used to show/hide "Load more". */
  totalCount: number;
  /** Username of the logged-in student, used to highlight the "You" row */
  currentUserUsername: string | null;
  /**
   * Name of the centre the logged-in student belongs to.
   * Populated by the backend from the JWT / user service.
   * Used to apply the "Your Centre" badge and highlight in the Centres tab.
   * Null for admin users or when the backend cannot resolve the centre.
   */
  currentUserCentreName: string | null;
}

// ── Badge Catalogue ───────────────────────────────────────────────────────────

/**
 * A single badge-level threshold as configured on the backend.
 *
 * Mirrors: BadgeLevelDto (Java)
 * Backend endpoint: included in BadgeCatalogueDto
 */
export interface BadgeLevelDto {
  /** Lowercase stable key, e.g. "bronze" | "silver" | "gold" | "platinum" */
  name: string;
  /** Human-readable label, e.g. "Bronze" */
  label: string;
  /** Minimum XP required to reach this level (inclusive) */
  minXP: number;
  /** Maximum XP for this level, or null when it is the top level */
  maxXP: number | null;
  /** CSS-compatible hex colour string, e.g. "#cd7f32" */
  color: string;
  /** Emoji icon, e.g. "🥉" */
  icon: string;
}

/**
 * A single sub-badge (criterion) with the student's live earned state.
 *
 * Mirrors: SubBadgeDetailDto (Java)
 * Backend endpoint: nested inside MainBadgeDetailDto
 */
export interface SubBadgeDetailDto {
  /** Stable numeric ID matching the backend entity */
  id: number;
  /** Emoji icon, e.g. "🗺️" */
  icon: string;
  /** Short display name, e.g. "Zone Reader" */
  name: string;
  /** One-line goal shown on the collapsed card header */
  shortDesc: string;
  /** Full achievement criteria shown when the card is expanded */
  criteria: string;
  /** XP awarded to the student's parent main badge on completion */
  xpReward: number;
  /** Whether this criterion is delivered as a Lesson or an Activity */
  type: "lesson" | "activity";
  /** Skill tags from the Youthwork Skills & Outcomes Framework */
  skills: string[];
  /** Whether the logged-in student has earned this sub-badge */
  earned: boolean;
  /** ISO-8601 date string (e.g. "Nov 2024"), or null if not yet earned */
  earnedDate: string | null;
}

/**
 * Full detail for one of the 5 core main badges, including the student's
 * current XP and the earned state of every sub-badge.
 *
 * Mirrors: MainBadgeDetailDto (Java)
 * Backend endpoint: nested inside BadgeCatalogueDto
 */
export interface MainBadgeDetailDto {
  /** Stable slug, e.g. "game-mastery" */
  id: string;
  /** Emoji icon, e.g. "🎮" */
  icon: string;
  /** Display name, e.g. "Game Mastery" */
  name: string;
  /** Short tagline shown on the collapsed card */
  tagline: string;
  /** Full description paragraph shown when the card is expanded */
  description: string;
  /** Total XP the student has earned towards this badge */
  xpEarned: number;
  /** All sub-badges (criteria) for this main badge */
  subBadges: SubBadgeDetailDto[];
}

/**
 * Full badge catalogue payload for the Badge Catalogue page.
 *
 * Mirrors: BadgeCatalogueDto (Java)
 * Backend endpoint: GET /api/v1/students/{studentId}/badges
 *
 * Returns the global badge-level thresholds alongside the student's live
 * progress for all 5 core YMCA badges and their sub-badge criteria.
 */
export interface BadgeCatalogueDto {
  /** Ordered list of badge-level thresholds, from lowest to highest */
  badgeLevels: BadgeLevelDto[];
  /** All 5 core badges with the student's earned XP and sub-badge states */
  badges: MainBadgeDetailDto[];
}

// ── Module Progress ───────────────────────────────────────────────────────────

/**
 * A single sub-badge criterion within a module, including the student's
 * earned state.
 *
 * Mirrors: ModuleSubBadgeDto (Java)
 * Backend endpoint: nested inside ModuleProgressDto
 */
export interface ModuleSubBadgeDto {
  id: number;
  /** Emoji icon, e.g. "🗺️" */
  icon: string;
  /** Display name, e.g. "Zone Reader" */
  name: string;
  /** Short description of the challenge */
  desc: string;
  /** XP awarded to the student's parent main badge on completion */
  xpReward: number;
  /** Stable slug of the main badge this sub-badge contributes to */
  mainBadgeId: string;
  /** Whether the logged-in student has earned this sub-badge */
  earned: boolean;
  /** ISO-8601 date string, or null if not yet earned */
  earnedDate: string | null;
}

/**
 * Progress data for a single module.
 *
 * Mirrors: ModuleProgressDto (Java)
 * Backend endpoint: GET /api/v1/students/{studentId}/modules
 */
export interface ModuleProgressDto {
  id: number;
  /** Emoji icon, e.g. "🎮" */
  icon: string;
  /** Display name, e.g. "Fortnite Fundamentals" */
  name: string;
  /** Overall learning outcome / goal for the module */
  outcome: string;
  /** Total duration of the module in weeks */
  durationWeeks: number;
  /** All sub-badge criteria for this module with the student's earned state */
  subBadges: ModuleSubBadgeDto[];
}

// ── Public player profile ─────────────────────────────────────────────────────

/**
 * A single module's progress summary as returned on the public profile.
 * Only contains fields safe to expose publicly (no sub-badge detail).
 *
 * Mirrors: PublicModuleProgressDto (Java)
 * Backend endpoint: nested inside PublicPlayerProfileDto
 */
export interface PublicModuleProgressDto {
  moduleId: number;
  moduleName: string;
  moduleIcon: string;
  sessionsCompleted: number;
  sessionsTotal: number;
}

/**
 * Full public profile for a player, keyed by username slug.
 *
 * Mirrors: PublicPlayerProfileDto (Java)
 * Backend endpoint: GET /api/v1/students/by-username/{username}/public-profile
 *
 * No auth token is required — this endpoint is intentionally public.
 */
export interface PublicPlayerProfileDto {
  /** In-leaderboard / mention handle, e.g. "@alex_gamer" */
  username: string;
  /** In-game display name, e.g. "Tiger Bear" */
  gamertag: string;
  /** Real / display name */
  realName: string;
  /** Free-text bio */
  bio: string;
  /** ISO-8601 date string for when the student joined, e.g. "Sep 2024" */
  joinedDate: string;
  /** Current player level */
  level: number;
  /** Total XP accumulated by the student (all time) */
  totalXP: number;
  /**
   * URL to the student's avatar image.
   * Null when no avatar has been uploaded; the frontend should fall back to
   * DEFAULT_AVATAR_URL.
   */
  avatarUrl: string | null;
  /** Name of the team/hub the student belongs to, or null */
  teamName: string | null;
  /** Emoji icon for the team, or null */
  teamIcon: string | null;
  /** Stable ID used for team navigation links, or null */
  teamId: string | null;
  /** CSS colour string for the team, or null */
  teamColour: string | null;
  /** Name of the centre / hub, or null */
  hub: string | null;
  /** Whether the student is the captain of their team */
  isCaptain: boolean;
  /** Global leaderboard rank (all-time XP), or null if unranked */
  globalRank: number | null;
  /** Summary module progress — only fields safe for public display */
  moduleProgress: PublicModuleProgressDto[];
}

// ── Public profile badge summary ──────────────────────────────────────────────

/**
 * Lightweight badge summary for a player's public profile page.
 *
 * Mirrors: PublicBadgeSummaryDto (Java)
 * Backend endpoint: GET /api/v1/students/by-username/{username}/badges/summary
 *
 * Keyed by username (rather than studentId) because the public profile page
 * is reached via /players/:username and the viewer is not necessarily logged in
 * as the same student. The backend resolves the student from the username and
 * returns only the fields safe to display publicly.
 */
export interface PublicBadgeSummaryDto {
  /** All 5 core badges with this student's earned XP and sub-badge counts */
  badges: MainBadgeSummaryDto[];
}

// ── Student Settings ──────────────────────────────────────────────────────────

/**
 * Profile data for the logged-in student.
 *
 * Mirrors: StudentProfileDto (Java)
 * Backend endpoint: GET /api/v1/students/{studentId}/profile
 */
export interface StudentProfileDto {
  studentId: number;
  /** In-leaderboard / mention handle, e.g. "@alex_gamer" */
  username: string;
  /** Display name shown on profile and leaderboard rows, e.g. "Tiger Bear" */
  gamertag: string;
  /** Free-text bio shown on the public profile page */
  bio: string;
  /**
   * URL to the student's avatar image.
   * Null when no avatar has been uploaded; the frontend should fall back to
   * DEFAULT_AVATAR_URL (see src/constants.ts).
   */
  avatarUrl: string | null;
}

/**
 * Request body for updating a student's editable profile fields.
 *
 * Mirrors: UpdateProfileRequestDto (Java)
 * Backend endpoint: PATCH /api/v1/students/{studentId}/profile
 *
 * The studentId is supplied as a path variable; only the fields below are
 * included in the request body.
 */
export interface UpdateProfileRequestDto {
  username: string;
  gamertag: string;
  bio: string;
}

/**
 * Request body for changing the student's password.
 *
 * Mirrors: ChangePasswordRequestDto (Java)
 * Backend endpoint: POST /api/v1/students/{studentId}/change-password
 *
 * The backend verifies currentPassword against the stored hash before
 * accepting the change. Returns 204 No Content on success, 401 when
 * currentPassword is wrong.
 */
export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

// ── Teams ─────────────────────────────────────────────────────────────────────

/**
 * Summary of a single team, returned in the teams list.
 *
 * Mirrors: TeamSummaryDto (Java)
 * Backend endpoint: GET /api/v1/teams
 */
export interface TeamSummaryDto {
  /** Stable slug, e.g. "wolf-cubs" */
  id: string;
  /** Display name, e.g. "Wolf Cubs" */
  name: string;
  /** Emoji icon, e.g. "🐺" */
  icon: string;
  /** CSS hex colour string, e.g. "#4f8ef7" */
  colour: string;
  /** Centre / hub name, e.g. "Hub Manchester" */
  hub: string;
  /** Display string for the founding year, e.g. "2024" */
  founded: string;
  description: string;
  /** Primary game, e.g. "Fortnite" */
  game: string;
  /** Total number of members on the team */
  memberCount: number;
  /** Gamertag of the team captain, or null if no captain is assigned */
  captainGamertag: string | null;
  /**
   * Avatar URLs for the member avatar stack on the team card.
   * The backend returns the first N urls (typically 4–5); the frontend uses
   * memberCount to compute the "+N more" overflow badge.
   * Any null/missing entry should fall back to DEFAULT_AVATAR_URL.
   */
  memberAvatarUrls: string[];
}

/**
 * Badge progress summary for a single main badge on a team member's card.
 *
 * Mirrors: TeamMemberBadgeProgressDto (Java)
 * Backend endpoint: nested inside TeamMemberDto
 */
export interface TeamMemberBadgeProgressDto {
  /** Stable slug, e.g. "game-mastery" */
  mainBadgeId: string;
  /** Display name, e.g. "Game Mastery" */
  mainBadgeName: string;
  /** Emoji icon, e.g. "🎮" */
  mainBadgeIcon: string;
  /** Total XP the student has earned towards this badge */
  xpEarned: number;
  /** Number of sub-badges the student has earned for this badge */
  subBadgesEarned: number;
  /** Total number of sub-badges for this badge */
  subBadgesTotal: number;
  /**
   * Resolved badge level name, e.g. "BRONZE".
   * Resolved by the backend to avoid duplicating XP threshold logic on
   * the frontend — consistent with MainBadgeSummaryDto.
   */
  levelName: string;
  /** Human-readable label, e.g. "Bronze" */
  levelLabel: string;
  /** CSS hex colour string for the level, e.g. "#cd7f32" */
  levelColor: string;
  /** Emoji icon for the level, e.g. "🥉" */
  levelIcon: string;
}

/**
 * Module progress summary for a single module on a team member's card.
 *
 * Mirrors: TeamMemberModuleProgressDto (Java)
 * Backend endpoint: nested inside TeamMemberDto
 */
export interface TeamMemberModuleProgressDto {
  moduleId: number;
  /** Display name, e.g. "Fortnite Fundamentals" */
  moduleName: string;
  /** Emoji icon, e.g. "🎮" */
  moduleIcon: string;
  sessionsCompleted: number;
  sessionsTotal: number;
}

/**
 * Full data for a single team member, shown on the Team Detail page.
 *
 * Mirrors: TeamMemberDto (Java)
 * Backend endpoint: nested inside TeamDetailDto
 */
export interface TeamMemberDto {
  /** Backend numeric ID for the student */
  studentId: number;
  /** In-game display name, e.g. "Tiger Bear" */
  gamertag: string;
  /** Real / display name */
  realName: string;
  /**
   * Leaderboard / mention handle, e.g. "@alex_gamer".
   * Includes the @ prefix — strip it when building profile route links.
   */
  username: string;
  /** Stable team slug, e.g. "wolf-cubs" */
  teamId: string;
  /** Display string for when the student joined the team, e.g. "Sep 2024" */
  joinedDate: string;
  /**
   * URL to the student's avatar image.
   * Null when no avatar has been uploaded; fall back to DEFAULT_AVATAR_URL.
   */
  avatarUrl: string | null;
  /** Whether this student is the team captain */
  isCaptain: boolean;
  /** Current player level */
  level: number;
  /** Total XP accumulated by the student (all time) */
  totalXP: number;
  /** Progress towards each of the 5 core YMCA main badges */
  badgeProgress: TeamMemberBadgeProgressDto[];
  /** Progress through each enrolled module */
  moduleProgress: TeamMemberModuleProgressDto[];
}

/**
 * Full team payload for the Team Detail page.
 *
 * Mirrors: TeamDetailDto (Java)
 * Backend endpoint: GET /api/v1/teams/{teamId}
 *
 * Members are expected to arrive pre-sorted: captain first, then remaining
 * members ordered by totalXP descending.
 */
export interface TeamDetailDto {
  /** Stable slug, e.g. "wolf-cubs" */
  id: string;
  /** Display name, e.g. "Wolf Cubs" */
  name: string;
  /** Emoji icon, e.g. "🐺" */
  icon: string;
  /** CSS hex colour string, e.g. "#4f8ef7" */
  colour: string;
  /** Centre / hub name, e.g. "Hub Manchester" */
  hub: string;
  /** Display string for the founding year, e.g. "2024" */
  founded: string;
  description: string;
  /** Primary game, e.g. "Fortnite" */
  game: string;
  /** All team members, sorted: captain first, then by totalXP descending */
  members: TeamMemberDto[];
}

// ── Evidence Submission ───────────────────────────────────────────────────────

/**
 * A single evidence submission record returned by the backend.
 *
 * Mirrors: EvidenceSubmissionDto (Java)
 * Backend endpoint: GET /api/v1/students/{studentId}/evidence
 */
export interface EvidenceSubmissionDto {
  id: number;
  badgeName: string;
  subBadgeName: string;
  /** Emoji icon, e.g. "🎯" */
  subBadgeIcon: string;
  fileName: string;
  notes: string;
  /** Display string, e.g. "22 Mar 2026" */
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

/**
 * Request body for submitting new evidence.
 * The file is sent separately as multipart/form-data and is not included here.
 *
 * Mirrors: EvidenceSubmissionRequestDto (Java)
 * Backend endpoint: POST /api/v1/students/{studentId}/evidence
 */
export interface EvidenceSubmissionRequestDto {
  subBadgeId: number;
  notes: string;
}

// ── Admin Recent Activity ─────────────────────────────────────────────────────

/** Activity type tag for filtering and styling in the admin activity feed. */
export type AdminActivityType = "badge" | "module" | "user";

/**
 * A single entry in the admin-facing activity feed on the dashboard.
 *
 * Mirrors: AdminRecentActivityDto (Java)
 * Backend endpoint: GET /api/v1/admin/activity
 *
 * Requires ROLE_ADMIN.
 */
export interface AdminRecentActivityDto {
  id: number;
  /** Categorises the activity for CSS styling and filter chips */
  type: AdminActivityType;
  /** Emoji icon shown in the feed row */
  icon: string;
  /** Human-readable description of the action, e.g. "Awarded \"Road to Diamond\" to Jamie R." */
  action: string;
  /** Centre / hub name where the action occurred */
  centre: string;
  /** Username or display name of the admin/staff who performed the action */
  admin: string;
  /** Human-readable relative time string, e.g. "5 minutes ago" */
  time: string;
}

// ── Admin Badge Management ────────────────────────────────────────────────────

/**
 * A single row in the per-badge XP leaderboard strip.
 *
 * Mirrors: BadgeLeaderboardEntryDto (Java)
 * Backend endpoint: included in AdminBadgeCatalogueDto
 */
export interface BadgeLeaderboardEntryDto {
  rank: number;
  name: string;
  username: string;
  xp: number;
}

/**
 * Admin-facing badge catalogue with per-badge leaderboard data.
 *
 * Mirrors: AdminBadgeCatalogueDto (Java)
 * Backend endpoint: GET /api/v1/admin/badges
 */
export interface AdminBadgeCatalogueDto {
  badgeLevels: BadgeLevelDto[];
  badges: MainBadgeDetailDto[];
  /** Top earners per badge, keyed by badge id */
  badgeLeaderboards: Record<string, BadgeLeaderboardEntryDto[]>;
}

// ── Admin Module Management ───────────────────────────────────────────────────

/** Status of a module in the admin view. */
export type AdminModuleStatus = "Active" | "Draft" | "Archived";

/**
 * A sub-badge/challenge within a module, as managed by an admin.
 *
 * Mirrors: AdminSubBadgeDto (Java)
 * Backend endpoint: nested inside AdminModuleDto
 */
export interface AdminSubBadgeDto {
  id: number;
  name: string;
  description: string;
  /** Stable slug of the main badge this sub-badge contributes to */
  mainBadgeId: string;
  /** XP awarded on completion */
  xpValue: number;
  /** YSOF skill tags — must have at least 2 */
  skills: string[];
}

/**
 * A module as managed by an admin.
 *
 * Mirrors: AdminModuleDto (Java)
 * Backend endpoint: GET /api/v1/admin/modules
 */
export interface AdminModuleDto {
  id: number;
  name: string;
  /** Primary game, e.g. "Fortnite" */
  game: string;
  /** Overall learning outcome / goal */
  outcome: string;
  /** Duration in weeks (12–16) */
  durationWeeks: number;
  status: AdminModuleStatus;
  /** Sub-badges / challenges within this module */
  subBadges: AdminSubBadgeDto[];
  /** Names of groups currently using this module */
  groupsUsingIt: string[];
  /** Weekly session plans / lessons */
  sessions: AdminSessionDto[];
}

// ── Session & Resource types ──────────────────────────────────────────────────

/** Allowed file types for lesson resources. */
export type ResourceFileType = "pptx" | "pdf" | "video" | "image" | "doc" | "other";

/**
 * A file/resource attached to a session.
 *
 * Mirrors: AdminResourceDto (Java)
 * Backend endpoint: nested inside AdminSessionDto
 */
export interface AdminResourceDto {
  id: number;
  /** Original file name, e.g. "Week1-Slides.pptx" */
  fileName: string;
  fileType: ResourceFileType;
  /** Size in bytes */
  fileSizeBytes: number;
  /** Download URL (presigned S3 URL in production) */
  url: string;
  /** ISO-8601 datetime */
  uploadedAt: string;
}

/**
 * A weekly session / lesson within a module.
 *
 * Mirrors: AdminSessionDto (Java)
 * Backend endpoint: nested inside AdminModuleDto
 */
export interface AdminSessionDto {
  id: number;
  /** Week number within the module (1-based) */
  weekNumber: number;
  title: string;
  /** Markdown/plain-text session plan for the facilitator */
  sessionPlan: string;
  /** Delivery notes — tips, timings, differentiation advice */
  deliveryNotes: string;
  /** Attached lesson resources (slides, videos, handouts) */
  resources: AdminResourceDto[];
}

// ── Admin Award Progress ──────────────────────────────────────────────────────

/**
 * A group / cohort managed by the centre.
 *
 * Mirrors: AdminGroupDto (Java)
 * Backend endpoint: GET /api/v1/admin/groups
 */
export type AdminGroupGame =
  | "Minecraft"
  | "Rocket League"
  | "Fortnite"
  | "Competitive"
  | "Media"
  | "Casual";

export type AdminGroupType = "Juniors" | "Competitive" | "Media" | "Casual";

export interface AdminGroupDto {
  /** Stable slug, e.g. "wolf-cubs" */
  id: string;
  /** Display name, e.g. "Wolf Cubs" */
  name: string;
  /** Centre / hub name, e.g. "Hub Glasgow" */
  hub: string;
  /** Primary game / activity tag */
  game: AdminGroupGame;
  /** Group programme type */
  groupType: AdminGroupType;
  /** IDs of modules assigned to this group */
  moduleIds: number[];
  /** Total number of members in the group */
  memberCount: number;
}

/**
 * A single member row in the group award view, including which sub-badges
 * have already been awarded.
 *
 * Mirrors: AdminGroupMemberAwardDto (Java)
 * Backend endpoint: nested inside AdminGroupAwardViewDto
 */
export interface AdminGroupMemberAwardDto {
  studentId: number;
  gamertag: string;
  realName: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  /** Sub-badge IDs that have already been awarded to this member */
  awardedSubBadgeIds: number[];
  /** Map from subBadgeId → ISO date string of when it was awarded */
  awardedDates: Record<number, string>;
}

/**
 * Full payload for the group award view: group metadata, members with their
 * award state, and the sub-badges available from the group's assigned modules.
 *
 * Mirrors: AdminGroupAwardViewDto (Java)
 * Backend endpoint: GET /api/v1/admin/groups/{groupId}/awards
 */
export interface AdminGroupAwardViewDto {
  group: AdminGroupDto;
  members: AdminGroupMemberAwardDto[];
  /** Modules assigned to this group, with their sub-badges */
  modules: AdminAwardModuleDto[];
}

/**
 * Lightweight module representation for the award view, containing only the
 * fields needed to render sub-badge columns.
 *
 * Mirrors: AdminAwardModuleDto (Java)
 * Backend endpoint: nested inside AdminGroupAwardViewDto
 */
export interface AdminAwardModuleDto {
  id: number;
  name: string;
  subBadges: AdminSubBadgeDto[];
}

/**
 * A single award instruction: "award subBadgeId to studentId".
 *
 * Mirrors: AwardEntryDto (Java)
 * Backend endpoint: used in BulkAwardRequestDto
 */
export interface AwardEntryDto {
  studentId: number;
  subBadgeId: number;
}

/**
 * Request body for bulk-awarding sub-badges to multiple students.
 *
 * Mirrors: BulkAwardRequestDto (Java)
 * Backend endpoint: POST /api/v1/admin/awards/bulk
 */
export interface BulkAwardRequestDto {
  awards: AwardEntryDto[];
}

/**
 * Request body for revoking a previously awarded sub-badge.
 *
 * Mirrors: RevokeAwardRequestDto (Java)
 * Backend endpoint: DELETE /api/v1/admin/awards
 */
export interface RevokeAwardRequestDto {
  studentId: number;
  subBadgeId: number;
}

/**
 * Lightweight user record returned by the admin user search.
 *
 * Mirrors: AdminUserSearchResultDto (Java)
 * Backend endpoint: GET /api/v1/admin/users/search?q=...
 */
export interface AdminUserSearchResultDto {
  studentId: number;
  gamertag: string;
  realName: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  hub: string;
}

/**
 * Full award state for a single user, used in the individual-award view.
 *
 * Mirrors: AdminUserAwardStateDto (Java)
 * Backend endpoint: GET /api/v1/admin/users/{studentId}/awards
 */
export interface AdminUserAwardStateDto {
  studentId: number;
  gamertag: string;
  realName: string;
  username: string;
  /** Sub-badge IDs that have already been awarded */
  awardedSubBadgeIds: number[];
  /** Map from subBadgeId → ISO date string */
  awardedDates: Record<number, string>;
}

// ── Admin User Management ─────────────────────────────────────────────────────

/**
 * Request body for creating a new student user.
 *
 * Mirrors: CreateUserRequestDto (Java)
 * Backend endpoint: POST /api/v1/admin/users
 */
export interface CreateUserRequestDto {
  username: string;
  password: string;
  name: string;
  gamertag?: string;
  centre?: string;
  group?: string;
}

/**
 * User info returned from admin endpoints.
 *
 * Mirrors: AdminUserDto (Java)
 * Backend endpoint: GET /api/v1/admin/users
 */
export interface AdminUserDto {
  id: number;
  username: string;
  name: string;
  gamertag: string;
  centre: string | null;
  group: string | null;
  level: number;
  totalXP: number;
  badgesEarned: number;
  joinedDate: string;
  avatarUrl: string | null;
}
