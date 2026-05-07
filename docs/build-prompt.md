# Prompt: Build the WYMCA eSports Badge Portal

> This is the natural language prompt used to instruct an AI coding assistant to build the React UI from scratch.

---

## The Problem

Wishaw YMCA is a youth charity that runs an eSports programme called "Pathways". They have a gamified badge system — 5 main badges (Game Mastery, Teamwork, Esports Citizen, Personal Development, Digital Skills), each with sub-badges and XP points. Young people earn badges by completing training modules and participating in tournaments.

Right now, the Centre Manager manually tracks everything in spreadsheets and a clunky WordPress site. We need to replace this with a proper web app.

---

## What to Build

Build me a React single-page application — an **eSports Badge Portal** for Wishaw YMCA. It should work as a standalone frontend with a mock API layer so it can run without a backend.

### Two user roles:

**Players** (young people / parents) can:
- Log in / register
- See a dashboard homepage with their progress summary and upcoming tournaments
- View their badge journey — 5 main badge tracks, each with sub-badges they can earn through modules. Badges have levels: Bronze, Silver, Gold, Platinum based on XP thresholds
- Browse and view training modules (multi-week programmes with weekly session schedules and linked sub-badges)
- Browse tournaments, view details, join or leave, see participants, match schedule, and tournament leaderboard
- View their personal stats — tournaments played, win/loss record, attendance rate, earned badges
- See a global leaderboard showing all players ranked by XP with their badge levels across all 5 tracks
- View their enrolled tournaments
- Edit their profile
- Receive and read notifications (tournament updates, badge awards, module updates, announcements)

**Admins** (centre staff) can do everything players can, plus:
- See an admin dashboard with system-wide stats (total tournaments, players, matches) and quick-action links
- Manage sports (create sports with emoji icons, used as tournament categories)
- Create and manage tournaments — full form with name, sport, description, venue, dates, capacity, individual vs team, scoring points. Publish, cancel, or complete tournaments. View participants and matches
- Manage badges (create main badges)
- View training modules
- Upload spreadsheet files to import data into the system (an "Import Lab" page)
- View centres and their associated groups
- An analytics page (placeholder for now)

### Design requirements:
- Dark mode by default with a light mode toggle. Use a modern dark UI aesthetic — think gaming/esports dashboard. Dark slate backgrounds, indigo/purple accent colors, glassmorphism-style cards with subtle borders and backdrop blur
- Responsive — works on mobile with a collapsible sidebar
- The sidebar should show player navigation, and if the user is an admin, show admin navigation above the player navigation with a divider
- Sticky header with a notification bell (showing unread count) and the theme toggle
- Use toast notifications for success/error feedback
- Show loading spinners while data is being fetched
- Use emoji icons for sports and badges, and an icon library for UI elements
- Clean, modern card layouts throughout. Use status badges (colored pills) for tournament/match/module states

### Mock data should include:
- Demo admin and player accounts with passwords
- Multiple centres and groups
- The 5 main badges with several sub-badges each, linked to modules
- At least 2 training modules with weekly schedules
- At least 2 tournaments with participants, matches, and leaderboard data
- Sample notifications
- Player stats data

### Technical preferences:
- Vite + React + TypeScript
- Tailwind CSS for styling using CSS custom properties for theming
- Zustand for state management (auth state, theme, notifications)
- React Router for client-side routing
- JWT-based auth flow (access + refresh tokens stored in localStorage)
- The API client should support automatic token refresh on 401 responses
- A mock API that can be swapped for a real backend via an environment variable
- All API methods should be async with a small simulated delay

Build the complete working app with all pages, routing, auth guards, mock data, and the full mock API. I should be able to run `npm run dev` and interact with every feature using the demo accounts.
