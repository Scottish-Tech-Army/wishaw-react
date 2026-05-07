# Task 7 — Award Progress

**File(s):** `src/components/portal/admin/AdminAwardProgress.tsx`

---

## TODOs

- [ ] **7.1** Group session view
  - Dropdown to select a group
  - On selection, render a table of all members in that group as rows
  - Sub-badge columns for the group's assigned module(s) as column headers
  - Checkboxes at each row/column intersection to mark completion

- [ ] **7.2** Bulk-award flow
  - "Award Selected" button (enabled when at least one checkbox is ticked)
  - Confirmation modal: lists all user+sub-badge pairs about to be awarded and total XP
  - On confirm: mark those checkboxes as awarded in local state, show success toast

- [ ] **7.3** Individual award
  - Search input to find a single user by name/username
  - Once selected, dropdown to pick a module
  - Show that module's sub-badge list as checkboxes
  - Submit button awards the ticked sub-badges and XP to that user in local state

- [ ] **7.4** Undo / correction
  - Already-awarded sub-badges shown as checked (but visually distinct, e.g. green)
  - Clicking a checked/awarded checkbox prompts "Remove this award from [user]?"
  - Confirm removes the sub-badge award and deducts XP in local state

---

## Status: ⬜ Not Started
