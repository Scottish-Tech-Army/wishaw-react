/**
 * Student API — Portal
 *
 * All communication with the Java Spring Boot backend goes through this module.
 * Set VITE_API_BASE_URL in your .env file to the backend root, e.g.:
 *   VITE_API_BASE_URL=http://localhost:8080/api/v1
 *
 * Every function throws an ApiError on non-2xx responses so callers (hooks)
 * can distinguish network errors from application errors.
 */

import type { AdminBadgeCatalogueDto, AdminGroupDto, AdminGroupGame, AdminGroupType, AdminModuleDto, AdminRecentActivityDto, AdminResourceDto, AdminSessionDto, AdminSubBadgeDto, AdminUserDto, BadgeCatalogueDto, BadgeLevelDto, ChangePasswordRequestDto, CreateUserRequestDto, DashboardSummaryDto, EvidenceSubmissionDto, LeaderboardPeriod, LeaderboardResponseDto, LoginResponseDto, ModuleProgressDto, PublicBadgeSummaryDto, PublicPlayerProfileDto, StudentProfileDto, TeamDetailDto, TeamSummaryDto, UpdateProfileRequestDto } from "./types";

/** Maps to the backend LeaderboardSortKey enum: XP | LEVEL | MODULES | BADGES */
export type LeaderboardSortKey = "XP" | "LEVEL" | "MODULES" | "BADGES";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

// ── Error type ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      // JWT Bearer token — Spring Security expects "Authorization: Bearer <token>"
      // The token is stored in localStorage by the auth layer once real auth is in place.
      ...(localStorage.getItem("auth_token")
        ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
        : {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(
      response.status,
      body || `Request failed with status ${response.status}`,
    );
  }

  // 204 No Content — return undefined cast to T
  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Authenticates the user against the backend.
 *
 * Backend endpoint: POST /api/v1/auth/login
 * Request body: { username, password }
 * Response: { token: "<signed-JWT>" }
 *
 * On success the caller should:
 *  1. Store the JWT in localStorage under the key "auth_token".
 *  2. Decode the JWT payload to read { studentId, username, role } claims.
 */
export async function authLogin(
  username: string,
  password: string,
): Promise<LoginResponseDto> {
  return apiFetch<LoginResponseDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Invalidates the server-side session / refresh token.
 *
 * Backend endpoint: DELETE /api/v1/auth/session
 *
 * The caller is responsible for removing "auth_token" from localStorage
 * before or after this call.
 */
export async function authLogout(): Promise<void> {
  return apiFetch<void>("/auth/session", { method: "DELETE" });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * Fetches the full dashboard summary for the given student.
 *
 * Backend endpoint: GET /api/v1/students/{studentId}/dashboard
 *
 * The response is a single aggregated DTO that covers:
 *  - XP progress and level
 *  - Weekly XP (personal / team / hub)
 *  - Badge summaries (5 main badges)
 *  - Recent XP activity (last 5 events)
 *  - Leaderboard rank and next session time
 */
export async function getDashboardSummary(
  studentId: number,
): Promise<DashboardSummaryDto> {
  return apiFetch<DashboardSummaryDto>(`/students/${studentId}/dashboard`);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

/**
 * Fetches a page of the leaderboard for both the Players and Centres tabs.
 *
 * Backend endpoint: GET /api/v1/leaderboard?period=ALL_TIME&sortBy=XP&page=0&size=50
 *
 * The backend resolves the current user from the JWT and injects
 * `currentUserUsername` into the response so the frontend can highlight
 * the logged-in student's row without needing to pass the ID explicitly.
 */
export async function getLeaderboard(
  period: LeaderboardPeriod,
  sortBy: LeaderboardSortKey = "XP",
  page: number = 0,
  pageSize: number = 50,
): Promise<LeaderboardResponseDto> {
  return apiFetch<LeaderboardResponseDto>(
    `/leaderboard?period=${encodeURIComponent(period)}&sortBy=${sortBy}&page=${page}&size=${pageSize}`,
  );
}

// ── Badge Catalogue ───────────────────────────────────────────────────────────

/**
 * Fetches the full badge catalogue for the given student.
 *
 * Backend endpoint: GET /api/v1/students/{studentId}/badges
 *
 * The response includes:
 *  - badgeLevels: ordered list of XP thresholds (Bronze → Platinum)
 *  - badges: all 5 core YMCA badges with the student's live xpEarned and
 *            the earned/locked state of every sub-badge criterion
 *
 * The JWT Bearer token is forwarded automatically by apiFetch, so Spring
 * Security can verify the request and return only this student's progress.
 */
export async function getBadgeCatalogue(
  studentId: number,
): Promise<BadgeCatalogueDto> {
  return apiFetch<BadgeCatalogueDto>(`/students/${studentId}/badges`);
}

// ── Module Progress ───────────────────────────────────────────────────────────

/**
 * Fetches the full module progress list for the given student.
 *
 * Backend endpoint: GET /api/v1/students/{studentId}/modules
 *
 * The response includes all modules the student is enrolled in, with the
 * earned/locked state of every sub-badge criterion inside each module.
 */
export async function getModuleProgress(
  studentId: number,
): Promise<ModuleProgressDto[]> {
  return apiFetch<ModuleProgressDto[]>(`/students/${studentId}/modules`);
}

// ── Public profile badge summary ──────────────────────────────────────────────

/**
 * Fetches the lightweight badge summary for a player's public profile page.
 *
 * Backend endpoint: GET /api/v1/students/by-username/{username}/badges/summary
 *
 * No auth token is required — this endpoint is intentionally public.
 * The backend resolves the student from the username slug and returns only
 * the fields that are safe to display publicly (MainBadgeSummaryDto[]).
 */
export async function getPublicBadgeSummary(
  username: string,
): Promise<PublicBadgeSummaryDto> {
  return apiFetch<PublicBadgeSummaryDto>(
    `/students/by-username/${encodeURIComponent(username)}/badges/summary`,
  );
}

/**
 * Fetches the full public profile for a player identified by username slug.
 *
 * Backend endpoint: GET /api/v1/students/by-username/{username}/public-profile
 *
 * No auth token is required — this endpoint is intentionally public.
 * Throws ApiError with status 404 when the username does not exist.
 */
export async function getPublicPlayerProfile(
  username: string,
): Promise<PublicPlayerProfileDto> {
  return apiFetch<PublicPlayerProfileDto>(
    `/students/by-username/${encodeURIComponent(username)}/public-profile`,
  );
}

// ── Student Settings ──────────────────────────────────────────────────────────

/**
 * Fetches the editable profile fields for the given student.
 *
 * Backend endpoint: GET /api/v1/students/{studentId}/profile
 *
 * Used by the Settings page to pre-fill the profile form with the current
 * username, gamertag, bio, and avatarUrl stored on the backend.
 */
export async function getStudentProfile(
  studentId: number,
): Promise<StudentProfileDto> {
  return apiFetch<StudentProfileDto>(`/students/${studentId}/profile`);
}

/**
 * Persists changes to a student's editable profile fields.
 *
 * Backend endpoint: PATCH /api/v1/students/{studentId}/profile
 *
 * Returns the full updated StudentProfileDto so the frontend can reflect any
 * server-side normalisations (e.g. trimming whitespace, enforcing @ prefix).
 */
export async function updateStudentProfile(
  studentId: number,
  body: UpdateProfileRequestDto,
): Promise<StudentProfileDto> {
  return apiFetch<StudentProfileDto>(`/students/${studentId}/profile`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * Changes the student's password after verifying the current one.
 *
 * Backend endpoint: POST /api/v1/students/{studentId}/change-password
 *
 * Returns 204 No Content on success — apiFetch handles this and resolves with
 * undefined (cast to void). Throws an ApiError with status 401 when
 * currentPassword does not match the stored hash.
 */
export async function changePassword(
  studentId: number,
  body: ChangePasswordRequestDto,
): Promise<void> {
  return apiFetch<void>(`/students/${studentId}/change-password`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Uploads a new avatar image for the given student.
 *
 * Backend endpoint: POST /api/v1/students/{studentId}/avatar
 *
 * Sends a multipart/form-data body with the image file under the key "file".
 * Note: does NOT use apiFetch because that helper forces Content-Type to
 * application/json. The Authorization header is still forwarded manually.
 *
 * Returns the updated StudentProfileDto (with the new avatarUrl).
 */
export async function uploadAvatar(
  studentId: number,
  file: File,
): Promise<StudentProfileDto> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/students/${studentId}/avatar`, {
    method: "POST",
    headers: {
      ...(localStorage.getItem("auth_token")
        ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
        : {}),
      // No Content-Type header — the browser sets it automatically with the
      // correct multipart boundary when using FormData.
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(
      response.status,
      body || `Upload failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<StudentProfileDto>;
}

// ── Teams ─────────────────────────────────────────────────────────────────────

/**
 * Fetches the summary list of all teams.
 *
 * Backend endpoint: GET /api/v1/teams
 *
 * Returns every team with the fields needed to render the team cards on the
 * Teams list page: member count, captain gamertag, and avatar URL stack.
 * Requires a valid Bearer JWT — forwarded automatically by apiFetch.
 */
export async function getTeams(): Promise<TeamSummaryDto[]> {
  return apiFetch<TeamSummaryDto[]>("/teams");
}

/**
 * Fetches the full detail for a single team, including all member data.
 *
 * Backend endpoint: GET /api/v1/teams/{teamId}
 *
 * The teamId is the stable string slug, e.g. "wolf-cubs".
 * Throws ApiError with status 404 when the slug does not match any team.
 * Requires a valid Bearer JWT — forwarded automatically by apiFetch.
 */
export async function getTeamDetail(teamId: string): Promise<TeamDetailDto> {
  return apiFetch<TeamDetailDto>(`/teams/${encodeURIComponent(teamId)}`);
}

// ── Evidence Submission ───────────────────────────────────────────────────────

/**
 * Fetches the evidence submission history for the given student.
 *
 * Backend endpoint: GET /api/v1/students/{studentId}/evidence
 *
 * Returns all submissions the student has made, ordered by submittedAt
 * descending. Requires a valid Bearer JWT — forwarded automatically by apiFetch.
 */
export async function getEvidenceSubmissions(
  studentId: number,
): Promise<EvidenceSubmissionDto[]> {
  return apiFetch<EvidenceSubmissionDto[]>(`/students/${studentId}/evidence`);
}

/**
 * Posts a new evidence submission for the given student.
 *
 * Backend endpoint: POST /api/v1/students/{studentId}/evidence
 *
 * Sends a multipart/form-data body with three fields: subBadgeId, notes, file.
 * Note: does NOT use apiFetch because that helper forces Content-Type to
 * application/json. The Authorization header is still forwarded manually.
 *
 * Returns the newly created EvidenceSubmissionDto.
 */
export async function submitEvidence(
  studentId: number,
  subBadgeId: number,
  notes: string,
  file: File,
): Promise<EvidenceSubmissionDto> {
  const formData = new FormData();
  formData.append("subBadgeId", String(subBadgeId));
  formData.append("notes", notes);
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/students/${studentId}/evidence`, {
    method: "POST",
    headers: {
      ...(localStorage.getItem("auth_token")
        ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
        : {}),
      // No Content-Type header — the browser sets it automatically with the
      // correct multipart boundary when using FormData.
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(
      response.status,
      body || `Submission failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<EvidenceSubmissionDto>;
}

// ── Forgot credentials ────────────────────────────────────────────────────────

/**
 * Looks up the username associated with the given email address.
 *
 * Backend endpoint: POST /api/v1/auth/forgot-username
 * Body: { email: string }
 *
 * Returns { username } on success.
 * Throws ApiError with status 404 when no account matches the email.
 */
export async function forgotUsername(email: string): Promise<{ username: string }> {
  return apiFetch<{ username: string }>("/auth/forgot-username", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Retrieves the password hint for the given username.
 *
 * Backend endpoint: POST /api/v1/auth/forgot-password
 * Body: { username: string }
 *
 * Returns { hint } on success.
 * Throws ApiError with status 404 when no account matches the username.
 */
export async function forgotPassword(username: string): Promise<{ hint: string }> {
  return apiFetch<{ hint: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

// ── Admin Badge Management ────────────────────────────────────────────────────

/**
 * Fetches the admin badge catalogue with per-badge leaderboards.
 *
 * Backend endpoint: GET /api/v1/admin/badges
 *
 * Requires ROLE_ADMIN.
 */
export async function getAdminBadgeCatalogue(): Promise<AdminBadgeCatalogueDto> {
  return apiFetch<AdminBadgeCatalogueDto>("/admin/badges");
}

/**
 * Updates the badge level thresholds.
 *
 * Backend endpoint: PUT /api/v1/admin/badge-levels
 *
 * Requires ROLE_ADMIN.
 */
export async function updateBadgeLevels(
  levels: BadgeLevelDto[],
): Promise<BadgeLevelDto[]> {
  return apiFetch<BadgeLevelDto[]>("/admin/badge-levels", {
    method: "PUT",
    body: JSON.stringify(levels),
  });
}

// ── Admin Module Management ───────────────────────────────────────────────────

/**
 * Fetches all modules for the admin view.
 *
 * Backend endpoint: GET /api/v1/admin/modules
 *
 * Requires ROLE_ADMIN.
 */
export async function getAdminModules(): Promise<AdminModuleDto[]> {
  return apiFetch<AdminModuleDto[]>("/admin/modules");
}

/**
 * Creates a new module.
 *
 * Backend endpoint: POST /api/v1/admin/modules
 *
 * Requires ROLE_ADMIN.
 */
export async function createAdminModule(
  module: Omit<AdminModuleDto, "id" | "subBadges" | "groupsUsingIt" | "sessions">,
): Promise<AdminModuleDto> {
  return apiFetch<AdminModuleDto>("/admin/modules", {
    method: "POST",
    body: JSON.stringify(module),
  });
}

/**
 * Updates an existing module.
 *
 * Backend endpoint: PUT /api/v1/admin/modules/{moduleId}
 *
 * Requires ROLE_ADMIN.
 */
export async function updateAdminModule(
  moduleId: number,
  updates: Partial<Pick<AdminModuleDto, "name" | "game" | "outcome" | "durationWeeks" | "status">>,
): Promise<AdminModuleDto> {
  return apiFetch<AdminModuleDto>(`/admin/modules/${moduleId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * Archives a module (sets status to "Archived").
 *
 * Backend endpoint: DELETE /api/v1/admin/modules/{moduleId}
 *
 * Requires ROLE_ADMIN.
 */
export async function archiveAdminModule(
  moduleId: number,
): Promise<AdminModuleDto> {
  return apiFetch<AdminModuleDto>(`/admin/modules/${moduleId}`, {
    method: "DELETE",
  });
}

/**
 * Adds a sub-badge to a module.
 *
 * Backend endpoint: POST /api/v1/admin/modules/{moduleId}/sub-badges
 *
 * Requires ROLE_ADMIN.
 */
export async function addSubBadge(
  moduleId: number,
  subBadge: Omit<AdminSubBadgeDto, "id">,
): Promise<AdminSubBadgeDto> {
  return apiFetch<AdminSubBadgeDto>(`/admin/modules/${moduleId}/sub-badges`, {
    method: "POST",
    body: JSON.stringify(subBadge),
  });
}

/**
 * Updates a sub-badge within a module.
 *
 * Backend endpoint: PUT /api/v1/admin/modules/{moduleId}/sub-badges/{subBadgeId}
 *
 * Requires ROLE_ADMIN.
 */
export async function updateSubBadge(
  moduleId: number,
  subBadgeId: number,
  updates: Partial<Omit<AdminSubBadgeDto, "id">>,
): Promise<AdminSubBadgeDto> {
  return apiFetch<AdminSubBadgeDto>(`/admin/modules/${moduleId}/sub-badges/${subBadgeId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

/**
 * Removes a sub-badge from a module.
 *
 * Backend endpoint: DELETE /api/v1/admin/modules/{moduleId}/sub-badges/{subBadgeId}
 *
 * Requires ROLE_ADMIN.
 */
export async function removeSubBadge(
  moduleId: number,
  subBadgeId: number,
): Promise<void> {
  return apiFetch<void>(`/admin/modules/${moduleId}/sub-badges/${subBadgeId}`, {
    method: "DELETE",
  });
}

/**
 * Reorders sub-badges within a module.
 *
 * Backend endpoint: PUT /api/v1/admin/modules/{moduleId}/sub-badges/reorder
 *
 * Requires ROLE_ADMIN.
 */
export async function reorderSubBadges(
  moduleId: number,
  orderedIds: number[],
): Promise<AdminSubBadgeDto[]> {
  return apiFetch<AdminSubBadgeDto[]>(`/admin/modules/${moduleId}/sub-badges/reorder`, {
    method: "PUT",
    body: JSON.stringify({ orderedIds }),
  });
}

// ── Admin Session Management ──────────────────────────────────────────────────

/**
 * Adds a session to a module.
 *
 * Backend endpoint: POST /api/v1/admin/modules/{moduleId}/sessions
 *
 * Requires ROLE_ADMIN.
 */
export async function addSession(
  moduleId: number,
  data: Omit<AdminSessionDto, "id" | "resources">,
): Promise<AdminSessionDto> {
  return apiFetch<AdminSessionDto>(`/admin/modules/${moduleId}/sessions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Updates a session within a module.
 *
 * Backend endpoint: PUT /api/v1/admin/modules/{moduleId}/sessions/{sessionId}
 *
 * Requires ROLE_ADMIN.
 */
export async function updateSession(
  moduleId: number,
  sessionId: number,
  data: Omit<AdminSessionDto, "id" | "resources">,
): Promise<AdminSessionDto> {
  return apiFetch<AdminSessionDto>(`/admin/modules/${moduleId}/sessions/${sessionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Removes a session from a module.
 *
 * Backend endpoint: DELETE /api/v1/admin/modules/{moduleId}/sessions/{sessionId}
 *
 * Requires ROLE_ADMIN.
 */
export async function removeSession(
  moduleId: number,
  sessionId: number,
): Promise<void> {
  return apiFetch<void>(`/admin/modules/${moduleId}/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

// ── Admin Resource Management ─────────────────────────────────────────────────

/**
 * Uploads a resource file to a session.
 *
 * Backend endpoint: POST /api/v1/admin/modules/{moduleId}/sessions/{sessionId}/resources
 *
 * Sends a multipart/form-data body with the file under key "file".
 * Requires ROLE_ADMIN.
 */
export async function uploadResource(
  moduleId: number,
  sessionId: number,
  file: File,
): Promise<AdminResourceDto> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/admin/modules/${moduleId}/sessions/${sessionId}/resources`, {
    method: "POST",
    headers: {
      ...(localStorage.getItem("auth_token")
        ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
        : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(
      response.status,
      body || `Upload failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<AdminResourceDto>;
}

/**
 * Removes a resource from a session.
 *
 * Backend endpoint: DELETE /api/v1/admin/modules/{moduleId}/sessions/{sessionId}/resources/{resourceId}
 *
 * Requires ROLE_ADMIN.
 */
export async function removeResource(
  moduleId: number,
  sessionId: number,
  resourceId: number,
): Promise<void> {
  return apiFetch<void>(`/admin/modules/${moduleId}/sessions/${sessionId}/resources/${resourceId}`, {
    method: "DELETE",
  });
}

// ── Admin User Management ─────────────────────────────────────────────────────

/**
 * Fetches all student users.
 *
 * Backend endpoint: GET /api/v1/admin/users
 *
 * Requires ROLE_ADMIN.
 */
export async function getAdminUsers(): Promise<AdminUserDto[]> {
  return apiFetch<AdminUserDto[]>("/admin/users");
}

/**
 * Creates a new student user.
 *
 * Backend endpoint: POST /api/v1/admin/users
 *
 * Requires ROLE_ADMIN.
 */
export async function createUser(data: CreateUserRequestDto): Promise<AdminUserDto> {
  return apiFetch<AdminUserDto>("/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Admin Group Management ────────────────────────────────────────────────────

export async function getAdminGroups(): Promise<AdminGroupDto[]> {
  return apiFetch<AdminGroupDto[]>("/admin/groups");
}

export async function createAdminGroup(
  data: { name: string; hub: string; game: AdminGroupGame; groupType: AdminGroupType },
): Promise<AdminGroupDto> {
  return apiFetch<AdminGroupDto>("/admin/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminGroup(
  groupId: string,
  data: { name: string; hub: string; game: AdminGroupGame; groupType: AdminGroupType },
): Promise<AdminGroupDto> {
  return apiFetch<AdminGroupDto>(`/admin/groups/${groupId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminGroup(groupId: string): Promise<void> {
  return apiFetch<void>(`/admin/groups/${groupId}`, { method: "DELETE" });
}

export async function assignModuleToGroup(
  groupId: string,
  moduleId: number,
): Promise<AdminGroupDto> {
  return apiFetch<AdminGroupDto>(`/admin/groups/${groupId}/modules/${moduleId}`, { method: "POST" });
}

export async function unassignModuleFromGroup(
  groupId: string,
  moduleId: number,
): Promise<AdminGroupDto> {
  return apiFetch<AdminGroupDto>(`/admin/groups/${groupId}/modules/${moduleId}`, { method: "DELETE" });
}

// ── Admin Recent Activity ─────────────────────────────────────────────────────

export async function getAdminRecentActivities(): Promise<AdminRecentActivityDto[]> {
  return apiFetch<AdminRecentActivityDto[]>("/admin/activity");
}

