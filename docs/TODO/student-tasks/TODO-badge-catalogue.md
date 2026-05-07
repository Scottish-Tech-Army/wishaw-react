# Badge Catalogue — Backend Integration Todo

Each task below is self-contained and can be picked up in a separate chat.
The badge catalogue lives in `src/components/portal/student/StudentBadges.tsx`.
Hardcoded data currently lives in `src/data/studentData.ts` (`MAIN_BADGE_DEFINITIONS`, `BADGE_LEVELS`).

---

## 1. Backend API contract — DTOs & endpoint design

- [x] **1a.** Define `BadgeCatalogueDto` in `src/api/types.ts` — the full page payload returned by the backend:
  ```ts
  interface BadgeCatalogueDto {
    badgeLevels: BadgeLevelDto[];      // level thresholds (bronze → platinum)
    badges: MainBadgeDetailDto[];      // all 5 core badges with student progress
  }
  ```
- [x] **1b.** Define `BadgeLevelDto` — mirrors `BadgeLevelThreshold` but sourced from the backend:
  ```ts
  interface BadgeLevelDto {
    name: string;       // "bronze" | "silver" | "gold" | "platinum"
    label: string;
    minXP: number;
    maxXP: number | null;
    color: string;
    icon: string;
  }
  ```
- [x] **1c.** Define `MainBadgeDetailDto` — full badge detail including student-specific earned state:
  ```ts
  interface MainBadgeDetailDto {
    id: string;           // e.g. "game-mastery"
    icon: string;
    name: string;
    tagline: string;
    description: string;
    xpEarned: number;     // student's earned XP for this badge
    subBadges: SubBadgeDetailDto[];
  }
  ```
- [x] **1d.** Define `SubBadgeDetailDto` — individual criterion with student earn state:
  ```ts
  interface SubBadgeDetailDto {
    id: number;
    icon: string;
    name: string;
    shortDesc: string;
    criteria: string;
    xpReward: number;
    type: "lesson" | "activity";
    skills: string[];
    earned: boolean;
    earnedDate: string | null;   // ISO-8601 date or null
  }
  ```
- [ ] **1e.** Confirm the backend endpoint with the Spring Boot team:
  - Proposed: `GET /api/v1/students/{studentId}/badges`
  - Returns `BadgeCatalogueDto` — badge level thresholds + all 5 badges with the student's live progress

---

## 2. API function — `src/api/studentApi.ts`

- [x] **2a.** Add `getBadgeCatalogue(studentId: number): Promise<BadgeCatalogueDto>` using the existing `apiFetch` helper:
  ```ts
  export async function getBadgeCatalogue(studentId: number): Promise<BadgeCatalogueDto> {
    return apiFetch<BadgeCatalogueDto>(`/students/${studentId}/badges`);
  }
  ```
- [x] **2b.** Ensure the JWT `Authorization: Bearer` header is forwarded automatically (already handled by `apiFetch`, verify it covers this route).

---

## 3. Custom hook — `src/hooks/useBadgeCatalogue.ts`

- [x] **3a.** Create `useBadgeCatalogue(studentId)` following the same pattern as `useDashboard`:
  - States: `data: BadgeCatalogueDto | null`, `loading: boolean`, `error: string | null`
  - Expose a `refresh()` callback (for post-evidence-submission re-fetch)
  - Handle `401`/`403` (session expired), `404` (student not found), and generic server errors
- [x] **3b.** Guard against race conditions with a `cancelled` flag inside `useEffect` (same as `useDashboard`)

---

## 4. Replace hardcoded data in `StudentBadges.tsx`

- [x] **4a.** Read `studentId` from `AuthContext` (`useAuth()` → `user.studentId`) instead of using static data
- [x] **4b.** Call `useBadgeCatalogue(studentId)` at the top of the `StudentBadges` component
- [x] **4c.** Remove all imports of `MAIN_BADGE_DEFINITIONS` and `BADGE_LEVELS` from `studentData.ts`
- [x] **4d.** Remove the `getBadgeLevel()` call from the `xpProgress()` helper — replace with a local lookup against the `badgeLevels` array returned by the API (pass it as a prop or via context)
- [x] **4e.** Thread `badgeLevels` down through `BadgeCard` and `xpProgress()` so level resolution is data-driven
- [x] **4f.** Add a loading skeleton or spinner while `loading === true`
- [x] **4g.** Add an error state UI (inline alert / retry button) when `error !== null`

---

## 5. Remove / deprecate hardcoded data

- [x] **5a.** Delete `MAIN_BADGE_DEFINITIONS` constant from `src/data/studentData.ts` once no other component references it
- [x] **5b.** Delete `BADGE_LEVELS` constant and `getBadgeLevel()` helper from `src/data/studentData.ts` once unused
- [x] **5c.** Run a workspace-wide search for remaining imports of `MAIN_BADGE_DEFINITIONS` / `BADGE_LEVELS` / `getBadgeLevel` and update or remove them (check `StudentDashboard.tsx`, `StudentProfile.tsx`, `StudentPublicProfile.tsx`)

---

## 6. `StudentDashboard.tsx` badge hex row

- [x] **6a.** The hex row currently reads badge summaries from `DashboardSummaryDto.badges` (`MainBadgeSummaryDto[]`) — verify that `xpEarned`, `levelColor`, `levelIcon`, and sub-badge counts are all populated by the Spring Boot backend
- [x] **6b.** Ensure the "View all badges →" deep-link (`/portal/student/badges?badge=<id>`) keeps working after the catalogue switches to live data

---

## 7. `StudentPublicProfile.tsx` badge display

- [x] **7a.** Audit whether `StudentPublicProfile` reads from `MAIN_BADGE_DEFINITIONS` or `TEAM_MEMBERS` hardcoded data
- [x] **7b.** If it does, replace with a separate API call: `GET /api/v1/students/{studentId}/badges/summary` (lightweight — only `MainBadgeSummaryDto[]` needed for the public card)

---

## 8. `useBadgeCatalogue` — `refresh` integration

- [x] **8a.** Pass `refresh` down to (or expose via context from) `EvidenceSubmission.tsx` so that submitting evidence immediately re-fetches the badge catalogue without a full page reload

---

## 9. Error & edge-case handling

- [x] **9a.** Handle the case where `studentId` is `null` (admin user or not yet resolved from JWT) — show a "Sign in to view your badges" prompt rather than fetching
- [x] **9b.** Handle empty `subBadges` arrays gracefully (collapsed card with "No criteria defined yet" message)
- [x] **9c.** Keep the `?badge=<id>` deep-link scroll behaviour working when data loads asynchronously (the `useEffect` scroll should fire only after `loading` becomes `false`)

---

## 10. Type cleanup

- [x] **10a.** Once the backend DTOs are confirmed, remove the `MainBadgeDefinition`, `MainBadgeSubBadge`, `BadgeLevelThreshold`, and `BadgeLevel` interfaces from `src/data/studentData.ts` — they are superseded by the DTO types in `src/api/types.ts`
- [x] **10b.** Export the new DTO types from `src/api/types.ts` with JSDoc comments describing the corresponding Spring Boot backend class
