# Student Profile Page — TODO

This file tracks work for the student profile views and their backend integration.

- Main private profile: `src/components/portal/student/StudentProfile.tsx`
- Public profile: `src/components/portal/student/StudentPublicProfile.tsx`

---

## A. UX & Layout (already mostly done)

These are largely implemented and listed here only for historical context:

- [x] Display avatar, display name, and username on the profile hero
- [x] Show current level and XP progress bar toward next level
- [x] List main badges and sub-badges with progress and earned/locked states
- [x] Show XP reward for each sub-badge
- [x] Collapse/expand sections for main badges and modules
- [x] Link XP history to "Recent Activity" on the dashboard

---

<<<<<<< HEAD
## 6. Profile Editing
- [x] Editable display name field
- [x] Avatar/profile picture upload or picker
- [x] Save / Cancel flow with client-side validation
- [x] Success/error feedback on save

## 7. XP History Feed
- 7a [x] Chronological list of XP-earning events
- 7b [x] Each entry: activity name, `+XP` amount, and date
- 7c [x] Pagination or "load more" for long histories

## 8. Routing & Navigation
- [x] 8a Register `/portal/student/profile` route in the student portal router
- [x] Link to profile page from the student navbar/sidebar
- [x] Active state on the nav link when on the profile page
=======
## B. Backend Integration — Private Student Profile (`StudentProfile.tsx`)

> Goal: no hardcoded data; all profile, badge, module, and XP history data comes from the Java Spring Boot backend.

### B1. Current student identity
>>>>>>> origin/main

- [x] Expose `currentStudentId` (and username if needed) from the auth layer (e.g. decode JWT into `AuthContext`).
- [x] Ensure `StudentProfile` can read the current student ID via context/hooks.

### B2. Replace local `STUDENT` object

- [x] Remove the hardcoded `STUDENT` constant from `StudentProfile.tsx`.
- [x] Use a backend DTO for hero + core stats, e.g. `DashboardSummaryDto` from `getDashboardSummary(studentId)`.
- [x] Map hero fields to live data:
	- [x] `gamertag`, `name`, `avatarUrl` (with fallback to `DEFAULT_AVATAR_URL`).
	- [x] `level`, `xp`, `xpForNextLevel`.
	- [x] Rank / leaderboard position (from `leaderboardRank` or an added field on the DTO).

### B3. Live badge and module data

- [x] Remove imports of `MAIN_BADGE_DEFINITIONS`, `MODULES`, and `XP_HISTORY` from `studentData`.
- [x] Badges tab:
	- [x] Fetch `BadgeCatalogueDto` via `getBadgeCatalogue(studentId)`.
	- [x] Drive main badge cards from `BadgeCatalogueDto.badges: MainBadgeDetailDto[]`.
	- [x] Use `SubBadgeDetailDto` for sub-badge rows (already typed in `api/types.ts`).
- [x] Modules tab:
	- [x] Define/confirm a backend DTO for module progress (e.g. `ModuleProgressDto[]`).
	- [x] Add `getModuleProgress(studentId)` to `studentApi.ts` and matching types.
	- [x] Replace `MODULES` usage with live module progress from the backend.
- [x] XP history tab:
	- [x] Use `XpEventDto[]` either from `DashboardSummaryDto.recentActivity` or a dedicated `/xp-history` endpoint.
	- [x] Implement client-side pagination or "load more" on the returned list.

### B4. Badge level thresholds (remove `LOCAL_BADGE_LEVELS`)

- [x] Remove `LOCAL_BADGE_LEVELS` and `resolveLevel` from `StudentProfile.tsx`.
- [x] Use `BadgeCatalogueDto.badgeLevels: BadgeLevelDto[]` from `getBadgeCatalogue` as the source of truth.
- [x] Implement a reusable helper (e.g. `resolveBadgeLevel(xp, badgeLevels)`) in a shared utils file.
- [x] Update per-badge XP bars and level chips to use backend-provided thresholds, colours, and icons.

### B5. Editable profile fields

- [ ] Use `useStudentProfile(studentId)` where appropriate (mainly in Settings) to edit `username`, `gamertag`, `bio`, and `avatarUrl` via:
	- [ ] `GET /students/{studentId}/profile` → `getStudentProfile`.
	- [ ] `PATCH /students/{studentId}/profile` → `updateStudentProfile`.
	- [ ] `POST /students/{studentId}/avatar` → `uploadAvatar`.
- [ ] Ensure changes propagate to `StudentProfile` (refresh or shared state invalidation).

### B6. Loading & error states

- [x] Add loading states for each data source (dashboard, badges, modules, XP history).
- [x] Surface human-readable error messages using the `ApiError` conventions.
- [x] Handle empty states: no badges, no modules, no XP history.

---

## C. Backend Integration — Public Profile (`StudentPublicProfile.tsx`)

> Goal: show public profile data without relying on `TEAM_MEMBERS` or `TEAMS`; use dedicated public endpoints.

### C1. Replace mock player/team data

- [x] Remove imports of `TEAM_MEMBERS` and `TEAMS` from `studentData`.
- [x] Design a `PublicPlayerProfileDto` in the backend and mirror it in `src/api/types.ts` with fields such as:
	- `gamertag`, `realName`, `username`, `bio`, `joinedDate`.
	- `level`, `totalXP`, `avatarUrl`.
	- `team` / `hub` info and `isCaptain`.
	- `moduleProgress[]` summary for the module list.
- [ ] Implement `GET /api/v1/students/by-username/{username}/public-profile` in Spring Boot.
- [x] Add `getPublicPlayerProfile(username)` to `studentApi.ts`.
- [x] Create `usePublicPlayerProfile(username)` hook with loading/error state handling.
- [x] Replace all `member` and `team` references with data from `usePublicPlayerProfile`.

### C2. Leaderboard rank

- [x] Stop deriving `rank` by sorting local `TEAM_MEMBERS`.
- [x] Expose global rank from the backend, either:
	- As a `globalRank` field on `PublicPlayerProfileDto`, or
	- Via a filtered leaderboard endpoint (e.g. `GET /leaderboard?username={username}`).
- [x] Update the rank circle in the hero to use the backend-provided rank.

### C3. Badge summary

- [ ] Confirm `GET /students/by-username/{username}/badges/summary` returns `PublicBadgeSummaryDto` with `badges: MainBadgeSummaryDto[]`.
- [x] Ensure `usePublicBadgeSummary(username)` remains the single source of badge summary data.
- [x] Handle empty results (new player) and error states gracefully.

### C4. Public module progress

- [x] Decide which module fields are safe to expose on public profiles.
- [x] Add a public-friendly `moduleProgress[]` to `PublicPlayerProfileDto`.
- [x] Wire the "Module Progress" section to this backend data (instead of `member.moduleProgress` from mocks).

### C5. Not-found and error handling

- [x] For unknown usernames, return 404 from the backend and map this to a "Player not found" UI (no reliance on mock arrays).
- [x] Add a generic error state for network/server failures distinct from "not found".

---

## D. Clean-up & Validation

- [x] Remove or clearly mark `src/data/studentData.ts` as mock data only, and eliminate its use from profile-related components.
- [ ] Run the app and manually verify both:
	- [ ] Private profile (logged-in student) shows correct live data.
	- [ ] Public profile (`/players/:username` or equivalent) shows correct live data.
- [x] Add/update docs (e.g. a short section in `DEPENDENCIES.md` or `docs/`) describing the profile-related backend endpoints and DTOs.
