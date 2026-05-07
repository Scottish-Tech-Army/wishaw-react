# TODO — Student Teams & Team Detail: Backend Integration

> **Status:** All team and member data is currently hardcoded in `src/data/studentData.ts`
> (`TEAMS`, `TEAM_MEMBERS`). No component may import new data from that file.
> This checklist tracks every step needed to remove the hardcoded data and wire
> both `StudentTeams.tsx` and `StudentTeamDetail.tsx` to the Java Spring Boot backend.

---

## 1. Define API DTOs in `src/api/types.ts`

Add the following TypeScript interfaces that mirror the Java backend DTOs.
Field names must be **camelCase** (Jackson's `LOWER_CAMEL_CASE` strategy).

- [x] **`TeamSummaryDto`** — used by the Teams list page (`GET /api/v1/teams`)
  ```ts
  interface TeamSummaryDto {
    id: string;           // stable slug, e.g. "wolf-cubs"
    name: string;
    icon: string;         // emoji
    colour: string;       // CSS hex, e.g. "#4f8ef7"
    hub: string;          // centre name
    founded: string;      // display string, e.g. "2024"
    description: string;
    game: string;
    memberCount: number;
    captainGamertag: string | null;
    memberAvatarUrls: string[]; // first 4+ for the avatar stack
  }
  ```

- [x] **`TeamMemberBadgeProgressDto`** — nested inside `TeamMemberDto`
  ```ts
  interface TeamMemberBadgeProgressDto {
    mainBadgeId: string;
    mainBadgeName: string;
    mainBadgeIcon: string;
    xpEarned: number;
    subBadgesEarned: number;
    subBadgesTotal: number;
  }
  ```

- [x] **`TeamMemberModuleProgressDto`** — nested inside `TeamMemberDto`
  ```ts
  interface TeamMemberModuleProgressDto {
    moduleId: number;
    moduleName: string;
    moduleIcon: string;
    sessionsCompleted: number;
    sessionsTotal: number;
  }
  ```

- [x] **`TeamMemberDto`** — a single member card on the Team Detail page
  ```ts
  interface TeamMemberDto {
    studentId: number;
    gamertag: string;
    realName: string;
    username: string;          // includes @ prefix
    teamId: string;
    joinedDate: string;        // display string, e.g. "Sep 2024"
    avatarUrl: string | null;  // fall back to DEFAULT_AVATAR_URL
    isCaptain: boolean;
    level: number;
    totalXP: number;
    badgeProgress: TeamMemberBadgeProgressDto[];
    moduleProgress: TeamMemberModuleProgressDto[];
  }
  ```

- [x] **`TeamDetailDto`** — full payload for Team Detail page (`GET /api/v1/teams/{teamId}`)
  ```ts
  interface TeamDetailDto {
    id: string;
    name: string;
    icon: string;
    colour: string;
    hub: string;
    founded: string;
    description: string;
    game: string;
    members: TeamMemberDto[];  // sorted by backend: captain first, then XP desc
  }
  ```

---

## 2. Add API functions to `src/api/studentApi.ts`

- [x] **`getTeams()`** — fetches the full teams list for the Teams page
  ```ts
  // Backend endpoint: GET /api/v1/teams
  // Auth: Bearer JWT required (student or admin role)
  export async function getTeams(): Promise<TeamSummaryDto[]>
  ```

- [x] **`getTeamDetail(teamId: string)`** — fetches one team with all member data
  ```ts
  // Backend endpoint: GET /api/v1/teams/{teamId}
  // Auth: Bearer JWT required
  // Throws ApiError 404 when the teamId slug does not exist
  export async function getTeamDetail(teamId: string): Promise<TeamDetailDto>
  ```

  > Note: both functions must use the shared `apiFetch` helper so the JWT
  > `Authorization` header is forwarded automatically, consistent with all other
  > API calls in this file.

---

## 3. Create custom hooks in `src/hooks/`

Follow the same pattern as `useLeaderboard.ts` and `useStudentProfile.ts`.

- [x] **`src/hooks/useTeams.ts`**
  - State shape: `{ data: TeamSummaryDto[] | null; loading: boolean; error: string | null; refresh: () => void }`
  - Calls `getTeams()` on mount; sets cancellation flag on cleanup.
  - Error handling:
    - 401 / 403 → `"Session expired. Please log in again."`
    - other `ApiError` → `"Server error (${status}). Please try again later."`
    - network failure → `"Could not connect to the server. Check your network connection."`

- [x] **`src/hooks/useTeamDetail.ts`**
  - Accepts `teamId: string | undefined`.
  - Guards against undefined (same pattern as `useStudentProfile` guards against `null`).
  - State shape: `{ data: TeamDetailDto | null; loading: boolean; error: string | null; refresh: () => void }`
  - Additional error case: 404 → `"Team not found."`

---

## 4. Migrate `StudentTeams.tsx`

- [x] Remove the import of `TEAMS` and `TEAM_MEMBERS` from `../../../data/studentData`.
- [x] Call `useTeams()` to obtain `{ data: teams, loading, error }`.
- [x] **Loading state:** Render a placeholder grid of skeleton cards (match the
  `.sp-team-card` layout) while `loading === true`. Reuse the skeleton pattern
  used elsewhere in the portal (check `StudentLeaderboard.tsx` or
  `StudentDashboard.tsx` for reference).
- [x] **Error state:** Show an inline error message with a retry button that calls
  `refresh()` when `error !== null`.
- [x] **Empty state:** Show a friendly message if `teams` is an empty array.
- [x] Replace derived values that were computed from `TEAM_MEMBERS` with fields
  from `TeamSummaryDto`:
  - `members.length` → `team.memberCount`
  - `members.slice(0, 4).map(m => m.avatar)` → `team.memberAvatarUrls` (already pre-sliced or slice client-side)
  - `captain?.gamertag` → `team.captainGamertag`
  - The `+N` overflow badge: compute from `memberCount` and `memberAvatarUrls.length`
- [x] Fall back to `DEFAULT_AVATAR_URL` (from `src/constants.ts`) for any
  `avatarUrl` that is `null` in `memberAvatarUrls`.

---

## 5. Migrate `StudentTeamDetail.tsx`

- [x] Remove the imports of `TEAMS`, `TEAM_MEMBERS`, and `type TeamMember` from
  `../../../data/studentData`.
- [x] Replace `useParams` + array look-up with `useTeamDetail(teamId)`.
- [x] Remove the `LOCAL_BADGE_LEVELS` constant and `resolveLevel()` helper.
  Badge level resolution must come from the backend. Two options (pick one
  after confirming the backend contract):
  - **Option A (preferred):** Add `levelName`, `levelLabel`, `levelColor`, and
    `levelIcon` fields directly to `TeamMemberBadgeProgressDto` so the backend
    resolves the level — consistent with how `MainBadgeSummaryDto` works on
    the dashboard.
  - **Option B (fallback):** Fetch badge-level thresholds from the existing
    `BadgeCatalogueDto.badgeLevels` (via `getBadgeCatalogue`) and use those
    thresholds to resolve levels client-side, instead of the hardcoded array.
- [x] Update `MemberCard` to accept `TeamMemberDto` instead of the local `TeamMember` type.
- [x] Replace `member.avatar` with `member.avatarUrl ?? DEFAULT_AVATAR_URL`.
- [x] The backend should return members pre-sorted (captain first, then XP desc)
  inside `TeamDetailDto.members`. Remove the client-side sort if sorting is
  confirmed to happen on the backend; otherwise keep it as a safety net.
- [x] **Loading state:** Show a full-page skeleton hero + member-card skeletons
  while the request is in flight.
- [x] **Error state (non-404):** Inline error + retry button.
- [x] **404 state:** Keep the existing "Team not found" message, but trigger it
  from `error === "Team not found."` (or `ApiError.status === 404`) instead of
  a missing array element.
- [x] **"View full profile" CTA:** The link `to={/student/players/${member.username.replace(/^@/, "")}}` 
  already uses the public-profile route. Verify the `username` field in
  `TeamMemberDto` matches the slug expected by `StudentPublicProfile.tsx`
  (currently strips the `@` prefix — confirm this is consistent with the
  backend's `username` field format).

---

## 6. Backend contract checklist (to confirm with the Spring Boot team)

These items need sign-off before frontend work can begin:

- [ ] Confirm endpoint paths: `GET /api/v1/teams` and `GET /api/v1/teams/{teamId}`
- [ ] Confirm `teamId` is a string slug (e.g. `"wolf-cubs"`) not a numeric DB id
- [ ] Confirm `colour` is returned as a CSS hex string (e.g. `"#4f8ef7"`)
- [ ] Confirm `memberAvatarUrls` is limited server-side (e.g. top 5) or confirm
  the frontend should slice
- [ ] Confirm members are sorted server-side (captain first, XP desc) or leave
  client-side sort in place
- [ ] Confirm whether badge-level resolution (bronze/silver/gold/platinum) is
  included in `TeamMemberBadgeProgressDto` or must be derived client-side
- [ ] Confirm auth requirement: are team endpoints open to all authenticated
  users, or scoped to team members only?
- [ ] Confirm `username` field format in `TeamMemberDto` — does it include the
  `@` prefix or not?

---

## 7. Clean up `src/data/studentData.ts`

Once both components are verified working against the real backend:

- [x] Remove the `Team` interface export
- [x] Remove the `TeamMember` interface export
- [x] Remove the `TeamMemberBadgeProgress` interface export
- [x] Remove the `TeamMemberModuleProgress` interface export
- [x] Remove the `TEAMS` constant
- [x] Remove the `TEAM_MEMBERS` constant
- [x] If these were the last remaining exports in `studentData.ts`, delete the
  entire file and remove it from `.gitignore` / barrel exports if applicable

---

## 8. Testing & verification

- [ ] Confirm Teams list renders correctly with real data (member count, avatars,
  captain tag, team colour accent)
- [ ] Confirm Team Detail renders badge progress bars using live XP thresholds
- [ ] Confirm Team Detail renders module progress bars with correct session counts
- [ ] Confirm the "View full profile →" link navigates to the correct public
  profile page for each member
- [ ] Confirm loading skeletons appear and disappear correctly
- [ ] Confirm error state and retry button work on network failure
- [ ] Confirm 404 state shows the "Team not found" message for an invalid slug
- [ ] Confirm `DEFAULT_AVATAR_URL` fallback is shown when `avatarUrl` is null

---

## Files to create / modify

| Action   | File                                    |
|----------|-----------------------------------------|
| Modify   | `src/api/types.ts`                      |
| Modify   | `src/api/studentApi.ts`                 |
| **Create** | `src/hooks/useTeams.ts`               |
| **Create** | `src/hooks/useTeamDetail.ts`          |
| Modify   | `src/components/portal/student/StudentTeams.tsx` |
| Modify   | `src/components/portal/student/StudentTeamDetail.tsx` |
| Modify   | `src/data/studentData.ts` *(cleanup)*   |
