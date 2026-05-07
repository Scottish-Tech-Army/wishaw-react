# Reusable Prompt: Build the WYMCA eSports Badge Portal UI

Use this prompt with an AI coding assistant (Copilot, Cursor, etc.) to rebuild the full React UI from scratch.

---

## PROMPT START

You are building the **WYMCA eSports Badge Portal** — a React single-page application for **Wishaw YMCA**, a charity that runs youth eSports programmes. The app has two user roles: **Player** and **Admin**. Players track badges, modules, tournaments, and leaderboards. Admins manage sports, tournaments, badges, modules, centres, and data imports.

---

### 1. PROJECT SCAFFOLDING

Create a Vite + React + TypeScript project:

```bash
npm create vite@latest wishaw-react -- --template react-ts
cd wishaw-react
npm install
```

**package.json dependencies:**

```json
{
  "dependencies": {
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.468.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.54.2",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.28.0",
    "recharts": "^2.15.0",
    "zod": "^3.24.2",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.8.3",
    "vite": "^6.3.5"
  }
}
```

**Key libraries and their purpose:**
| Library | Purpose |
|---------|---------|
| `react-router-dom` | Client-side routing with `BrowserRouter`, `Routes`, `Route` |
| `zustand` | Lightweight global state management (auth store, theme store, notification store) |
| `lucide-react` | Icon library (Trophy, Award, Bell, BookOpen, Users, etc.) |
| `tailwindcss 3` | Utility-first CSS framework with CSS custom property theming |
| `clsx` | Conditional CSS class merging |
| `react-hot-toast` | Toast notification popups (`Toaster` component) |
| `react-hook-form` | Form state management (used in tournament form) |
| `zod` | Schema validation |
| `recharts` | Charting library (available for analytics) |
| `date-fns` | Date formatting utilities |

---

### 2. VITE CONFIGURATION

**`vite.config.ts`:**
- Plugin: `@vitejs/plugin-react`
- Path alias: `@` → `./src`
- Dev server on port `3000`

**`postcss.config.js`:** Plugins: `tailwindcss`, `autoprefixer`

**`tsconfig.app.json`:** Target ES2022, strict mode, jsx react-jsx, resolveJsonModule, exclude `src/__tests__`

---

### 3. THEMING SYSTEM (DARK/LIGHT MODE)

The app uses a **CSS custom property theming system** with Tailwind. Two color scales are defined:
- `primary` (50–950): Indigo in dark mode, sky-blue in light mode
- `surface` (50–950): Slate grays, **inverted in light mode** (surface-800 becomes white, surface-900 becomes near-white)

**`index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root, :root[data-theme='dark'] {
    /* Indigo primary scale */
    --color-primary-50: 238 242 255;
    --color-primary-500: 99 102 241;
    --color-primary-600: 79 70 229;
    /* ... full 50-950 scale */

    /* Slate surface scale */
    --color-surface-50: 248 250 252;
    --color-surface-800: 30 41 59;
    --color-surface-900: 15 23 42;
    /* ... full 50-950 scale */

    --app-bg-image: radial-gradient(circle at top left, rgba(99,102,241,0.18), transparent 28%), linear-gradient(180deg, rgba(2,6,23,1), rgba(15,23,42,1));
  }

  :root[data-theme='light'] {
    /* Sky-blue primary scale */
    --color-primary-500: 14 165 233;
    /* ... full 50-950 scale */

    /* INVERTED surface scale (dark values map to light equivalents) */
    --color-surface-50: 15 23 42;   /* darkest text */
    --color-surface-800: 255 255 255; /* white cards */
    --color-surface-900: 248 250 252; /* near-white background */
    /* ... */
    --app-bg-image: radial-gradient(circle at top left, rgba(14,165,233,0.12), transparent 24%), linear-gradient(180deg, rgba(255,255,255,1), rgba(241,245,249,1));
  }

  body { @apply bg-surface-900 text-white antialiased transition-colors duration-200; background-image: var(--app-bg-image); }
  :root[data-theme='light'] .text-white { color: rgb(var(--color-foreground-strong)) !important; }
}
```

**`tailwind.config.js`:**
- Extend colors with `primary` and `surface` scales using `rgb(var(--color-...) / <alpha-value>)` syntax
- Font: `Inter` (loaded via Google Fonts in `index.html`)

**Theme is toggled** via `data-theme` attribute on `<html>` element, persisted in `localStorage` key `wishaw-theme`.

---

### 4. TAILWIND COMPONENT CLASSES

Define these reusable component classes in `@layer components` inside `index.css`:

| Class | Description |
|-------|-------------|
| `.btn-primary` | Indigo bg, white text, rounded-xl, shadow-lg |
| `.btn-secondary` | surface-800 bg, surface-200 text, border |
| `.btn-danger` | Red-500/15 bg, red-400 text, red border |
| `.btn-ghost` | Transparent, hover surface-700 |
| `.btn-sm` / `.btn-lg` | Size variants |
| `.card` | surface-800/95 bg, surface-700/50 border, rounded-2xl, p-5, backdrop-blur |
| `.card-hover` | Card + hover:border-primary-500/30 transition |
| `.input` | surface-700/50 bg, surface-600 border, rounded-xl, focus:border-primary-500 |
| `.label` | sm font-medium text-surface-300 |
| `.badge-primary/success/warning/danger/neutral` | Inline-flex pill badges with colored bg/text/border at 15% opacity |
| `.page-header` | text-2xl font-bold |
| `.stat-card` | surface-800 bg, rounded-xl, p-4, text-center |
| `.table` / `.table th` / `.table td` | Table with surface-700 borders, hover row highlight |
| `.theme-toggle` | Rounded-full border btn for dark/light switch |

---

### 5. TYPESCRIPT TYPES (`src/types/index.ts`)

Define these interfaces and types:

**Auth:** `UserRole` ('PLAYER' | 'ADMIN' | 'SUPER_ADMIN'), `User` (id, email, role, centreId?), `Profile` (displayName, firstName, lastName, bio?, photoUrl?, overlayTemplate?, privacy), `AuthResponse` (accessToken, refreshToken, user, profile)

**Centres:** `Centre` (id, name, location), `Group` (id, name, game, centreId, centreName?, memberCount)

**Badges:** `MainBadgeName` (5 literal types: 'Game Mastery' | 'Teamwork' | 'Esports Citizen' | 'Personal Development' | 'Digital Skills'), `BadgeLevel` ('None' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'), `MainBadge` (id, name, description, icon), `SubBadge` (id, name, description, mainBadgeId, mainBadgeName, points, skills[], moduleId), `UserBadgeProgress` (mainBadgeId, mainBadgeName, totalPoints, level, earnedSubBadges[])

**Modules:** `ModuleSession` (weekNo, focus, subBadgeId?, sessionPlanUrl?, slidesUrl?), `Module` (id, name, game, description, durationWeeks, subBadges[], schedule[], status: 'ACTIVE'|'COMPLETED'|'DRAFT')

**Leaderboard:** `LeaderboardEntry` (userId, displayName, centreId, centreName, totalPoints, badgeLevels: Record<MainBadgeName, BadgeLevel>, completedModules)

**Sports/Tournaments:** `Sport` (id, name, icon, description, scoreFields[], rankingPoints), `ScoreField` (key, label, type), `TournamentStatus`, `TournamentType`, `ParticipantStatus`, `AttendanceStatus`, `MatchStatus`, `Tournament` (id, name, sportId, sport?, description, rules?, venue, type, status, startDate, endDate, regStartDate, regEndDate, capacity, participantCount, teamMinSize?, teamMaxSize?, pointsWin, pointsDraw, pointsLoss), `Participant`, `Match`, `MatchParticipant`, `MatchScore`, `Team`

**Notifications:** `NotificationType` ('TOURNAMENT' | 'ANNOUNCEMENT' | 'BADGE' | 'MODULE'), `Notification` (id, type, title, message, isRead, createdAt, linkTo?)

**Stats:** `PlayerStats` (tournamentsJoined, activeTournaments, completedTournaments, matchesPlayed, wins, losses, draws, attendanceRate, badges[], tournaments[]), `AdminDashboard` (totalTournaments, activeTournaments, totalPlayers, totalMatches, registrationsByTournament[], attendanceTrend[], topPerformers[], recentScores[])

**Imports:** `SpreadsheetImportSheet`, `SpreadsheetImportResult`

---

### 6. STATE MANAGEMENT (Zustand Stores)

Create three Zustand stores in `src/store/`:

**`auth-store.ts`:**
- State: `user`, `profile`, `isLoading`, `isAuthenticated`
- Actions: `initialize()` — check localStorage for token, call `api.getMe()` to restore session; `login(email, password)` — call API, store tokens in localStorage; `register(data)` — same as login; `logout()` — call API, clear tokens; `updateProfile(profile)` — update local state; `isAdmin()` — check role === 'ADMIN' or 'SUPER_ADMIN'

**`theme-store.ts`:**
- State: `theme` ('dark' | 'light')
- Actions: `initializeTheme()` — read from localStorage or prefers-color-scheme; `setTheme(theme)` — apply `data-theme` attribute; `toggleTheme()`
- Theme persisted in localStorage key `wishaw-theme`
- Call `initializeTheme()` before React render in `main.tsx`

**`notification-store.ts`:**
- State: `notifications[]`, `unreadCount`
- Actions: `fetchNotifications()`, `markRead(id)`, `markAllRead()`
- Polled every 30 seconds from the Layout component

---

### 7. TOKEN MANAGEMENT (`src/utils/token.ts`)

Store `accessToken` and `refreshToken` in localStorage. Functions: `getAccessToken()`, `getRefreshToken()`, `setTokens(access, refresh)`, `clearTokens()`.

---

### 8. API CLIENT (`src/services/api-client.ts`)

Build a class-based `ApiClient` with:
- `request<T>(endpoint, options)` — prepends `baseUrl`, sets `Authorization: Bearer <token>`, auto-refreshes on 401 with `TOKEN_EXPIRED` code
- `refreshToken()` — POST to `/auth/refresh` with refresh token
- File upload methods use `FormData` without Content-Type header

**Full API endpoint list:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Register |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user + profile |
| GET | `/profile` | Get profile |
| PUT | `/profile` | Update profile |
| POST | `/profile/photo` | Upload photo (FormData) |
| POST | `/profile/photo/overlay` | Set badge overlay template |
| GET | `/sports` | List all sports |
| POST | `/sports` | Create sport |
| PUT | `/sports/:id` | Update sport |
| DELETE | `/sports/:id` | Delete sport |
| GET | `/tournaments` | List tournaments (optional query filters) |
| GET | `/tournaments/:id` | Get tournament |
| POST | `/tournaments` | Create tournament |
| PUT | `/tournaments/:id` | Update tournament |
| POST | `/tournaments/:id/publish` | Publish tournament |
| POST | `/tournaments/:id/cancel` | Cancel tournament |
| POST | `/tournaments/:id/complete` | Complete tournament |
| POST | `/tournaments/:id/join` | Join tournament |
| DELETE | `/tournaments/:id/leave` | Leave tournament |
| GET | `/tournaments/:id/participants` | Get participants |
| GET | `/matches/tournament/:id` | Get matches for tournament |
| GET | `/matches/:id` | Get single match |
| POST | `/matches` | Create match |
| PUT | `/matches/:id` | Update match |
| POST | `/matches/:id/score` | Submit score |
| POST | `/matches/:id/attendance` | Mark attendance |
| GET | `/matches/:id/score` | Get score |
| GET | `/matches/:id/score/audit` | Get score audit log |
| GET | `/leaderboard/tournament/:id` | Tournament leaderboard |
| GET | `/leaderboard/global` | Global leaderboard |
| GET | `/leaderboard/badges` | List badges (LTC-style) |
| POST | `/leaderboard/badges` | Create badge |
| POST | `/leaderboard/badges/assign` | Assign badge to user |
| GET | `/leaderboard/badges/user/:id` | Get user's badges |
| POST | `/leaderboard/calories` | Log calories |
| GET | `/leaderboard/calories/user/:id` | Get user calories |
| GET | `/stats/player/:userId` | Player stats |
| GET | `/stats/admin/dashboard` | Admin dashboard data |
| GET | `/notifications` | Get notifications + unread count |
| PUT | `/notifications/:id/read` | Mark notification read |
| PUT | `/notifications/read-all` | Mark all read |
| POST | `/notifications/announcements` | Create announcement |
| GET | `/notifications/announcements/tournament/:id` | Get announcements |
| GET | `/notifications/share/:type/:id` | Get share data |
| GET | `/notifications/gallery/tournament/:id` | Get gallery |
| GET | `/teams/tournament/:id` | Get teams |
| POST | `/teams` | Create team |
| GET | `/modules` | List modules |
| GET | `/modules/:id` | Get module |
| GET | `/badges/main` | Get main badges |
| GET | `/badges/sub` | Get sub-badges (optional `?moduleId=`) |
| GET | `/badges/progress/:userId` | Get badge progress |
| POST | `/badges/award` | Award sub-badge |
| GET | `/centres` | List centres |
| GET | `/groups` | List groups (optional `?centreId=`) |
| POST | `/admin/imports/spreadsheets` | Upload spreadsheet (FormData) |

**Environment config (`src/config/env.ts`):**
- `VITE_APP_ENV` (default 'local')
- `VITE_API_BASE_URL` (default '/api')
- `VITE_USE_MOCKS` ('true' enables mock API)

**API switcher (`src/services/api.ts`):** If `env.useMocks` is true, export `mockApi`; otherwise export `realApi`.

---

### 9. MOCK API SYSTEM

Create `src/mocks/mock-api.ts` that implements every method from the API client using local JSON data.
- All methods are `async` with a small `delay()` (200ms) to simulate network
- JSON data files in `src/mocks/data/`: `users.json`, `centres.json`, `badges.json`, `modules.json`, `tournaments.json`
- Mock login validates email+password against users.json
- Enable mocks via `VITE_USE_MOCKS=true` in `.env`

---

### 10. UTILITY FUNCTIONS

**`src/utils/badge-levels.ts`:**
- `getBadgeLevel(points)`: Platinum ≥121, Gold ≥71, Silver ≥31, Bronze ≥1, else None
- `BADGE_LEVEL_COLORS`: Record mapping each BadgeLevel to Tailwind classes (e.g., Gold → 'text-yellow-300 bg-yellow-900/30')

**`src/utils/date-time.ts`:**
- `formatDateTime(value)`: Intl.DateTimeFormat with medium date + short time
- `formatDate(value)`: Intl.DateTimeFormat medium date only
- `toDateTimeLocalValue(value)`: Convert to `datetime-local` input format
- `shiftDateTimeLocalValue(value, minutes)`: Shift a datetime-local value

---

### 11. SHARED COMPONENTS (`src/components/`)

**`ui.tsx`** — Contains reusable UI primitives:
- `Loading` — Spinner with text (uses `Loader2` icon)
- `EmptyState` — Icon + title + description + optional action
- `StatusBadge` — Maps status strings to badge-* CSS classes
- `Avatar` — Photo or initial-letter circle (sm/md/lg/xl sizes)
- `Modal` — Overlay with backdrop-blur, close button, sm/md/lg/xl sizes
- `ConfirmDialog` — Modal with Cancel + Confirm buttons (danger/primary variants)
- `Tabs` — Horizontal tab bar with active state highlight

**`Layout.tsx`** — App shell with:
- Collapsible sidebar (hidden on mobile, revealed via hamburger)
- Player nav: Home, Badges, Modules, Leaderboard, Tournaments, My Tournaments, Stats, Profile
- Admin nav: Dashboard, Sports, Tournaments, Badges, Modules, Import Lab, Centres, Analytics
- If admin: show admin nav + divider + player nav
- Sticky top header with workspace label, ThemeToggle, notification bell with unread badge
- User avatar with role display in sidebar footer
- Logout button
- Notification polling every 30 seconds
- Icons from lucide-react: Trophy, Home, User, Bell, LogOut, Menu, X, LayoutDashboard, Swords, Calendar, Award, BarChart3, BookOpen, MapPin, Upload

**`ProtectedRoute.tsx`:**
- `ProtectedRoute` — If loading show Loading spinner; if not authenticated redirect to /login; if adminOnly and not admin redirect to /; wraps children in Layout
- `AuthRoute` — If authenticated redirect to /; otherwise render children (for login/register pages)

**`ThemeToggle.tsx`** — Button with Sun/Moon icon, calls `toggleTheme()` from theme store

---

### 12. ROUTING (`App.tsx`)

Use `react-router-dom` `<Routes>` with these routes:

**Public (wrapped in `AuthRoute`):**
- `/login` → LoginPage
- `/register` → RegisterPage

**Player (wrapped in `ProtectedRoute`):**
- `/` → HomePage
- `/badges` → BadgesPage
- `/modules` → ModulesPage
- `/modules/:id` → ModuleDetailPage
- `/leaderboard` → LeaderboardPage
- `/tournaments` → TournamentsPage
- `/tournaments/:id` → TournamentDetailPage
- `/matches/:id` → MatchDetailPage
- `/my-tournaments` → MyTournamentsPage
- `/stats` → StatsPage
- `/profile` → ProfilePage
- `/notifications` → NotificationsPage

**Admin (wrapped in `ProtectedRoute adminOnly`):**
- `/admin` → AdminDashboard
- `/admin/sports` → SportsManagement
- `/admin/tournaments` → AdminTournaments
- `/admin/tournaments/create` → TournamentForm
- `/admin/tournaments/:id` → AdminTournamentDetail
- `/admin/tournaments/:id/edit` → TournamentForm
- `/admin/badges` → BadgesManagement
- `/admin/modules` → AdminModules
- `/admin/import-lab` → AdminImportLab
- `/admin/centres` → AdminCentres
- `/admin/analytics` → AdminAnalytics

**Catch-all:** `*` → redirect to `/`

**`main.tsx`:**
- Call `useThemeStore.getState().initializeTheme()` before render
- Wrap App in `StrictMode` → `BrowserRouter`
- Add `<Toaster>` from react-hot-toast with dark styled toasts (position: top-right, bg: #1e293b, border: #334155, rounded-12px)

---

### 13. PAGE IMPLEMENTATIONS

#### 13.1 LoginPage
- Full-page centered card with Trophy icon logo, "WYMCA eSports" heading
- Email + password form with show/hide password toggle (Eye/EyeOff icons)
- Error display in red-bordered box
- Loading state on submit button
- Link to register page
- Demo credentials hint at bottom
- ThemeToggle in top-right corner
- On success: `toast.success('Welcome back!')`, navigate to `/`

#### 13.2 RegisterPage
- Same layout as Login with Trophy logo
- Fields: Display Name, First Name, Last Name (2-col grid), Email, Password (min 6 chars)
- Show/hide password toggle
- On success: `toast.success('Account created!')`, navigate to `/`
- Link to sign in page

#### 13.3 HomePage
- Welcome greeting with user's display name
- **Feature Carousel/Slider** with 3 slides (auto-rotates every 7 seconds):
  1. **Player Growth Engine** — Badge progress stats (total XP, active tracks, sub-badges earned)
  2. **Competition Control** — Tournament flow safety features
  3. **Admin Ops And Data** (admin only) — Import Lab feature description
  - Each slide has: eyebrow text, title, description, 3 highlight stat boxes, bullet points, CTA link, icon
  - Navigation: prev/next arrows, dot indicators, slide counter
- **4 stat cards** in grid: Total Points, Active Badges, Sub-Badges Earned, Live Tournaments
- **2-column grid**: Badge Progress section (progress bars per main badge) + Upcoming Tournaments list
- API calls: `api.getUserBadgeProgress(userId)`, `api.getTournaments()`

#### 13.4 BadgesPage
- Info section explaining badge levels and thresholds
- **Card grid (3 cols responsive)** per main badge showing:
  - Icon + badge name + current level with color
  - Points display + progress bar (capped at 120pt scale)
  - List of sub-badges: green checkmark if earned, grey lock if not, shows point value
- API calls: `api.getMainBadges()`, `api.getSubBadges()`, `api.getUserBadgeProgress(userId)`

#### 13.5 ModulesPage
- Section header with description
- **Card grid (2 cols)** with card-hover class, each showing: name, status badge, description, meta (🎮 game, 📅 weeks, 🏅 sub-badge count)
- Links to `/modules/:id`
- API: `api.getModules()`

#### 13.6 ModuleDetailPage
- Breadcrumb back link to modules list
- Header: module name, game, duration, status badge
- **3 tabs**: Overview (description + stat cards), Schedule (table with weekNo, focus, sub-badge link), Sub-Badges (card grid with name, points, description, skills tags)
- API: `api.getModule(id)`

#### 13.7 LeaderboardPage
- **2 tabs**: Global, By Centre
- Large table: rank, player name, centre, total XP, completed modules, + 5 badge-level columns
- Badge level pills use `BADGE_LEVEL_COLORS` for color coding
- API: `api.getGlobalLeaderboard()`

#### 13.8 TournamentsPage
- Card list of all tournaments with name, venue, status badge, participant count, dates
- Link to tournament detail
- Create tournament button (admin only)
- API: `api.getTournaments()`

#### 13.9 TournamentDetailPage
- Breadcrumb, header with name/venue/status + Join/Leave buttons
- **4 info cards**: start date, end date, reg start, reg end
- **4 tabs**: Details (description, rules, stats), Participants (grid of avatar cards), Schedule (match list linking to /matches/:id), Leaderboard (ranked table)
- Join/Leave with `actionLoading` state, conditional visibility based on registration status
- API: `api.getTournament(id)`, `api.getParticipants(id)`, `api.getMatches(id)`, `api.getLeaderboard(id)`, `api.joinTournament(id)`, `api.leaveTournament(id)`

#### 13.10 MatchDetailPage
- Header with round label + status badge
- Date/time + venue info
- 2-column participant cards with attendance status
- Score section
- API: `api.getMatch(id)`

#### 13.11 MyTournamentsPage
- **3 stat cards**: Joined, Active, Completed
- Tournament card list from player stats
- Empty state with "Browse Tournaments" link
- API: `api.getPlayerStats(userId)`

#### 13.12 StatsPage
- **4 stat cards**: Tournaments, Matches, Wins, Attendance %
- **3 colored cards**: Wins (green), Draws (yellow), Losses (red)
- Earned badges grid with emoji icons
- API: `api.getPlayerStats(userId)`

#### 13.13 ProfilePage
- Avatar with initial letter
- Form: Display Name, First Name, Last Name, Bio (textarea)
- Save button with loading state
- Updates auth store profile on success
- API: `api.getProfile()`, `api.updateProfile(form)`

#### 13.14 NotificationsPage
- "Mark all read" button
- Notification cards with type-specific icons (Trophy=TOURNAMENT, Award=BADGE, BookOpen=MODULE, Megaphone=ANNOUNCEMENT)
- Unread dot indicator
- Click navigates to `notification.linkTo` after marking read
- Empty state with Bell icon
- Uses notification store

---

### 14. ADMIN PAGES

#### 14.1 AdminDashboard
- **4 stat cards**: Total Tournaments, Active, Total Players, Total Matches
- **3 action link cards** to: Create Tournament, Manage Sports, Manage Badges
- Top performers list with win counts
- API: `api.getAdminDashboard()`

#### 14.2 SportsManagement
- **Card grid (3 cols)** showing sport emoji icon + name + description
- Create modal with name, emoji icon field, description
- API: `api.getSports()`, `api.createSport(data)`

#### 14.3 AdminTournaments
- Tournament card list with name, venue, status badge
- Link to create + detail pages
- API: `api.getTournaments()`

#### 14.4 TournamentForm (Create/Edit)
- Reused for `/admin/tournaments/create` and `/admin/tournaments/:id/edit`
- **Comprehensive form** with sections:
  - Tournament basics: name, sport select, description, rules, venue
  - Schedule: start/end dates with datetime-local inputs, preset buttons (Now, Tomorrow, Next Week), quick helpers (Open at tournament start, Deadline 1hr before, Make it 2hr event)
  - Entry: type (INDIVIDUAL/TEAM), capacity with presets, team size (if TEAM), scoring points (win/draw/loss)
  - Venue suggestions from existing tournaments + defaults
- API: `api.getSports()`, `api.getTournaments()`, `api.createTournament(payload)`, `api.updateTournament(id, payload)`, `api.getTournament(id)`

#### 14.5 AdminTournamentDetail
- **4 date info cards** (start, end, reg open, reg close)
- **3 tabs**: Overview, Participants (table), Matches (card list)
- Status transition buttons: Publish (DRAFT→PUBLISHED), Complete (PUBLISHED→COMPLETED) with loading states
- API: `api.getTournament(id)`, `api.getParticipants(id)`, `api.getMatches(id)`, `api.publishTournament(id)`, `api.completeTournament(id)`

#### 14.6 BadgesManagement
- **Card grid (3 cols)** with emoji icon + name + description
- Create modal with name, icon (emoji), description
- API: `api.getBadges()`, `api.createBadge(data)`

#### 14.7 AdminModules
- Card list with name, game, duration, sub-badge count, status badge
- Links to module detail
- API: `api.getModules()`

#### 14.8 AdminImportLab
- **File upload** with dashed-border drop zone, file input, checkbox for "Drop existing tables"
- Selected file display with clear button
- Import button with loading state
- **Result display**: 3 stat cards (workbook name, sheets imported, rows loaded) + sheet detail list
- Error message box
- API: `api.uploadSpreadsheetImport(file, { dropExisting })`

#### 14.9 AdminCentres
- Card per centre with name + location
- Nested group cards showing name, game, member count
- API: `api.getCentres()`, `api.getGroups()`

#### 14.10 AdminAnalytics
- Placeholder page: "Analytics dashboard — charts coming soon"

---

### 15. `index.html`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#6366f1" />
  <meta name="description" content="Wishaw YMCA eSports Academy - Digital Badge Portal" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <title>WYMCA eSports Badge Portal</title>
</head>
<body class="bg-surface-900 text-white antialiased">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

---

### 16. DESIGN PATTERNS & CONVENTIONS

1. **All pages use functional components** with hooks (`useState`, `useEffect`)
2. **Data fetching**: Direct `api.*()` calls in `useEffect` with cleanup flags (`let cancelled = false`)
3. **Loading states**: Every page shows `<Loading />` spinner while fetching
4. **Error handling**: `try/catch` with `toast.error()` for user feedback
5. **No external state management for server data** — fetched fresh, no caching layer
6. **Responsive layout**: Tailwind grid classes (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
7. **Consistent card design**: `card` class with surface-800 bg, surface-700 border, rounded-2xl
8. **Status badges**: Reusable StatusBadge component mapping status strings to colored pills
9. **Admin-only routes**: Guarded by `ProtectedRoute adminOnly` prop
10. **Sidebar navigation**: Combined admin + player nav with divider for admin users
11. **Toast notifications**: Dark themed, positioned top-right, 3-second duration
12. **Auth tokens in localStorage**: JWT access + refresh pattern with auto-refresh on 401
13. **File paths use `@/` alias** for src imports (configured in vite.config.ts)
14. **Icon usage**: lucide-react icons throughout, emoji icons for sports/badges

---

### 17. FILE STRUCTURE

```
src/
  main.tsx                  # Entry point, BrowserRouter, Toaster, theme init
  App.tsx                   # Routes definition
  index.css                 # Tailwind + CSS custom properties + component classes
  config/
    env.ts                  # VITE_* env config
  types/
    index.ts                # All TypeScript interfaces
  store/
    auth-store.ts           # Zustand auth state
    theme-store.ts          # Zustand theme state
    notification-store.ts   # Zustand notification state
  utils/
    token.ts                # localStorage token helpers
    badge-levels.ts         # Badge level thresholds + colors
    date-time.ts            # Date formatting helpers
  services/
    api.ts                  # Mock/real API switcher
    api-client.ts           # Real API client class
  mocks/
    mock-api.ts             # Mock API implementation
    data/
      users.json
      centres.json
      badges.json
      modules.json
      tournaments.json
  components/
    Layout.tsx              # App shell (sidebar + header)
    ProtectedRoute.tsx      # Auth guards
    ThemeToggle.tsx          # Dark/light toggle button
    ui.tsx                  # Shared UI primitives
  pages/
    LoginPage.tsx
    RegisterPage.tsx
    HomePage.tsx
    BadgesPage.tsx
    ModulesPage.tsx
    ModuleDetailPage.tsx
    LeaderboardPage.tsx
    TournamentsPage.tsx
    TournamentDetailPage.tsx
    MatchDetailPage.tsx
    MyTournamentsPage.tsx
    StatsPage.tsx
    ProfilePage.tsx
    NotificationsPage.tsx
    admin/
      AdminDashboard.tsx
      SportsManagement.tsx
      AdminTournaments.tsx
      TournamentForm.tsx
      AdminTournamentDetail.tsx
      BadgesManagement.tsx
      AdminModules.tsx
      AdminImportLab.tsx
      AdminCentres.tsx
      AdminAnalytics.tsx
```

---

### 18. MOCK DATA STRUCTURE

Provide JSON seed data for the mock API:

**`users.json`**: Array of users with id, email, password, role (ADMIN/PLAYER), centreId. Include profiles keyed by user id with displayName, firstName, lastName, bio, privacy settings. Demo accounts: `admin@wymca.org`/`admin123` (ADMIN) and `player1@wymca.org`/`player123` (PLAYER).

**`centres.json`**: Array of centres (id, name, location) and groups (id, name, game, centreId, memberCount).

**`badges.json`**: 5 main badges (Game Mastery 🎮, Teamwork 🤝, Esports Citizen 🌐, Personal Development 📈, Digital Skills 💻), sub-badges linked to modules, and userBadgeProgress keyed by userId.

**`modules.json`**: Training modules with schedule (weekly sessions), linked sub-badges, status.

**`tournaments.json`**: Sports, tournaments, participants per tournament, matches per tournament, leaderboard entries per tournament.

---

### 19. BACKEND CONTEXT

The backend is a **Spring Boot (Java)** REST API with:
- JWT auth (access + refresh tokens)
- H2 or PostgreSQL database
- Endpoints matching the API table above
- Role-based access control (PLAYER, ADMIN, SUPER_ADMIN)
- Spreadsheet import capability for data migration

---

## PROMPT END

Build every file listed above. Start with the project scaffold, configs, types, stores, and services. Then build components and pages in the order listed. Use the mock API system so the app works standalone without the backend.
