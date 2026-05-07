# Student Leaderboard — Backend Integration TODO

> **Scope:** Wire `StudentLeaderboard.tsx` fully to the Java Spring Boot backend and eliminate every hardcoded / stale reference. Tasks are ordered by dependency — complete them top-to-bottom.

---

## 1. Fix broken variable references in the JSX (compile errors first)

The component currently references names that no longer exist after the data-model
refactor. None of these will compile or behave correctly until they are resolved.

- [ ] **1.1** Replace every use of `timePeriod` / `setTimePeriod` with the already-declared `period` / `setPeriod` state pair in the period-picker button group.
- [ ] **1.2** Replace `filtered` (old mock-derived list) with `displayed` (the correctly derived, sorted+filtered list from `useLeaderboard`).
- [ ] **1.3** Replace `currentUser` (old mock object) with `currentPlayer` (the `LeaderboardPlayerDto | null` derived from live data).
- [ ] **1.4** Replace `myPeriodXp` with `currentPlayer?.periodXp ?? 0`.
- [ ] **1.5** Replace `p.avatar` (old field) with `p.avatarUrl ?? FALLBACK_AVATAR` everywhere in the render (podium, table rows, my-rank card).
- [ ] **1.6** Remove calls to the deleted helpers `getPeriodXp(p, timePeriod)` and `getCentreXp(centre)` — use `p.periodXp` and `centre.periodXp` directly (both are already period-scoped by the backend response).
- [ ] **1.7** Remove `centres` (old mock list) from the centre-filter `<select>` — replace with `centreOptions` (already derived from live data via `useMemo`).
- [ ] **1.8** Remove `centre.isMycentre` (old field that doesn't exist on `LeaderboardCentreDto`) — derive "is my centre" from `currentPlayer?.centre === centre.name` instead.
- [ ] **1.9** Replace `centre.topPlayer.name` (nested object, old shape) with `centre.topPlayerName` (flat string field on `LeaderboardCentreDto`).

---

## 2. Add loading & error UI states

The `useLeaderboard` hook already exposes `loading`, `error`, and `refresh`, but the component renders nothing while the data is in-flight.

- [ ] **2.1** Render a loading skeleton or spinner (`loading === true`) in place of the player table and podium — prevents layout shift and blank screen.
- [ ] **2.2** Render an error banner (`error !== null`) with the human-readable message from the hook and a **Retry** button that calls `refresh()`.
- [ ] **2.3** Render a friendly empty state when `data` is non-null but `data.players` is empty (e.g. backend returned zero rows for the chosen period).

---

## 3. Replace mock auth with real JWT-based identity

`AuthContext` still uses a hardcoded `MOCK_USERS` array with a stub `studentId`.

- [ ] **3.1** After a successful `/api/v1/auth/login` call, store the JWT in `localStorage` under the key `auth_token` (already read by `apiFetch` in `studentApi.ts`) and decode the claims (`studentId`, `username`, `role`) to populate `AuthContext`.
- [ ] **3.2** Remove the `MOCK_USERS` array and the local `login()` mock logic from `AuthContext.tsx`; replace with a call to a new `authApi.login()` function.
- [ ] **3.3** On app load (`useEffect` at the `AuthProvider` level), check for an existing `auth_token`, validate it is not expired (check `exp` claim), and restore the user session automatically.
- [ ] **3.4** On `logout()`, remove `auth_token` from `localStorage` and call `DELETE /api/v1/auth/session` (or equivalent backend logout endpoint) to invalidate the server-side session / refresh token.
- [ ] **3.5** The leaderboard's "You" row highlighting already uses `data.currentUserUsername` (injected by the backend from the JWT) — verify this survives the auth migration and no extra prop-threading is needed.

---

## 4. Add `studentCentreId` to the backend response for centre highlighting

The centres tab needs to know which centre the logged-in student belongs to, but
`LeaderboardResponseDto` does not currently expose it.

- [ ] **4.1** Add a `currentUserCentreId: number | null` (or `currentUserCentreName: string | null`) field to `LeaderboardResponseDto` in `src/api/types.ts`.
- [ ] **4.2** Confirm that the Spring Boot backend populates this field in `LeaderboardController` by reading the student's centre from the JWT / user service.
- [ ] **4.3** Use `data.currentUserCentreName` (or match by id) in the centres tab to apply the `sp-lb-centre-card--mine` CSS class and the **"Your Centre"** badge.

---

## 5. Implement server-side sort (optional but recommended for large datasets)

Currently all sorting is done client-side on the full list returned by the backend.

- [ ] **5.1** Add a `sortBy` query parameter to the backend endpoint: `GET /api/v1/leaderboard?period=ALL_TIME&sortBy=XP`.
- [ ] **5.2** Map the frontend `SortKey` type (`"xp" | "level" | "completedModules" | "badgesCompleted"`) to the backend `LeaderboardSortKey` enum (`"XP" | "LEVEL" | "MODULES" | "BADGES"`) and pass it in `getLeaderboard()` inside `studentApi.ts`.
- [ ] **5.3** Update `useLeaderboard` signature to accept `sortBy` alongside `period` and include it in the `useEffect` dependency array so a re-fetch is triggered on sort change.
- [ ] **5.4** Remove the client-side `list.sort(...)` block from the component once server-side sort is in place (or keep as a client-side tie-breaker only).

---

## 6. Implement pagination or virtual scrolling

- [ ] **6.1** Add `page` and `pageSize` query parameters to the backend endpoint (e.g. `?period=ALL_TIME&page=0&size=50`).
- [ ] **6.2** Add `totalCount: number` to `LeaderboardResponseDto` so the frontend knows the total number of rows.
- [ ] **6.3** Add "Load more" / pagination controls to the bottom of the players table in the component, linked to a new `page` state variable.
- [ ] **6.4** Update `useLeaderboard` to accept `page` and append new pages to the existing list (infinite scroll) or replace the list (classic pagination).

---

## 7. Environment & API configuration

- [ ] **7.1** Create a `.env.local` file (gitignored) with `VITE_API_BASE_URL=http://localhost:8080/api/v1` for local development.
- [ ] **7.2** Create a `.env.production` file with the real backend URL for deployment.
- [ ] **7.3** Add `VITE_API_BASE_URL` to the `README.md` setup instructions so contributors know to configure it.
- [ ] **7.4** Verify the Vite dev server proxy (`vite.config.ts`) is not needed when `VITE_API_BASE_URL` is set, or document when each approach should be used.

---

## 8. CORS & Spring Security configuration (backend)

- [ ] **8.1** Ensure `GET /api/v1/leaderboard` is accessible to authenticated users with role `ROLE_STUDENT` — confirm the Spring Security `SecurityFilterChain` allows it.
- [ ] **8.2** Add the frontend origin (e.g. `http://localhost:5173`) to the Spring Boot CORS `allowedOrigins` list for local development.
- [ ] **8.3** Verify the backend includes the `Authorization` header in the CORS `allowedHeaders` list so the JWT is forwarded correctly.

---

## 9. Complete remaining UI tasks (unblocked once data is live)

These were already tracked in `TODO-leaderboard.md` but are now unblocked once
the backend is wired up:

- [ ] **9.1** *(Task 4 from TODO-leaderboard)* Fully implement the Top-3 podium — currently renders `p.avatar` (broken) and `getPeriodXp(...)` (deleted).
- [ ] **9.2** *(Task 8b from TODO-leaderboard)* Wire the Centre filter `<select>` to use `centreOptions` derived from the live backend data.
- [ ] **9.3** *(Task 8d from TODO-leaderboard)* Confirm table columns (`Rank`, `Player`, `Level`, `XP`, `Modules`, `Badges`) match the final `LeaderboardPlayerDto` shape from the backend — remove any leftover game-stats columns.
- [ ] **9.4** Add `badgeIcons` rendering to player rows (field already present on `LeaderboardPlayerDto`) — render as a small emoji row beneath the player name.
- [ ] **9.5** Add a `rank` display that uses `p.rank` from the backend (backend-assigned rank) instead of `idx + 1` (client-side index) so rank numbers survive pagination correctly.

---

## Summary of files to touch

| File | Changes needed |
|---|---|
| `src/components/portal/student/StudentLeaderboard.tsx` | Tasks 1, 2, 9 — fix broken refs, add loading/error UI, use live DTOs |
| `src/api/types.ts` | Task 4 — add `currentUserCentreName` to `LeaderboardResponseDto`; Task 5 — add `sortBy` param |
| `src/api/studentApi.ts` | Task 5 — pass `sortBy` to `getLeaderboard()`; Task 6 — add pagination params |
| `src/hooks/useLeaderboard.ts` | Tasks 5, 6 — accept `sortBy` and `page` params, update deps |
| `src/context/AuthContext.tsx` | Task 3 — replace mock login with real JWT auth |
| `vite.config.ts` | Task 7 — verify/document proxy vs env var approach |
| `.env.local` *(new)* | Task 7 — set `VITE_API_BASE_URL` for local dev |
| `.env.production` *(new)* | Task 7 — set `VITE_API_BASE_URL` for deployment |
| Spring Boot backend | Tasks 4, 5, 6, 8 — DTO fields, sort param, pagination, CORS/security |
