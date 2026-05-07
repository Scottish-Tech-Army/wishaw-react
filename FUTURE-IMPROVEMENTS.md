# Future Improvements

This document lists features, enhancements, and ideas for future development of the **Wishaw YMCA eSports Badge Portal**. Items are grouped by area and roughly ordered by priority or logical dependency.

---

## 1. Backend Integration

### 1.1 Authentication & Session Management
- Replace the mock `MOCK_USERS` array in `AuthContext.tsx` with a real `POST /api/v1/auth/login` call.
- Decode JWT claims (`studentId`, `username`, `role`) to populate `AuthContext` on login.
- On app load, restore the session automatically from a stored `auth_token` (validate expiry via the `exp` claim).
- On logout, call the backend session-invalidation endpoint and clear `localStorage`.
- Implement token refresh (silent re-auth before expiry) to avoid mid-session logouts.

### 1.2 Student Portal — Remaining Wiring
- **Evidence Submission** — replace the `setTimeout` simulation and the `STATIC_BADGE_OPTIONS` list with real `GET /evidence` (history) and `POST /evidence` (multipart file upload) calls.
- **Leaderboard** — fix all stale variable references (`timePeriod`, `filtered`, `currentUser`, `p.avatar`, etc.) and wire to live backend data; add loading skeletons, error banners with retry, and empty-state messages.
- **Student Settings** — complete the `PATCH /profile` and `POST /change-password` wiring; propagate avatar/profile changes across the whole portal without a full page reload.
- **Teams** — fix `getTeamDetail()` in `mockApi.ts` so it looks up data by `teamId` rather than always returning Wolf Cubs.

### 1.3 Admin Portal — Backend Integration
- Remove all hardcoded / mock data from the admin views once admin API endpoints are available.
- Implement a dedicated mock-API layer for the admin portal (mirroring the student `VITE_USE_MOCK` pattern) so frontend development can proceed independently.

---

## 2. Admin Portal — Unstarted Features

The following admin tasks are scoped and documented but not yet built:

| Feature | Notes |
|---|---|
| Group & Centre Management | Add / edit / archive groups and centres; assign students to groups |
| Badge & Level Management | Create, edit, and delete main badges and sub-badges; configure level thresholds (Bronze → Platinum and beyond) |
| Module Management | Full module builder: upload session plans, delivery notes, and resources (PowerPoint, video) |
| Award Progress | Manually award sub-badges / XP to students; bulk import from spreadsheet |
| Leaderboard Management | Reset or adjust leaderboard periods; export data as CSV |
| Styles & Polish | Consistent dark/light theme, spacing audit, accessibility pass |

Additional admin UX items noted during development:
- Dark mode / light mode toggle in the admin portal.
- Dedicated "Exit to main site" button (currently goes to `/portals` instead of the public homepage).
- Logout button visible at all times in the admin layout.

---

## 3. Student Portal — UX & Feature Gaps

### 3.1 Mobile Responsiveness
The entire application currently targets desktop. A full mobile pass is needed:
- Collapse the student sidebar into a bottom-nav or slide-out drawer on small screens.
- Make badge cards, leaderboard tables, and dashboard cards single-column on mobile.
- Convert the public marketing navbar to a hamburger menu at ≤768 px.
- Ensure all tap targets are ≥ 44 px and images are fluid (`max-width: 100%`).
- Add a `<meta name="viewport">` audit and define a documented breakpoint strategy.

### 3.2 Progressive Web App (PWA)
The brief explicitly requires a PWA. This is not yet implemented:
- Add a Web App Manifest (`manifest.json`) with icons, theme colour, and `display: standalone`.
- Register a Service Worker for offline caching of the shell and static assets.
- Prompt users to "Add to Home Screen" on supported browsers.
- Test install flow on Android and iOS Safari.

### 3.3 XP History & Pagination
- Add a dedicated XP history tab (or expand the existing one) with server-side pagination or infinite scroll.
- Allow filtering by date range, badge category, or activity type.



---

## 4. Gamification & Engagement

### 4.1 Expanded Badge Level Scale
The brief notes a desire to add levels beyond Platinum:
> *"We would like to be able to add new levels like Emerald, Diamond, Master, Pro."*

- Make level thresholds fully configurable from the admin portal (not hardcoded).
- Design and upload icons for Emerald, Diamond, Master, and Pro tiers.
- Update XP-bar and level-chip components to render any dynamically defined level.

### 4.2 Notifications & Activity Feed
- In-portal notifications when a new sub-badge is awarded or a module is completed.
- Weekly XP summary email or push notification (if PWA push is available).
- "Recent Activity" feed on the dashboard currently shows static items — wire to live `XpEventDto` stream from the backend.

### 4.3 Mini Tournaments
Described in the brief as a *"mind-blowing"* stretch goal:
- Allow admins to create time-limited tournaments between teams or centres.
- Track and display tournament standings on a dedicated leaderboard tab.
- Award bonus XP or special tournament badges for top finishers.

### 4.4 Team Features
- Team chat or message board (async, moderated).
- Team-level XP and badge progress visible on the team detail page.
- Allow students to view teammates' public profiles directly from the team page.

---

## 5. Leaderboard Enhancements

- **Server-side sorting** — pass a `sortBy` parameter to the backend endpoint to avoid transferring and sorting large lists on the client.
- **Pagination / infinite scroll** — add `page` and `pageSize` query parameters; render a "Load more" control or virtual list.
- **Centre leaderboard** — a dedicated view comparing aggregate XP and badges across all participating YMCA centres (including a "global" vs per-centre toggle).
- **Parent view** — a read-only leaderboard view accessible without login so parents can follow their child's progress.

---

## 6. Module System Enhancements

- **Online course view** — render each module as a step-by-step course with a weekly lesson plan, delivery notes, and embedded resources (PDF, video, slides).
- **Admin resource uploader** — allow admins to attach files to each session within a module.
- **Evidence approval workflow** — when a student submits evidence for a sub-badge, the assigned youth worker receives a notification and can approve or reject it from the admin portal.
- **Module templates** — clone an existing module as a starting point for a new one.
- **Module versioning** — allow a module to be updated without affecting students currently enrolled in the previous version.

---

## 7. Multi-Centre / SaaS Scaling

The long-term goal is to package the portal as a **SaaS product** licensed to other YMCAs:

- **Multi-tenant architecture** — isolate data per centre; super-admin can provision new centre instances.
- **Super-admin portal** — approve new centres, manage global module library, view cross-centre analytics.
- **Centre-level branding** — allow each centre to set its own colour scheme, logo, and display name.
- **Billing & subscription management** — integrate a payment provider (e.g. Stripe) for the licensing model.
- **Analytics dashboard** — give centre managers insight into engagement metrics, dropout rates, and badge completion rates.

---

## 8. Accessibility & Internationalisation

- Conduct a full WCAG 2.1 AA audit across all pages.
- Add `aria-*` attributes and keyboard navigation to all interactive components (leaderboard filters, badge catalogue accordions, evidence submission form).
- Support screen readers for XP progress bars and badge level chips.
- Prepare i18n infrastructure (e.g. `react-i18next`) to support Welsh, Gaelic, or other languages relevant to YMCA Scotland sites.

---

## 9. Testing & Quality

- Add unit tests for utility functions (`badgeUtils.ts`, level-resolution logic).
- Add integration tests for all custom hooks using `@testing-library/react` and MSW (Mock Service Worker).
- Add end-to-end tests (Playwright or Cypress) for critical flows: login → dashboard, evidence submission, admin award-progress.
- Set up a CI pipeline (GitHub Actions) to run lint, type-check, and tests on every pull request.
- Add Storybook stories for shared UI components to support isolated development and visual regression testing.

---

## 10. Developer Experience

- Document all API endpoints and DTOs in an OpenAPI / Swagger spec alongside the backend.
- Add a `.env.local.example` file so new contributors can get the dev environment running without reading through multiple TODO files.
- Enforce consistent code style with Prettier and expand ESLint rules.
- Add `husky` + `lint-staged` pre-commit hooks to catch lint and type errors before they are pushed.
- Consolidate mock data so a single `npm run dev:mock` command boots the full portal (student + admin) without a backend.
