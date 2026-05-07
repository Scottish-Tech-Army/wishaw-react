# Task 1 — Shell & Navigation

**File(s):** `AdminLayout.tsx`, `App.tsx`, `PortalSelector.tsx`

---

## TODOs

- [ ] **1.1** `AdminLayout.tsx` — Create persistent shell component
  - Left sidebar with nav links (Dashboard, Users, Groups, Modules, Badges, Award Progress, Leaderboard)
  - Top bar showing logged-in admin name and role
  - `<Outlet />` placeholder for child route content
  - Mirror the structure of `StudentLayout.tsx`

- [ ] **1.2** `App.tsx` — Wire up admin routes
  - `/admin` → `AdminDashboard`
  - `/admin/users` → `AdminUsers`
  - `/admin/groups` → `AdminGroups`
  - `/admin/modules` → `AdminModules`
  - `/admin/badges` → `AdminBadges`
  - `/admin/leaderboard` → `AdminLeaderboard`
  - `/admin/activity` → `AdminActivity` (stub if needed)
  - Wrap all above routes inside `AdminLayout` as a parent route

- [ ] **1.3** `PortalSelector.tsx` — Enable the Admin Portal button
  - Remove "Coming Soon" disabled state
  - Link button to `/admin`

---

## Status: ✅ Complete
