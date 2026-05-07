# Dependencies to Install

Before running the project, you need to install the following packages.
Run these commands from the project root directory.

---

## Option A — npm (recommended)

```bash
npm install lucide-react react-router-dom
npm install --save-dev @types/react-router-dom
```

---

## Option B — yarn

```bash
yarn add lucide-react react-router-dom
yarn add --dev @types/react-router-dom
```

---

## Option C — pnpm

```bash
pnpm add lucide-react react-router-dom
pnpm add -D @types/react-router-dom
```

---

## Package Details

| Package | Version | Purpose |
|---|---|---|
| `lucide-react` | `^0.474.0` | SVG icon library (menu, social, chevron icons etc.) |
| `react-router-dom` | `^7.x` | Client-side routing between pages |
| `@types/react-router-dom` | `^5.x` | TypeScript types for react-router-dom (dev only) |

> **Note:** `react-router-dom` v7 ships its own types, so `@types/react-router-dom`
> is only needed if your installed version is v5/v6.

---

## Verifying the install

After installing, run:

```bash
npm run dev
```

The dev server should start at `http://localhost:5173` with no TypeScript errors.

---

## Profile-Related Backend Endpoints & DTOs

All endpoints below are served from the Java Spring Boot backend at the base
URL configured in `VITE_API_BASE_URL` (default: `/api/v1`).

### Private profile (requires JWT Bearer token)

| Method | Path | Function | Hook | Response DTO |
|--------|------|----------|------|-------------|
| `GET` | `/students/{studentId}/dashboard` | `getDashboardSummary` | `useDashboard` | `DashboardSummaryDto` |
| `GET` | `/students/{studentId}/badges` | `getBadgeCatalogue` | `useBadgeCatalogue` | `BadgeCatalogueDto` |
| `GET` | `/students/{studentId}/modules` | `getModuleProgress` | `useModuleProgress` | `ModuleProgressDto[]` |
| `GET` | `/students/{studentId}/profile` | `getStudentProfile` | `useStudentProfile` | `StudentProfileDto` |
| `PATCH` | `/students/{studentId}/profile` | `updateStudentProfile` | — | `StudentProfileDto` |
| `POST` | `/students/{studentId}/avatar` | `uploadAvatar` | — | `StudentProfileDto` |
| `POST` | `/students/{studentId}/change-password` | `changePassword` | — | `204 No Content` |

#### `DashboardSummaryDto` key fields
```
studentId, gamertag, name, avatarUrl,
level, xp, xpForNextLevel,
weeklyXp, teamWeeklyXp, hubWeeklyXp,
totalSubBadges, earnedSubBadges,
leaderboardRank, nextSessionAt,
badges: MainBadgeSummaryDto[],
recentActivity: XpEventDto[]
```

#### `BadgeCatalogueDto` key fields
```
badgeLevels: BadgeLevelDto[]   // ordered Bronze → Platinum thresholds
badges: MainBadgeDetailDto[]   // 5 core badges with earned XP + SubBadgeDetailDto[]
```

#### `ModuleProgressDto` key fields
```
id, icon, name, outcome, durationWeeks,
subBadges: ModuleSubBadgeDto[]  // id, icon, name, desc, xpReward, mainBadgeId, earned, earnedDate
```

---

### Public profile (no auth required)

| Method | Path | Function | Hook | Response DTO |
|--------|------|----------|------|-------------|
| `GET` | `/students/by-username/{username}/public-profile` | `getPublicPlayerProfile` | `usePublicPlayerProfile` | `PublicPlayerProfileDto` |
| `GET` | `/students/by-username/{username}/badges/summary` | `getPublicBadgeSummary` | `usePublicBadgeSummary` | `PublicBadgeSummaryDto` |

#### `PublicPlayerProfileDto` key fields
```
username, gamertag, realName, bio, joinedDate,
level, totalXP, avatarUrl,
teamName, teamIcon, teamId, teamColour, hub, isCaptain,
globalRank,
moduleProgress: PublicModuleProgressDto[]
```

#### Error handling conventions
- **404** from `getPublicPlayerProfile` → `usePublicPlayerProfile` sets `notFound: true` → renders "Player not found" UI.
- **Other 4xx / 5xx** → `error` string is set → renders generic error UI.
- All DTOs are typed in `src/api/types.ts`; all API functions are in `src/api/studentApi.ts`.
- Badge level resolution (`Bronze → Platinum`) uses `resolveBadgeLevel(xp, badgeLevels)` from `src/utils/badgeUtils.ts`.
