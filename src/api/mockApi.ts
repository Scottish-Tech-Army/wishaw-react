/**
 * @file mockApi.ts — Mock implementation of every studentApi.ts export.
 *
 * Only bundled when VITE_USE_MOCK=true (loaded via --mode mock / .env.mock).
 * Vite tree-shakes this entire file from production builds.
 *
 * Each function mirrors the real signature in studentApi.ts so callers never
 * need to know which implementation they are using.
 */

import type {
  AdminBadgeCatalogueDto,
  AdminModuleDto,
  AdminSubBadgeDto,
  AdminSessionDto,
  AdminResourceDto,
  AdminUserDto,
  CreateUserRequestDto,
  ResourceFileType,
  BadgeCatalogueDto,
  BadgeLevelDto,
  ChangePasswordRequestDto,
  DashboardSummaryDto,
  EvidenceSubmissionDto,
  LeaderboardPeriod,
  LeaderboardResponseDto,
  LoginResponseDto,
  ModuleProgressDto,
  PublicBadgeSummaryDto,
  PublicPlayerProfileDto,
  StudentProfileDto,
  TeamDetailDto,
  TeamSummaryDto,
  UpdateProfileRequestDto,
  AdminGroupDto,
  AdminGroupGame,
  AdminGroupType,
  AdminGroupAwardViewDto,
  AdminAwardModuleDto,
  AwardEntryDto,
  AdminUserSearchResultDto,
  AdminUserAwardStateDto,
  AdminRecentActivityDto,
} from "./types";

import {
  MOCK_DASHBOARD,
  MOCK_LEADERBOARD,
  MOCK_BADGE_CATALOGUE,
  MOCK_MODULES,
  MOCK_STUDENT_PROFILE,
  MOCK_TEAMS,
  MOCK_TEAM_DETAIL,
  MOCK_TEAM_DETAILS,
  MOCK_EVIDENCE_SUBMISSIONS,
  MOCK_PUBLIC_BADGE_SUMMARY,
  MOCK_PUBLIC_PLAYER_PROFILES_MAP,
  MOCK_LOGIN_RESPONSE,
  MOCK_ADMIN_BADGE_CATALOGUE,
  MOCK_ADMIN_MODULES,
  MOCK_ADMIN_GROUPS,
  MOCK_GROUP_MEMBER_AWARDS,
  MOCK_ALL_USERS,
  MOCK_USER_AWARD_STATES,
  MOCK_ADMIN_RECENT_ACTIVITIES,
} from "./mockData";

// ── Re-exports so callers that import these from ../api/index still compile ───

export { ApiError, type LeaderboardSortKey } from "./studentApi";
import { ApiError } from "./studentApi";

// ── Helper ────────────────────────────────────────────────────────────────────

/** Simulates network latency. */
const delay = (ms = 400): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function authLogin(
  _username: string,
  _password: string,
): Promise<LoginResponseDto> {
  await delay();
  return MOCK_LOGIN_RESPONSE;
}

export async function authLogout(): Promise<void> {
  // No delay — feels instant, mirrors a real session tear-down.
  return undefined;
}

export async function forgotUsername(
  _email: string,
): Promise<{ username: string }> {
  await delay();
  return { username: "alex_gamer" };
}

export async function forgotPassword(
  _username: string,
): Promise<{ hint: string }> {
  await delay();
  return { hint: "Your first pet's name" };
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardSummary(
  _studentId: number,
): Promise<DashboardSummaryDto> {
  await delay();
  return MOCK_DASHBOARD;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function getLeaderboard(
  _period: LeaderboardPeriod,
  _sortBy?: string,
  _page?: number,
  _pageSize?: number,
): Promise<LeaderboardResponseDto> {
  await delay();
  return MOCK_LEADERBOARD;
}

// ── Badge Catalogue ───────────────────────────────────────────────────────────

export async function getBadgeCatalogue(
  _studentId: number,
): Promise<BadgeCatalogueDto> {
  await delay();
  return MOCK_BADGE_CATALOGUE;
}

// ── Module Progress ───────────────────────────────────────────────────────────

export async function getModuleProgress(
  _studentId: number,
): Promise<ModuleProgressDto[]> {
  await delay();
  return MOCK_MODULES;
}

// ── Public profile ────────────────────────────────────────────────────────────

export async function getPublicBadgeSummary(
  _username: string,
): Promise<PublicBadgeSummaryDto> {
  await delay();
  return MOCK_PUBLIC_BADGE_SUMMARY;
}

export async function getPublicPlayerProfile(
  username: string,
): Promise<PublicPlayerProfileDto> {
  await delay();
  
  // Normalize username - ensure it starts with @
  const normalizedUsername = username.startsWith('@') ? username : `@${username}`;
  
  // Look up the profile in the map
  const profile = MOCK_PUBLIC_PLAYER_PROFILES_MAP[normalizedUsername];
  
  // If not found, throw a 404 ApiError
  if (!profile) {
    throw new ApiError(404, `Player with username '${username}' not found`);
  }
  
  return profile;
}

// ── Student profile / settings ────────────────────────────────────────────────

export async function getStudentProfile(
  _studentId: number,
): Promise<StudentProfileDto> {
  await delay();
  return MOCK_STUDENT_PROFILE;
}

export async function updateStudentProfile(
  _studentId: number,
  body: UpdateProfileRequestDto,
): Promise<StudentProfileDto> {
  await delay();
  Object.assign(MOCK_STUDENT_PROFILE, body);
  return MOCK_STUDENT_PROFILE;
}

export async function changePassword(
  _studentId: number,
  _body: ChangePasswordRequestDto,
): Promise<void> {
  await delay();
  return undefined;
}

export async function uploadAvatar(
  _studentId: number,
  _file: File,
): Promise<StudentProfileDto> {
  await delay();
  return MOCK_STUDENT_PROFILE;
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export async function getTeams(): Promise<TeamSummaryDto[]> {
  await delay();
  return MOCK_TEAMS;
}

/**
 * Fetches team detail by ID.
 * Falls back to Wolf Cubs data if teamId is not found (for graceful degradation in mocks).
 */
export async function getTeamDetail(
  teamId: string,
): Promise<TeamDetailDto> {
  await delay();
  return MOCK_TEAM_DETAILS[teamId] ?? MOCK_TEAM_DETAIL;
}

// ── Evidence Submission ───────────────────────────────────────────────────────

export async function getEvidenceSubmissions(
  _studentId: number,
): Promise<EvidenceSubmissionDto[]> {
  await delay();
  return MOCK_EVIDENCE_SUBMISSIONS;
}

export async function submitEvidence(
  _studentId: number,
  subBadgeId: number,
  notes: string,
  _file: File,
): Promise<EvidenceSubmissionDto> {
  const newEntry: EvidenceSubmissionDto = {
    id: Date.now(),
    badgeName:    "Mock Badge",
    subBadgeName: `Sub-badge #${subBadgeId}`,
    subBadgeIcon: "📎",
    fileName:     _file.name,
    notes,
    submittedAt:  new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status: "pending",
  };
  MOCK_EVIDENCE_SUBMISSIONS.unshift(newEntry);
  await delay();
  return newEntry;
}

// ── Admin Badge Management ────────────────────────────────────────────────────

export async function getAdminBadgeCatalogue(): Promise<AdminBadgeCatalogueDto> {
  await delay();
  return MOCK_ADMIN_BADGE_CATALOGUE;
}

export async function updateBadgeLevels(
  levels: BadgeLevelDto[],
): Promise<BadgeLevelDto[]> {
  await delay();
  MOCK_ADMIN_BADGE_CATALOGUE.badgeLevels = levels;
  return levels;
}

// ── Admin Module Management ───────────────────────────────────────────────────

export async function getAdminModules(): Promise<AdminModuleDto[]> {
  await delay();
  return MOCK_ADMIN_MODULES;
}

export async function createAdminModule(
  module: Omit<AdminModuleDto, "id" | "subBadges" | "groupsUsingIt" | "sessions">,
): Promise<AdminModuleDto> {
  await delay();
  const newModule: AdminModuleDto = {
    ...module,
    id: Date.now(),
    subBadges: [],
    groupsUsingIt: [],
    sessions: [],
  };
  MOCK_ADMIN_MODULES.unshift(newModule);
  return newModule;
}

export async function updateAdminModule(
  moduleId: number,
  updates: Partial<Pick<AdminModuleDto, "name" | "game" | "outcome" | "durationWeeks" | "status">>,
): Promise<AdminModuleDto> {
  await delay();
  const idx = MOCK_ADMIN_MODULES.findIndex((m) => m.id === moduleId);
  if (idx === -1) throw new ApiError(404, `Module ${moduleId} not found`);
  MOCK_ADMIN_MODULES[idx] = { ...MOCK_ADMIN_MODULES[idx], ...updates };
  return MOCK_ADMIN_MODULES[idx];
}

export async function archiveAdminModule(
  moduleId: number,
): Promise<AdminModuleDto> {
  return updateAdminModule(moduleId, { status: "Archived" });
}

export async function addSubBadge(
  moduleId: number,
  subBadge: Omit<AdminSubBadgeDto, "id">,
): Promise<AdminSubBadgeDto> {
  await delay();
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new ApiError(404, `Module ${moduleId} not found`);
  const newSub: AdminSubBadgeDto = { ...subBadge, id: Date.now() };
  mod.subBadges = [...mod.subBadges, newSub];
  return newSub;
}

export async function updateSubBadge(
  moduleId: number,
  subBadgeId: number,
  updates: Partial<Omit<AdminSubBadgeDto, "id">>,
): Promise<AdminSubBadgeDto> {
  await delay();
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new ApiError(404, `Module ${moduleId} not found`);
  const idx = mod.subBadges.findIndex((s) => s.id === subBadgeId);
  if (idx === -1) throw new ApiError(404, `Sub-badge ${subBadgeId} not found`);
  mod.subBadges[idx] = { ...mod.subBadges[idx], ...updates };
  return mod.subBadges[idx];
}

export async function removeSubBadge(
  moduleId: number,
  subBadgeId: number,
): Promise<void> {
  await delay();
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new ApiError(404, `Module ${moduleId} not found`);
  mod.subBadges = mod.subBadges.filter((s) => s.id !== subBadgeId);
}

export async function reorderSubBadges(
  moduleId: number,
  orderedIds: number[],
): Promise<AdminSubBadgeDto[]> {
  await delay();
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new ApiError(404, `Module ${moduleId} not found`);
  const byId = new Map(mod.subBadges.map((s) => [s.id, s]));
  mod.subBadges = orderedIds.map((id) => byId.get(id)!).filter(Boolean);
  return mod.subBadges;
}

// ── Session CRUD ──────────────────────────────────────────────────────────────

let nextSessionId = 700;

export async function addSession(
  moduleId: number,
  data: Omit<AdminSessionDto, "id" | "resources">,
): Promise<AdminSessionDto> {
  await delay();
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new ApiError(404, `Module ${moduleId} not found`);
  const session: AdminSessionDto = { ...data, id: nextSessionId++, resources: [] };
  mod.sessions.push(session);
  return session;
}

export async function updateSession(
  moduleId: number,
  sessionId: number,
  data: Omit<AdminSessionDto, "id" | "resources">,
): Promise<AdminSessionDto> {
  await delay();
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new ApiError(404, `Module ${moduleId} not found`);
  const session = mod.sessions.find((s) => s.id === sessionId);
  if (!session) throw new ApiError(404, `Session ${sessionId} not found`);
  Object.assign(session, data);
  return session;
}

export async function removeSession(
  moduleId: number,
  sessionId: number,
): Promise<void> {
  await delay();
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new ApiError(404, `Module ${moduleId} not found`);
  mod.sessions = mod.sessions.filter((s) => s.id !== sessionId);
}

// ── Resource upload / remove ──────────────────────────────────────────────────

const FILE_TYPE_MAP: Record<string, ResourceFileType> = {
  pptx: "pptx", ppt: "pptx",
  pdf: "pdf",
  mp4: "video", mov: "video", avi: "video", webm: "video",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image",
  doc: "doc", docx: "doc",
};

function inferFileType(name: string): ResourceFileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return FILE_TYPE_MAP[ext] ?? "other";
}

let nextResourceId = 90000;

export async function uploadResource(
  moduleId: number,
  sessionId: number,
  file: File,
): Promise<AdminResourceDto> {
  await delay();
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new ApiError(404, `Module ${moduleId} not found`);
  const session = mod.sessions.find((s) => s.id === sessionId);
  if (!session) throw new ApiError(404, `Session ${sessionId} not found`);
  const resource: AdminResourceDto = {
    id: nextResourceId++,
    fileName: file.name,
    fileType: inferFileType(file.name),
    fileSizeBytes: file.size,
    url: `/mock/files/${file.name}`,
    uploadedAt: new Date().toISOString(),
  };
  session.resources.push(resource);
  return resource;
}

export async function removeResource(
  moduleId: number,
  sessionId: number,
  resourceId: number,
): Promise<void> {
  await delay();
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (!mod) throw new ApiError(404, `Module ${moduleId} not found`);
  const session = mod.sessions.find((s) => s.id === sessionId);
  if (!session) throw new ApiError(404, `Session ${sessionId} not found`);
  session.resources = session.resources.filter((r) => r.id !== resourceId);
}

// ── Admin User Management ─────────────────────────────────────────────────────
// ── Admin Award Progress ──────────────────────────────────────────────────────

export async function getAdminGroups(): Promise<AdminGroupDto[]> {
  await delay();
  return MOCK_ADMIN_GROUPS;
}

export async function createAdminGroup(data: {
  name: string;
  hub: string;
  game: AdminGroupGame;
  groupType: AdminGroupType;
}): Promise<AdminGroupDto> {
  await delay();
  const id = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  if (MOCK_ADMIN_GROUPS.find((g) => g.id === id)) {
    throw new ApiError(409, `Group with id "${id}" already exists`);
  }
  const newGroup: AdminGroupDto = { ...data, id, moduleIds: [], memberCount: 0 };
  MOCK_ADMIN_GROUPS.push(newGroup);
  return newGroup;
}

export async function updateAdminGroup(
  groupId: string,
  data: { name: string; hub: string; game: AdminGroupGame; groupType: AdminGroupType },
): Promise<AdminGroupDto> {
  await delay();
  const group = MOCK_ADMIN_GROUPS.find((g) => g.id === groupId);
  if (!group) throw new ApiError(404, `Group ${groupId} not found`);
  Object.assign(group, data);
  return group;
}

export async function deleteAdminGroup(groupId: string): Promise<void> {
  await delay();
  const idx = MOCK_ADMIN_GROUPS.findIndex((g) => g.id === groupId);
  if (idx === -1) throw new ApiError(404, `Group ${groupId} not found`);
  MOCK_ADMIN_GROUPS.splice(idx, 1);
  delete MOCK_GROUP_MEMBER_AWARDS[groupId];
}

export async function assignModuleToGroup(
  groupId: string,
  moduleId: number,
): Promise<AdminGroupDto> {
  await delay();
  const group = MOCK_ADMIN_GROUPS.find((g) => g.id === groupId);
  if (!group) throw new ApiError(404, `Group ${groupId} not found`);
  if (!group.moduleIds.includes(moduleId)) group.moduleIds.push(moduleId);
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (mod && !mod.groupsUsingIt.includes(group.name)) mod.groupsUsingIt.push(group.name);
  return group;
}

export async function unassignModuleFromGroup(
  groupId: string,
  moduleId: number,
): Promise<AdminGroupDto> {
  await delay();
  const group = MOCK_ADMIN_GROUPS.find((g) => g.id === groupId);
  if (!group) throw new ApiError(404, `Group ${groupId} not found`);
  group.moduleIds = group.moduleIds.filter((id) => id !== moduleId);
  const mod = MOCK_ADMIN_MODULES.find((m) => m.id === moduleId);
  if (mod) mod.groupsUsingIt = mod.groupsUsingIt.filter((n) => n !== group.name);
  return group;
}

export async function getAdminGroupAwardView(
  groupId: string,
): Promise<AdminGroupAwardViewDto> {
  await delay();
  const group = MOCK_ADMIN_GROUPS.find((g) => g.id === groupId);
  if (!group) throw new ApiError(404, `Group ${groupId} not found`);

  const members = MOCK_GROUP_MEMBER_AWARDS[groupId] ?? [];

  const modules: AdminAwardModuleDto[] = group.moduleIds
    .map((mid) => MOCK_ADMIN_MODULES.find((m) => m.id === mid))
    .filter(Boolean)
    .map((m) => ({ id: m!.id, name: m!.name, subBadges: m!.subBadges }));

  return { group, members, modules };
}

export async function bulkAwardSubBadges(
  awards: AwardEntryDto[],
): Promise<void> {
  await delay();
  const today = new Date().toISOString().slice(0, 10);

  for (const { studentId, subBadgeId } of awards) {
    // Update group member awards
    for (const members of Object.values(MOCK_GROUP_MEMBER_AWARDS)) {
      const member = members.find((m) => m.studentId === studentId);
      if (member && !member.awardedSubBadgeIds.includes(subBadgeId)) {
        member.awardedSubBadgeIds.push(subBadgeId);
        member.awardedDates[subBadgeId] = today;
      }
    }

    // Update per-user award state
    const userState = MOCK_USER_AWARD_STATES[studentId];
    if (userState && !userState.awardedSubBadgeIds.includes(subBadgeId)) {
      userState.awardedSubBadgeIds.push(subBadgeId);
      userState.awardedDates[subBadgeId] = today;
    }
  }
}

export async function revokeSubBadgeAward(
  studentId: number,
  subBadgeId: number,
): Promise<void> {
  await delay();

  // Update group member awards
  for (const members of Object.values(MOCK_GROUP_MEMBER_AWARDS)) {
    const member = members.find((m) => m.studentId === studentId);
    if (member) {
      member.awardedSubBadgeIds = member.awardedSubBadgeIds.filter(
        (id) => id !== subBadgeId,
      );
      delete member.awardedDates[subBadgeId];
    }
  }

  // Update per-user award state
  const userState = MOCK_USER_AWARD_STATES[studentId];
  if (userState) {
    userState.awardedSubBadgeIds = userState.awardedSubBadgeIds.filter(
      (id) => id !== subBadgeId,
    );
    delete userState.awardedDates[subBadgeId];
  }
}

export async function searchAdminUsers(
  query: string,
): Promise<AdminUserSearchResultDto[]> {
  await delay();
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return MOCK_ALL_USERS.filter(
    (u) =>
      u.gamertag.toLowerCase().includes(q) ||
      u.realName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q),
  );
}

export async function getAdminUserAwardState(
  studentId: number,
): Promise<AdminUserAwardStateDto> {
  await delay();
  const state = MOCK_USER_AWARD_STATES[studentId];
  if (!state) throw new ApiError(404, `User ${studentId} not found`);
  return state;
}

export async function getAdminUsers(): Promise<AdminUserDto[]> {
  await delay();
  return MOCK_ALL_USERS.map((u) => ({
    id: u.studentId,
    username: u.username,
    name: u.realName,
    gamertag: u.gamertag,
    centre: u.hub,
    group: null,
    level: u.level,
    totalXP: u.level * 200,
    badgesEarned: 0,
    joinedDate: "2025-09-01",
    avatarUrl: u.avatarUrl,
  }));
}

export async function createUser(data: CreateUserRequestDto): Promise<AdminUserDto> {
  await delay();
  const id = Math.max(0, ...MOCK_ALL_USERS.map((u) => u.studentId)) + 1;
  const newUser: AdminUserDto = {
    id,
    username: data.username,
    name: data.name,
    gamertag: data.gamertag ?? data.name,
    centre: data.centre ?? null,
    group: data.group ?? null,
    level: 1,
    totalXP: 0,
    badgesEarned: 0,
    joinedDate: new Date().toISOString().slice(0, 10),
    avatarUrl: null,
  };
  MOCK_ALL_USERS.push({
    studentId: id,
    gamertag: newUser.gamertag,
    realName: newUser.name,
    username: newUser.username,
    avatarUrl: null,
    level: 1,
    hub: newUser.centre ?? "Hub Glasgow",
  });
  return newUser;
}

// ── Admin Recent Activity ─────────────────────────────────────────────────────

export async function getAdminRecentActivities(): Promise<AdminRecentActivityDto[]> {
  await delay();
  return MOCK_ADMIN_RECENT_ACTIVITIES;
}
