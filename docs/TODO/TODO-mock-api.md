# TODO — Mock API Layer for Frontend-Only Development

> **Goal:** Allow the full student portal to be tested visually without a running
> backend. Controlled by a single env flag (`VITE_USE_MOCK=true`). Zero impact on
> production builds — Vite tree-shakes the mock code away when the flag is absent.

---

## Overview of files to create / edit

| # | Action | File |
|---|--------|------|
| 1 | **Create** | `src/api/mockData.ts` |
| 2 | **Create** | `src/api/mockApi.ts` |
| 3 | **Create** | `src/api/index.ts` |
| 4 | **Edit** × 11 | All hooks — swap `studentApi` import → `../api/index` |
| 5 | **Edit** × 3 | Components that import `studentApi` directly |
| 6 | **Edit** × 1 | `AuthContext.tsx` — swap `studentApi` import → `../api/index` |
| 7 | **Create** | `.env.mock` |
| 8 | **Edit** | `package.json` — add `dev:mock` script |

---

## Step 1 — Create `src/api/mockData.ts`

Build typed mock responses for every DTO used in the portal.
Re-use the rich data already in `src/data/studentData.ts` where possible.

### 1A — `MOCK_DASHBOARD` (`DashboardSummaryDto`)

- [x] 1A-i   Identity & XP block — set `studentId`, `gamertag`, `name`, `avatarUrl`,
             `level`, `xp`, `xpForNextLevel`
- [x] 1A-ii  Weekly stats & counts — set `weeklyXp`, `teamWeeklyXp`, `hubWeeklyXp`,
             `totalSubBadges`, `earnedSubBadges`, `leaderboardRank`, `nextSessionAt`
- [x] 1A-iii Badge summaries (`badges: MainBadgeSummaryDto[]`) — one object per main
             badge (`id`, `icon`, `name`, `xpEarned`, `levelName`, `levelLabel`,
             `levelColor`, `levelIcon`, `subBadgesEarned`, `subBadgesTotal`)
- [x] 1A-iv  Recent activity (`recentActivity: XpEventDto[]`) — 5 entries reusing
             data from `studentData.ts` (`id`, `activity`, `xp`, `date`, `icon`)

### 1B — `MOCK_LEADERBOARD` (`LeaderboardResponseDto`)

- [x] 1B-i   Response metadata — set `period`, `totalCount`, `currentUserUsername`
             (match a player in the list so the "You" row highlights),
             `currentUserCentreName`
- [x] 1B-ii  Players tab (`players: LeaderboardPlayerDto[]`, ≥ 10 rows) — each row
             needs `rank`, `studentId`, `name`, `username`, `level`, `periodXp`,
             `completedModules`, `badgesCompleted`, `centre`, `avatarUrl`,
             `badgeIcons[]`
- [x] 1B-iii Centres tab (`centres: LeaderboardCentreDto[]`, ≥ 5 rows) — each row
             needs `rank`, `name`, `icon`, `memberCount`, `periodXp`,
             `totalBadges`, `totalModules`, `topPlayerName`

### 1C — `MOCK_BADGE_CATALOGUE` (`BadgeCatalogueDto`)

- [x] 1C-i   Badge levels (`badgeLevels: BadgeLevelDto[]`) — 4 entries
             Bronze → Silver → Gold → Platinum, each with `name`, `label`,
             `minXP`, `maxXP`, `color`, `icon`
- [x] 1C-ii  Main badge definitions (`badges: MainBadgeDetailDto[]`) — 5 entries,
             each with `id`, `icon`, `name`, `tagline`, `description`, `xpEarned`
- [x] 1C-iii Sub-badges (`subBadges: SubBadgeDetailDto[]`) nested inside each main
             badge — include `id`, `icon`, `name`, `shortDesc`, `criteria`,
             `xpReward`, `type`, `skills[]`, `earned`, `earnedDate`; ensure a
             mix of `earned: true` and `earned: false` across all 5 badges

### 1D — `MOCK_MODULES` (`ModuleProgressDto[]`)

- [x] 1D-i   Module shells — 3 `ModuleProgressDto` objects with `id`, `icon`,
             `name`, `outcome`, `durationWeeks`; reuse names from `studentData.ts`
- [x] 1D-ii  Sub-badges per module (`subBadges: ModuleSubBadgeDto[]`) — each entry
             needs `id`, `icon`, `name`, `desc`, `xpReward`, `mainBadgeId`,
             `earned`, `earnedDate`; mix earned/unearned within each module

### 1E — `MOCK_STUDENT_PROFILE` (`StudentProfileDto`)

- [x] 1E     Single object — `studentId`, `username`, `gamertag`, `bio`,
             `avatarUrl` (use a placeholder URL or `null`)

### 1F — `MOCK_TEAMS` (`TeamSummaryDto[]`)

- [x] 1F-i   Team shells — 3–4 `TeamSummaryDto` objects with `id`, `name`, `icon`,
             `colour`, `hub`, `founded`, `description`, `game`, `memberCount`,
             `captainGamertag`
- [x] 1F-ii  Avatar stacks — populate `memberAvatarUrls[]` for each team
             (4–5 placeholder URLs or empty strings)

### 1G — `MOCK_TEAM_DETAIL` (`TeamDetailDto`)

- [x] 1G-i   Team header — one `TeamDetailDto` for slug `"wolf-cubs"` with `id`,
             `name`, `icon`, `colour`, `hub`, `founded`, `description`, `game`
- [x] 1G-ii  Members (`members: TeamMemberDto[]`, 4–5 entries) — each with
             `studentId`, `gamertag`, `realName`, `username`, `teamId`,
             `joinedDate`, `avatarUrl`, `isCaptain`, `level`, `totalXP`;
             mark exactly one member as captain
- [x] 1G-iii Badge progress per member (`badgeProgress: TeamMemberBadgeProgressDto[]`)
             — 5 entries per member (`mainBadgeId`, `mainBadgeName`, `mainBadgeIcon`,
             `xpEarned`, `subBadgesEarned`, `subBadgesTotal`, `levelName`,
             `levelLabel`, `levelColor`, `levelIcon`)
- [x] 1G-iv  Module progress per member (`moduleProgress: TeamMemberModuleProgressDto[]`)
             — 1–2 entries per member (`moduleId`, `moduleName`, `moduleIcon`,
             `sessionsCompleted`, `sessionsTotal`)

### 1H — `MOCK_EVIDENCE_SUBMISSIONS` (`EvidenceSubmissionDto[]`)

- [x] 1H     4–5 entries covering all three statuses — at least one `"pending"`,
             one `"approved"`, one `"rejected"`; each with `id`, `badgeName`,
             `subBadgeName`, `subBadgeIcon`, `fileName`, `notes`, `submittedAt`,
             `status`
### 1I — `MOCK_PUBLIC_BADGE_SUMMARY` (`PublicBadgeSummaryDto`)

- [x] 1I     Single object — `badges: MainBadgeSummaryDto[]` with 5 entries;
             can reuse the same objects built in **1A-iii**

### 1J — `MOCK_PUBLIC_PLAYER_PROFILE` (`PublicPlayerProfileDto`)

- [x] 1J-i   Identity & stats — `username`, `gamertag`, `realName`, `bio`,
             `joinedDate`, `level`, `totalXP`, `avatarUrl`, `globalRank`
- [x] 1J-ii  Team fields — `teamName`, `teamIcon`, `teamId`, `teamColour`, `hub`,
             `isCaptain`
- [x] 1J-iii Module progress (`moduleProgress: PublicModuleProgressDto[]`) — 2–3
             entries, each with `moduleId`, `moduleName`, `moduleIcon`,
             `sessionsCompleted`, `sessionsTotal`

### 1K — `MOCK_LOGIN_RESPONSE` (`LoginResponseDto`)

- [x] 1K     Craft a JWT-shaped token string — base64url-encode a minimal header
             (`{ "alg": "none" }`) and payload
             (`{ "sub": "alex_gamer", "studentId": 1, "role": "ROLE_STUDENT", "playerUsername": "@alex_gamer" }`);
             append a dummy signature segment so the shape is `xxxxx.yyyyy.zzzzz`

---

## Step 2 — Create `src/api/mockApi.ts`

Mirror every exported function from `studentApi.ts`, returning mock data after a
short simulated delay (`await new Promise(r => setTimeout(r, 400))`).

### 2A — Boilerplate & helper

- [x] 2A-i   Create the file `src/api/mockApi.ts` and import all mock fixtures
             from `./mockData`
- [x] 2A-ii  Define a `delay()` helper:
             `const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));`

### 2B — Auth functions

- [x] 2B-i   `authLogin()` — call `delay()`, then resolve with `MOCK_LOGIN_RESPONSE`
             (ignore the credentials argument entirely)
- [x] 2B-ii  `authLogout()` — resolve immediately with `undefined` (no delay needed)
- [x] 2B-iii `forgotUsername()` — call `delay()`, resolve with
             `{ username: "alex_gamer" }`
- [x] 2B-iv  `forgotPassword()` — call `delay()`, resolve with
             `{ hint: "Your first pet's name" }`

### 2C — Dashboard & catalogue functions

- [x] 2C-i   `getDashboardSummary()` — call `delay()`, resolve with `MOCK_DASHBOARD`
- [x] 2C-ii  `getBadgeCatalogue()` — call `delay()`, resolve with
             `MOCK_BADGE_CATALOGUE`
- [x] 2C-iii `getModuleProgress()` — call `delay()`, resolve with `MOCK_MODULES`

### 2D — Leaderboard function

- [x] 2D     `getLeaderboard()` — call `delay()`, resolve with `MOCK_LEADERBOARD`
             (accept and ignore the sort/filter arguments)

### 2E — Student profile functions

- [x] 2E-i   `getStudentProfile()` — call `delay()`, resolve with
             `MOCK_STUDENT_PROFILE`
- [x] 2E-ii  `updateStudentProfile(body)` — call `delay()`, merge `body` into
             `MOCK_STUDENT_PROFILE` with `Object.assign`, resolve with the
             updated object so the UI reflects the change immediately
- [x] 2E-iii `changePassword()` — call `delay()`, resolve with `undefined`
- [x] 2E-iv  `uploadAvatar()` — call `delay()`, resolve with `MOCK_STUDENT_PROFILE`
             unchanged *(optionally set `avatarUrl` to a placeholder data-URI
             to make the avatar swap visible)*

### 2F — Teams functions

- [x] 2F-i   `getTeams()` — call `delay()`, resolve with `MOCK_TEAMS`
- [x] 2F-ii  `getTeamDetail(slug)` — call `delay()`, resolve with `MOCK_TEAM_DETAIL`
             regardless of the `slug` value

### 2G — Evidence functions

- [x] 2G-i   `getEvidenceSubmissions()` — call `delay()`, resolve with
             `MOCK_EVIDENCE_SUBMISSIONS`
- [x] 2G-ii  `submitEvidence(body)` — build a new `EvidenceSubmissionDto` with
             `status: "pending"` and a generated `id`, push it onto
             `MOCK_EVIDENCE_SUBMISSIONS`, call `delay()`, resolve with the
             new entry

### 2H — Public profile functions

- [x] 2H-i   `getPublicBadgeSummary()` — call `delay()`, resolve with
             `MOCK_PUBLIC_BADGE_SUMMARY`
- [x] 2H-ii  `getPublicPlayerProfile()` — call `delay()`, resolve with
             `MOCK_PUBLIC_PLAYER_PROFILE`

### 2I — Re-exports

- [x] 2I     Re-export `ApiError` and `LeaderboardSortKey` from `./studentApi`
             so any file that imports them from `../api/index` still compiles
             without changes

---

## Step 3 — Create `src/api/index.ts`

Single shim that switches between real and mock implementations at build time.

- [x] 3A     Create the file `src/api/index.ts`
- [x] 3B     Read `import.meta.env.VITE_USE_MOCK` and conditionally re-export:
             if truthy → `export * from "./mockApi"`, otherwise → `export * from "./studentApi"`
- [x] 3C     Verify TypeScript is happy with the conditional export (use `// @ts-ignore`
             on the unreachable branch or a Vite plugin alias if the ternary
             syntax raises a type error)

```ts
// src/api/index.ts
export * from import.meta.env.VITE_USE_MOCK ? "./mockApi" : "./studentApi";
```
> Note: Vite resolves the conditional at build time, so the unused branch is
> fully tree-shaken in production. If the ternary syntax causes a TypeScript
> issue with your tsconfig, use an `if/else` with two `export *` blocks guarded
> by `// @ts-ignore` on the unreachable branch, or use a Vite plugin alias.

---

## Step 4 — Update all hook imports (11 files)

Change every `from "../api/studentApi"` → `from "../api/index"` in:

- [x] 4A     `src/hooks/useDashboard.ts`
- [x] 4B     `src/hooks/useLeaderboard.ts` *(also update the `LeaderboardSortKey` type import)*
- [x] 4C     `src/hooks/useBadgeCatalogue.ts`
- [x] 4D     `src/hooks/useModuleProgress.ts`
- [x] 4E     `src/hooks/useStudentProfile.ts`
- [x] 4F     `src/hooks/useTeams.ts`
- [x] 4G     `src/hooks/useTeamDetail.ts`
- [x] 4H     `src/hooks/useEvidenceSubmissions.ts`
- [x] 4I     `src/hooks/usePublicBadgeSummary.ts`
- [x] 4J     `src/hooks/usePublicPlayerProfile.ts`

---

## Step 5 — Update component direct imports (3 files)

Change every `from "../../../api/studentApi"` → `from "../../../api/index"` in:

- [x] 5A     `src/components/portal/student/StudentSettings.tsx`
             *(imports `updateStudentProfile`, `changePassword`, `uploadAvatar`, `ApiError`)*
- [x] 5B     `src/components/portal/student/StudentLeaderboard.tsx`
             *(imports `LeaderboardSortKey` type)*
- [x] 5C     `src/components/portal/student/EvidenceSubmission.tsx`
             *(imports `submitEvidence`)*

---

## Step 6 — Update `AuthContext.tsx`

- [x] 6A     Open `src/context/AuthContext.tsx`
- [x] 6B     Change `from "../api/studentApi"` → `from "../api/index"` for the
             `authLogin`, `authLogout`, `forgotUsername`, `forgotPassword` imports
- [x] 6C     Confirm no other `studentApi` references remain in the file

---

## Step 7 — Create `.env.mock`

- [x] 7A     Create `.env.mock` at the repo root containing:
             ```
             VITE_USE_MOCK=true
             ```
- [x] 7B     Decide whether to commit the file or add it to `.gitignore`
             (it contains no secrets, so committing is fine as a developer
             convenience)
- [x] 7C     Confirm Vite picks it up: the filename must be `.env.mock` so that
             `vite --mode mock` loads it automatically

---

## Step 8 — Add `dev:mock` script to `package.json`

- [x] 8A     Open `package.json` and locate the `"scripts"` block
- [x] 8B     Add the new script entry:
             ```json
             "dev:mock": "vite --mode mock"
             ```
- [x] 8C     Verify `npm run dev:mock` starts the dev server and loads `.env.mock`
             (check the terminal output for `VITE_USE_MOCK=true`)

  Vite's `--mode mock` flag makes it load `.env.mock` automatically, which sets
  `VITE_USE_MOCK=true` for that process only.

---

## Verification checklist

Once all steps are complete, run `npm run dev:mock` and confirm:

- [ ] Login page accepts any credentials and lands on the student dashboard
- [ ] Dashboard renders with XP bar, stat cards, badge hex row, and activity feed
- [ ] Badge Catalogue page renders all 5 main badges with sub-badge cards
- [ ] Module Progress page renders 3 modules with earned/unearned sub-badges
- [ ] Leaderboard renders player rows with the "You" row highlighted
- [ ] Teams list renders team cards with member avatar stacks
- [ ] Team Detail page renders members with badge and module progress
- [ ] Evidence Submission page renders submission history with all 3 statuses
- [ ] Student Settings page pre-fills profile fields and accepts edits
- [ ] Public Player Profile page (`/players/:username`) renders without auth
- [ ] `npm run dev` (without mock flag) behaves exactly as before — no regressions
- [ ] `npm run build` succeeds and produces no references to mock data in the bundle
