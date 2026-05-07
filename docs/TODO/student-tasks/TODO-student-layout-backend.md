# TODO — Student Layout Backend Integration

**Scope:** `src/components/portal/student/StudentLayout.tsx`

The goal is to remove all hardcoded data from the student layout shell and have it rely entirely on the Java Spring Boot backend and JWT-based auth for student-specific information.

---

## 1. Wire StudentLayout to real auth (no hardcoded name)

**Current state**
- The topbar greeting uses a hardcoded name: `Welcome back, <strong>Tiger Bear</strong> 👾`.
- `StudentLayout` does not read from `AuthContext` yet.

**Target state**
- The greeting and any student-identifying UI (name, gamertag, avatar) come from the authenticated user or dashboard DTO, not from literals.

**Tasks**
- [x] **1.1** Inject auth into layout
  - [x] Import and use `useAuth()` in `StudentLayout.tsx`.
  - [x] Read `user.studentId` and `user.username` from `AuthContext`.

- [x] **1.2** Replace hardcoded greeting text
  - [x] Replace `Welcome back, <strong>Tiger Bear</strong> 👾` with `user?.username ?? "Player"`.
  - [x] Greeting renders safely when `user` is `null` (fallback "Player").

- [x] **1.3** Enforce student-only access
  - [x] Added `useEffect` guard: if `!user || user.role !== "student"`, redirect to `/portal` with `replace: true`.
  - [x] Fixed the logout button to call `logout()` from `AuthContext` (clears JWT from `localStorage`) before navigating to `/`.

---

## 2. Drive notifications from DashboardSummaryDto.recentActivity

**Current state**
- `StudentLayout` imports `XP_HISTORY` from `src/data/studentData.ts`.
- It computes `recentActivity` from that mock array, reversed and sliced with `NOTIF_COUNT = 5`.
- The notification badge shows a hardcoded count based on `NOTIF_COUNT`.

**Backend contract**
- `DashboardSummaryDto` (see `src/api/types.ts`) includes:
  - `recentActivity: XpEventDto[]` — five most recent XP events.

**Target state**
- Notification bell + dropdown are driven entirely by `DashboardSummaryDto.recentActivity` from `/api/v1/students/{studentId}/dashboard`.

**Tasks**
- [x] **2.1** Fetch dashboard summary in `StudentLayout`
  - [x] Import `useDashboard` from `src/hooks/useDashboard`.
  - [x] Call `const { data, loading: notifLoading, error: notifError, refresh: refreshNotif } = useDashboard(user?.studentId)` at the top of `StudentLayout`.
  - [x] Removed `XP_HISTORY` import and `NOTIF_COUNT` constant.

- [x] **2.2** Replace XP_HISTORY with backend `recentActivity`
  - [x] Removed import of `XP_HISTORY` from `src/data/studentData.ts`.
  - [x] Replaced old slice with `const recentActivity = (data?.recentActivity ?? []).slice(0, MAX_NOTIF)`.

- [x] **2.3** Drive notification count from live data
  - [x] Removed `NOTIF_COUNT` constant (replaced by `MAX_NOTIF` cap and `recentActivity.length` for display).
  - [x] Bell badge only renders when `recentActivity.length > 0`.
  - [x] "X new" label only renders when `recentActivity.length > 0`.

- [x] **2.4** Confirm date/format compatibility
  - [x] Kept existing `toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })` formatter — `XpEventDto.date` is ISO-8601, fully compatible.

- [x] **2.5** Handle loading & error for notifications
  - [x] `loading === true` → renders 3 skeleton placeholder rows inside the dropdown.
  - [x] `error !== null` → renders error message + **Retry** button that calls `refreshNotif()`.
  - [x] Empty state → friendly "No recent activity yet." message when data is loaded but list is empty.
  - [x] Bell badge is hidden when `recentActivity.length === 0`.

---

## 3. Load avatar from backend, not a hardcoded URL

**Current state**
- The avatar image is a static DiceBear URL in `StudentLayout`:
  - `src="https://api.dicebear.com/9.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4"`.

**Target state**
- Avatar URL comes from backend / user profile, with a shared fallback.

**Tasks**
- [x] **3.1** Decide the canonical avatar source
  - [x] Chose **Option A**: extend `DashboardSummaryDto` with `avatarUrl: string | null` — the dashboard DTO is already fetched by `StudentLayout` via `useDashboard`, so no extra round-trip is needed.
  - [x] Added `avatarUrl: string | null` to `DashboardSummaryDto` in `src/api/types.ts` with a JSDoc comment pointing to `DEFAULT_AVATAR_URL`.

- [x] **3.2** Update frontend types and auth context
  - [x] Added `avatarUrl: string | null` to `DashboardSummaryDto` in `src/api/types.ts`.
  - [x] Created `src/constants.ts` with `DEFAULT_AVATAR_URL` (a neutral DiceBear seed) — a single source of truth for the fallback across all components.
  - [x] No auth context changes needed; avatar is sourced from the dashboard DTO.

- [x] **3.3** Replace hardcoded avatar in `StudentLayout`
  - [x] Imported `DEFAULT_AVATAR_URL` from `src/constants.ts`.
  - [x] Replaced `src="https://…seed=Alex…"` with `src={data?.avatarUrl ?? DEFAULT_AVATAR_URL}`.
  - [x] Updated `alt` to `{user?.username ?? "Player"}'s avatar` for accessibility.

---

## 4. Clean up mock data & dead code

**Current state**
- `XP_HISTORY` and other mock structures live in `src/data/studentData.ts`.
- `StudentLayout` currently depends on this file for its notification content.

**Target state**
- `StudentLayout` no longer imports anything from `studentData.ts`.
- Any layout-relevant mock data is either removed or clearly confined to non-portal demo pages.

**Tasks**
- [x] **4.1** Remove XP_HISTORY and references
  - [x] `StudentLayout.tsx` no longer imports anything from `src/data/studentData.ts` — confirmed clean after task 2.
  - [x] Searched codebase for `XP_HISTORY`: the only remaining consumer is `StudentProfile.tsx` (lines 5 and 548), which uses it for the full XP history tab. **Cannot delete from `studentData.ts` yet** — `XP_HISTORY` must stay until `StudentProfile` is wired to its own backend endpoint (separate work item).

- [x] **4.2** Re-check `studentData.ts` for layout dependencies
  - [x] `StudentLayout.tsx` itself: **zero** imports from `studentData.ts` ✅
  - [x] Audited all child routes mounted inside `<StudentLayout>` that still import from `studentData.ts`:

    | Component | Imported symbols | Data to replace with backend |
    |---|---|---|
    | `StudentProfile.tsx` | `XP_HISTORY`, `MODULES`, `MAIN_BADGE_DEFINITIONS` | XP history tab → student activity endpoint; modules tab → module API; badge tab → `useBadgeCatalogue` |
    | `StudentTeams.tsx` | `TEAMS`, `TEAM_MEMBERS` | Teams list → `GET /api/v1/teams`; members → per-team roster endpoint |
    | `StudentTeamDetail.tsx` | `TEAMS`, `TEAM_MEMBERS` | Team detail + member cards → same team/roster endpoints |
    | `StudentPublicProfile.tsx` | `TEAM_MEMBERS`, `TEAMS` | Player identity + team info → public student profile endpoint (badge summary already wired via `usePublicBadgeSummary`) |

  - [x] None of the above values affect `StudentLayout`'s own shell UI (sidebar, topbar, notifications). They are self-contained in their respective page components and will be removed as part of those pages' individual backend integration tasks.

---

## 5. Final integration & QA

**Tasks**
- [ ] **5.1** Verify behaviour across all student routes *(requires live backend)*
  - [ ] Navigate to `/student` and each nested route (`/student/leaderboard`, `/student/profile`, `/student/badges`, etc.).
  - [ ] Check that the topbar greeting shows the correct student name from the JWT (`user.username`).
  - [ ] Confirm the avatar resolves to `DashboardSummaryDto.avatarUrl` when populated, and falls back to `DEFAULT_AVATAR_URL` when `null`.
  - [ ] Open the notification dropdown on each page and confirm:
    - It shows the same recent activity list as the dashboard page.
    - The badge count matches `recentActivity.length` from the backend (hidden when 0).

- [ ] **5.2** Test edge cases *(requires live backend)*
  - [ ] Student with **no recent activity** → bell badge hidden, dropdown shows "No recent activity yet."
  - [ ] Backend returns an error for `/dashboard` → dropdown shows "Couldn't load recent activity." + Retry button; topbar shell still renders with fallback greeting and avatar.
  - [ ] Expired or missing JWT → `StudentLayout` guard redirects to `/portal` before any content renders.

- [x] **5.3** Remove any remaining hardcoded user references in `StudentLayout.tsx`
  - [x] Searched for `"Tiger Bear"` across the codebase — **zero hits in `StudentLayout.tsx`** ✅
    - Remaining hits are in `StudentProfile.tsx` (local mock object, line 78) and `studentData.ts` (TEAM_MEMBERS, line 595) — both are separate page concerns.
  - [x] Searched for `seed=Alex` — **zero hits in `StudentLayout.tsx`** ✅
    - Remaining hit is in `StudentProfile.tsx` (line 90) — separate page concern.
  - [x] `StudentLayout.tsx` contains no hardcoded usernames, gamertags, or user-identifying literals. All dynamic user data is sourced from `AuthContext` (`user.username`) or `DashboardSummaryDto` (`data.avatarUrl`, `data.recentActivity`).
