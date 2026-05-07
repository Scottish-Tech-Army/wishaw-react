# Task 8 — Leaderboard Management

**File(s):** `src/components/portal/admin/AdminLeaderboard.tsx`

---

## TODOs

- [ ] **8.1** Global leaderboard table
  - Reuse / adapt the data model from `StudentLeaderboard.tsx`
  - Columns: Rank, Name, Centre, Group, XP, Level, Modules Completed, Badges Earned
  - Default sort by XP descending

- [ ] **8.2** Centre filter + sort controls
  - Dropdown: filter by Centre (shows all by default)
  - Sort buttons or column header clicks: sort by XP / Level / Modules / Badges

- [ ] **8.3** Centre leaderboard section
  - Separate table or card list showing aggregate score per centre
  - Columns: Centre Name, Total XP (sum of all members), Member Count, Top User
  - Sorted by Total XP descending

- [ ] **8.4** Export CSV button
  - "Export CSV" button in the toolbar
  - For hackathon: stub — logs to console or shows a toast "Export not yet implemented"
  - (Stretch) generate and download a real CSV of the current filtered table view

- [ ] **8.5** Manual XP adjustment modal
  - "Adjust XP" button (global or per-row)
  - Modal fields: User search/select, XP Amount (positive = add, negative = subtract), Reason (text input)
  - Submit applies the adjustment to local state and shows a success toast

---

## Status: ⬜ Not Started
