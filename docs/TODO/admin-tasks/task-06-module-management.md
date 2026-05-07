# Task 6 — Module Management

**File(s):** `src/components/portal/admin/AdminModules.tsx`

---

## TODOs

- [ ] **6.1** Modules list table
  - Columns: Name, Game, Duration (weeks), Status (Active / Draft / Archived), Sub-badge Count, Groups Using It
  - Render from mock data array
  - Status shown as a coloured badge/pill

- [ ] **6.2** Create Module form / modal
  - Fields: Name, Game (dropdown), Overall Learning Outcome / Goal (textarea), Duration (number input, 12–16 weeks), Status toggle (Active / Draft)
  - Submit adds module to local mock state

- [ ] **6.3** Edit Module
  - Clicking edit on a row opens the same form pre-populated
  - Save updates the module in local state

- [ ] **6.4** Archive Module
  - "Archive" action on each row (separate from delete)
  - Sets module status to `Archived` in local state
  - Confirmation prompt before archiving

- [ ] **6.5** Sub-badge builder — Add sub-badge
  - Available inside the module detail view/panel
  - Fields: Name, Description, Associated Main Badge (dropdown of 5 badges), XP/Points Value (number), YSOF Skills (multi-select tag input, minimum 2)
  - Submit appends sub-badge to the module's sub-badge list in local state

- [ ] **6.6** Sub-badge builder — Edit / Remove sub-badge
  - Inline edit icon to re-open the add form pre-populated for an existing sub-badge
  - Delete icon with confirmation to remove sub-badge from the module

- [ ] **6.7** Sub-badge builder — Reorder sub-badges
  - Up / Down arrow buttons on each sub-badge row to shift its position
  - (Optional stretch) drag handle for drag-and-drop reorder

- [ ] **6.8** Module detail page / panel
  - Clicking a module row opens a detail panel (side drawer or expanded row)
  - Shows all sub-badges in a table with columns: Name, Associated Badge (colour-coded pill), XP Value, YSOF Skills
  - Hosts the sub-badge builder (6.5–6.7) inline

---

## Status: ⬜ Not Started
