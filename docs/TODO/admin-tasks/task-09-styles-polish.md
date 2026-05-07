# Task 9 — Styles & Polish

**File(s):** `src/admin.css` (or extend `src/portal.css`), shared component files

---

## TODOs

- [ ] **9.1** Admin colour accent — `admin.css`
  - Define CSS variables for admin accent: use red `#e31e24` for sidebar active states, highlights, and primary buttons
  - Differentiate clearly from the student blue `#00aeef`
  - Apply to `AdminLayout` sidebar nav active link, top bar, and any accent borders

- [ ] **9.2** Consistent empty states
  - Create a reusable `EmptyState` component: icon + heading + sub-text
  - Add to all list/table views:
    - AdminUsers: "No users yet"
    - AdminGroups: "No groups created"
    - AdminModules: "No modules created"
    - AdminBadges sub-badge list: "No sub-badges added"
    - AdminLeaderboard: "No data available"
    - AdminAwardProgress: "No group selected" / "No sub-badges to award"

- [ ] **9.3** Confirmation modal — reusable component
  - Props: `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `isOpen`
  - Destructive variant: confirm button styled in red
  - Used by: Remove User, Remove Group, Archive Module, Remove Sub-badge, Undo Award

- [ ] **9.4** Toast / notification component
  - Props: `message`, `type` (`success` | `error` | `info`), auto-dismiss after ~3 s
  - Triggered after: awarding XP, saving module, removing user, manual XP adjustment
  - Position: bottom-right corner, stacks if multiple toasts

---

## Status: ⬜ Not Started
