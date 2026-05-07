# Prompt 2: Build React UI from BRD + Tech Stack

> Use this prompt after the BRD is ready. Paste the BRD content and your tech preferences to get a complete working React frontend.

---

## PROMPT START

You are a senior frontend developer. Build me a **complete, working React SPA** based on the Business Requirements Document and tech stack below. The app must run standalone with a mock API — no backend required.

---

### BRD Context:

[PASTE YOUR BRD HERE]

---

### Tech Stack:

- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS with CSS custom properties for dark/light theming
- **State management:** Zustand (stores for auth, theme, notifications)
- **Routing:** React Router v6 with protected routes and role-based guards
- **Icons:** lucide-react
- **Notifications:** react-hot-toast
- **Forms:** react-hook-form + zod for validation
- **Charts:** recharts (where analytics are needed)
- **Date utilities:** date-fns

---

### What I need you to build:

**1. Project structure**
- Scaffold a Vite React TypeScript project
- Configure Tailwind with custom theme (dark/light mode via CSS custom properties and a `data-theme` attribute)
- Set up path aliases, PostCSS, ESLint

**2. Theming**
- Dark mode default with a toggle to light
- Two color scales (primary accent + surface/neutral) defined as CSS custom properties
- Persist theme choice in localStorage
- Modern gaming/esports aesthetic — dark backgrounds, vibrant accent colors, glassmorphism cards

**3. TypeScript types**
- Define all interfaces and types in a single types file based on the BRD entities
- Use string literal union types for enums (roles, statuses, badge levels, etc.)

**4. State management**
- Auth store: login, register, logout, session restore from token, role check
- Theme store: toggle, persist, apply before render
- Notification store: fetch, mark read, mark all read

**5. Mock API layer**
- Create a mock API module that implements every endpoint using local JSON data files
- All methods async with simulated delay
- Seed data covering all entities from the BRD (users, badges, modules, tournaments, etc.)
- Include demo accounts (admin + player) with working login
- Environment variable to switch between mock and real API

**6. API client**
- Class-based client that prepends a configurable base URL
- JWT Bearer token in headers
- Automatic token refresh on 401 responses
- FormData support for file uploads

**7. Reusable components**
- App shell: sidebar navigation (collapsible on mobile) + sticky header + notification bell
- Loading spinner, empty state, status badges, avatar, modal, confirm dialog, tabs
- Button variants, card variants, form input classes
- All defined as Tailwind component classes for consistency

**8. Routing**
- Public routes (login, register) that redirect to home if already authenticated
- Protected routes that redirect to login if not authenticated
- Admin-only routes that redirect to home if not admin
- All protected routes wrapped in the app shell layout

**9. All pages from the BRD**
- Build every player-facing and admin-facing page specified in the BRD
- Each page should fetch data from the mock API on mount
- Show loading state while fetching, handle errors with toast
- Use responsive grid layouts

**10. Patterns to follow**
- Functional components with hooks only
- Data fetching in useEffect with cleanup flags
- No server-state caching — fresh fetch each mount
- Toast notifications for all user actions
- Responsive: mobile → tablet → desktop grid breakpoints

### Deliver:
- Every file. Every page. Working mock data. I should run `npm install && npm run dev` and have a fully interactive app.

## PROMPT END
