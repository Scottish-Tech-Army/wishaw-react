# WYMCA eSports Badge Portal — Build Template

> Paste this entire prompt into an AI coding assistant to rebuild the React UI from scratch.

---

## PROMPT START

Build a **React SPA** called **WYMCA eSports Badge Portal** for a youth eSports charity. Two roles: **Player** (track badges, modules, tournaments, leaderboards) and **Admin** (manage sports, tournaments, badges, modules, centres, data imports). Dark/light theme. Fully functional with a mock API so it runs standalone.

---

## 1 — STACK

```
Vite 6 + React 19 + TypeScript 5.8 + Tailwind CSS 3
```

```json
"dependencies": {
  "clsx": "^2.1.1", "date-fns": "^4.1.0", "lucide-react": "^0.468.0",
  "react": "^19.2.0", "react-dom": "^19.2.0", "react-hook-form": "^7.54.2",
  "react-hot-toast": "^2.4.1", "react-router-dom": "^6.28.0",
  "recharts": "^2.15.0", "zod": "^3.24.2", "zustand": "^5.0.3"
},
"devDependencies": {
  "@types/node": "^24.10.1", "@types/react": "^19.2.7", "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.1", "autoprefixer": "^10.4.20",
  "postcss": "^8.4.49", "tailwindcss": "^3.4.17", "typescript": "~5.8.3", "vite": "^6.3.5"
}
```

- Vite: `@` alias → `./src`, dev port 3000
- PostCSS: tailwindcss + autoprefixer
- Font: **Inter** via Google Fonts in `index.html`
- ESLint: flat config with `typescript-eslint`, `react-hooks`, `react-refresh`

---

## 2 — THEMING (CSS Custom Properties)

Two color scales defined as space-separated RGB triplets on `:root`:

| Scale | Dark mode | Light mode |
|-------|-----------|------------|
| `primary` (50–950) | Indigo (#6366f1 base) | Sky-blue (#0ea5e9 base) |
| `surface` (50–950) | Slate (dark) | **Inverted** — surface-800=white, surface-900=near-white |

Tailwind config references them as `rgb(var(--color-primary-500) / <alpha-value>)`.

Theme switch: `data-theme="dark|light"` on `<html>`, persisted in `localStorage` key `wishaw-theme`. A Zustand **theme-store** toggles it. Body gets a `background-image` radial gradient.

Light mode overrides `.text-white` to `rgb(var(--color-foreground-strong))`.

---

## 3 — TAILWIND COMPONENT CLASSES (in `@layer components`)

| Class | What |
|-------|------|
| `btn-primary` | indigo bg, white text, rounded-xl, shadow |
| `btn-secondary` | surface-800 bg, border, rounded-xl |
| `btn-danger` | red bg/15% opacity, red text |
| `btn-ghost` | transparent, hover highlight |
| `btn-sm` / `btn-lg` | size variants |
| `card` | surface-800/95 bg, surface-700/50 border, rounded-2xl, p-5, backdrop-blur |
| `card-hover` | card + hover glow transition |
| `input` | surface-700/50 bg, border, rounded-xl, focus ring |
| `label` | sm, font-medium, surface-300 |
| `badge-primary/success/warning/danger/neutral` | colored pills at 15% opacity |
| `stat-card` | surface-800, rounded-xl, p-4, text-center |
| `table` / `th` / `td` | bordered, hover row highlight |

---

## 4 — TYPES (`src/types/index.ts`)

Define all these interfaces/types in one file:

```
UserRole = 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN'
User { id, email, role, centreId? }
Profile { displayName, firstName, lastName, bio?, photoUrl?, overlayTemplate?, privacy: { showInPublicList, allowSocialSharing } }
AuthResponse { accessToken, refreshToken, user, profile }

Centre { id, name, location }
Group { id, name, game, centreId, centreName?, memberCount }

MainBadgeName = 'Game Mastery' | 'Teamwork' | 'Esports Citizen' | 'Personal Development' | 'Digital Skills'
BadgeLevel = 'None' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
MainBadge { id, name, description, icon }
SubBadge { id, name, description, mainBadgeId, mainBadgeName, points, skills[], moduleId }
UserBadgeProgress { mainBadgeId, mainBadgeName, totalPoints, level, earnedSubBadges[] }

ModuleSession { weekNo, focus, subBadgeId?, sessionPlanUrl?, slidesUrl? }
Module { id, name, game, description, durationWeeks, subBadges[], schedule[], status: ACTIVE|COMPLETED|DRAFT }

LeaderboardEntry { userId, displayName, centreId, centreName, totalPoints, badgeLevels: Record<MainBadgeName,BadgeLevel>, completedModules }

Sport { id, name, icon, description, scoreFields[], rankingPoints: { win, draw, loss } }
ScoreField { key, label, type: number|time|text }
TournamentStatus = DRAFT | PUBLISHED | CANCELLED | COMPLETED
Tournament { id, name, sportId, sport?, description, rules?, venue, type: INDIVIDUAL|TEAM, status, startDate, endDate, regStartDate, regEndDate, capacity, participantCount, teamMinSize?, teamMaxSize?, pointsWin, pointsDraw, pointsLoss }
Participant { id, userId, displayName, status: REGISTERED|WITHDRAWN, photoUrl? }
Match { id, tournamentId, roundLabel, scheduledAt, venue, status, participants[], score? }
MatchParticipant { userId, displayName, attendance?: PRESENT|ABSENT|LATE|EXCUSED }
MatchScore { winnerId?, fields: Record<string, Record<string, number|string>>, summary? }
Team { id, name, tournamentId, members[] }

NotificationType = TOURNAMENT | ANNOUNCEMENT | BADGE | MODULE
Notification { id, type, title, message, isRead, createdAt, linkTo? }

PlayerStats { tournamentsJoined, activeTournaments, completedTournaments, matchesPlayed, wins, losses, draws, attendanceRate, badges[], tournaments[] }
AdminDashboard { totalTournaments, activeTournaments, totalPlayers, totalMatches, registrationsByTournament[], attendanceTrend[], topPerformers[], recentScores[] }

SpreadsheetImportSheet { sheetName, tableName, headerRowNumber, dataRowCount }
SpreadsheetImportResult { importRunId, workbookName, dropExisting, importedSheets, importedRows, sheets[], message }
```

---

## 5 — ZUSTAND STORES (`src/store/`)

| Store | State | Key logic |
|-------|-------|-----------|
| `auth-store` | user, profile, isLoading, isAuthenticated | `initialize()` reads token from localStorage → calls `api.getMe()`; `login/register` store JWT tokens; `isAdmin()` checks role |
| `theme-store` | theme: dark\|light | `initializeTheme()` reads localStorage/prefers-color-scheme, sets `data-theme` attr; called before React render |
| `notification-store` | notifications[], unreadCount | `fetchNotifications()`, `markRead(id)`, `markAllRead()`; polled every 30s from Layout |

Token helpers in `src/utils/token.ts`: `getAccessToken()`, `setTokens(a,r)`, `clearTokens()` — all localStorage.

---

## 6 — API CLIENT (`src/services/`)

**`api-client.ts`** — class with `request<T>(endpoint, options)`:
- Prepends `VITE_API_BASE_URL` (default `/api`)
- Sets `Authorization: Bearer <token>`
- On 401 with `TOKEN_EXPIRED` → auto-refresh via `/auth/refresh`
- File uploads use `FormData` (no Content-Type header)

**`api.ts`** — switcher: if `VITE_USE_MOCKS=true` export mock, else export real client.

**Env config** (`src/config/env.ts`): `VITE_APP_ENV`, `VITE_API_BASE_URL`, `VITE_USE_MOCKS`

### Full endpoint table:

| Method | Path | Notes |
|--------|------|-------|
| POST | /auth/login | → AuthResponse |
| POST | /auth/register | → AuthResponse |
| POST | /auth/logout | |
| GET | /auth/me | → { user, profile } |
| GET | /profile | |
| PUT | /profile | |
| POST | /profile/photo | FormData |
| POST | /profile/photo/overlay | { template } |
| GET/POST | /sports | CRUD |
| PUT/DELETE | /sports/:id | |
| GET | /tournaments?filters | → { tournaments[], total } |
| GET/POST | /tournaments/:id | |
| PUT | /tournaments/:id | |
| POST | /tournaments/:id/publish | status → PUBLISHED |
| POST | /tournaments/:id/cancel | |
| POST | /tournaments/:id/complete | |
| POST | /tournaments/:id/join | |
| DELETE | /tournaments/:id/leave | |
| GET | /tournaments/:id/participants | |
| GET | /matches/tournament/:id | |
| GET/POST/PUT | /matches/:id | |
| POST | /matches/:id/score | |
| POST | /matches/:id/attendance | |
| GET | /leaderboard/tournament/:id | |
| GET | /leaderboard/global | |
| GET/POST | /leaderboard/badges | |
| POST | /leaderboard/badges/assign | |
| GET | /stats/player/:userId | → PlayerStats |
| GET | /stats/admin/dashboard | → AdminDashboard |
| GET | /notifications | → { notifications[], unreadCount } |
| PUT | /notifications/:id/read | |
| PUT | /notifications/read-all | |
| POST | /notifications/announcements | |
| GET | /teams/tournament/:id | |
| POST | /teams | |
| GET | /modules | |
| GET | /modules/:id | |
| GET | /badges/main | |
| GET | /badges/sub?moduleId= | |
| GET | /badges/progress/:userId | |
| POST | /badges/award | { userId, subBadgeId } |
| GET | /centres | |
| GET | /groups?centreId= | |
| POST | /admin/imports/spreadsheets | FormData |

---

## 7 — MOCK API

`src/mocks/mock-api.ts` implements every endpoint above using local JSON files in `src/mocks/data/`:

| File | Data |
|------|------|
| `users.json` | Users with password, profiles keyed by id. Demo: `admin@wymca.org`/`admin123`, `player1@wymca.org`/`player123` |
| `centres.json` | Centres + groups |
| `badges.json` | 5 main badges (🎮 Game Mastery, 🤝 Teamwork, 🌐 Esports Citizen, 📈 Personal Development, 💻 Digital Skills), sub-badges, userBadgeProgress per userId |
| `modules.json` | Modules with weekly schedule, linked sub-badges |
| `tournaments.json` | Sports, tournaments, participants, matches, leaderboard entries |

All mock methods are `async` with ~200ms delay. Badge level thresholds: Platinum≥121, Gold≥71, Silver≥31, Bronze≥1.

---

## 8 — SHARED COMPONENTS (`src/components/`)

| Component | What it does |
|-----------|-------------|
| `ui.tsx` → `Loading` | Spinner + text (Loader2 icon) |
| `ui.tsx` → `EmptyState` | Icon + title + description + action slot |
| `ui.tsx` → `StatusBadge` | Maps status string to badge-* class |
| `ui.tsx` → `Avatar` | Photo or initial-letter circle (sm/md/lg/xl) |
| `ui.tsx` → `Modal` | Overlay + backdrop-blur + close btn (sm/md/lg/xl) |
| `ui.tsx` → `ConfirmDialog` | Modal + Cancel/Confirm (danger/primary) |
| `ui.tsx` → `Tabs` | Horizontal tab bar, active highlight |
| `Layout.tsx` | Sidebar (collapsible on mobile) + sticky header + notification bell with badge + ThemeToggle + logout. Player nav: Home, Badges, Modules, Leaderboard, Tournaments, My Tournaments, Stats, Profile. Admin nav: Dashboard, Sports, Tournaments, Badges, Modules, Import Lab, Centres, Analytics. Admin users see both navs with a divider. Polls notifications every 30s. |
| `ProtectedRoute.tsx` | Auth guard: loading → spinner, !auth → /login, adminOnly check. Wraps in Layout. `AuthRoute` for login/register: if auth → redirect / |
| `ThemeToggle.tsx` | Sun/Moon icon button, calls store toggleTheme |

---

## 9 — ROUTES (`App.tsx`)

```
AUTH ROUTES (AuthRoute wrapper — redirects to / if logged in):
  /login              → LoginPage
  /register           → RegisterPage

PLAYER ROUTES (ProtectedRoute wrapper):
  /                   → HomePage
  /badges             → BadgesPage
  /modules            → ModulesPage
  /modules/:id        → ModuleDetailPage
  /leaderboard        → LeaderboardPage
  /tournaments        → TournamentsPage
  /tournaments/:id    → TournamentDetailPage
  /matches/:id        → MatchDetailPage
  /my-tournaments     → MyTournamentsPage
  /stats              → StatsPage
  /profile            → ProfilePage
  /notifications      → NotificationsPage

ADMIN ROUTES (ProtectedRoute adminOnly):
  /admin              → AdminDashboard
  /admin/sports       → SportsManagement
  /admin/tournaments  → AdminTournaments
  /admin/tournaments/create     → TournamentForm
  /admin/tournaments/:id        → AdminTournamentDetail
  /admin/tournaments/:id/edit   → TournamentForm
  /admin/badges       → BadgesManagement
  /admin/modules      → AdminModules
  /admin/import-lab   → AdminImportLab
  /admin/centres      → AdminCentres
  /admin/analytics    → AdminAnalytics

CATCH-ALL: * → redirect /
```

`main.tsx`: Init theme before render. `StrictMode` → `BrowserRouter` → `App` + `Toaster` (top-right, dark styled: bg #1e293b, border #334155, 3s duration).

---

## 10 — PAGES SPEC

### Player Pages

| Page | API calls | UI |
|------|-----------|-----|
| **LoginPage** | auth-store `login()` | Centered card, Trophy logo, email+password (show/hide toggle), error box, demo creds hint, ThemeToggle top-right |
| **RegisterPage** | auth-store `register()` | Same layout, fields: displayName, firstName+lastName (2-col), email, password (min 6) |
| **HomePage** | `getUserBadgeProgress(userId)`, `getTournaments()` | Welcome greeting; **auto-rotating feature carousel** (3 slides, 7s interval, arrows+dots): 1) Badge progress engine 2) Tournament controls 3) Import Lab (admin-only); 4 stat cards; 2-col: badge progress bars + upcoming tournaments |
| **BadgesPage** | `getMainBadges()`, `getSubBadges()`, `getUserBadgeProgress(userId)` | Level threshold info; 3-col card grid per main badge: icon, level, progress bar, sub-badge list (✓ earned / 🔒 locked with points) |
| **ModulesPage** | `getModules()` | 2-col card-hover grid: name, status badge, description, meta (🎮 game, 📅 weeks, 🏅 badges) |
| **ModuleDetailPage** | `getModule(id)` | Breadcrumb; 3 tabs: Overview (description + stats), Schedule (table: week/focus/sub-badge), Sub-Badges (card grid with skills tags) |
| **LeaderboardPage** | `getGlobalLeaderboard()` | 2 tabs: Global / By Centre; ranked table: name, centre, XP, modules, 5 badge-level columns with colored pills |
| **TournamentsPage** | `getTournaments()` | Card list: name, venue, status, participants, dates; create btn (admin) |
| **TournamentDetailPage** | `getTournament`, `getParticipants`, `getMatches`, `getLeaderboard`, `joinTournament`, `leaveTournament` | Header with Join/Leave btns; 4 date info cards; 4 tabs: Details (description+rules+stats), Participants (avatar grid), Schedule (match links), Leaderboard (ranked table) |
| **MatchDetailPage** | `getMatch(id)` | Round label + status; date/venue; 2-col participant cards with attendance; score section |
| **MyTournamentsPage** | `getPlayerStats(userId)` | 3 stat cards (joined/active/completed); tournament list; empty state with browse link |
| **StatsPage** | `getPlayerStats(userId)` | 4 stat cards; 3 colored W/D/L cards (green/yellow/red); earned badges grid |
| **ProfilePage** | `getProfile()`, `updateProfile()` | Avatar initial; form: displayName, firstName, lastName, bio textarea; save btn |
| **NotificationsPage** | notification-store | Mark-all-read btn; cards with type icons (Trophy/Award/BookOpen/Megaphone); unread dot; click→markRead+navigate to linkTo |

### Admin Pages

| Page | API calls | UI |
|------|-----------|-----|
| **AdminDashboard** | `getAdminDashboard()` | 4 stat cards; 3 action link cards (Create Tournament, Manage Sports, Manage Badges); top performers list |
| **SportsManagement** | `getSports()`, `createSport()` | 3-col card grid (emoji icon + name + desc); create modal with name/icon(emoji)/description |
| **AdminTournaments** | `getTournaments()` | Card list with status badges; links to create + detail |
| **TournamentForm** | `getSports`, `getTournaments`, `createTournament`, `updateTournament`, `getTournament` | Create/edit reuse; sections: basics (name, sport, desc, venue with suggestions), schedule (datetime-local + presets: Now/Tomorrow/Next Week + quick helpers), entry (type, capacity presets, team size, scoring points) |
| **AdminTournamentDetail** | `getTournament`, `getParticipants`, `getMatches`, `publishTournament`, `completeTournament` | 4 date cards; 3 tabs: Overview, Participants (table), Matches (cards); Publish/Complete action btns with loading |
| **BadgesManagement** | `getBadges()`, `createBadge()` | 3-col card grid; create modal |
| **AdminModules** | `getModules()` | Card list: name, game, duration, sub-badges, status |
| **AdminImportLab** | `uploadSpreadsheetImport()` | File upload zone + "drop existing" checkbox; result display: 3 stat cards + sheet detail list; error box |
| **AdminCentres** | `getCentres()`, `getGroups()` | Card per centre with nested group cards (name, game, members) |
| **AdminAnalytics** | — | Placeholder: "Charts coming soon" |

---

## 11 — KEY PATTERNS

- Functional components + hooks only
- Data fetching: `api.*()` in `useEffect` with `let cancelled = false` cleanup
- Every page shows `<Loading />` while fetching
- Errors: `try/catch` → `toast.error()`
- No server-state caching — fresh fetch each mount
- Responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Icons: `lucide-react` throughout (Trophy, Award, Bell, Home, BookOpen, Users, Swords, MapPin, Upload, etc.)
- Sports/badges use emoji icons
- Auth tokens: JWT access+refresh in localStorage, auto-refresh on 401
- Admin routes: `<ProtectedRoute adminOnly>` guard
- Toasts: dark themed, top-right, 3s

---

## 12 — FILE TREE

```
src/
  main.tsx
  App.tsx
  index.css
  config/env.ts
  types/index.ts
  store/          auth-store.ts, theme-store.ts, notification-store.ts
  utils/          token.ts, badge-levels.ts, date-time.ts
  services/       api.ts, api-client.ts
  mocks/          mock-api.ts
    data/          users.json, centres.json, badges.json, modules.json, tournaments.json
  components/     Layout.tsx, ProtectedRoute.tsx, ThemeToggle.tsx, ui.tsx
  pages/          LoginPage.tsx, RegisterPage.tsx, HomePage.tsx, BadgesPage.tsx,
                  ModulesPage.tsx, ModuleDetailPage.tsx, LeaderboardPage.tsx,
                  TournamentsPage.tsx, TournamentDetailPage.tsx, MatchDetailPage.tsx,
                  MyTournamentsPage.tsx, StatsPage.tsx, ProfilePage.tsx, NotificationsPage.tsx
    admin/         AdminDashboard.tsx, SportsManagement.tsx, AdminTournaments.tsx,
                  TournamentForm.tsx, AdminTournamentDetail.tsx, BadgesManagement.tsx,
                  AdminModules.tsx, AdminImportLab.tsx, AdminCentres.tsx, AdminAnalytics.tsx
```

---

## BUILD ORDER

1. Scaffold Vite project, install deps, configure Tailwind/PostCSS/TS/Vite
2. `index.html` + `index.css` (theme CSS vars + component classes)
3. `types/index.ts`
4. `config/env.ts` + `utils/*`
5. `store/*` (3 stores)
6. `mocks/data/*.json` + `mocks/mock-api.ts`
7. `services/api-client.ts` + `services/api.ts`
8. `components/*` (ui.tsx, Layout, ProtectedRoute, ThemeToggle)
9. `main.tsx` + `App.tsx`
10. Player pages (Login → Register → Home → Badges → Modules → Leaderboard → Tournaments → Stats → Profile → Notifications)
11. Admin pages (Dashboard → Sports → Tournaments → TournamentForm → TournamentDetail → Badges → Modules → ImportLab → Centres → Analytics)

Set `VITE_USE_MOCKS=true` in `.env` to run standalone without a backend.

## PROMPT END
