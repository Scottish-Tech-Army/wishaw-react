# Wishaw YMCA eSports Badge Portal

> A gamified Progressive Web App for Wishaw YMCA's Esports Academy - replacing a manual spreadsheet and WordPress system with a modern student and admin portal.

---

## Table of Contents

- [Background](#background)
- [The Badging System](#the-badging-system)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API & Mock Mode](#api--mock-mode)
- [Environment Variables](#environment-variables)
- [Components & Screens](#components--screens)
- [Contexts & Hooks](#contexts--hooks)
- [Contributing](#contributing)

---

## Background

Wishaw YMCA is a community organisation focused on digital inclusion and youth development through Esports. Despite funding reductions, they operate two Esports rooms and a podcast space, and ran a successful pilot "Mini League" across 6 YMCAs (5 in Scotland, 1 in Ireland).

Their **"Pathways" programme** uses a gamified "Football Card" badging system for junior esports groups. Previously managed on a self-built WordPress site with manual spreadsheet data entry, this app replaces that workflow with a professional, scalable web application that can eventually be licensed to other YMCAs as a SaaS product.

---

## The Badging System

Young people earn XP and progress through **5 main badges**, each levelling up as points accumulate:

| Badge | Description |
|---|---|
| Game Mastery | Learning game mechanics, strategies, and in-game decision making |
| Teamwork | Collaborating, sharing goals, and supporting teammates |
| Esports Citizen | Positive online behaviour, communication, and digital conduct |
| Personal Development | Building confidence, self-awareness, goal-setting, and reflection |
| Digital Skills | Online safety, responsible communication, and using digital tools |

**Badge levels** (XP thresholds):

| Level | XP Range |
|---|---|
| Bronze | 0 - 30 |
| Silver | 31 - 70 |
| Gold | 71 - 120 |
| Platinum | 120+ |

Points are persistent across modules. Each **module** runs 12-16 weeks, with weekly in-person sessions guided by a trained youth worker. Each module contains ~15 sub-badges, each tied to one of the 5 main badges and worth a set XP value.

---

## Features

### Student Portal

- **Dashboard** - Level bar, weekly XP stats, badge hex-grid, recent activity feed, team info, and next session countdown
- **Leaderboard** - Global and period-filtered (All Time / This Month / This Week) rankings, sortable by XP, Level, Modules, or Badges
- **Profile** - View and edit personal info, avatar, gamertag, and bio
- **Public Player Profiles** - Shareable profile pages showing badge progress and stats
- **Badge Catalogue** - Browse all 5 main badges, sub-badges, and XP breakdowns
- **Teams** - View team membership, team stats, and individual team detail pages
- **Evidence Submission** - Submit evidence for badge challenges awaiting approval
- **Settings** - Change password, toggle dark/light theme, manage preferences

### Admin Portal

- **Admin Dashboard** - Platform-wide statistics and quick-action links
- **User Management** - List, search, and manage student accounts
- **Group & Centre Management** - Create and manage groups with game tags and programme types; assign modules to groups; overview cards per centre showing group count, member count, and active modules

### Authentication

- JWT-based login with role detection (`student` / `admin`)
- Persistent session via `localStorage` with expiry validation
- Forgot username (email lookup) and forgot password (hint lookup) flows

### Theme

- Dark/light mode toggle, respecting the OS preference on first visit, persisted to `localStorage`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) + [TypeScript 5.9](https://www.typescriptlang.org/) |
| Build tool | [Vite 7](https://vite.dev/) |
| Routing | [React Router DOM 7](https://reactrouter.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Linting | ESLint 9 + typescript-eslint |
| Backend (target) | Java Spring Boot (REST API, JWT auth) |

---

## Project Structure

```
tfg-hackathon-react/
├── public/                    # Static assets
├── src/
│   ├── api/
│   │   ├── index.ts           # API entry point (swapped for mockApi in mock mode)
│   │   ├── studentApi.ts      # Real fetch-based API calls to Spring Boot backend
│   │   ├── mockApi.ts         # Drop-in mock implementation (no network required)
│   │   ├── mockData.ts        # Static fixture data for mock mode
│   │   └── types.ts           # Shared TypeScript DTOs mirroring backend responses
│   ├── components/
│   │   ├── About.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   ├── News.tsx
│   │   ├── Partners.tsx
│   │   ├── Programs.tsx
│   │   └── portal/
│   │       ├── admin/
│   │       │   ├── AdminAwardProgress.tsx
│   │       │   ├── AdminBadges.tsx
│   │       │   ├── AdminDashboard.tsx
│   │       │   ├── AdminGroups.tsx
│   │       │   ├── AdminLayout.tsx
│   │       │   ├── AdminModules.tsx
│   │       │   └── AdminUsers.tsx
│   │       └── student/
│   │           ├── EvidenceSubmission.tsx
│   │           ├── StudentBadges.tsx
│   │           ├── StudentDashboard.tsx
│   │           ├── StudentLayout.tsx
│   │           ├── StudentLeaderboard.tsx
│   │           ├── StudentProfile.tsx
│   │           ├── StudentPublicProfile.tsx
│   │           ├── StudentSettings.tsx
│   │           ├── StudentTeamDetail.tsx
│   │           └── StudentTeams.tsx
│   ├── context/
│   │   ├── AuthContext.tsx    # JWT auth state, login/logout, credential lookup
│   │   ├── BadgeCatalogueContext.tsx
│   │   └── ThemeContext.tsx   # Dark/light theme with OS preference detection
│   ├── hooks/
│   │   ├── useBadgeCatalogue.ts
│   │   ├── useDashboard.ts
│   │   ├── useEvidenceSubmissions.ts
│   │   ├── useLeaderboard.ts
│   │   ├── useModuleProgress.ts
│   │   ├── usePublicBadgeSummary.ts
│   │   ├── usePublicPlayerProfile.ts
│   │   ├── useStudentProfile.ts
│   │   ├── useTeamDetail.ts
│   │   └── useTeams.ts
│   ├── utils/
│   │   └── badgeUtils.ts
│   ├── App.tsx                # Route definitions
│   ├── main.tsx               # App entry point
│   └── constants.ts
├── docs/
│   ├── project-details/       # Project brief, challenge, and solution docs
│   └── TODO/                  # Task tracking and feature planning
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

### Install dependencies

```bash
npm install
```

### Run in mock mode (no backend required)

```bash
npm run dev:mock
```

This starts the dev server with the mock API layer, using local fixture data. No Spring Boot backend is needed.

### Run against a real backend

1. Create a `.env.local` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

2. Start the dev server:

```bash
npm run dev
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server (real API) |
| `npm run dev:mock` | Start dev server with mock API |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## API & Mock Mode

All API calls are routed through `src/api/index.ts`. When the app is started with `npm run dev:mock` (sets `VITE_USE_MOCK=true`), Vite replaces every import of `src/api/index.ts` with `src/api/mockApi.ts` at build time via a path alias. This means:

- No network requests are made in mock mode
- `studentApi.ts` and all `fetch()` calls are fully tree-shaken from the bundle
- Mock data lives in `src/api/mockData.ts`

The real API targets a **Java Spring Boot** backend and communicates over REST using JWT Bearer tokens stored in `localStorage`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Base URL of the Spring Boot backend API |
| `VITE_USE_MOCK` | `false` | Set to `true` to use the mock API layer |

---

## Components & Screens

### Routes

| Path | Component | Access |
|---|---|---|
| `/` | `Home` (login) | Public |
| `/student` | `StudentDashboard` | Student |
| `/student/leaderboard` | `StudentLeaderboard` | Student |
| `/student/profile` | `StudentProfile` | Student |
| `/student/badges` | `StudentBadges` | Student |
| `/student/settings` | `StudentSettings` | Student |
| `/student/teams` | `StudentTeams` | Student |
| `/student/teams/:teamId` | `StudentTeamDetail` | Student |
| `/student/players/:username` | `StudentPublicProfile` | Student |
| `/student/submit-evidence` | `EvidenceSubmission` | Student |
| `/admin` | `AdminDashboard` | Admin |
| `/admin/users` | `AdminUsers` | Admin |
| `/admin/groups` | `AdminGroups` | Admin |
| `/admin/modules` | `AdminModules` | Admin |
| `/admin/badges` | `AdminBadges` | Admin |
| `/admin/award-progress` | `AdminAwardProgress` | Admin |

---

## Contexts & Hooks

### Contexts

| Context | Purpose |
|---|---|
| `AuthContext` | JWT auth state, `login`, `logout`, `lookupUsername`, `lookupPassword` |
| `ThemeContext` | Dark/light theme toggle, OS preference, `localStorage` persistence |
| `BadgeCatalogueContext` | Shared badge catalogue data across the student portal |

### Custom Hooks

| Hook | Fetches |
|---|---|
| `useDashboard` | Student dashboard summary (XP, badges, activity) |
| `useLeaderboard` | Leaderboard entries with period and sort filters |
| `useStudentProfile` | Student profile data and update mutations |
| `useBadgeCatalogue` | All main badges and sub-badges |
| `useModuleProgress` | Student module completion progress |
| `useTeams` | List of teams the student belongs to |
| `useTeamDetail` | Detail view for a specific team |
| `useEvidenceSubmissions` | Evidence submissions list and submission action |
| `usePublicPlayerProfile` | Public profile data for a given username |
| `usePublicBadgeSummary` | Badge summary for public profile display |

---

## Group & Centre Management

The `/admin/groups` page implements full group lifecycle management for the admin portal.

### Centre Overview Cards

Derived automatically from the groups list — no extra API call needed. Each card shows:
- Centre name and icon
- Number of groups at that centre
- Total member count across all groups
- Count of distinct Active modules assigned to groups at the centre

Cards reflow responsively: 4-up on wide screens → 2-up → 1-up on mobile.

### Groups Table

Sortable by all columns (Group Name, Centre, Game, Type, Members, Modules). Filterable by Centre, Game Tag, and Group Type with a live search box.

| Column | Notes |
|---|---|
| Group Name | Display name |
| Centre | Hub name with emoji icon |
| Game | Colour-coded pill — Minecraft, Rocket League, Fortnite, Competitive, Media, Casual |
| Type | Colour-coded pill — Juniors, Competitive, Media, Casual |
| Members | Total member count |
| Modules | Inline chip list with ✕ remove + `+ module` dropdown |

### Add / Edit Group Modal

Shared `GroupFormModal` component used for both create and edit flows:
- **Name** — free text with required validation
- **Centre** — dropdown of known hubs
- **Game Tag** — dropdown (Minecraft / Rocket League / Fortnite / Competitive / Media / Casual)
- **Group Type** — dropdown (Juniors / Competitive / Media / Casual)
- Server error display for API failures

### Delete Group with Member Reassignment

Two-step confirmation flow:
1. Warning box showing the group name and member count
2. Optional reassignment dropdown — pick another group to absorb the members before deletion
3. First click on "Remove Group" shows a final "Are you sure?" prompt; second click confirms

### Assign / Unassign Modules Inline

Directly from the table row — no drawer or separate page needed:
- Assigned modules render as teal chips with a ✕ button to unassign
- A `+ module` select dropdown lists all Active modules not yet assigned to the group
- Selecting one immediately calls `assignModuleToGroup` and updates local state

### API Surface

| Function | Method | Endpoint |
|---|---|---|
| `getAdminGroups` | GET | `/api/v1/admin/groups` |
| `createAdminGroup` | POST | `/api/v1/admin/groups` |
| `updateAdminGroup` | PUT | `/api/v1/admin/groups/:id` |
| `deleteAdminGroup` | DELETE | `/api/v1/admin/groups/:id` |
| `assignModuleToGroup` | POST | `/api/v1/admin/groups/:id/modules/:moduleId` |
| `unassignModuleFromGroup` | DELETE | `/api/v1/admin/groups/:id/modules/:moduleId` |

### Types Added

```ts
export type AdminGroupGame =
  | "Minecraft" | "Rocket League" | "Fortnite"
  | "Competitive" | "Media" | "Casual";

export type AdminGroupType = "Juniors" | "Competitive" | "Media" | "Casual";

export interface AdminGroupDto {
  id: string;
  name: string;
  hub: string;
  game: AdminGroupGame;
  groupType: AdminGroupType;
  moduleIds: number[];
  memberCount: number;
}
```

---

## Contributing

This project is developed as a hackathon/TFG (Final Degree Project) in collaboration with [Scottish Tech Army](https://www.scottishtecharmy.org/) and Wishaw YMCA.

See [`docs/TODO/`](docs/TODO/) for current task tracking and feature planning.

---

*Built with love for Wishaw YMCA Esports Academy*
